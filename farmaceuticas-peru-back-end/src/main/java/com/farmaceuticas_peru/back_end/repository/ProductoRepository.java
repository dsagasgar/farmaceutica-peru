package com.farmaceuticas_peru.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, String> {
    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    // Busca productos con stock para venta mayor a un valor
    List<Producto> findByStockVentaGreaterThan(int stock);

    // Busca productos por nombre y con stock para venta mayor a un valor
    List<Producto> findByNombreContainingIgnoreCaseAndStockVentaGreaterThan(String nombre, int stock);
}