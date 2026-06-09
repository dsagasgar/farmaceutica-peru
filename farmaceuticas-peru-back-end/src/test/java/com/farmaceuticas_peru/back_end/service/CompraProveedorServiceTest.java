package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.dto.RecepcionRequest;
import com.farmaceuticas_peru.back_end.model.CompraProveedor;
import com.farmaceuticas_peru.back_end.model.ItemCompra;
import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.model.enums.EstadoCompra;
import com.farmaceuticas_peru.back_end.repository.CompraProveedorRepository;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompraProveedorServiceTest {

    @Mock
    private CompraProveedorRepository compraRepository;

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private CompraProveedorService compraProveedorService;

    @Test
    void getComprasParaRecepcion_returnsList() {
        CompraProveedor c1 = CompraProveedor.builder().id("COMPRA-1").estado(EstadoCompra.PENDIENTE_RECEPCION).build();
        when(compraRepository.findByEstado(EstadoCompra.PENDIENTE_RECEPCION)).thenReturn(Collections.singletonList(c1));

        List<CompraProveedor> result = compraProveedorService.getComprasParaRecepcion();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("COMPRA-1", result.get(0).getId());
        verify(compraRepository, times(1)).findByEstado(EstadoCompra.PENDIENTE_RECEPCION);
    }

    @Test
    void registrarRecepcion_whenItemsVerificadosIsNull_throwsIllegalArgumentException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            compraProveedorService.registrarRecepcion("COMPRA-1", null, "observaciones");
        });

        assertEquals("La lista de items verificados no puede ser nula.", exception.getMessage());
        verifyNoInteractions(compraRepository, productoRepository);
    }

    @Test
    void registrarRecepcion_whenCompraNotFound_throwsEntityNotFoundException() {
        when(compraRepository.findById("COMPRA-1")).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            compraProveedorService.registrarRecepcion("COMPRA-1", new ArrayList<>(), "observaciones");
        });

        assertEquals("Compra no encontrada: COMPRA-1", exception.getMessage());
        verify(compraRepository, times(1)).findById("COMPRA-1");
        verifyNoMoreInteractions(compraRepository, productoRepository);
    }

    @Test
    void registrarRecepcion_whenEstadoNotPendiente_throwsIllegalStateException() {
        CompraProveedor compra = CompraProveedor.builder().id("COMPRA-1").estado(EstadoCompra.RECIBIDO_COMPLETO).build();
        when(compraRepository.findById("COMPRA-1")).thenReturn(Optional.of(compra));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            compraProveedorService.registrarRecepcion("COMPRA-1", new ArrayList<>(), "observaciones");
        });

        assertEquals("Esta compra no está pendiente de recepción.", exception.getMessage());
        verify(compraRepository, times(1)).findById("COMPRA-1");
        verifyNoMoreInteractions(compraRepository, productoRepository);
    }

    @Test
    void registrarRecepcion_whenProductNotFound_throwsEntityNotFoundException() {
        ItemCompra item = ItemCompra.builder().id(10L).productoId("PROD-1").cantidadPedida(5).build();
        CompraProveedor compra = CompraProveedor.builder()
                .id("COMPRA-1")
                .estado(EstadoCompra.PENDIENTE_RECEPCION)
                .items(Collections.singletonList(item))
                .build();

        RecepcionRequest.ItemRecepcion itemVerificado = new RecepcionRequest.ItemRecepcion();
        itemVerificado.setId(10L);
        itemVerificado.setCantidadRecibida(5);

        when(compraRepository.findById("COMPRA-1")).thenReturn(Optional.of(compra));
        when(productoRepository.findById("PROD-1")).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            compraProveedorService.registrarRecepcion("COMPRA-1", Collections.singletonList(itemVerificado), "observaciones");
        });

        assertEquals("Producto no encontrado para actualizar stock: PROD-1", exception.getMessage());
        verify(compraRepository, times(1)).findById("COMPRA-1");
        verify(productoRepository, times(1)).findById("PROD-1");
        verify(compraRepository, never()).save(any());
    }

    @Test
    void registrarRecepcion_whenTodoRecibidoCompleto_updatesStockAndSetsRecibidoCompleto() {
        ItemCompra item = ItemCompra.builder().id(10L).productoId("PROD-1").cantidadPedida(5).build();
        CompraProveedor compra = CompraProveedor.builder()
                .id("COMPRA-1")
                .estado(EstadoCompra.PENDIENTE_RECEPCION)
                .items(Collections.singletonList(item))
                .build();

        RecepcionRequest.ItemRecepcion itemVerificado = new RecepcionRequest.ItemRecepcion();
        itemVerificado.setId(10L);
        itemVerificado.setCantidadRecibida(5);

        Producto producto = Producto.builder().id("PROD-1").stock(10).build();

        when(compraRepository.findById("COMPRA-1")).thenReturn(Optional.of(compra));
        when(productoRepository.findById("PROD-1")).thenReturn(Optional.of(producto));
        when(compraRepository.save(any(CompraProveedor.class))).thenAnswer(inv -> inv.getArgument(0));

        CompraProveedor result = compraProveedorService.registrarRecepcion("COMPRA-1", Collections.singletonList(itemVerificado), "Observaciones de test");

        assertNotNull(result);
        assertEquals(EstadoCompra.RECIBIDO_COMPLETO, result.getEstado());
        assertEquals("Observaciones de test", result.getObservacionesAlmacen());
        assertNotNull(result.getFechaRecepcion());
        assertEquals(15, producto.getStock()); // 10 + 5
        assertEquals(5, item.getCantidadRecibida());

        verify(compraRepository, times(1)).findById("COMPRA-1");
        verify(productoRepository, times(1)).findById("PROD-1");
        verify(productoRepository, times(1)).save(producto);
        verify(compraRepository, times(1)).save(compra);
    }

    @Test
    void registrarRecepcion_whenRecibidoParcial_updatesStockAndSetsRecibidoParcial() {
        ItemCompra item = ItemCompra.builder().id(10L).productoId("PROD-1").cantidadPedida(5).build();
        CompraProveedor compra = CompraProveedor.builder()
                .id("COMPRA-1")
                .estado(EstadoCompra.PENDIENTE_RECEPCION)
                .items(Collections.singletonList(item))
                .build();

        RecepcionRequest.ItemRecepcion itemVerificado = new RecepcionRequest.ItemRecepcion();
        itemVerificado.setId(10L);
        itemVerificado.setCantidadRecibida(3); // Less than pedida (5)

        Producto producto = Producto.builder().id("PROD-1").stock(10).build();

        when(compraRepository.findById("COMPRA-1")).thenReturn(Optional.of(compra));
        when(productoRepository.findById("PROD-1")).thenReturn(Optional.of(producto));
        when(compraRepository.save(any(CompraProveedor.class))).thenAnswer(inv -> inv.getArgument(0));

        CompraProveedor result = compraProveedorService.registrarRecepcion("COMPRA-1", Collections.singletonList(itemVerificado), "Observaciones parcial");

        assertNotNull(result);
        assertEquals(EstadoCompra.RECIBIDO_PARCIAL, result.getEstado());
        assertEquals(13, producto.getStock()); // 10 + 3
        assertEquals(3, item.getCantidadRecibida());

        verify(compraRepository, times(1)).findById("COMPRA-1");
        verify(productoRepository, times(1)).findById("PROD-1");
        verify(productoRepository, times(1)).save(producto);
        verify(compraRepository, times(1)).save(compra);
    }
}
