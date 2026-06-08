package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    @Test
    void getProductosParaAlmacen_whenNombreIsEmpty_returnsAllProducts() {
        Producto p1 = Producto.builder().id("1").nombre("Paracetamol").stock(10).build();
        Producto p2 = Producto.builder().id("2").nombre("Ibuprofeno").stock(20).build();
        when(productoRepository.findAll()).thenReturn(Arrays.asList(p1, p2));

        List<Producto> result = productoService.getProductosParaAlmacen(null);

        assertEquals(2, result.size());
        verify(productoRepository, times(1)).findAll();
        verify(productoRepository, never()).findByNombreContainingIgnoreCase(anyString());
    }

    @Test
    void getProductosParaAlmacen_whenNombreIsNotEmpty_returnsMatchingProducts() {
        Producto p1 = Producto.builder().id("1").nombre("Paracetamol").stock(10).build();
        when(productoRepository.findByNombreContainingIgnoreCase("para")).thenReturn(Collections.singletonList(p1));

        List<Producto> result = productoService.getProductosParaAlmacen("para");

        assertEquals(1, result.size());
        assertEquals("Paracetamol", result.get(0).getNombre());
        verify(productoRepository, times(1)).findByNombreContainingIgnoreCase("para");
        verify(productoRepository, never()).findAll();
    }

    @Test
    void getProductosParaVenta_whenNombreIsEmpty_returnsAvailableProducts() {
        Producto p1 = Producto.builder().id("1").nombre("Paracetamol").stockVenta(5).build();
        when(productoRepository.findByStockVentaGreaterThan(0)).thenReturn(Collections.singletonList(p1));

        List<Producto> result = productoService.getProductosParaVenta("");

        assertEquals(1, result.size());
        verify(productoRepository, times(1)).findByStockVentaGreaterThan(0);
        verify(productoRepository, never()).findByNombreContainingIgnoreCaseAndStockVentaGreaterThan(anyString(), anyInt());
    }

    @Test
    void getProductosParaVenta_whenNombreIsNotEmpty_returnsMatchingAvailableProducts() {
        Producto p1 = Producto.builder().id("1").nombre("Paracetamol").stockVenta(5).build();
        when(productoRepository.findByNombreContainingIgnoreCaseAndStockVentaGreaterThan("para", 0))
                .thenReturn(Collections.singletonList(p1));

        List<Producto> result = productoService.getProductosParaVenta("para");

        assertEquals(1, result.size());
        verify(productoRepository, times(1)).findByNombreContainingIgnoreCaseAndStockVentaGreaterThan("para", 0);
        verify(productoRepository, never()).findByStockVentaGreaterThan(0);
    }

    @Test
    void actualizarStockVenta_whenProductDoesNotExist_throwsRuntimeException() {
        when(productoRepository.findById("123")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productoService.actualizarStockVenta("123", 5);
        });

        assertEquals("Producto no encontrado con id: 123", exception.getMessage());
        verify(productoRepository, times(1)).findById("123");
        verify(productoRepository, never()).save(any());
    }

    @Test
    void actualizarStockVenta_whenNewStockExceedsTotalStock_throwsIllegalArgumentException() {
        Producto p1 = Producto.builder().id("123").nombre("Paracetamol").stock(10).stockVenta(2).build();
        when(productoRepository.findById("123")).thenReturn(Optional.of(p1));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productoService.actualizarStockVenta("123", 15);
        });

        assertEquals("El stock de venta no puede ser mayor al stock total en almacén.", exception.getMessage());
        verify(productoRepository, times(1)).findById("123");
        verify(productoRepository, never()).save(any());
    }

    @Test
    void actualizarStockVenta_whenValid_updatesAndSavesProduct() {
        Producto p1 = Producto.builder().id("123").nombre("Paracetamol").stock(10).stockVenta(2).build();
        when(productoRepository.findById("123")).thenReturn(Optional.of(p1));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Producto result = productoService.actualizarStockVenta("123", 8);

        assertNotNull(result);
        assertEquals(8, result.getStockVenta());
        verify(productoRepository, times(1)).findById("123");
        verify(productoRepository, times(1)).save(p1);
    }
}
