import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lote } from '../../interfaces/lote';

@Component({
  selector: 'app-inventario',
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  lotes: Lote[] = [
    {
      id: 1,
      producto_id: 1,
      num_lote: 'P-KG-LOTE-001',
      cantidad_inicial: 150,
      cantidad_disponible: 140,
      fecha_caducidad: '2027-11-30',
      fecha_ingreso: '2025-10-19',
      proveedor_id: 45,
      producto: {
        id: 1,
        nombre: 'Pastillas Desparasitante (Kg)',
        descripcion: 'Desparasitante interno de amplio espectro para perros, dosis por peso (kilogramo).',
        precio_venta: 85.00,
        unidad_medida: 'Tableta'
      },
      proveedor_nombre: 'Proveedor ABC',
      categoria: 'Medicamentos'
    },
    {
      id: 2,
      producto_id: 1,
      num_lote: 'P-KG-LOTE-002',
      cantidad_inicial: 200,
      cantidad_disponible: 200,
      fecha_caducidad: '2028-02-15',
      fecha_ingreso: '2025-10-19',
      proveedor_id: 99,
      producto: {
        id: 1,
        nombre: 'Pastillas Desparasitante (Kg)',
        descripcion: 'Desparasitante interno de amplio espectro para perros, dosis por peso (kilogramo).',
        precio_venta: 85.00,
        unidad_medida: 'Tableta'
      },
      proveedor_nombre: 'Proveedor XYZ',
      categoria: 'Medicamentos'
    },
    {
      id: 3,
      producto_id: 2,
      num_lote: 'VAC-FEL-001',
      cantidad_inicial: 50,
      cantidad_disponible: 35,
      fecha_caducidad: '2026-12-31',
      fecha_ingreso: '2025-10-20',
      proveedor_id: 45,
      producto: {
        id: 2,
        nombre: 'Vacuna Antirrábica Felina',
        descripcion: 'Vacuna de prevención anual contra la rabia para gatos. Presentación de 1 dosis.',
        precio_venta: 250.00,
        unidad_medida: 'Dosis'
      },
      proveedor_nombre: 'Proveedor ABC',
      categoria: 'Vacunas'
    },
    {
      id: 4,
      producto_id: 3,
      num_lote: 'AMX-500-001',
      cantidad_inicial: 100,
      cantidad_disponible: 75,
      fecha_caducidad: '2027-06-30',
      fecha_ingreso: '2025-10-15',
      proveedor_id: 99,
      producto: {
        id: 3,
        nombre: 'Amoxicilina + Ácido Clavulánico 500mg',
        descripcion: 'Antibiótico de amplio espectro para inyección intramuscular. Indicado para infecciones de piel y tejidos blandos.',
        precio_venta: 180.00,
        unidad_medida: 'Frasco 10ml'
      },
      proveedor_nombre: 'Proveedor XYZ',
      categoria: 'Antibióticos'
    }
  ];

  lotesFiltrados: Lote[] = [];

  filtros = {
    nombre: '',
    categoria: '',
    proveedor: '',
    lote: '',
    fechaVencimiento: ''
  };

  categorias: string[] = [];
  proveedores: string[] = [];

  loteEnEdicion: number | null = null;

  filtrosVisible: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.lotesFiltrados = [...this.lotes];
    this.cargarCategorias();
    this.cargarProveedores();
  }

  toggleFiltros(): void {
    this.filtrosVisible = !this.filtrosVisible;
  }

  cargarCategorias(): void {
    const categoriasSet = new Set(this.lotes.map(l => l.categoria || ''));
    this.categorias = Array.from(categoriasSet).filter(c => c !== '');
  }

  cargarProveedores(): void {
    const proveedoresSet = new Set(this.lotes.map(l => l.proveedor_nombre || ''));
    this.proveedores = Array.from(proveedoresSet).filter(p => p !== '');
  }

  aplicarFiltros(): void {
    this.lotesFiltrados = this.lotes.filter(lote => {
      const cumpleNombre = !this.filtros.nombre ||
        lote.producto?.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase());

      const cumpleCategoria = !this.filtros.categoria ||
        lote.categoria === this.filtros.categoria;

      const cumpleProveedor = !this.filtros.proveedor ||
        lote.proveedor_nombre === this.filtros.proveedor;

      const cumpleLote = !this.filtros.lote ||
        lote.num_lote.toLowerCase().includes(this.filtros.lote.toLowerCase());

      const cumpleFecha = !this.filtros.fechaVencimiento ||
        lote.fecha_caducidad === this.filtros.fechaVencimiento;

      return cumpleNombre && cumpleCategoria && cumpleProveedor && cumpleLote && cumpleFecha;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      nombre: '',
      categoria: '',
      proveedor: '',
      lote: '',
      fechaVencimiento: ''
    };
    this.lotesFiltrados = [...this.lotes];
  }

  toggleEdicion(loteId: number): void {
    if (this.loteEnEdicion === loteId) {
      this.loteEnEdicion = null;
    } else {
      this.loteEnEdicion = loteId;
    }
  }

  registrarProducto(): void {
    console.log('Registrar nuevo producto');
  }

  getEstadoStock(cantidad: number, cantidadInicial: number): string {
    const porcentaje = (cantidad / cantidadInicial) * 100;
    if (porcentaje <= 10) return 'critico';
    if (porcentaje <= 30) return 'bajo';
    if (porcentaje <= 70) return 'medio';
    return 'alto';
  }

  getColorStock(cantidad: number, cantidadInicial: number): string {
    const estado = this.getEstadoStock(cantidad, cantidadInicial);
    switch(estado) {
      case 'critico': return 'danger';
      case 'bajo': return 'warning';
      case 'medio': return 'info';
      default: return 'success';
    }
  }

  getDiasParaVencer(fechaCaducidad: string): number {
    const hoy = new Date();
    const fecha = new Date(fechaCaducidad);
    const diferencia = fecha.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  getAlertaVencimiento(fechaCaducidad: string): string {
    const dias = this.getDiasParaVencer(fechaCaducidad);
    if (dias < 0) return 'vencido';
    if (dias <= 30) return 'proximo';
    if (dias <= 90) return 'cercano';
    return 'normal';
  }

  contarStockBajo(): number {
    return this.lotes.filter(lote => {
      const color = this.getColorStock(lote.cantidad_disponible, lote.cantidad_inicial);
      return color === 'warning' || color === 'danger';
    }).length;
  }

  contarPorVencer(): number {
    return this.lotes.filter(lote => {
      return this.getDiasParaVencer(lote.fecha_caducidad) <= 30;
    }).length;
  }
}
