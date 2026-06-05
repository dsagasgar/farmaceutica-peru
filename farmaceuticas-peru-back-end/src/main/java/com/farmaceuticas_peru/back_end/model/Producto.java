package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "productos") // Asegura que el nombre de la tabla sea "productos"
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    private String id;

    private String codigo;

    private String nombre;
    private String descripcion;

    @Column(name = "precio_unitario")
    private BigDecimal precioUnitario;

    private Integer stock;

    @Column(name = "stock_venta")
    private Integer stockVenta;

    private String categoria;
    private String marca;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    private String lote;
    private String formato;
}