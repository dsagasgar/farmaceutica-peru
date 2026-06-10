package com.farmaceuticas_peru.back_end.security;

import com.farmaceuticas_peru.back_end.config.SecurityConfig;
import com.farmaceuticas_peru.back_end.controller.AuthController;
import com.farmaceuticas_peru.back_end.controller.VentaController;
import com.farmaceuticas_peru.back_end.dto.AuthResponse;
import com.farmaceuticas_peru.back_end.dto.LoginRequestDTO;
import com.farmaceuticas_peru.back_end.model.Venta;
import com.farmaceuticas_peru.back_end.service.AuthService;
import com.farmaceuticas_peru.back_end.service.VentaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {VentaController.class, AuthController.class}, properties = "logging.level.org.springframework.security=DEBUG")
@Import(SecurityConfig.class)
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VentaService ventaService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    @BeforeEach
    void setUp() {
        // Mock responses for endpoints to prevent NullPointerException/500 Errors
        // so that if security allows, we get 200/201 instead of 500 or 404.
        when(ventaService.crearVenta(any(Venta.class))).thenReturn(new Venta());
        when(ventaService.buscarOrdenPorId("1")).thenReturn(Optional.of(new Venta()));
        try {
            when(ventaService.registrarPago(eq("1"), any(String.class))).thenReturn(new Venta());
        } catch (Exception e) {
            // Ignored in mockup setup
        }
        when(authService.login(any(LoginRequestDTO.class))).thenReturn(mock(AuthResponse.class));
    }

    // ==========================================
    // 1. PRUEBAS DE ACCESO PÚBLICO Y VALIDACIÓN DE TOKEN
    // ==========================================

    @Test
    void whenNoTokenProvided_thenAccessToProtectedEndpointIsForbidden() throws Exception {
        // Un endpoint protegido debe retornar 403 Forbidden cuando no hay autenticación/token.
        mockMvc.perform(get("/api/ventas/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void whenAccessingPublicEndpoint_thenAccessIsPermittedWithoutToken() throws Exception {
        // El endpoint /api/auth/login es público y no debe requerir token JWT.
        String requestBody = "{\"email\":\"test@example.com\",\"password\":\"password\"}";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    // ==========================================
    // 2. PRUEBAS DE AUTORIZACIÓN BASADA EN ROLES (RBAC)
    // ==========================================

    // --- ROL: QUIMICO_FARMACEUTICO ---

    @Test
    @WithMockUser(username = "quimico@farmacia.pe", roles = {"QUIMICO_FARMACEUTICO"})
    void whenUserIsQuimico_thenCanCreateVentaAndGetVentaButCannotRegisterPago() throws Exception {
        // 1. Crear venta: Permitido (hasRole('QUIMICO_FARMACEUTICO'))
        String ventaBody = "{\"id\":\"1\",\"monto\":100.0}";
        mockMvc.perform(post("/api/ventas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ventaBody))
                .andExpect(status().isCreated());

        // 2. Buscar venta: Permitido (hasAnyRole('CAJERO', 'QUIMICO_FARMACEUTICO', 'ADMINISTRADOR'))
        mockMvc.perform(get("/api/ventas/1"))
                .andExpect(status().isOk());

        // 3. Registrar pago: Denegado (solo CAJERO o ADMINISTRADOR) -> HTTP 403 Forbidden
        String pagoBody = "{\"cajeroId\":\"CAJERO-123\"}";
        mockMvc.perform(put("/api/ventas/1/registrar-pago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoBody))
                .andExpect(status().isForbidden());
    }

    // --- ROL: CAJERO ---

    @Test
    @WithMockUser(username = "cajero@farmacia.pe", roles = {"CAJERO"})
    void whenUserIsCajero_thenCannotCreateVentaButCanGetVentaAndRegisterPago() throws Exception {
        // 1. Crear venta: Denegado -> HTTP 403 Forbidden
        String ventaBody = "{\"id\":\"1\",\"monto\":100.0}";
        mockMvc.perform(post("/api/ventas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ventaBody))
                .andExpect(status().isForbidden());

        // 2. Buscar venta: Permitido
        mockMvc.perform(get("/api/ventas/1"))
                .andExpect(status().isOk());

        // 3. Registrar pago: Permitido -> HTTP 200 OK
        String pagoBody = "{\"cajeroId\":\"CAJERO-123\"}";
        mockMvc.perform(put("/api/ventas/1/registrar-pago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoBody))
                .andExpect(status().isOk());
    }

    // --- ROL: ADMINISTRADOR ---

    @Test
    @WithMockUser(username = "admin@farmacia.pe", roles = {"ADMINISTRADOR"})
    void whenUserIsAdmin_thenCannotCreateVentaButCanGetVentaAndRegisterPago() throws Exception {
        // 1. Crear venta: Denegado -> HTTP 403 Forbidden
        String ventaBody = "{\"id\":\"1\",\"monto\":100.0}";
        mockMvc.perform(post("/api/ventas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ventaBody))
                .andExpect(status().isForbidden());

        // 2. Buscar venta: Permitido
        mockMvc.perform(get("/api/ventas/1"))
                .andExpect(status().isOk());

        // 3. Registrar pago: Permitido
        String pagoBody = "{\"cajeroId\":\"CAJERO-123\"}";
        mockMvc.perform(put("/api/ventas/1/registrar-pago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pagoBody))
                .andExpect(status().isOk());
    }
}
