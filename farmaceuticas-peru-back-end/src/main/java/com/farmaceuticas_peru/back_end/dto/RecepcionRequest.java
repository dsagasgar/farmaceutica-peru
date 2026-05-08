package com.farmaceuticas_peru.back_end.dto;

import java.util.List;

import com.farmaceuticas_peru.back_end.model.ItemCompra;

import lombok.Data;

@Data
public class RecepcionRequest {
    private List<ItemCompra> itemsVerificados;
    private String observaciones;
}