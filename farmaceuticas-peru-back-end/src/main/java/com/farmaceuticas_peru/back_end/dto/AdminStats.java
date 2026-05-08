package com.farmaceuticas_peru.back_end.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStats {
    private long totalUsuarios;
    private long totalProductos;
    private long ventasHoy;
    private BigDecimal ingresosHoy;
}