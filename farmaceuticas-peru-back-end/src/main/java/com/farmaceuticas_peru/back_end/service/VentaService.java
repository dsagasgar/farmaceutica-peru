package com.farmaceuticas_peru.back_end.service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.model.Venta;
import com.farmaceuticas_peru.back_end.model.enums.EstadoVenta;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import com.farmaceuticas_peru.back_end.repository.VentaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public Optional<Venta> buscarOrdenPorId(String id) {
        return ventaRepository.findById(id);
    }

    @Transactional
    public Venta crearVenta(Venta venta) {
        venta.setId("VENTA-" + UUID.randomUUID().toString().toUpperCase().substring(0, 8));
        venta.setFecha(LocalDate.now());
        venta.setEstado(EstadoVenta.PENDIENTE_PAGO);

        // Asignar la venta a cada item para la persistencia de la relación
        if (venta.getItems() != null) {
            venta.getItems().forEach(item -> item.setVenta(venta));
        }
        if (venta.getItemsFormula() != null) {
            venta.getItemsFormula().forEach(item -> item.setVenta(venta));
        }

        // Descontar stock
        venta.getItems().forEach(item -> {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + item.getProductoId()));
            int nuevoStockVenta = producto.getStockVenta() - item.getCantidad();
            if (nuevoStockVenta < 0) {
                throw new IllegalStateException("Stock insuficiente para el producto: " + producto.getNombre());
            }
            producto.setStockVenta(nuevoStockVenta);
            productoRepository.save(producto);
        });

        return ventaRepository.save(venta);
    }

    @Transactional
    public Venta registrarPago(String id, String cajeroId) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada: " + id));

        if (venta.getEstado() != EstadoVenta.PENDIENTE_PAGO) {
            throw new IllegalStateException("La venta no está pendiente de pago.");
        }

        venta.setEstado(EstadoVenta.PAGADO);
        venta.setCajeroId(cajeroId);

        // Descontar del stock principal
        venta.getItems().forEach(item -> {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + item.getProductoId()));
            int nuevoStock = producto.getStock() - item.getCantidad();
            producto.setStock(nuevoStock);
            productoRepository.save(producto);
        });

        return ventaRepository.save(venta);
    }
}