import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertsService } from '../../shared/services/alerts.service';
import { MovimientosService } from '../../services/movimientos.service';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../shared/services/export.service';

@Component({
  selector: 'app-movimientos',
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss'
})
export class MovimientosComponent implements OnInit {
  movimientos: any[] = [];
  movimientosFiltrados: any[] = [];
  displayedMovimientos: any[] = [];

  filtroTipo = '';
  filtroProducto = '';
  filtroInicio = '';
  filtroFin = '';

  page = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  rangeStart = 0;
  rangeEnd = 0;
  visiblePages: number[] = [];
  pageSizeOptions = [5, 10, 15, 20];

  constructor(
    private movimientosServ: MovimientosService,
    private alertSrv: AlertsService,
    private exportSrv: ExportService
  ) {}

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.movimientosServ.getMovimientos().subscribe({
      next: (res) => {
        if (res.status === 'OK') {
          this.movimientos = res.data.map((m: any) => {
            const fechaOriginal = m.fecha || m.fecha_movimiento;
            const fecha = fechaOriginal ? new Date(fechaOriginal) : new Date();

            return {
              ...m,
              fecha_movimiento: isNaN(fecha.getTime()) ? new Date() : fecha
            };
          });
          this.movimientosFiltrados = [...this.movimientos];
          this.totalItems = this.movimientosFiltrados.length;
          this.calcularPaginacion();
        }
      },
      error: (err) => {
        console.error('Error al cargar movimientos', err);
        this.alertSrv.showErrorAlert('Error', 'No se pudieron cargar los movimientos.');
      }
    });
  }

  aplicarFiltro(): void {
    const tipo = this.filtroTipo.toLowerCase();
    const texto = this.filtroProducto.toLowerCase();
    const inicio = this.filtroInicio ? new Date(this.filtroInicio) : null;
    const fin = this.filtroFin ? new Date(this.filtroFin) : null;

    this.movimientosFiltrados = this.movimientos.filter(m => {
      const coincideTipo = !tipo || m.tipo.toLowerCase() === tipo;
      const coincideTexto = m.producto_nombre?.toLowerCase().includes(texto);
      const fecha = new Date(m.fecha_movimiento);
      const coincideFecha = (!inicio || fecha >= inicio) && (!fin || fecha <= fin);
      return coincideTipo && coincideTexto && coincideFecha;
    });

    this.totalItems = this.movimientosFiltrados.length;
    this.calcularPaginacion();
  }

  exportarExcel(): void {
    if (!this.movimientos.length) {
      this.alertSrv.showInfoAlert('Sin datos', 'No hay movimientos para exportar.');
      return;
    }

    const datosExportar = this.movimientos.map(m => ({
      'Tipo': m.tipo,
      'Producto': m.producto_nombre || 'N/A',
      'Lote': m.num_lote || '—',
      'Cantidad': m.cantidad,
      'Motivo': m.motivo || 'N/A',
      'Usuario': m.usuario_nombre || 'Sistema',
      'Fecha': new Date(m.fecha_movimiento).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    this.exportSrv.exportToExcel(datosExportar, 'movimientos', 'Movimientos de Inventario');
    this.alertSrv.showSuccessAlert('Exportado', `Excel generado con ${datosExportar.length} registros`);
  }

  exportarPDF(): void {
    if (!this.movimientos.length) {
      this.alertSrv.showInfoAlert('Sin datos', 'No hay movimientos para exportar.');
      return;
    }

    const headers = ['Tipo', 'Producto', 'Lote', 'Cantidad', 'Motivo', 'Usuario', 'Fecha'];

    const data = this.movimientos.map(m => [
      m.tipo,
      m.producto_nombre || 'N/A',
      m.num_lote || '—',
      m.cantidad.toString(),
      m.motivo || 'N/A',
      m.usuario_nombre || 'Sistema',
      new Date(m.fecha_movimiento).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    ]);

    this.exportSrv.exportToPDF(
      headers,
      data,
      'Movimientos de Inventario',
      'movimientos',
      'landscape'
    );

    this.alertSrv.showSuccessAlert('Exportado', `PDF generado con ${data.length} registros`);
  }

  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroProducto = '';
    this.filtroInicio = '';
    this.filtroFin = '';
    this.movimientosFiltrados = [...this.movimientos];
    this.totalItems = this.movimientosFiltrados.length;
    this.calcularPaginacion();
  }

  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.goToPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;

    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.rangeStart = startIndex + 1;
    this.rangeEnd = Math.min(endIndex, this.totalItems);
    this.visiblePages = this.getVisiblePages();

    this.displayedMovimientos = this.movimientosFiltrados.slice(startIndex, endIndex);
  }

  prevPage(): void {
    if (this.page > 1) this.goToPage(this.page - 1);
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.goToPage(this.page + 1);
  }

  getVisiblePages(): number[] {
    const maxPagesToShow = 5;
    let start = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let end = Math.min(this.totalPages, start + maxPagesToShow - 1);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
