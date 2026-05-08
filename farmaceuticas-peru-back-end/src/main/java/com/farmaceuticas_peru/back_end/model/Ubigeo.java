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
@Table(name="ubigeo")
public class Ubigeo {
    @Id    
    @Column(name="id_ubigeo")
    private String idUbigeo;

    @Column
    private String departamento;

    @Column
    private String provincia;

    @Column
    private String distrito;            
}
