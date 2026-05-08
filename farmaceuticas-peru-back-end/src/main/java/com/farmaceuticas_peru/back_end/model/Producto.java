package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Producto {
    @Id
    private String id;

    @Column(unique = true)
    private String codigo; // SKU o código de barras

    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private BigDecimal precioUnitario;

    private int stock; // Stock total en almacén

    private int stockVenta; // Stock disponible para la venta al público

    private String categoria;
    private String marca;
    private LocalDate fechaVencimiento;
    private String lote;
    private String formato; // Ej. "Caja x 20 tabletas" o "Frasco x 10 ml"
}
