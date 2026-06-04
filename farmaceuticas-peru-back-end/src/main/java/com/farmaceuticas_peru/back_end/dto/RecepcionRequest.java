package com.farmaceuticas_peru.back_end.dto;

import java.util.List;

import lombok.Data;

@Data
public class RecepcionRequest {

    @Data
    public static class ItemRecepcion {
        private Long id;
        private Integer cantidadRecibida;
    }

    private List<ItemRecepcion> items;
    private String observaciones;
}