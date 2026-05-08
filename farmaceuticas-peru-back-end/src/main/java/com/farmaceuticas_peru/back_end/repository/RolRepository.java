package com.farmaceuticas_peru.back_end.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.enums.Rol;

@Repository 
public interface RolRepository extends JpaRepository<Rol, Integer> {
}

