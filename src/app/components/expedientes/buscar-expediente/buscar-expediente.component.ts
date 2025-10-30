import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpedienteService, Expediente, FiltrosBusqueda } from '../../../services/expediente.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-expediente-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-expediente.component.html',
  styleUrl: './buscar-expediente.component.scss'
})
export class BuscarExpedienteComponent implements OnInit {
  
  expedientes: Expediente[] = [];
  
  // Filtros de búsqueda 
  filtros: FiltrosBusqueda = {
    nombre_mascota: '',
    propietario: '',
    numero_expediente: '',
    fecha_desde: '',
    fecha_hasta: '',
    diagnostico: '',
    estado: ''
  };
  
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';

  constructor(
    private expedienteService: ExpedienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[BÚSQUEDA EXPEDIENTES] Componente inicializado');
  }

  /**
   * RQF02 - Buscar expedientes con múltiples filtros
   */
  buscarExpedientes(): void {
    // Validar que al menos un filtro esté lleno
    const filtrosActivos = Object.values(this.filtros).filter(v => v && v.trim() !== '');
    
    if (filtrosActivos.length === 0) {
      this.mensaje = 'Debe ingresar al menos un criterio de búsqueda.';
      this.mensajeClase = 'error';
      return;
    }
    
    console.log('[BÚSQUEDA EXPEDIENTES] Buscando con filtros:', this.filtros);
    
    this.cargando = true;
    this.busquedaRealizada = true;
    this.mensaje = '';
    
    this.expedienteService.buscarExpedientes(this.filtros).subscribe({
      next: (expedientes) => {
        this.cargando = false;
        this.expedientes = expedientes;
        
        console.log(`[BÚSQUEDA EXPEDIENTES] Se encontraron ${expedientes.length} expedientes`);
        
        if (expedientes.length === 0) {
          this.mensaje = 'No se encontraron expedientes con los criterios especificados.';
          this.mensajeClase = 'info';
        } else {
          this.mensaje = `Se encontraron ${expedientes.length} expediente(s).`;
          this.mensajeClase = 'success';
        }
      },
      error: (error) => {
        console.error('[BÚSQUEDA EXPEDIENTES] Error:', error);
        this.cargando = false;
        this.mensaje = error.message;
        this.mensajeClase = 'error';
      }
    });
  }

  /**
   * Limpiar filtros y resultados
   */
  limpiarBusqueda(): void {
    this.filtros = {
      nombre_mascota: '',
      propietario: '',
      numero_expediente: '',
      fecha_desde: '',
      fecha_hasta: '',
      diagnostico: '',
      estado: ''
    };
    
    this.expedientes = [];
    this.busquedaRealizada = false;
    this.mensaje = '';
  }

  /**
   * Ver historial completo de un expediente
   */
  verExpediente(expediente: Expediente): void {
    console.log('[BÚSQUEDA EXPEDIENTES] Ver expediente:', expediente);
    this.router.navigate(['/expediente/ver', expediente.id_expediente]);
  }

  /**
   * Generar reporte PDF de un expediente
   */
  generarReporte(expediente: Expediente): void {
    console.log('[BÚSQUEDA EXPEDIENTES] Generando reporte para expediente:', expediente.numero_expediente);
    
    this.cargando = true;
    
    this.expedienteService.generarReporteMedico(expediente.id_expediente).subscribe({
      next: (resultado) => {
        this.cargando = false;
        
        // Descargar el PDF
        const url = `${environment.apiUrl}/reportes/descargar/${resultado.nombreArchivo}`;
        window.open(url, '_blank');
        
        this.mensaje = 'Reporte generado exitosamente.';
        this.mensajeClase = 'success';
        
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje = error.message;
        this.mensajeClase = 'error';
      }
    });
  }

  /**
   * Generar certificado de salud
   */
  generarCertificado(expediente: Expediente): void {
    console.log('[BÚSQUEDA EXPEDIENTES] Generando certificado para expediente:', expediente.numero_expediente);
    
    this.cargando = true;
    
    this.expedienteService.generarCertificadoSalud(expediente.id_expediente).subscribe({
      next: (resultado) => {
        this.cargando = false;
        
        // Descargar el PDF
        const url = `${environment.apiUrl}/reportes/descargar/${resultado.nombreArchivo}`;
        window.open(url, '_blank');
        
        this.mensaje = 'Certificado generado exitosamente.';
        this.mensajeClase = 'success';
        
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje = error.message;
        this.mensajeClase = 'error';
      }
    });
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('es-MX', opciones);
  }

  /**
   * Contar filtros activos
   */
  contarFiltrosActivos(): number {
    return Object.values(this.filtros).filter(v => v && v.trim() !== '').length;
  }
}