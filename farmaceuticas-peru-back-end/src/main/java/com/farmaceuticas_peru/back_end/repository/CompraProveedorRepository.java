package com.farmaceuticas_peru.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.CompraProveedor;
import com.farmaceuticas_peru.back_end.model.enums.EstadoCompra;

@Repository
public interface CompraProveedorRepository extends JpaRepository<CompraProveedor, String> {
    List<CompraProveedor> findByEstado(EstadoCompra estado);
}