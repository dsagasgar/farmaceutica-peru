package com.farmaceuticas_peru.back_end.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {
}