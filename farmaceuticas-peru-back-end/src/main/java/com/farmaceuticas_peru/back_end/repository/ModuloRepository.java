package com.farmaceuticas_peru.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.Modulo;
import com.farmaceuticas_peru.back_end.model.enums.Rol;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Integer> {
    List<Modulo> findByRolesContains(Rol rol);
}