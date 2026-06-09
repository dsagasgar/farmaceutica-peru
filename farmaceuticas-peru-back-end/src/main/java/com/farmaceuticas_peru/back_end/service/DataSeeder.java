package com.farmaceuticas_peru.back_end.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.farmaceuticas_peru.back_end.model.CompraProveedor;
import com.farmaceuticas_peru.back_end.model.ItemCompra;
import com.farmaceuticas_peru.back_end.model.Producto;
import com.farmaceuticas_peru.back_end.model.Usuario;
import com.farmaceuticas_peru.back_end.model.enums.EstadoCompra;
import com.farmaceuticas_peru.back_end.model.enums.Rol;
import com.farmaceuticas_peru.back_end.repository.CompraProveedorRepository;
import com.farmaceuticas_peru.back_end.repository.ProductoRepository;
import com.farmaceuticas_peru.back_end.repository.UsuarioRepository;
import com.farmaceuticas_peru.back_end.repository.VentaRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CompraProveedorRepository compraProveedorRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            crearUsuarios();
            crearProductos();
            crearComprasPendientes();
        }
    }

    private void crearUsuarios() {
        usuarioRepository.save(Usuario.builder()
                .id("USER-ADMIN")
                .email("admin@farmaperu.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .nombre("Admin General")
                .rol(Rol.ADMINISTRADOR)
                .build());

        usuarioRepository.save(Usuario.builder()
                .id("USER-QUIMICO")
                .email("quimico@farmaperu.com")
                .passwordHash(passwordEncoder.encode("quimico123"))
                .nombre("Juan Químico")
                .rol(Rol.QUIMICO_FARMACEUTICO)
                .build());

        usuarioRepository.save(Usuario.builder()
                .id("USER-ALMACEN")
                .email("almacen@farmaperu.com")
                .passwordHash(passwordEncoder.encode("almacen123"))
                .nombre("Ana Almacenera")
                .rol(Rol.ALMACENERO)
                .build());

        usuarioRepository.save(Usuario.builder()
                .id("USER-CAJERO")
                .email("cajero@farmaperu.com")
                .passwordHash(passwordEncoder.encode("cajero123"))
                .nombre("Carlos Cajero")
                .rol(Rol.CAJERO)
                .build());
    }

    private void crearProductos() {
        productoRepository.save(Producto.builder()
                .id("PROD-001").codigo("7750123456789").nombre("Paracetamol 500mg Caja x20")
                .descripcion("Analgésico y antipirético.").precioUnitario(new BigDecimal("15.50"))
                .stock(100).stockVenta(50).categoria("Analgésicos").marca("Genérico")
                .fechaVencimiento(LocalDate.now().plusYears(2)).lote("LOTE001").formato("Caja x 20 tabletas")
                .build());

        productoRepository.save(Producto.builder()
                .id("PROD-002").codigo("7750987654321").nombre("Amoxicilina 250mg/5ml Suspensión")
                .descripcion("Antibiótico de amplio espectro.").precioUnitario(new BigDecimal("25.00"))
                .stock(50).stockVenta(20).categoria("Antibióticos").marca("FarmaLab")
                .fechaVencimiento(LocalDate.now().plusYears(1)).lote("LOTE002").formato("Frasco 60ml")
                .build());

        productoRepository.save(Producto.builder()
                .id("PROD-003").codigo("7750111222333").nombre("Ibuprofeno 400mg")
                .descripcion("Antiinflamatorio no esteroideo.").precioUnitario(new BigDecimal("12.00"))
                .stock(200).stockVenta(0).categoria("Analgésicos").marca("SaludPlus")
                .fechaVencimiento(LocalDate.now().plusMonths(18)).lote("LOTE003").formato("Caja x 10 tabletas")
                .build());

        productoRepository.save(Producto.builder()
                .id("PROD-004").codigo("7750444555666").nombre("Vitamina C 1000mg Efervescente")
                .descripcion("Suplemento vitamínico para defensas.").precioUnitario(new BigDecimal("35.00"))
                .stock(80).stockVenta(80).categoria("Vitaminas").marca("VitaLife")
                .fechaVencimiento(LocalDate.now().plusYears(3)).lote("LOTE004").formato("Tubo x 10 tabletas")
                .build());

        productoRepository.save(Producto.builder()
                .id("PROD-005").codigo("7750777888999").nombre("Shampoo Anticaspa 400ml")
                .descripcion("Control efectivo de la caspa.").precioUnitario(new BigDecimal("45.50"))
                .stock(120).stockVenta(100).categoria("Cuidado Personal").marca("DermaClean")
                .fechaVencimiento(LocalDate.now().plusYears(2)).lote("LOTE005").formato("Botella 400ml")
                .build());

        productoRepository.save(Producto.builder()
                .id("PROD-006").codigo("7750123123123").nombre("Loratadina 10mg")
                .descripcion("Antialérgico.").precioUnitario(new BigDecimal("18.00"))
                .stock(0).stockVenta(0).categoria("Antialérgicos").marca("Genérico")
                .fechaVencimiento(LocalDate.now().plusMonths(6)).lote("LOTE006").formato("Caja x 10 tabletas")
                .build());

        // NUEVO: Omeprazol para stock de almacén
        productoRepository.save(Producto.builder()
                .id("PROD-007").codigo("7750555666111").nombre("Omeprazol 20mg Protector")
                .descripcion("Inhibidor de la bomba de protones.").precioUnitario(new BigDecimal("10.00"))
                .stock(15).stockVenta(10).categoria("Gastrointestinales").marca("Medisana")
                .fechaVencimiento(LocalDate.now().plusYears(2)).lote("LOTE007").formato("Caja x 30 cápsulas")
                .build());

        // NUEVO: Losartán para reposición urgente
        productoRepository.save(Producto.builder()
                .id("PROD-008").codigo("7750999222444").nombre("Losartán Potásico 50mg")
                .descripcion("Antihipertensivo regulador.").precioUnitario(new BigDecimal("22.50"))
                .stock(30).stockVenta(5).categoria("Cardiovasculares").marca("NeoPharma")
                .fechaVencimiento(LocalDate.now().plusMonths(24)).lote("LOTE008").formato("Caja x 30 tabletas")
                .build());
    }

    private void crearComprasPendientes() {
        // COMPRA 1: Distribuidora Farmacéutica
        List<ItemCompra> items1 = new ArrayList<>();
        items1.add(ItemCompra.builder().productoId("PROD-001").nombreProducto("Paracetamol 500mg Caja x20").cantidadPedida(50).costoUnitario(new BigDecimal("10.00")).build());
        items1.add(ItemCompra.builder().productoId("PROD-003").nombreProducto("Ibuprofeno 400mg").cantidadPedida(100).costoUnitario(new BigDecimal("8.50")).build());

        CompraProveedor compra1 = CompraProveedor.builder()
                .id("COMPRA-2026-001").proveedor("Distribuidora Farmacéutica S.A.C.")
                .numeroFactura("F001-12345").fechaPedido(LocalDate.now().minusDays(5))
                .total(new BigDecimal("1350.00")).estado(EstadoCompra.PENDIENTE_RECEPCION)
                .build();
        
        // CORREGIDO: Sincronizar bidireccionalidad explícita antes de persistir en PostgreSQL
        items1.forEach(item -> item.setCompra(compra1));
        compra1.setItems(items1);
        compraProveedorRepository.save(compra1);

        // COMPRA 2: Laboratorios DERMA
        List<ItemCompra> items2 = new ArrayList<>();
        items2.add(ItemCompra.builder().productoId("PROD-005").nombreProducto("Shampoo Anticaspa 400ml").cantidadPedida(70).costoUnitario(new BigDecimal("30.00")).build());

        CompraProveedor compra2 = CompraProveedor.builder()
                .id("COMPRA-2026-002").proveedor("Laboratorios DERMA S.A.")
                .numeroFactura("F002-54321").fechaPedido(LocalDate.now().minusDays(3))
                .total(new BigDecimal("2100.00")).estado(EstadoCompra.PENDIENTE_RECEPCION)
                .build();
        
        items2.forEach(item -> item.setCompra(compra2));
        compra2.setItems(items2);
        compraProveedorRepository.save(compra2);

        // NUEVA COMPRA 3: Llenado de stock para Omeprazol y Losartán (Abastecimiento Norte S.A.)
        List<ItemCompra> items3 = new ArrayList<>();
        items3.add(ItemCompra.builder().productoId("PROD-007").nombreProducto("Omeprazol 20mg Protector").cantidadPedida(200).costoUnitario(new BigDecimal("5.00")).build());
        items3.add(ItemCompra.builder().productoId("PROD-008").nombreProducto("Losartán Potásico 50mg").cantidadPedida(150).costoUnitario(new BigDecimal("12.00")).build());

        CompraProveedor compra3 = CompraProveedor.builder()
                .id("COMPRA-2026-003").proveedor("Abastecimiento Farmacéutico del Norte S.A.")
                .numeroFactura("F009-88776").fechaPedido(LocalDate.now().minusDays(1))
                .total(new BigDecimal("2800.00")).estado(EstadoCompra.PENDIENTE_RECEPCION)
                .build();

        items3.forEach(item -> item.setCompra(compra3));
        compra3.setItems(items3);
        compraProveedorRepository.save(compra3);
    }
}