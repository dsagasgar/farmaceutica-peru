package com.farmaceuticas_peru.back_end.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.farmaceuticas_peru.back_end.model.Persona;
import com.farmaceuticas_peru.back_end.model.Sexo;
import com.farmaceuticas_peru.back_end.model.TipoDocumento;
import com.farmaceuticas_peru.back_end.model.Ubigeo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonaResponse {
    private Long idpersona;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombres;
    private Sexo sexo;
    private LocalDate fechaNacimiento;
    private TipoDocumento tipoDocumento;
    private String numDocumento;
    private String direccion;
    private String telefono;
    private Ubigeo ubigeo;

    public static PersonaResponse fromEntity(Persona persona){
        return PersonaResponse.builder()
                .idpersona(persona.getIdPersona())
                .apellidoPaterno(persona.getApellidoPaterno())
                .apellidoMaterno(persona.getApellidoMaterno())
                .nombres(persona.getNombres())
                .sexo(persona.getSexo())
                .fechaNacimiento(persona.getFechaNacimiento())
                .tipoDocumento(persona.getTipoDocumento())
                .numDocumento(persona.getNumDocumento())
                .direccion(persona.getDireccion())
                .telefono(persona.getTelefono())
                .ubigeo(persona.getUbigeo())
                .build();
    }
    public static List<PersonaResponse> fromEntities(List<Persona> persona){
        return persona.stream()
                .map(PersonaResponse::fromEntity)
                .collect(Collectors.toList());
    }

}