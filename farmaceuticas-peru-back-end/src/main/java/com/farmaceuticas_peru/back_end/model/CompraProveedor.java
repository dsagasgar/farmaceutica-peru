package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.farmaceuticas_peru.back_end.model.enums.EstadoCompra;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "compra_proveedor")
@NoArgsConstructor
@AllArgsConstructor
public class CompraProveedor {
    @Id
    private String id;
    private String proveedor;
    private String numeroFactura;
    private LocalDate fechaPedido;
    private LocalDate fechaRecepcion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "compra_id")
    private List<ItemCompra> items;

    private BigDecimal total;
    @Enumerated(EnumType.STRING)
    private EstadoCompra status;

    @Column(columnDefinition = "TEXT")
    private String observacionesAlmacen;
}
