package com.farmaceuticas_peru.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, String> {

    // Búsqueda para Almacenero/Admin: encuentra por nombre en todos los productos.
    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    // Búsqueda para QF: encuentra por nombre solo en productos con stock para venta.
    List<Producto> findByNombreContainingIgnoreCaseAndStockVentaGreaterThan(String nombre, int stock);

    // Búsqueda para QF: encuentra todos los productos con stock para venta.
    List<Producto> findByStockVentaGreaterThan(int stock);
}