import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lote } from '../../interfaces/lote';
import { InventarioFormComponent } from './inventario-form/inventario-form.component';
import { Producto } from '../../interfaces/producto';
import { InventarioService } from '../../services/inventario.service';
import { InventarioLoteFormComponent } from './inventario-lote-form/inventario-lote-form.component';
import { InventarioDetalleComponent } from './inventario-detalle/inventario-detalle.component';
import { ExportService } from '../../shared/services/export.service';
import { AlertsService } from '../../shared/services/alerts.service';

@Component({
  selector: 'app-inventario',
  imports: [
    CommonModule, FormsModule,
    InventarioFormComponent, InventarioLoteFormComponent,
    InventarioDetalleComponent
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  openForm = false;
  mostrarFormLote = false;
  mostrarDetalle = false;
  loading = false;
  errorMsg = '';

  selectedProducto: Producto | null = null;
  productoSeleccionado: any = null;
  detalleProducto: any = null;

  filtrosVisible = true;
  filtros = { nombre: '', unidad: '', categoria: '' };
  categorias: string[] = [];
  unidades: string[] = [];

  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  maxPageLinks = 5;

  constructor(
    private inventarioSev: InventarioService,
    private exportSrv: ExportService,
    private alertSrv: AlertsService,
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  exportarExcel(): void {
    if (!this.productos.length) {
      this.alertSrv.showInfoAlert('Sin datos', 'No hay productos para exportar.');
      return;
    }

    const datosExportar = this.productos.map(p => ({
      'ID': p.id,
      'Producto': p.nombre || 'N/A',
      'Descripción': p.descripcion || 'N/A',
      'Precio de Venta': `$${p.precio_venta}`,
      'Unidad de Medida': p.unidad_medida || 'N/A',
      'Categoría': p.categoria || 'N/A'
    }));

    this.exportSrv.exportToExcel(datosExportar, 'inventario_productos', 'Inventario de Productos');
    this.alertSrv.showSuccessAlert('Exportado', `Excel generado con ${datosExportar.length} registros`);
  }

  exportarPDF(): void {
    if (!this.productos.length) {
      this.alertSrv.showInfoAlert('Sin datos', 'No hay productos para exportar.');
      return;
    }

    const headers = ['ID', 'Producto', 'Descripción', 'Precio', 'Unidad', 'Categoría'];

    const data = this.productos.map(p => [
      p.id.toString(),
      p.nombre || 'N/A',
      this.limitarTexto(p.descripcion, 8),
      `$${p.precio_venta}`,
      p.unidad_medida || 'N/A',
      p.categoria || 'N/A'
    ]);

    this.exportSrv.exportToPDF(
      headers,
      data,
      'Inventario de Productos',
      'inventario_productos',
      'landscape'
    );

    this.alertSrv.showSuccessAlert('Exportado', `PDF generado con ${data.length} registros`);
  }

  cargarProductos(): void {
    this.loading = true;
    this.errorMsg = '';

    this.inventarioSev.getProductos().subscribe({
      next: (res) => {
        if (res.status === 'OK' && res.data) {
          this.productos = res.data.sort((a, b) => a.id - b.id);
          this.productosFiltrados = [...this.productos];
          this.generarListasFiltros();
        } else {
          this.errorMsg = res.message || 'No se pudo obtener la lista de productos.';
          this.productos = [];
          this.productosFiltrados = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.errorMsg = 'Error al cargar los productos.';
        this.loading = false;
      }
    });
  }


  abrirForm(): void {
    this.resetPanels();
    this.openForm = true;
  }

  editarProducto(prod: Producto): void {
    this.resetPanels();
    this.selectedProducto = prod;
    this.openForm = true;
  }

  handleGuardar(event: any): void {
    if (!event || !event.data) return;

    const { data, tipo } = event;

    if (tipo === 'nuevo') {
      this.productoSeleccionado = data;
      this.mostrarFormLote = true;
    }

    if (tipo === 'editado') {
      this.cargarProductos();
    }

    this.openForm = false;
    this.selectedProducto = null;
  }


  closeForm(): void {
    this.openForm = false;
    this.selectedProducto = null;
  }

  cerrarFormLote(): void {
    this.mostrarFormLote = false;
    this.productoSeleccionado = null;
    this.cargarProductos();
  }

  verDetalle(producto: any): void {

    this.resetPanels();

    this.inventarioSev.getDetalleProductoYLote(producto.id).subscribe({
      next: (res) => {

        if (res.status === 'OK' && res.data && res.data.length > 0) {
          this.detalleProducto = res.data[0];
          this.mostrarDetalle = true;
        } else {

        }
      },
      error: (err) => console.error('error:', err)
    });
  }


  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.detalleProducto = null;
  }


  aplicarFiltros(): void {
    const nombre = this.filtros.nombre.toLowerCase();
    const categoria = this.filtros.categoria;
    const unidad = this.filtros.unidad;

    this.productosFiltrados = this.productos.filter((p) => {
      const matchNombre = p.nombre.toLowerCase().includes(nombre);
      const matchCategoria = !categoria || p.categoria === categoria;
      const matchUnidad = !unidad || p.unidad_medida === unidad;
      return matchNombre && matchCategoria && matchUnidad;
    });

    this.goToPage(1);
  }

  limpiarFiltros(): void {
    this.filtros = { nombre: '', unidad: '', categoria: '' };
    this.productosFiltrados = [...this.productos];
    this.goToPage(1);
  }

  toggleFiltros(): void {
    this.filtrosVisible = !this.filtrosVisible;
  }

  private generarListasFiltros(): void {
    const categoriasSet = new Set<string>();
    const unidadesSet = new Set<string>();

    this.productos.forEach(p => {
      if (p.categoria) categoriasSet.add(p.categoria);
      if (p.unidad_medida) unidadesSet.add(p.unidad_medida);
    });

    this.categorias = Array.from(categoriasSet);
    this.unidades = Array.from(unidadesSet);
  }


  get totalItems(): number {
    return this.productosFiltrados.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get displayedProductos(): Producto[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.productosFiltrados.slice(start, end);
  }

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const half = Math.floor(this.maxPageLinks / 2);
    let start = Math.max(1, this.page - half);
    let end = Math.min(total, start + this.maxPageLinks - 1);

    if (end - start + 1 < this.maxPageLinks) {
      start = Math.max(1, end - this.maxPageLinks + 1);
    }

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  goToPage(p: number) {
    const target = Math.min(Math.max(1, p), this.totalPages);
    this.page = target;
  }

  nextPage() {
    this.goToPage(this.page + 1);
  }

  prevPage() {
    this.goToPage(this.page - 1);
  }


  resetPanels(): void {
    this.openForm = false;
    this.mostrarFormLote = false;
    this.mostrarDetalle = false;
    this.selectedProducto = null;
    this.productoSeleccionado = null;
    this.detalleProducto = null;
  }

  eliminarProducto(prod: Producto) {}

  limitarTexto(texto: string, limite: number): string {
    if (!texto) return '';
    const palabras = texto.split(' ');
    return palabras.length > limite
      ? palabras.slice(0, limite).join(' ') + '...'
      : texto;
  }
}
