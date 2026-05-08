package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Método para Almacenero y Admin
    @Transactional(readOnly = true)
    public List<Producto> getProductosParaAlmacen(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return productoRepository.findAll();
        }
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    // Método para Químico Farmacéutico
    @Transactional(readOnly = true)
    public List<Producto> getProductosParaVenta(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return productoRepository.findByStockVentaGreaterThan(0);
        }
        return productoRepository.findByNombreContainingIgnoreCaseAndStockVentaGreaterThan(nombre, 0);
    }

    // Método para que el Almacenero actualice el stock de venta
    @Transactional
    public Producto actualizarStockVenta(String id, int nuevoStockVenta) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));

        if (nuevoStockVenta > producto.getStock()) {
            throw new IllegalArgumentException("El stock de venta no puede ser mayor al stock total en almacén.");
        }
        producto.setStockVenta(nuevoStockVenta);
        return productoRepository.save(producto);
    }
}