package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.dto.*;
import com.farmaceuticas_peru.back_end.model.Modulo;
import com.farmaceuticas_peru.back_end.model.Persona;
import com.farmaceuticas_peru.back_end.model.Usuario;
import com.farmaceuticas_peru.back_end.model.enums.Rol;
import com.farmaceuticas_peru.back_end.repository.ModuloRepository;
import com.farmaceuticas_peru.back_end.repository.PersonaRepository;
import com.farmaceuticas_peru.back_end.repository.UsuarioRepository;
import com.farmaceuticas_peru.back_end.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PersonaRepository personaRepository;

    @Mock
    private ModuloRepository moduloRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_whenEmailExists_throwsIllegalArgumentException() {
        RegisterRequestDTO request = RegisterRequestDTO.builder()
                .email("test@example.com")
                .password("password")
                .build();
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new Usuario()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(request);
        });

        assertEquals("Hay un usuario registrado con ese email", exception.getMessage());
        verify(usuarioRepository, times(1)).findByEmail("test@example.com");
        verifyNoMoreInteractions(personaRepository, moduloRepository, passwordEncoder, jwtService);
    }

    @Test
    void register_whenPersonaIsNull_throwsIllegalArgumentException() {
        RegisterRequestDTO request = RegisterRequestDTO.builder()
                .email("test@example.com")
                .password("password")
                .persona(null)
                .build();
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(request);
        });

        assertEquals("Los datos de la persona son obligatorios", exception.getMessage());
        verify(usuarioRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void register_whenDocumentoExists_throwsIllegalArgumentException() {
        PersonaRequest personaReq = PersonaRequest.builder()
                .numDocumento("12345678")
                .build();
        RegisterRequestDTO request = RegisterRequestDTO.builder()
                .email("test@example.com")
                .password("password")
                .persona(personaReq)
                .build();

        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(personaRepository.existsByNumDocumento("12345678")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(request);
        });

        assertEquals("Hay un usuario registrado con ese numero de documento", exception.getMessage());
        verify(usuarioRepository, times(1)).findByEmail("test@example.com");
        verify(personaRepository, times(1)).existsByNumDocumento("12345678");
    }

    @Test
    void register_whenValid_registersUserAndReturnsToken() {
        PersonaRequest personaReq = PersonaRequest.builder()
                .nombres("Juan")
                .apellidoPaterno("Perez")
                .numDocumento("12345678")
                .build();
        RegisterRequestDTO request = RegisterRequestDTO.builder()
                .email("test@example.com")
                .password("rawPassword")
                .persona(personaReq)
                .build();

        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(personaRepository.existsByNumDocumento("12345678")).thenReturn(false);
        when(passwordEncoder.encode("rawPassword")).thenReturn("hashedPassword");
        
        List<Modulo> mockModules = Collections.singletonList(Modulo.builder().descripcion("Dashboard").build());
        when(moduloRepository.findByRolesContains(Rol.CAJERO)).thenReturn(mockModules);
        when(jwtService.generateToken(any(Usuario.class), eq(mockModules))).thenReturn("mockToken123");

        AuthResponseDTO response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockToken123", response.getToken());

        verify(personaRepository, times(1)).save(any(Persona.class));
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
        verify(jwtService, times(1)).generateToken(any(Usuario.class), eq(mockModules));
    }

    @Test
    void login_whenValidCredentials_returnsAuthResponse() {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setEmail("test@example.com");
        request.setPassword("password");

        Usuario usuario = Usuario.builder()
                .id("USR-123")
                .email("test@example.com")
                .nombre("Juan")
                .rol(Rol.ADMINISTRADOR)
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(usuario);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);

        List<Modulo> mockModules = Collections.singletonList(Modulo.builder().descripcion("Dashboard").build());
        when(moduloRepository.findByRolesContains(Rol.ADMINISTRADOR)).thenReturn(mockModules);
        when(jwtService.generateToken(usuario, mockModules)).thenReturn("mockToken123");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockToken123", response.getJwt());
        assertEquals("USR-123", response.getUser().getId());
        assertEquals("test@example.com", response.getUser().getEmail());
        assertEquals(Rol.ADMINISTRADOR, response.getUser().getRol());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(moduloRepository, times(1)).findByRolesContains(Rol.ADMINISTRADOR);
        verify(jwtService, times(1)).generateToken(usuario, mockModules);
    }
}
