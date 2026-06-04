package com.farmaceuticas_peru.back_end.dto;

import com.farmaceuticas_peru.back_end.model.Usuario;
import com.farmaceuticas_peru.back_end.model.enums.Rol;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String email;
    private String nombre;
    private Rol rol;

    public static UserDTO fromEntity(Usuario usuario) {
        return new UserDTO(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getNombre(),
            usuario.getRol()
        );
    }
}