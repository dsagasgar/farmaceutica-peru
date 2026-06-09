import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { VentaService } from '../../../services/venta.service';
import { CompraService } from '../../../services/compra.service';
import { Usuario, AdminStats, ActividadReciente, Venta, CompraProveedor } from '../../../models/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dashboardService = inject(AdminDashboardService);
  private ventaService = inject(VentaService);
  private compraService = inject(CompraService);
  private cdr = inject(ChangeDetectorRef);

  usuario: Usuario | null = this.authService.obtenerUsuarioActual();
  stats$!: Observable<AdminStats>;
  actividadReciente$!: Observable<ActividadReciente[]>;

  // MANAGEMENT STATE: Control de navegación interna sin recargar pantalla
  pestanaActiva: 'stats' | 'ventas' | 'almacen' = 'stats';

  // AUDIT SUB-STATES: Variables destinadas al análisis gerencial
  idVentaBusqueda: string = '';
  ventaAuditoria: Venta | null = null;
  buscandoVenta: boolean = false;
  errorVenta: string = '';

  comprasAuditoria: CompraProveedor[] = [];
  cargandoCompras: boolean = false;

  ngOnInit(): void {
    this.cargarMetricasPrincipales();
  }

  private cargarMetricasPrincipales(): void {
    this.stats$ = this.dashboardService.getStats();
    this.actividadReciente$ = this.dashboardService.getActividadReciente();
  }

  cambiarPestana(nuevaPestana: 'stats' | 'ventas' | 'almacen'): void {
    this.pestanaActiva = nuevaPestana;
    
    // Lazy-loading logic: Extraemos la data solo cuando el usuario hace clic en el tab
    if (nuevaPestana === 'almacen') {
      this.cargarComprasParaAuditoria();
    }
    this.cdr.detectChanges();
  }

  consultarVentaEspecifica(): void {
    const idLimpio = this.idVentaBusqueda ? this.idVentaBusqueda.trim() : '';
    if (!idLimpio) return;

    this.buscandoVenta = true;
    this.errorVenta = '';
    this.ventaAuditoria = null;
    this.cdr.detectChanges();

    this.ventaService.buscarOrdenPorId(idLimpio).subscribe({
      next: (venta) => {
        this.ventaAuditoria = venta;
        this.buscandoVenta = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.buscandoVenta = false;
        this.errorVenta = err.status === 404 
          ? `No existe registro de venta con el identificador "${idLimpio}".` 
          : 'Error de red al conectar con el servidor de base de datos.';
        this.cdr.detectChanges();
      }
    });
  }

  private cargarComprasParaAuditoria(): void {
    this.cargandoCompras = true;
    this.cdr.detectChanges();

    // CORREGIDO: Cambiado a getTodasLasCompras para que persistan los registros recibidos
    this.compraService.getTodasLasCompras().subscribe({
      next: (data) => {
        this.comprasAuditoria = data;
        this.cargandoCompras = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Inability to fetch historical workflows:', err);
        this.cargandoCompras = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}