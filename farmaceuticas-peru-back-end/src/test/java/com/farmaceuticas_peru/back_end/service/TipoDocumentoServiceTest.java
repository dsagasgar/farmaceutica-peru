package com.farmaceuticas_peru.back_end.service;

import com.farmaceuticas_peru.back_end.model.TipoDocumento;
import com.farmaceuticas_peru.back_end.repository.TipoDocumentoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TipoDocumentoServiceTest {

    @Mock
    private TipoDocumentoRepository tipoDocumentoRepository;

    @InjectMocks
    private TipoDocumentoService tipoDocumentoService;

    @Test
    void getTipoDocumentos_returnsAllDocumentTypes() {
        TipoDocumento td1 = TipoDocumento.builder().idTipoDocumento(1).descripcion("DNI").build();
        TipoDocumento td2 = TipoDocumento.builder().idTipoDocumento(2).descripcion("Pasaporte").build();
        when(tipoDocumentoRepository.findAll()).thenReturn(Arrays.asList(td1, td2));

        List<TipoDocumento> result = tipoDocumentoService.getTipoDocumentos();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("DNI", result.get(0).getDescripcion());
        assertEquals("Pasaporte", result.get(1).getDescripcion());
        verify(tipoDocumentoRepository, times(1)).findAll();
    }
}
