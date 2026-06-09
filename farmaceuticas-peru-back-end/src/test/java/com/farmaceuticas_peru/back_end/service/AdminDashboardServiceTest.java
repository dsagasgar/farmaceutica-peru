package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.dto.ActividadReciente;
import com.farmaceuticas_peru.back_end.dto.AdminStats;
import com.farmaceuticas_peru.back_end.model.Venta;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import com.farmaceuticas_peru.back_end.repository.UsuarioRepository;
import com.farmaceuticas_peru.back_end.repository.VentaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private VentaRepository ventaRepository;

    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @Test
    void getStats_whenIngresosHoyIsNull_returnsStatsWithZeroIngresos() {
        when(usuarioRepository.count()).thenReturn(10L);
        when(productoRepository.count()).thenReturn(200L);
        when(ventaRepository.countByFecha(any(LocalDate.class))).thenReturn(5L);
        when(ventaRepository.sumTotalByFecha(any(LocalDate.class))).thenReturn(null);

        AdminStats stats = adminDashboardService.getStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalUsuarios());
        assertEquals(200L, stats.getTotalProductos());
        assertEquals(5L, stats.getVentasHoy());
        assertEquals(BigDecimal.ZERO, stats.getIngresosHoy());

        verify(usuarioRepository, times(1)).count();
        verify(productoRepository, times(1)).count();
        verify(ventaRepository, times(1)).countByFecha(any(LocalDate.class));
        verify(ventaRepository, times(1)).sumTotalByFecha(any(LocalDate.class));
    }

    @Test
    void getStats_whenIngresosHoyIsNotNull_returnsStatsWithCorrectIngresos() {
        BigDecimal totalIngresos = new BigDecimal("150.50");
        when(usuarioRepository.count()).thenReturn(10L);
        when(productoRepository.count()).thenReturn(200L);
        when(ventaRepository.countByFecha(any(LocalDate.class))).thenReturn(5L);
        when(ventaRepository.sumTotalByFecha(any(LocalDate.class))).thenReturn(totalIngresos);

        AdminStats stats = adminDashboardService.getStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalUsuarios());
        assertEquals(200L, stats.getTotalProductos());
        assertEquals(5L, stats.getVentasHoy());
        assertEquals(totalIngresos, stats.getIngresosHoy());
    }

    @Test
    void getActividadReciente_returnsListMappedFromVentas() {
        Venta v1 = Venta.builder()
                .id("VENTA-1")
                .total(new BigDecimal("100.00"))
                .fecha(LocalDate.of(2026, 6, 9))
                .quimicoId("QUIMICO-1")
                .build();
        Venta v2 = Venta.builder()
                .id("VENTA-2")
                .total(new BigDecimal("50.00"))
                .fecha(LocalDate.of(2026, 6, 8))
                .quimicoId("QUIMICO-2")
                .build();

        when(ventaRepository.findTop5ByOrderByFechaDesc()).thenReturn(Arrays.asList(v1, v2));

        List<ActividadReciente> result = adminDashboardService.getActividadReciente();

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals("NUEVA_VENTA", result.get(0).getTipo());
        assertEquals("Venta #VENTA-1 por S/ 100.00", result.get(0).getDescripcion());
        assertEquals(LocalDate.of(2026, 6, 9).atStartOfDay(), result.get(0).getFecha());
        assertEquals("QUIMICO-1", result.get(0).getUsuario());

        assertEquals("NUEVA_VENTA", result.get(1).getTipo());
        assertEquals("Venta #VENTA-2 por S/ 50.00", result.get(1).getDescripcion());
        assertEquals(LocalDate.of(2026, 6, 8).atStartOfDay(), result.get(1).getFecha());
        assertEquals("QUIMICO-2", result.get(1).getUsuario());

        verify(ventaRepository, times(1)).findTop5ByOrderByFechaDesc();
    }
}
