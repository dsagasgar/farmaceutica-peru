package com.farmaceuticas_peru.back_end.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.service.ProductoService;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // Endpoint para Almacenero y Administrador
    @GetMapping("/almacen")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")
    public List<Producto> getProductosAlmacen(@RequestParam(required = false) String nombre) {
        return productoService.getProductosParaAlmacen(nombre);
    }

    // Endpoint para Químico Farmacéutico 
    @GetMapping("/venta")
    @PreAuthorize("hasAnyRole('QUIMICO_FARMACEUTICO', 'ADMINISTRADOR')")
    public List<Producto> getProductosVenta(@RequestParam(required = false) String nombre) {
        return productoService.getProductosParaVenta(nombre);
    }

    // Endpoint para que el Almacenero actualice el stock
    @PutMapping("/{id}/stock-venta")
    @PreAuthorize("hasRole('ALMACENERO')")
    public ResponseEntity<Producto> updateStockVenta(@PathVariable String id, @RequestBody Integer nuevoStockVenta) {
        Producto productoActualizado = productoService.actualizarStockVenta(id, nuevoStockVenta);
        return ResponseEntity.ok(productoActualizado);
    }
}