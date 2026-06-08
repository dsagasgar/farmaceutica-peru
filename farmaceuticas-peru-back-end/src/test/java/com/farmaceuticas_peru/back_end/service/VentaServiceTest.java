package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.model.ItemVenta;
import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.model.Venta;
import com.farmaceuticas_peru.back_end.model.enums.EstadoVenta;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import com.farmaceuticas_peru.back_end.repository.VentaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private VentaService ventaService;

    @Test
    void buscarOrdenPorId_whenExists_returnsVenta() {
        Venta venta = Venta.builder().id("VENTA-123").total(BigDecimal.TEN).build();
        when(ventaRepository.findById("VENTA-123")).thenReturn(Optional.of(venta));

        Optional<Venta> result = ventaService.buscarOrdenPorId("VENTA-123");

        assertTrue(result.isPresent());
        assertEquals("VENTA-123", result.get().getId());
        verify(ventaRepository, times(1)).findById("VENTA-123");
    }

    @Test
    void crearVenta_whenStockIsSufficient_savesVentaAndReducesStockVenta() {
        Producto producto = Producto.builder()
                .id("PROD-1")
                .nombre("Paracetamol")
                .stock(100)
                .stockVenta(50)
                .build();

        ItemVenta item = ItemVenta.builder()
                .productoId("PROD-1")
                .cantidad(10)
                .build();

        Venta venta = Venta.builder()
                .items(Collections.singletonList(item))
                .itemsFormula(new ArrayList<>())
                .total(BigDecimal.TEN)
                .build();

        when(productoRepository.findById("PROD-1")).thenReturn(Optional.of(producto));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Venta result = ventaService.crearVenta(venta);

        assertNotNull(result);
        assertTrue(result.getId().startsWith("VENTA-"));
        assertEquals(EstadoVenta.PENDIENTE_PAGO, result.getEstado());
        assertEquals(40, producto.getStockVenta()); // 50 - 10

        verify(productoRepository, times(1)).findById("PROD-1");
        verify(productoRepository, times(1)).save(producto);
        verify(ventaRepository, times(1)).save(venta);
    }

    @Test
    void crearVenta_whenProductNotFound_throwsEntityNotFoundException() {
        ItemVenta item = ItemVenta.builder()
                .productoId("PROD-NOT-FOUND")
                .cantidad(10)
                .build();

        Venta venta = Venta.builder()
                .items(Collections.singletonList(item))
                .build();

        when(productoRepository.findById("PROD-NOT-FOUND")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            ventaService.crearVenta(venta);
        });

        verify(productoRepository, times(1)).findById("PROD-NOT-FOUND");
        verify(productoRepository, never()).save(any());
        verify(ventaRepository, never()).save(any());
    }

    @Test
    void crearVenta_whenStockIsInsufficient_throwsIllegalStateException() {
        Producto producto = Producto.builder()
                .id("PROD-1")
                .nombre("Paracetamol")
                .stock(100)
                .stockVenta(5)
                .build();

        ItemVenta item = ItemVenta.builder()
                .productoId("PROD-1")
                .cantidad(10) // Exceeds stockVenta (5)
                .build();

        Venta venta = Venta.builder()
                .items(Collections.singletonList(item))
                .build();

        when(productoRepository.findById("PROD-1")).thenReturn(Optional.of(producto));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            ventaService.crearVenta(venta);
        });

        assertEquals("Stock insuficiente para el producto: Paracetamol", exception.getMessage());
        verify(productoRepository, times(1)).findById("PROD-1");
        verify(productoRepository, never()).save(any());
        verify(ventaRepository, never()).save(any());
    }

    @Test
    void registrarPago_whenVentaNotPendingPago_throwsIllegalStateException() {
        Venta venta = Venta.builder()
                .id("VENTA-1")
                .estado(EstadoVenta.PAGADO) // Already paid
                .build();

        when(ventaRepository.findById("VENTA-1")).thenReturn(Optional.of(venta));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            ventaService.registrarPago("VENTA-1", "CAJERO-9");
        });

        assertEquals("La venta no está pendiente de pago.", exception.getMessage());
        verify(ventaRepository, times(1)).findById("VENTA-1");
        verify(ventaRepository, never()).save(any());
    }

    @Test
    void registrarPago_whenVentaIsPendingPago_updatesStateAndReducesMainStock() {
        Producto producto = Producto.builder()
                .id("PROD-1")
                .nombre("Paracetamol")
                .stock(100)
                .stockVenta(40)
                .build();

        ItemVenta item = ItemVenta.builder()
                .productoId("PROD-1")
                .cantidad(10)
                .build();

        Venta venta = Venta.builder()
                .id("VENTA-1")
                .estado(EstadoVenta.PENDIENTE_PAGO)
                .items(Collections.singletonList(item))
                .build();

        when(ventaRepository.findById("VENTA-1")).thenReturn(Optional.of(venta));
        when(productoRepository.findById("PROD-1")).thenReturn(Optional.of(producto));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Venta result = ventaService.registrarPago("VENTA-1", "CAJERO-9");

        assertNotNull(result);
        assertEquals(EstadoVenta.PAGADO, result.getEstado());
        assertEquals("CAJERO-9", result.getCajeroId());
        assertEquals(90, producto.getStock()); // 100 - 10

        verify(ventaRepository, times(1)).findById("VENTA-1");
        verify(productoRepository, times(1)).findById("PROD-1");
        verify(productoRepository, times(1)).save(producto);
        verify(ventaRepository, times(1)).save(venta);
    }
}
