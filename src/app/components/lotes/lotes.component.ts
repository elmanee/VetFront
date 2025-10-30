import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { AlertsService } from '../../shared/services/alerts.service';
import { LostesFormComponent } from './lostes-form/lostes-form.component';
import { ExportService } from '../../shared/services/export.service';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    LostesFormComponent
  ],
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.scss']
})
export class LotesComponent implements OnInit {

  //vista
  openForm = false;
  selectedLote: any | null = null;

  page = 1;
  pageSize = 8;
  totalItems = 0;
  totalPages = 0;
  rangeStart = 0;
  rangeEnd = 0;
  visiblePages: number[] = [];
  pageSizeOptions = [5, 8, 10, 15, 20];

  lotes: any[] = [];
  lotesFiltrados: any[] = [];
  proveedores: any[] = [];

  filtro: string = '';
  filtroProveedor: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtrosVisible = true;

  constructor(
    private inventarioSrv: InventarioService,
    private alertSrv: AlertsService,
    private exportSrv: ExportService,
  ) {}

  ngOnInit(): void {
    this.cargarLotes();
  }

  exportarExcel(): void {
    if (!this.lotes.length) {
      this.alertSrv.showInfoAlert('Sin datos', 'No hay lotes para exportar.');
      return;
    }

    const datosExportar = this.lotes.map(l => ({
      'Número de Lote': l.num_lote || 'N/A',
      'Producto': l.producto_nombre || 'N/A',
      'Cantidad Inicial': l.cantidad_inicial,
      'Cantidad Disponible': l.cantidad_disponible,
      'Fecha de Ingreso': new Date(l.fecha_ingreso).toLocaleDateString('es-MX'),
      'Fecha de Caducidad': new Date(l.fecha_caducidad).toLocaleDateString('es-MX'),
      'Proveedor': l.proveedor_nombre || 'No registrado'
    }));

    this.exportSrv.exportToExcel(datosExportar, 'lotes', 'Gestión de Lotes');
    this.alertSrv.showSuccessAlert('Exportado', `Excel generado con ${datosExportar.length} registros`);
  }

  exportarPDF(): void {
    if (!this.lotes.length) {
      this.alertSrv.showInfoAlert('Sin datos', 'No hay lotes para exportar.');
      return;
    }

    const headers = ['Número de Lote', 'Producto', 'Cant. Inicial', 'Disponible', 'Ingreso', 'Caducidad', 'Proveedor'];

    const data = this.lotes.map(l => [
      l.num_lote || 'N/A',
      l.producto_nombre || 'N/A',
      l.cantidad_inicial.toString(),
      l.cantidad_disponible.toString(),
      new Date(l.fecha_ingreso).toLocaleDateString('es-MX'),
      new Date(l.fecha_caducidad).toLocaleDateString('es-MX'),
      l.proveedor_nombre || 'No registrado'
    ]);

    this.exportSrv.exportToPDF(
      headers,
      data,
      'Gestión de Lotes',
      'lotes',
      'landscape'
    );

    this.alertSrv.showSuccessAlert('Exportado', `PDF generado con ${data.length} registros`);
  }

  cargarLotes(): void {
    this.inventarioSrv.getLotes().subscribe({
      next: (res) => {
        if (res.status === 'OK' && res.data) {
          this.lotes = res.data;
          this.lotesFiltrados = [...this.lotes];
          this.proveedores = this.obtenerProveedoresUnicos();
          this.totalItems = this.lotesFiltrados.length;
          this.calcularPaginacion();
        } else {
          this.alertSrv.showErrorAlert('Sin datos', 'No se encontraron lotes registrados.');
        }
      },
      error: (err) => {
        console.error('Error al cargar lotes:', err);
        this.alertSrv.showErrorAlert('Error', 'No se pudieron cargar los lotes.');
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtro.toLowerCase().trim();
    const proveedor = this.filtroProveedor;
    const inicio = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
    const fin = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;

    this.lotesFiltrados = this.lotes.filter((l) => {
      const coincideTexto =
        !texto ||
        l.producto_nombre?.toLowerCase().includes(texto) ||
        l.num_lote?.toLowerCase().includes(texto);

      const coincideProveedor = !proveedor || l.proveedor_nombre === proveedor;

      const fechaIngreso = new Date(l.fecha_ingreso);
      const coincideFecha =
        (!inicio || fechaIngreso >= inicio) && (!fin || fechaIngreso <= fin);

      return coincideTexto && coincideProveedor && coincideFecha;
    });

    this.totalItems = this.lotesFiltrados.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.goToPage(1);
  }


  obtenerProveedoresUnicos(): any[] {
    const unique = new Map();
    this.lotes.forEach((l) => {
      if (l.proveedor_nombre) unique.set(l.proveedor_nombre, { nombre: l.proveedor_nombre });
    });
    return Array.from(unique.values());
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

    this.lotesFiltrados = this.lotes
      .filter((l) => {
        const texto = this.filtro.toLowerCase().trim();
        const proveedor = this.filtroProveedor;
        const inicio = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
        const fin = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;

        const coincideTexto =
          !texto ||
          l.producto_nombre?.toLowerCase().includes(texto) ||
          l.num_lote?.toLowerCase().includes(texto);

        const coincideProveedor = !proveedor || l.proveedor_nombre === proveedor;

        const fechaIngreso = new Date(l.fecha_ingreso);
        const coincideFecha =
          (!inicio || fechaIngreso >= inicio) && (!fin || fechaIngreso <= fin);

        return coincideTexto && coincideProveedor && coincideFecha;
      })
      .slice(startIndex, endIndex);
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

  limpiarFiltros(): void {
    this.filtro = '';
    this.filtroProveedor = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.lotesFiltrados = [...this.lotes];
    this.totalItems = this.lotesFiltrados.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.goToPage(1);
  }

  toggleFiltros(): void {
    this.filtrosVisible = !this.filtrosVisible;
  }

  editarLote(lote: any): void {
    this.selectedLote = { ...lote };
    this.openForm = true;
  }

  eliminarLote(id: number): void {
    this.alertSrv.showConfirmAlert(
      'Eliminar lote',
      '¿Estás seguro de que deseas eliminar este lote?',
      'warning'
    ).then((result) => {
      if (result.isConfirmed) {
        this.inventarioSrv.deleteLote(id).subscribe({
          next: (res) => {
            if (res.status === 'OK') {
              this.alertSrv.showSuccessAlert('Lote eliminado', res.message);
              this.cargarLotes();
            } else {
              this.alertSrv.showErrorAlert('Error', res.message);
            }
          },
          error: (err) => {
            const msg = err.error?.message || 'No se pudo eliminar el lote.';
            this.alertSrv.showErrorAlert('No se puede eliminar', msg);
          }
        });
      }
    });
  }


  handleGuardar(event: any): void {
    this.closeForm();
    this.cargarLotes();
  }

  abrirForm(): void {
    this.openForm = true;
  }

  closeForm(): void {
    this.openForm = false;
    this.selectedLote = null;
  }
}
