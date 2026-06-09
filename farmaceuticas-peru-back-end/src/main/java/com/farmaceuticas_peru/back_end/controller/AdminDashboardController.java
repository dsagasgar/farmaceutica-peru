package com.farmaceuticas_peru.back_end.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmaceuticas_peru.back_end.dto.ActividadReciente;
import com.farmaceuticas_peru.back_end.dto.AdminStats;
import com.farmaceuticas_peru.back_end.service.AdminDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<AdminStats> getStats() {
        return ResponseEntity.ok(adminDashboardService.getStats());
    }

    @GetMapping("/activity")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<ActividadReciente>> getActividadReciente() {
        return ResponseEntity.ok(adminDashboardService.getActividadReciente());
    }
}