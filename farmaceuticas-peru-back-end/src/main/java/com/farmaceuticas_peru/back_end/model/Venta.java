package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.farmaceuticas_peru.back_end.model.enums.EstadoVenta;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ventas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venta {

    @Id
    private String id;

    private LocalDate fecha;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference("venta-items")
    private List<ItemVenta> items;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference("venta-formulas")
    private List<FormulaMagistral> itemsFormula;

    private BigDecimal total;

    @Column(name = "quimico_id")
    private String quimicoId;

    @Column(name = "cajero_id")
    private String cajeroId;

    @Column(name = "cliente_nombre")
    private String clienteNombre;

    @Enumerated(EnumType.STRING)
    private EstadoVenta estado;
}