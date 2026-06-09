package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.farmaceuticas_peru.back_end.model.enums.EstadoVenta;

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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "ventas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"items", "itemsFormula"})
@EqualsAndHashCode(exclude = {"items", "itemsFormula"})
public class Venta {

    @Id
    private String id;

    private LocalDate fecha;

    // CORREGIDO: Cambiado a FetchType.LAZY para mitigar la explosión de uniones redundantes en memoria
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ItemVenta> items;

    // CORREGIDO: Cambiado a FetchType.LAZY para permitir la carga fluida por Jackson
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
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