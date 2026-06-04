package com.farmaceuticas_peru.back_end.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private final String jwt;
    private final UserDTO user;

    public AuthResponse(String jwt, UserDTO user) {
        this.jwt = jwt;
        this.user = user;
    }
}