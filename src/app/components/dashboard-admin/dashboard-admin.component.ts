import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DashboardService } from '../../services/dashboard.service';
import { StockBajo, ProductoAVencer, TopProductoVendido, StatsCitas, StatsCrecimiento } from '../../interfaces/dashboard.interface';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {

  // Listas para las alertas
  alertasStockBajo: StockBajo[] = [];
  alertasProductosAVencer: ProductoAVencer[] = [];
  
  // Datos para la gráfica
  datosGraficaTopVendidos: TopProductoVendido[] = [];

  statsCitas: StatsCitas = {
    hoy: { total_citas_hoy: 0, citas_confirmadas: 0 },
    por_confirmar: { total_por_confirmar: 0 },
    proxima_semana: { total_proxima_semana: 0 }
  };
  
    statsCrecimiento: StatsCrecimiento = {
    nuevos_clientes_mes: { total_nuevos_clientes: 0 }
  };


  cargando: boolean = true; 

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    this.cargando = true;
    this.dashboardService.getDashboardAdminData().subscribe({
      next: (resp) => {
        // ACCESO CORRECTO: resp.data ahora es un objeto DashboardData, no un array.
        this.alertasStockBajo = resp.data.alertasStockBajo;
        this.alertasProductosAVencer = resp.data.alertasProductosAVencer;
        this.datosGraficaTopVendidos = resp.data.graficaTopVendidos;
        this.statsCitas = resp.data.statsCitas;
        this.statsCrecimiento = resp.data.statsCrecimiento;


        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar datos del dashboard:', err);
        const msg = err.error?.message || 'No se pudieron cargar los datos del dashboard. Verifique el servidor.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

}