package com.farmaceuticas_peru.back_end.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmaceuticas_peru.back_end.dto.AuthRequest;
import com.farmaceuticas_peru.back_end.dto.AuthResponse;
import com.farmaceuticas_peru.back_end.model.Modulo;
import com.farmaceuticas_peru.back_end.model.Usuario;
import com.farmaceuticas_peru.back_end.security.JwtUtil;
import com.farmaceuticas_peru.back_end.repository.ModuloRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ModuloRepository moduloRepository;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        final UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        final Usuario usuario = (Usuario) userDetails;

        List<Modulo> modules = Collections.emptyList();
        if (usuario.getRol() != null) {
            modules = moduloRepository.findByRolesContains(usuario.getRol());
        }

        final String jwt = jwtUtil.generateToken(usuario, modules);

        return ResponseEntity.ok(new AuthResponse(jwt));
    }
}