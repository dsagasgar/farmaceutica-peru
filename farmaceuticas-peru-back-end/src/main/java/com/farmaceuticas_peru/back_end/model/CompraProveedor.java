package com.farmaceuticas_peru.back_end.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.farmaceuticas_peru.back_end.model.enums.EstadoCompra;
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
@Table(name = "compras_proveedor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompraProveedor {

    @Id
    private String id;

    private String proveedor;

    @Column(name = "numero_factura")
    private String numeroFactura;

    @Column(name = "fecha_pedido")
    private LocalDate fechaPedido;

    @Column(name = "fecha_recepcion")
    private LocalDate fechaRecepcion;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ItemCompra> items;

    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private EstadoCompra estado;

    @Column(name = "observaciones_almacen")
    private String observacionesAlmacen;
}