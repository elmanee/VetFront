import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpedienteService, FiltrosBusqueda, Expediente } from '../../../services/expediente.service';

@Component({
  selector: 'app-buscar-expediente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-expediente.component.html',
  styleUrl: './buscar-expediente.component.scss'
})
export class BuscarExpedienteComponent implements OnInit {
  
  Math = Math;
  // Filtros de búsqueda (RQF02 - 3+ filtros)
  filtros: FiltrosBusqueda = {
    nombreMascota: '',
    propietario: '',
    numeroExpediente: '',
    fechaConsulta: '',
    diagnostico: '',
    estado: ''
  };
  
  // Resultados
  expedientes: Expediente[] = [];
  expedientesFiltrados: Expediente[] = [];
  
  // Estados
  buscando: boolean = false;
  busquedaRealizada: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';
  
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 12;
  
  constructor(
    private expedienteService: ExpedienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[BUSCAR EXPEDIENTE] Componente inicializado');
  }

  /**
   * Realizar búsqueda con filtros (RQF02)
   */
  buscarExpedientes(): void {
    console.log('[BUSCAR EXPEDIENTE] Iniciando búsqueda con filtros:', this.filtros);
    
    // Validar que al menos un filtro esté completo
    const filtrosActivos = this.contarFiltrosActivos();
    
    if (filtrosActivos === 0) {
      this.mensaje = 'Debe ingresar al menos un criterio de búsqueda';
      this.mensajeClase = 'warning';
      return;
    }
    
    this.buscando = true;
    this.mensaje = '';
    
    // Preparar filtros (remover vacíos)
    const filtrosLimpios: FiltrosBusqueda = {};
    
    if (this.filtros.nombreMascota?.trim()) {
      filtrosLimpios.nombreMascota = this.filtros.nombreMascota.trim();
    }
    if (this.filtros.propietario?.trim()) {
      filtrosLimpios.propietario = this.filtros.propietario.trim();
    }
    if (this.filtros.numeroExpediente?.trim()) {
      filtrosLimpios.numeroExpediente = this.filtros.numeroExpediente.trim();
    }
    if (this.filtros.fechaConsulta) {
      filtrosLimpios.fechaConsulta = this.filtros.fechaConsulta;
    }
    if (this.filtros.diagnostico?.trim()) {
      filtrosLimpios.diagnostico = this.filtros.diagnostico.trim();
    }
    if (this.filtros.estado) {
      filtrosLimpios.estado = this.filtros.estado;
    }
    
    this.expedienteService.buscarExpedientes(filtrosLimpios).subscribe({
      next: (resultados) => {
        this.expedientes = resultados;
        this.expedientesFiltrados = resultados;
        this.buscando = false;
        this.busquedaRealizada = true;
        this.paginaActual = 1;
        
        console.log(`[BUSCAR EXPEDIENTE] Se encontraron ${resultados.length} expedientes`);
        
        if (resultados.length === 0) {
          this.mensaje = 'No se encontraron expedientes con los criterios especificados';
          this.mensajeClase = 'info';
        } else {
          this.mensaje = `Se encontraron ${resultados.length} expediente(s)`;
          this.mensajeClase = 'success';
        }
      },
        error: (error) => {
        console.error('[BUSCAR EXPEDIENTE] Error en búsqueda:', error);
        this.buscando = false;
        this.mensaje = error.message || 'Error al buscar expedientes';
        this.mensajeClase = 'error';
      }
    });
  }

  /**
   * Contar filtros activos
   */
  contarFiltrosActivos(): number {
    let count = 0;
    if (this.filtros.nombreMascota?.trim()) count++;
    if (this.filtros.propietario?.trim()) count++;
    if (this.filtros.numeroExpediente?.trim()) count++;
    if (this.filtros.fechaConsulta) count++;
    if (this.filtros.diagnostico?.trim()) count++;
    if (this.filtros.estado) count++;
    return count;
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      nombreMascota: '',
      propietario: '',
      numeroExpediente: '',
      fechaConsulta: '',
      diagnostico: '',
      estado: ''
    };
    this.expedientes = [];
    this.expedientesFiltrados = [];
    this.busquedaRealizada = false;
    this.mensaje = '';
    this.paginaActual = 1;
    console.log('[BUSCAR EXPEDIENTE] Filtros limpiados');
  }

  /**
   * Ver expediente completo
   */
  verExpediente(expediente: Expediente): void {
    console.log('[BUSCAR EXPEDIENTE] Abriendo expediente:', expediente.numero_expediente);
    this.router.navigate(['/expediente/ver', expediente.id_expediente]);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Paginación - Obtener expedientes de la página actual
   */
  get expedientesPaginados(): Expediente[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.expedientesFiltrados.slice(inicio, fin);
  }

  /**
   * Paginación - Total de páginas
   */
  get totalPaginas(): number {
    return Math.ceil(this.expedientesFiltrados.length / this.itemsPorPagina);
  }

  /**
   * Paginación - Array de números de página
   */
  get numerosPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  /**
   * Cambiar página
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }
}

