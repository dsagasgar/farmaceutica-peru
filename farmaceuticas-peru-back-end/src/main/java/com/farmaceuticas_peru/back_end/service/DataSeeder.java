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

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CompraProveedorRepository compraProveedorRepository;

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
        // ADMINISTRADOR (Estrictamente uno solo)
        usuarioRepository.save(Usuario.builder()
                .id("USER-ADMIN").email("admin@farmaperu.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .nombre("Admin General").rol(Rol.ADMINISTRADOR).build());

        // QUÍMICOS FARMACÉUTICOS (3 usuarios)
        usuarioRepository.save(Usuario.builder()
                .id("USER-QUIMICO-1").email("quimico1@farmaperu.com")
                .passwordHash(passwordEncoder.encode("quimico123"))
                .nombre("Dra. Marta Rincón").rol(Rol.QUIMICO_FARMACEUTICO).build());
        usuarioRepository.save(Usuario.builder()
                .id("USER-QUIMICO-2").email("quimico2@farmaperu.com")
                .passwordHash(passwordEncoder.encode("quimico123"))
                .nombre("Dr. Luis Mendoza").rol(Rol.QUIMICO_FARMACEUTICO).build());
        usuarioRepository.save(Usuario.builder()
                .id("USER-QUIMICO-3").email("quimico3@farmaperu.com")
                .passwordHash(passwordEncoder.encode("quimico123"))
                .nombre("Dra. Elena Alva").rol(Rol.QUIMICO_FARMACEUTICO).build());

        // ALMACENEROS (3 usuarios)
        usuarioRepository.save(Usuario.builder()
                .id("USER-ALMACEN-1").email("almacen1@farmaperu.com")
                .passwordHash(passwordEncoder.encode("almacen123"))
                .nombre("Pedro Almacenero").rol(Rol.ALMACENERO).build());
        usuarioRepository.save(Usuario.builder()
                .id("USER-ALMACEN-2").email("almacen2@farmaperu.com")
                .passwordHash(passwordEncoder.encode("almacen123"))
                .nombre("Lucía Castro").rol(Rol.ALMACENERO).build());
        usuarioRepository.save(Usuario.builder()
                .id("USER-ALMACEN-3").email("almacen3@farmaperu.com")
                .passwordHash(passwordEncoder.encode("almacen123"))
                .nombre("Jorge Chunga").rol(Rol.ALMACENERO).build());

        // CAJEROS (3 usuarios)
        usuarioRepository.save(Usuario.builder()
                .id("USER-CAJERO-1").email("cajero1@farmaperu.com")
                .passwordHash(passwordEncoder.encode("cajero123"))
                .nombre("Carlos Cajero").rol(Rol.CAJERO).build());
        usuarioRepository.save(Usuario.builder()
                .id("USER-CAJERO-2").email("cajero2@farmaperu.com")
                .passwordHash(passwordEncoder.encode("cajero123"))
                .nombre("Sofía Benites").rol(Rol.CAJERO).build());
        usuarioRepository.save(Usuario.builder()
                .id("USER-CAJERO-3").email("cajero3@farmaperu.com")
                .passwordHash(passwordEncoder.encode("cajero123"))
                .nombre("Andrés Flores").rol(Rol.CAJERO).build());
    }

    private void crearProductos() {
        Object[][] datosProductos = {
            {"PROD-001", "7750123456789", "Paracetamol 500mg Caja x20", "Analgésico", "15.50", 120, 60, "Analgésicos", "Genfar", "Caja x20 tab"},
            {"PROD-002", "7750987654321", "Amoxicilina 250mg/5ml Suspensión", "Antibiótico", "25.00", 50, 20, "Antibióticos", "FarmaLab", "Frasco 60ml"},
            {"PROD-003", "7750111222333", "Ibuprofeno 400mg Caja x100", "Antiinflamatorio", "12.00", 200, 0, "Analgésicos", "SaludPlus", "Caja x100 tab"},
            {"PROD-004", "7750444555666", "Vitamina C 1000mg Efervescente", "Suplemento", "35.00", 80, 80, "Vitaminas", "VitaLife", "Tubo x10 tab"},
            {"PROD-005", "7750777888999", "Shampoo Anticaspa Medicado", "Cuidado", "45.50", 120, 100, "Cuidado Personal", "DermaClean", "Botella 400ml"},
            {"PROD-006", "7750123123123", "Loratadina 10mg Alergias", "Antialérgico", "18.00", 0, 0, "Antialérgicos", "Genérico", "Caja x10 tab"},
            {"PROD-007", "7750555666111", "Omeprazol 20mg Protector", "Antiácido", "10.00", 150, 45, "Gastrointestinales", "Medisana", "Caja x30 cap"},
            {"PROD-008", "7750999222444", "Losartán Potásico 50mg", "Presión arterial", "22.50", 300, 15, "Cardiovasculares", "NeoPharma", "Caja x30 tab"},
            {"PROD-009", "7750888111222", "Azitromicina 500mg Caja x3", "Antibiótico fuerte", "18.90", 90, 40, "Antibióticos", "Portugal", "Caja x3 tab"},
            {"PROD-010", "7750333444555", "Cetirizina 10mg Antihistamínico", "Antialérgico", "8.50", 400, 250, "Antialérgicos", "Genérico", "Caja x20 tab"},
            {"PROD-011", "7750222888111", "Metformina 850mg Diabetes", "Hipoglucemiante", "14.20", 350, 180, "Antidiabéticos", "Sanofi", "Caja x30 tab"},
            {"PROD-012", "7750666333777", "Atorvastatina 20mg Colesterol", "Cardiovascular", "28.00", 210, 95, "Cardiovasculares", "Pfizer", "Caja x30 tab"},
            {"PROD-013", "7750111999222", "Fluconazol 150mg Cápsula", "Antimicótico", "6.50", 85, 30, "Antifúngicos", "Genfar", "Pastilla individual"},
            {"PROD-014", "7750555444333", "Enalapril 10mg Presión", "Presión arterial", "11.00", 500, 400, "Cardiovasculares", "Magma", "Caja x30 tab"},
            {"PROD-015", "7750444999111", "Salbutamol 100mcg Inhalador", "Broncodilatador", "19.50", 75, 55, "Respiratorios", "Glaxo", "Frasco Aerosol"},
            {"PROD-016", "7750222333444", "Diclofenaco Sódico 50mg Gel", "Gel analgésico", "13.40", 140, 80, "Analgésicos", "Bayer", "Tubo 50g"},
            {"PROD-017", "7750999888777", "Ranitidina 150mg Caja x20", "Protector gástrico", "9.00", 0, 0, "Gastrointestinales", "Genérico", "Caja x20 tab"},
            {"PROD-018", "7750666555444", "Clonazepam 2mg Controlado", "Ansiolítico", "35.00", 100, 12, "Psicotrópicos", "Roche", "Caja x30 tab"},
            {"PROD-019", "7750111444777", "Alprazolam 0.5mg Controlado", "Sedante suave", "24.50", 90, 8, "Psicotrópicos", "Pfizer", "Caja x30 tab"},
            {"PROD-020", "7750888555222", "Sertralina 50mg Antidepresivo", "Regulador de ánimo", "42.00", 110, 35, "Psicotrópicos", "NeoPharma", "Caja x30 tab"},
            {"PROD-021", "7750444111888", "Naproxeno 550mg Antinflamatorio", "Dolores fuertes", "16.80", 280, 140, "Analgésicos", "Genérico", "Caja x20 tab"},
            {"PROD-022", "7750333999222", "Prednisona 5mg Corticoide", "Inmunosupresor", "7.20", 190, 85, "Corticoides", "Genfar", "Caja x20 tab"},
            {"PROD-023", "7750777111333", "Alcohol Etílico 70 Grados 1L", "Antiséptico líquido", "10.50", 300, 210, "Cuidado Personal", "Alkofarma", "Botella 1L"},
            {"PROD-024", "7750222555999", "Gasa Esterilizada 10x10cm", "Material curación", "2.20", 1000, 800, "Dispositivos Médicos", "MedicalPerú", "Sobre individual"},
            {"PROD-025", "7750888999333", "Mascarillas Quirúrgicas x50", "Protección facial", "15.00", 150, 150, "Dispositivos Médicos", "3M", "Caja x50 unidades"},
            {"PROD-026", "7750333222111", "Panadol Antigripal Caja x24", "Multisíntomas", "19.80", 240, 130, "Respiratorios", "Glaxo", "Caja x24 tab"},
            {"PROD-027", "7750444222888", "Antalgina 500mg Gotas", "Fiebre severa", "14.50", 65, 30, "Analgésicos", "Sanofi", "Frasco Gotero 15ml"},
            {"PROD-028", "7750999111333", "Bismutol Suspensión Oral", "Antidiarreico", "21.50", 80, 45, "Gastrointestinales", "Medifarma", "Frasco 150ml"},
            {"PROD-029", "7750777555333", "Dexametasona 4mg Inyectable", "Antiinflamatorio", "5.80", 120, 60, "Corticoides", "Portugal", "Ampolla 2ml"},
            {"PROD-030", "7750111555999", "Colirio Ocular Humectante", "Lágrimas artificiales", "32.00", 70, 50, "Oftálmicos", "Alcon", "Frasco Gotero 15ml"}
        };

        for (Object[] p : datosProductos) {
            productoRepository.save(Producto.builder()
                    .id((String) p[0]).codigo((String) p[1]).nombre((String) p[2])
                    .descripcion((String) p[3]).precioUnitario(new BigDecimal((String) p[4]))
                    .stock((int) p[5]).stockVenta((int) p[6]).categoria((String) p[7])
                    .marca((String) p[8]).fechaVencimiento(LocalDate.now().plusMonths(18))
                    .lote("LOTE-" + p[0]).formato((String) p[9])
                    .build());
        }
    }

    private void crearComprasPendientes() {
        String[] proveedores = {
            "Distribuidora Farmacéutica S.A.C.", "Laboratorios DERMA S.A.", 
            "Abastecimiento del Norte S.A.", "Corporación Médica del Perú", 
            "Droguería San Borja S.A."
        };

        // Generamos exactamente 10 compras independientes para el flujo de verificación
        for (int i = 1; i <= 10; i++) {
            String compraId = String.format("COMPRA-2026-%03d", i);
            String prov = proveedores[i % proveedores.length];
            String factura = String.format("F%03d-%08d", i, 1000 + i);
            BigDecimal totalCosto = new BigDecimal(500 * i);

            List<ItemCompra> items = new ArrayList<>();
            // Relacionamos productos intercalados para tener variedad transaccional (transactional variety)
            String pId1 = String.format("PROD-%03d", ((i * 2) % 30) + 1);
            String pId2 = String.format("PROD-%03d", ((i * 3) % 30) + 1);

            items.add(ItemCompra.builder().productoId(pId1).nombreProducto("Fármaco de Reposición Tipo A").cantidadPedida(100).costoUnitario(new BigDecimal("10.50")).build());
            items.add(ItemCompra.builder().productoId(pId2).nombreProducto("Fármaco de Reposición Tipo B").cantidadPedida(50).costoUnitario(new BigDecimal("15.00")).build());

            CompraProveedor compra = CompraProveedor.builder()
                    .id(compraId).proveedor(prov).numeroFactura(factura)
                    .fechaPedido(LocalDate.now().minusDays(i))
                    .total(totalCosto).estado(EstadoCompra.PENDIENTE_RECEPCION)
                    .build();

            // Mapeo bidireccional forzado para evitar inconsistencias en JPA
            items.forEach(item -> item.setCompra(compra));
            compra.setItems(items);

            compraProveedorRepository.save(compra);
        }
    }
}