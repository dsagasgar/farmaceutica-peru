package com.farmaceuticas_peru.back_end.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActividadReciente {
    private String tipo; // "NUEVA_VENTA", "NUEVO_USUARIO", "RECEPCION_COMPRA"
    private String descripcion;
    private LocalDateTime fecha;
    private String usuario;
}