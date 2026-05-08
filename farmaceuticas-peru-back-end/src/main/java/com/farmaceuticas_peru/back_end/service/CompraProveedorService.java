package com.farmaceuticas_peru.back_end.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmaceuticas_peru.back_end.model.CompraProveedor;
import com.farmaceuticas_peru.back_end.model.ItemCompra;
import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.model.enums.EstadoCompra;
import com.farmaceuticas_peru.back_end.repository.CompraProveedorRepository;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;

@Service
public class CompraProveedorService {

    @Autowired
    private CompraProveedorRepository compraRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<CompraProveedor> getComprasParaRecepcion() {
        return compraRepository.findByEstado(EstadoCompra.PENDIENTE_RECEPCION);
    }

    @Transactional
    public CompraProveedor registrarRecepcion(String compraId, List<ItemCompra> itemsVerificados, String observaciones) {
        CompraProveedor compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada con id: " + compraId));

        if (compra.getEstado() != EstadoCompra.PENDIENTE_RECEPCION) {
            throw new IllegalStateException("Esta compra no está pendiente de recepción.");
        }

        boolean discrepancia = false;

        for (ItemCompra itemOriginal : compra.getItems()) {
            ItemCompra itemVerificado = itemsVerificados.stream()
                    .filter(iv -> iv.getProductoId().equals(itemOriginal.getProductoId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Falta información de verificación para: " + itemOriginal.getNombreProducto()));
            
            Integer cantidadRecibida = itemVerificado.getCantidadRecibida();
            itemOriginal.setCantidadRecibida(cantidadRecibida);

            if (cantidadRecibida != null && cantidadRecibida > 0) {
                Producto producto = productoRepository.findById(itemOriginal.getProductoId()).orElseThrow();
                producto.setStock(producto.getStock() + cantidadRecibida); // Actualiza el stock TOTAL
                productoRepository.save(producto);
            }

            if (!Objects.equals(itemOriginal.getCantidadPedida(), cantidadRecibida)) discrepancia = true;
        }

        compra.setFechaRecepcion(LocalDate.now());
        compra.setObservacionesAlmacen(observaciones);
        compra.setEstado(discrepancia || (observaciones != null && !observaciones.trim().isEmpty()) ? EstadoCompra.RECIBIDO_CON_OBSERVACIONES : EstadoCompra.RECIBIDO_OK);

        return compraRepository.save(compra);
    }
}
