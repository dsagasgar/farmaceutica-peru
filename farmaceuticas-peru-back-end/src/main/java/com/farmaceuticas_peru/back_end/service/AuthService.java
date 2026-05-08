package com.farmaceuticas_peru.back_end.service;

import java.util.Collections;
import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.farmaceuticas_peru.back_end.dto.AuthResponseDTO;
import com.farmaceuticas_peru.back_end.dto.LoginRequestDTO;
import com.farmaceuticas_peru.back_end.dto.PersonaRequest;
import com.farmaceuticas_peru.back_end.dto.RegisterRequestDTO;
import com.farmaceuticas_peru.back_end.model.Modulo;
import com.farmaceuticas_peru.back_end.model.Persona;
import com.farmaceuticas_peru.back_end.model.Usuario;
import com.farmaceuticas_peru.back_end.model.enums.Rol;
import com.farmaceuticas_peru.back_end.repository.ModuloRepository;
import com.farmaceuticas_peru.back_end.repository.PersonaRepository;
import com.farmaceuticas_peru.back_end.repository.UsuarioRepository;
import com.farmaceuticas_peru.back_end.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;
    private final ModuloRepository moduloRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtService;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if(usuarioRepository.findByEmail(request.getEmail()).isPresent())
            throw new IllegalArgumentException("Hay un usuario registrado con ese email");

        PersonaRequest personaDTO = request.getPersona();
        if(personaDTO == null)
            throw new IllegalArgumentException("Los datos de la persona son obligatorios");

        if(personaRepository.existsByNumDocumento(personaDTO.getNumDocumento()))
            throw new IllegalArgumentException("Hay un usuario registrado con ese numero de documento");

        Persona persona = PersonaRequest.toEntity(personaDTO);
        personaRepository.save(persona);

        // Create the user 
        var usuario = Usuario.builder()
                .email(request.getEmail())
                .persona(persona)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(Rol.CAJERO) // Always set a default role
                .build();
        usuarioRepository.save(usuario);

        List<Modulo> modules = moduloRepository.findByRolesContains(Rol.CAJERO);
        var token = jwtService.generateToken(usuario, modules);

        return AuthResponseDTO.builder()
                .token(token)
                .build();
    }

    // You have an existing account and want to log in 
    public AuthResponseDTO login(LoginRequestDTO request) {
        var usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email no encontrado"));

        if(!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash()))
            throw new BadCredentialsException("Contraseña incorrecta");

        List<Modulo> modules = Collections.emptyList();
        
        if(usuario.getRol() != null) {
            modules = moduloRepository.findByRolesContains(usuario.getRol());
        }

        var token = jwtService.generateToken(usuario, modules);
        
        return AuthResponseDTO.builder()
                .token(token)
                .build();
    }
}