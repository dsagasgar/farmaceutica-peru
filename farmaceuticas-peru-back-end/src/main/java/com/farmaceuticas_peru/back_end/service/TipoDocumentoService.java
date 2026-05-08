package com.farmaceuticas_peru.back_end.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.farmaceuticas_peru.back_end.model.TipoDocumento;
import com.farmaceuticas_peru.back_end.repository.TipoDocumentoRepository;

@Service
public class TipoDocumentoService {

    @Autowired
    TipoDocumentoRepository tipoDocumentoRepository;

    public List<TipoDocumento> getTipoDocumentos(){
        return tipoDocumentoRepository.findAll();
    }
}