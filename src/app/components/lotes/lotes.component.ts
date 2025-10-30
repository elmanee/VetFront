import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { AlertsService } from '../../shared/services/alerts.service';
import { LostesFormComponent } from './lostes-form/lostes-form.component';

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
  filtrosVisible = false;

  constructor(
    private inventarioSrv: InventarioService,
    private alertSrv: AlertsService
  ) {}

  ngOnInit(): void {
    this.cargarLotes();
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
    const texto = this.filtro.toLowerCase();
    const proveedor = this.filtroProveedor;
    const inicio = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
    const fin = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;

    this.lotesFiltrados = this.lotes.filter((l) => {
      const coincideTexto =
        l.producto_nombre?.toLowerCase().includes(texto) ||
        l.num_lote?.toLowerCase().includes(texto);

      const coincideProveedor = !proveedor || l.proveedor_nombre === proveedor;

      const fechaIngreso = new Date(l.fecha_ingreso);
      const coincideFecha =
        (!inicio || fechaIngreso >= inicio) && (!fin || fechaIngreso <= fin);

      return coincideTexto && coincideProveedor && coincideFecha;
    });

    this.totalItems = this.lotesFiltrados.length;
    this.calcularPaginacion();
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

    this.lotesFiltrados = [...this.lotes]
      .filter((l) => {
        const texto = this.filtro.toLowerCase();
        const coincideTexto =
          l.producto_nombre?.toLowerCase().includes(texto) ||
          l.num_lote?.toLowerCase().includes(texto);
        return coincideTexto;
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
    this.calcularPaginacion();
  }

  toggleFiltros(): void {
    this.filtrosVisible = !this.filtrosVisible;
  }

  editarLote(lote: any): void {
    console.log('Editar lote:', lote);
    this.alertSrv.showInfoAlert('Editar', `Lote ${lote.num_lote} seleccionado para edición.`);
  }

  eliminarLote(id: number): void {
    console.log('Eliminar lote con ID:', id);
  }

    handleGuardar(event: any): void {

  }

  abrirForm(): void {
    this.openForm = true;
  }

  closeForm(): void {
    this.openForm = false;
    this.selectedLote = null;
  }
}
