package com.farmaceuticas_peru.back_end.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmaceuticas_peru.back_end.model.Venta;
import com.farmaceuticas_peru.back_end.service.VentaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    @PreAuthorize("hasRole('QUIMICO_FARMACEUTICO')")
    public ResponseEntity<Venta> crearVenta(@RequestBody Venta venta) {
        Venta nuevaVenta = ventaService.crearVenta(venta);
        return new ResponseEntity<>(nuevaVenta, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CAJERO', 'QUIMICO_FARMACEUTICO')")
    public ResponseEntity<Venta> buscarOrdenPorId(@PathVariable String id) {
        Optional<Venta> venta = ventaService.buscarOrdenPorId(id);
        return venta.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/registrar-pago")
    @PreAuthorize("hasAuthority('CAJERO')")
    public ResponseEntity<Venta> registrarPago(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String cajeroId = payload.get("cajeroId");
        if (cajeroId == null || cajeroId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Venta ventaPagada = ventaService.registrarPago(id, cajeroId);
            return ResponseEntity.ok(ventaPagada);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}