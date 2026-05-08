package com.farmaceuticas_peru.back_end.controller;

import com.farmaceuticas_peru.back_end.dto.RecepcionRequest;
import com.farmaceuticas_peru.back_end.model.CompraProveedor;
import com.farmaceuticas_peru.back_end.service.CompraProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
public class CompraProveedorController {
    
    @Autowired
    private CompraProveedorService compraProveedorService;

    @GetMapping("/para-recepcion")
    @PreAuthorize("hasAnyRole('ALMACENERO', 'ADMINISTRADOR')")
    public ResponseEntity<List<CompraProveedor>> getComprasParaRecepcion() {
        List<CompraProveedor> compras = compraProveedorService.getComprasParaRecepcion();
        return ResponseEntity.ok(compras);
    }

    @PostMapping("/{compraId}/registrar-recepcion")
    @PreAuthorize("hasAnyRole('ALMACENERO', 'ADMINISTRADOR')")
    public ResponseEntity<CompraProveedor> registrarRecepcion(@PathVariable String compraId, @RequestBody RecepcionRequest recepcionRequest) {
        CompraProveedor compraActualizada = compraProveedorService.registrarRecepcion(compraId, recepcionRequest.getItemsVerificados(), recepcionRequest.getObservaciones());
        return ResponseEntity.ok(compraActualizada);
    }
}
