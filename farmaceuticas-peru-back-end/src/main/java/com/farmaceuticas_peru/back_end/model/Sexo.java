package com.farmaceuticas_peru.back_end.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="sexo")
public class Sexo {
    @Id
    @Column(name="id_sexo")
    private String idSexo;

    @Column(nullable = false, unique = true)
    private String descripcion;

    @Column(name="desc_corto", nullable = false, unique = true)
    private String descCorto;
}
