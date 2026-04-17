package com.farmaceuticas_peru.back_end.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    // Inyectamos JdbcTemplate, una utilidad de Spring para ejecutar consultas SQL fácilmente.
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/api/test-db")
    public Map<String, Object> testDatabaseConnection() {
        try {
            // Ejecutamos una consulta simple para obtener la hora actual de la BD.
            String now = jdbcTemplate.queryForObject("SELECT NOW()", String.class);
            return Map.of(
                "message", "✅ ¡Conexión con la base de datos PostgreSQL exitosa!",
                "hora_del_servidor_db", now
            );
        } catch (Exception e) {
            // Si falla, devolvemos un mensaje de error.
            return Map.of(
                "message", "❌ Error al conectar con la base de datos.",
                "error", e.getMessage()
            );
        }
    }
}
