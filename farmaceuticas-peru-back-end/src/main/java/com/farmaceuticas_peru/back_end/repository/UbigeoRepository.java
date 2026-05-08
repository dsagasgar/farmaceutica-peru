package com.farmaceuticas_peru.back_end.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmaceuticas_peru.back_end.model.Ubigeo;

@Repository
public interface UbigeoRepository extends JpaRepository<Ubigeo,String>{
}