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

import com.farmaceuticas_peru.back_end.dto.StockVentaRequest;
import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.service.ProductoService;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // Endpoint para que el QF busque productos con stock para vender
    @GetMapping("/venta")
    @PreAuthorize("hasAnyRole('QUIMICO_FARMACEUTICO', 'ADMINISTRADOR')")
    public ResponseEntity<List<Producto>> getProductosParaVenta(@RequestParam(required = false) String nombre) {
        List<Producto> productos = productoService.getProductosParaVenta(nombre);
        return ResponseEntity.ok(productos);
    }

    // Endpoint para que el Almacenero y Admin vean TODOS los productos
    @GetMapping("/almacen")
    @PreAuthorize("hasAnyRole('ALMACENERO', 'ADMINISTRADOR')")
    public ResponseEntity<List<Producto>> getProductosParaAlmacen(@RequestParam(required = false) String nombre) {
        List<Producto> productos = productoService.getProductosParaAlmacen(nombre);
        return ResponseEntity.ok(productos);
    }

    // Endpoint para que el Almacenero actualice el stock de venta
    @PutMapping("/{id}/stock-venta")
    @PreAuthorize("hasAnyRole('ALMACENERO', 'ADMINISTRADOR')")
    public ResponseEntity<Producto> actualizarStockVenta(@PathVariable String id, @RequestBody StockVentaRequest stockVentaRequest) {
        Producto productoActualizado = productoService.actualizarStockVenta(id, stockVentaRequest.getStockVenta());
        return ResponseEntity.ok(productoActualizado);
    }
}