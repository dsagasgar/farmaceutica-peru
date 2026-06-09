package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table(name = "items_compra")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "compra") // Rompe el bucle en el método toString()
@EqualsAndHashCode(exclude = "compra") // Rompe el bucle en contextos de persistencia (persistence contexts)
public class ItemCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "producto_id")
    private String productoId;

    @Column(name = "nombre_producto")
    private String nombreProducto;

    @Column(name = "cantidad_pedida")
    private int cantidadPedida;

    @Column(name = "cantidad_recibida")
    private Integer cantidadRecibida;

    @Column(name = "costo_unitario")
    private BigDecimal costoUnitario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_id")
    @JsonIgnore // CORREGIDO: Bloqueo absoluto de serialización cíclica asíncrona
    private CompraProveedor compra;
}