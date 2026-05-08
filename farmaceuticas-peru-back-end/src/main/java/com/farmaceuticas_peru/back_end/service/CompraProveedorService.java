package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.dto.RecepcionRequest;
import com.farmaceuticas_peru.back_end.model.CompraProveedor;
import com.farmaceuticas_peru.back_end.model.ItemCompra;
import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.model.enums.EstadoCompra;
import com.farmaceuticas_peru.back_end.repository.CompraProveedorRepository;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompraProveedorService {

    private final CompraProveedorRepository compraRepository;
    private final ProductoRepository productoRepository;

    public List<CompraProveedor> getComprasParaRecepcion() {
        return compraRepository.findByEstado(EstadoCompra.PENDIENTE_RECEPCION);
    }

    @Transactional
    public CompraProveedor registrarRecepcion(String compraId, List<RecepcionRequest.ItemRecepcion> itemsVerificados, String observaciones) {
        if (itemsVerificados == null) {
            throw new IllegalArgumentException("La lista de items verificados no puede ser nula.");
        }

        CompraProveedor compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new EntityNotFoundException("Compra no encontrada: " + compraId));

        if (compra.getEstado() != EstadoCompra.PENDIENTE_RECEPCION) {
            throw new IllegalStateException("Esta compra no está pendiente de recepción.");
        }

        Map<Long, ItemCompra> itemsOriginales = compra.getItems().stream()
                .collect(Collectors.toMap(ItemCompra::getId, Function.identity()));

        boolean todoRecibidoCompleto = true;

        for (RecepcionRequest.ItemRecepcion itemVerificado : itemsVerificados) {
            ItemCompra itemOriginal = itemsOriginales.get(itemVerificado.getId());
            if (itemOriginal == null) continue;

            int cantidadRecibida = itemVerificado.getCantidadRecibida() != null ? itemVerificado.getCantidadRecibida() : 0;
            itemOriginal.setCantidadRecibida(cantidadRecibida);

            if (cantidadRecibida != itemOriginal.getCantidadPedida()) {
                todoRecibidoCompleto = false;
            }

            Producto producto = productoRepository.findById(itemOriginal.getProductoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado para actualizar stock: " + itemOriginal.getProductoId()));
            producto.setStock(producto.getStock() + cantidadRecibida);
            productoRepository.save(producto);
        }

        compra.setObservacionesAlmacen(observaciones);
        compra.setFechaRecepcion(LocalDate.now());
        compra.setEstado(todoRecibidoCompleto ? EstadoCompra.RECIBIDO_COMPLETO : EstadoCompra.RECIBIDO_PARCIAL);

        return compraRepository.save(compra);
    }
}