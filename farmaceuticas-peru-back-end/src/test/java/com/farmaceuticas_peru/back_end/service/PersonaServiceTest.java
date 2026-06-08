package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.dto.PersonaRequest;
import com.farmaceuticas_peru.back_end.dto.PersonaResponse;
import com.farmaceuticas_peru.back_end.model.Persona;
import com.farmaceuticas_peru.back_end.repository.PersonaRepository;
import com.farmaceuticas_peru.back_end.repository.SexoRepository;
import com.farmaceuticas_peru.back_end.repository.TipoDocumentoRepository;
import com.farmaceuticas_peru.back_end.repository.UbigeoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PersonaServiceTest {

    @Mock
    private PersonaRepository personaRepository;

    @Mock
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Mock
    private UbigeoRepository ubigeoRepository;

    @Mock
    private SexoRepository sexoRepository;

    @InjectMocks
    private PersonaService personaService;

    @Test
    void listPersonas_returnsList() {
        Persona p1 = Persona.builder().idPersona(1L).nombres("Juan").apellidoPaterno("Perez").build();
        Persona p2 = Persona.builder().idPersona(2L).nombres("Maria").apellidoPaterno("Gomez").build();
        when(personaRepository.findAll()).thenReturn(Arrays.asList(p1, p2));

        List<PersonaResponse> result = personaService.listPersonas();

        assertEquals(2, result.size());
        assertEquals("Juan", result.get(0).getNombres());
        assertEquals("Maria", result.get(1).getNombres());
        verify(personaRepository, times(1)).findAll();
    }

    @Test
    void findPersona_whenExists_returnsPersonaResponse() throws NotFoundException {
        Persona p = Persona.builder().idPersona(1L).nombres("Juan").apellidoPaterno("Perez").build();
        when(personaRepository.findById(1L)).thenReturn(Optional.of(p));

        PersonaResponse result = personaService.findPersona(1L);

        assertNotNull(result);
        assertEquals("Juan", result.getNombres());
        verify(personaRepository, times(1)).findById(1L);
    }

    @Test
    void findPersona_whenNotExists_throwsNotFoundException() {
        when(personaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            personaService.findPersona(1L);
        });

        verify(personaRepository, times(1)).findById(1L);
    }

    @Test
    void findByNumdocumento_whenExists_returnsPersonaResponse() throws NotFoundException {
        Persona p = Persona.builder().idPersona(1L).nombres("Juan").numDocumento("12345678").build();
        when(personaRepository.findByNumDocumento("12345678")).thenReturn(Optional.of(p));

        PersonaResponse result = personaService.findByNumdocumento("12345678");

        assertNotNull(result);
        assertEquals("12345678", result.getNumDocumento());
        verify(personaRepository, times(1)).findByNumDocumento("12345678");
    }

    @Test
    void findByNumdocumento_whenNotExists_throwsNotFoundException() {
        when(personaRepository.findByNumDocumento("12345678")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            personaService.findByNumdocumento("12345678");
        });

        verify(personaRepository, times(1)).findByNumDocumento("12345678");
    }

    @Test
    void insertPersona_savesAndReturnsResponse() {
        PersonaRequest request = PersonaRequest.builder()
                .nombres("Juan")
                .apellidoPaterno("Perez")
                .apellidoMaterno("Gomez")
                .fechaNacimiento(LocalDate.of(1990, 1, 1))
                .numDocumento("12345678")
                .direccion("Av. Lima 123")
                .telefono("987654321")
                .build();

        Persona savedPersona = PersonaRequest.toEntity(request);
        savedPersona.setIdPersona(1L);

        when(personaRepository.save(any(Persona.class))).thenReturn(savedPersona);

        PersonaResponse result = personaService.insertPersona(request);

        assertNotNull(result);
        assertEquals(1L, result.getIdpersona());
        assertEquals("Juan", result.getNombres());
        verify(personaRepository, times(1)).save(any(Persona.class));
    }

    @Test
    void updatePersona_whenExists_updatesAndSaves() throws NotFoundException {
        Persona p = Persona.builder()
                .idPersona(1L)
                .nombres("Juan")
                .apellidoPaterno("Perez")
                .build();

        PersonaRequest request = PersonaRequest.builder()
                .nombres("Juan Carlos")
                .apellidoPaterno("Perez Diaz")
                .apellidoMaterno("Gomez")
                .numDocumento("12345678")
                .build();

        when(personaRepository.findById(1L)).thenReturn(Optional.of(p));
        when(personaRepository.save(any(Persona.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PersonaResponse result = personaService.updatePersona(1L, request);

        assertNotNull(result);
        assertEquals("Juan Carlos", result.getNombres());
        assertEquals("Perez Diaz", result.getApellidoPaterno());
        verify(personaRepository, times(1)).findById(1L);
        verify(personaRepository, times(1)).save(p);
    }

    @Test
    void updatePersona_whenNotExists_throwsNotFoundException() {
        PersonaRequest request = PersonaRequest.builder().nombres("Juan Carlos").build();
        when(personaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            personaService.updatePersona(1L, request);
        });

        verify(personaRepository, times(1)).findById(1L);
        verify(personaRepository, never()).save(any());
    }

    @Test
    void deletePersona_callsRepositoryDelete() {
        doNothing().when(personaRepository).deleteById(1L);

        personaService.deletePersona(1L);

        verify(personaRepository, times(1)).deleteById(1L);
    }
}
