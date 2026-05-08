package com.farmaceuticas_peru.back_end.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmaceuticas_peru.back_end.model.TipoDocumento;
import com.farmaceuticas_peru.back_end.service.TipoDocumentoService;

@RestController
@RequestMapping(path="api/v1/tipodocumento")
public class TipoDocumentoController {
    private final Logger logger= LoggerFactory.getLogger(this.getClass());

    @Autowired
    TipoDocumentoService tipoDocumentoService;

    @GetMapping
    public ResponseEntity<?> getTipoDocumentos(){
        List<TipoDocumento> listaTipoDocumento=null;
        try{
            listaTipoDocumento=tipoDocumentoService.getTipoDocumentos();
        }catch(Exception e ){
            logger.error("Error inesperado",e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(listaTipoDocumento);
    }

}
