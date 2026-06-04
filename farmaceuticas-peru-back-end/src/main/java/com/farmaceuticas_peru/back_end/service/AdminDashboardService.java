package com.farmaceuticas_peru.back_end.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.farmaceuticas_peru.back_end.dto.ActividadReciente;
import com.farmaceuticas_peru.back_end.dto.AdminStats;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import com.farmaceuticas_peru.back_end.repository.UsuarioRepository;
import com.farmaceuticas_peru.back_end.repository.VentaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;

    public AdminStats getStats() {
        long totalUsuarios = usuarioRepository.count();
        long totalProductos = productoRepository.count();
        long ventasHoy = ventaRepository.countByFecha(LocalDate.now());
        BigDecimal ingresosHoy = ventaRepository.sumTotalByFecha(LocalDate.now());

        return AdminStats.builder()
                .totalUsuarios(totalUsuarios)
                .totalProductos(totalProductos)
                .ventasHoy(ventasHoy)
                .ingresosHoy(ingresosHoy != null ? ingresosHoy : BigDecimal.ZERO)
                .build();
    }

    public List<ActividadReciente> getActividadReciente() {
        // Esta es una implementación simplificada. Una implementación real requeriría
        // una tabla de auditoría o consultas más complejas.
        List<ActividadReciente> actividades = new ArrayList<>();
        ventaRepository.findTop5ByOrderByFechaDesc().forEach(venta -> {
            actividades.add(ActividadReciente.builder()
                    .tipo("NUEVA_VENTA")
                    .descripcion("Venta #" + venta.getId() + " por S/ " + venta.getTotal())
                    .fecha(venta.getFecha().atStartOfDay()) // Tiempo aproximado
                    .usuario(venta.getQuimicoId())
                    .build());
        });
        return actividades;
    }
}