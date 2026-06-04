package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "formulas_magistrales")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormulaMagistral {

    @Id
    private String id;

    private String nombre;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String composicion;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String procedimiento;

    private BigDecimal precio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id")
    @JsonBackReference("venta-formulas")
    private Venta venta;
}