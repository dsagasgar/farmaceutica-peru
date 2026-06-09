package com.farmaceuticas_peru.back_end.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmaceuticas_peru.back_end.dto.RecepcionRequest;
import com.farmaceuticas_peru.back_end.model.CompraProveedor;
import com.farmaceuticas_peru.back_end.service.CompraProveedorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraProveedorController {

    private final CompraProveedorService compraService;

    @GetMapping("/para-recepcion")
    // CORREGIDO: Habilitamos hasAnyRole para que el administrador pueda auditar las órdenes pendientes
    @PreAuthorize("hasAnyRole('ALMACENERO', 'ADMINISTRADOR')")
    public ResponseEntity<List<CompraProveedor>> getComprasParaRecepcion() {
        return ResponseEntity.ok(compraService.getComprasParaRecepcion());
    }

    @GetMapping
    // CORREGIDO: Nuevo endpoint de auditoría histórica exclusivo para el Administrador
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<CompraProveedor>> getTodasLasCompras() {
        // Llama al método de tu servicio que hace un repository.findAll()
        return ResponseEntity.ok(compraService.getTodasLasCompras()); 
    }

    @PostMapping("/{compraId}/registrar-recepcion")
    // CORREGIDO: Permitimos que el administrador también pueda forzar recepciones de emergencia si se requiere
    @PreAuthorize("hasAnyRole('ALMACENERO', 'ADMINISTRADOR')")
    public ResponseEntity<CompraProveedor> registrarRecepcion(
            @PathVariable String compraId,
            @RequestBody RecepcionRequest payload) {

        CompraProveedor compraActualizada = compraService.registrarRecepcion(
                compraId, payload.getItems(), payload.getObservaciones());
        return ResponseEntity.ok(compraActualizada);
    }
}