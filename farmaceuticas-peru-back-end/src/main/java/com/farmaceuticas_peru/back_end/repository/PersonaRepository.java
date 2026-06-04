package com.farmaceuticas_peru.back_end.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.farmaceuticas_peru.back_end.model.Persona;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
    boolean existsByNumDocumento(String numDocumento);
    Optional<Persona> findByNumDocumento(String numDocumento);
}