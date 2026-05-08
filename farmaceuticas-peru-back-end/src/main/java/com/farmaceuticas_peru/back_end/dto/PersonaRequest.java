package com.farmaceuticas_peru.back_end.dto;

import java.time.LocalDate;

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
public class PersonaRequest {
    private Long idPersona;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombres;
    private String idSexo;
    private LocalDate fechaNacimiento;
    private Integer idTipoDcoumento;
    private String numDocumento;
    private String direccion;
    private String telefono;
    private String idUbigeo;

    public static Persona toEntity(PersonaRequest personaRequest){
        Persona persona = new Persona();
        if(personaRequest.getIdPersona()!=null && personaRequest.getIdPersona()>0)
            persona.setIdPersona(persona.getIdPersona());
        else
            persona.setIdPersona(null);

        persona.setApellidoPaterno(personaRequest.getApellidoPaterno());
        persona.setApellidoMaterno(personaRequest.getApellidoMaterno());
        persona.setNombres(personaRequest.getNombres());
        persona.setFechaNacimiento(personaRequest.getFechaNacimiento());
        persona.setDireccion(personaRequest.getDireccion());
        persona.setNumDocumento(personaRequest.getNumDocumento());
        persona.setTelefono(personaRequest.getTelefono());
        if(personaRequest.getIdSexo()!=null)
            persona.setSexo(Sexo.builder().idSexo(personaRequest.getIdSexo()).build());
        if(personaRequest.getIdTipoDcoumento()!=null)
            persona.setTipoDocumento(TipoDocumento.builder().idTipoDocumento(personaRequest.getIdTipoDcoumento()).build());
        if(personaRequest.getIdUbigeo()!=null)
            persona.setUbigeo(Ubigeo.builder().idUbigeo(personaRequest.getIdUbigeo()).build());
        return persona;
    }
}