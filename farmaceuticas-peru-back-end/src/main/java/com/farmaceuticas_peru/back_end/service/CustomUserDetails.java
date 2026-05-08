package com.farmaceuticas_peru.back_end.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.farmaceuticas_peru.back_end.model.Usuario;
import com.farmaceuticas_peru.back_end.repository.UsuarioRepository;

@Service
public class CustomUserDetails implements UserDetailsService{
    private final UsuarioRepository usuarioRepository;
    
    public CustomUserDetails(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return usuario;
    }
}