package com.farmaceuticas_peru.back_end.dto;

import com.farmaceuticas_peru.back_end.model.enums.Rol;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDTO {
    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    @NotNull(message = "La persona es obligatoria")
    private PersonaRequest persona;

    @NotNull(message = "El rol es obligatorio")
    private Rol tipoRol;
}
