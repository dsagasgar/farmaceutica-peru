package com.farmaceuticas_peru.back_end.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {

    long countByFecha(LocalDate fecha);

    @Query("SELECT SUM(v.total) FROM Venta v WHERE v.fecha = :fecha")
    BigDecimal sumTotalByFecha(LocalDate fecha);

    List<Venta> findTop5ByOrderByFechaDesc();
}