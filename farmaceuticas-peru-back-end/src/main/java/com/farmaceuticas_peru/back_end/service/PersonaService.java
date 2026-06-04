package com.farmaceuticas_peru.back_end.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.stereotype.Service;

import com.farmaceuticas_peru.back_end.dto.PersonaRequest;
import com.farmaceuticas_peru.back_end.dto.PersonaResponse;
import com.farmaceuticas_peru.back_end.model.Persona;
import com.farmaceuticas_peru.back_end.repository.PersonaRepository;
import com.farmaceuticas_peru.back_end.repository.SexoRepository;
import com.farmaceuticas_peru.back_end.repository.TipoDocumentoRepository;
import com.farmaceuticas_peru.back_end.repository.UbigeoRepository;

@Service
public class PersonaService {
    private final Logger logger=LoggerFactory.getLogger(this.getClass());
    private final PersonaRepository personaRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final UbigeoRepository ubigeoRepository;
    private final SexoRepository sexoRepository;
    
    public PersonaService(PersonaRepository personaRepository, TipoDocumentoRepository tipoDocumentoRepository, UbigeoRepository ubigeoRepository, SexoRepository sexoRepository) {
        this.personaRepository = personaRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.ubigeoRepository = ubigeoRepository;
        this.sexoRepository = sexoRepository;
    }

    public List<PersonaResponse> listPersonas(){
        return PersonaResponse.fromEntities(personaRepository.findAll());
    }
    public PersonaResponse findPersona(Long id) throws NotFoundException {
        return PersonaResponse.fromEntity(personaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException()));
    }    
    public PersonaResponse findByNumdocumento(String nDocumento) throws NotFoundException {
        return personaRepository.findByNumDocumento(nDocumento).stream().findFirst()
                .map(PersonaResponse::fromEntity)
                .orElseThrow(() -> new NotFoundException());
    }
    
    public PersonaResponse insertPersona(PersonaRequest personaRequest){
        Persona persona = PersonaRequest.toEntity(personaRequest);
        persona.setCreatedAt(java.time.LocalDateTime.now());

        persona=personaRepository.save(persona);        
        PersonaResponse personaResponse=PersonaResponse.fromEntity(persona);        
        return personaResponse;
    } 

    public PersonaResponse updatePersona(Long id, PersonaRequest personaRequest) throws NotFoundException {
        Persona persona = personaRepository.findById(id)
            .orElseThrow(() -> new NotFoundException());

        persona.setNombres(personaRequest.getNombres());
        persona.setApellidoPaterno(personaRequest.getApellidoPaterno());
        persona.setApellidoMaterno(personaRequest.getApellidoMaterno());
        persona.setNumDocumento(personaRequest.getNumDocumento());
        // Más campos a actualizar...

        persona.setUpdatedAt(java.time.LocalDateTime.now());

        Persona personaActualizada = personaRepository.save(persona);
        return PersonaResponse.fromEntity(personaActualizada);
    }   
    
    public void deletePersona(Long id){
        personaRepository.deleteById(id);
    }
}