package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "formulas_magistrales")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "venta") // CORREGIDO: Evita evaluar el string extendido de la venta madre
@EqualsAndHashCode(exclude = "venta") // CORREGIDO: Remueve la recursividad en contextos de persistencia (persistence contexts)
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
    @JsonIgnore // CORREGIDO: Bloqueo absoluto de serialización cíclica
    private Venta venta;
}