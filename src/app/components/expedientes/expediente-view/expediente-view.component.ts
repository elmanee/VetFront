import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpedienteService, Expediente } from '../../../services/expediente.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-expediente-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expediente-view.component.html',
  styleUrl: './expediente-view.component.scss'
})
export class ExpedienteViewComponent implements OnInit {
  
  expediente: Expediente | null = null;
  historial: any[] = [];
  expedienteId: number = 0;
  
  cargando: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';
  
  // Control de secciones expandidas
  consultasExpandidas: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expedienteService: ExpedienteService
  ) {}

  ngOnInit(): void {
    console.log('[EXPEDIENTE VIEW] Componente inicializado');
    
    this.route.params.subscribe(params => {
      this.expedienteId = +params['id'];
      
      if (this.expedienteId) {
        this.cargarExpediente();
      }
    });
  }

  /**
   * Cargar información completa del expediente
   */
  cargarExpediente(): void {
    this.cargando = true;
    
    console.log(`[EXPEDIENTE VIEW] Cargando expediente ID: ${this.expedienteId}`);
    
    // Cargar datos del expediente
    this.expedienteService.obtenerExpedientePorId(this.expedienteId).subscribe({
      next: (expediente) => {
        this.expediente = expediente;
        console.log('[EXPEDIENTE VIEW] Expediente cargado:', expediente);
        
        // Cargar historial completo
        this.cargarHistorial();
      },
      error: (error) => {
        console.error('[EXPEDIENTE VIEW] Error al cargar expediente:', error);
        this.cargando = false;
        this.mensaje = error.message;
        this.mensajeClase = 'error';
      }
    });
  }

  /**
   * Cargar historial de consultas
   */
  cargarHistorial(): void {
    this.expedienteService.obtenerHistorialCompleto(this.expedienteId).subscribe({
      next: (datos) => {
        this.historial = datos.consultas || [];
        this.cargando = false;
        
        console.log(`[EXPEDIENTE VIEW] Historial cargado: ${this.historial.length} consultas`);
      },
      error: (error) => {
        console.error('[EXPEDIENTE VIEW] Error al cargar historial:', error);
        this.cargando = false;
        this.mensaje = error.message;
        this.mensajeClase = 'error';
      }
    });
  }

  /**
   * Expandir/colapsar consulta
   */
  toggleConsulta(index: number): void {
    this.consultasExpandidas[index] = !this.consultasExpandidas[index];
  }

  /**
   * Verificar si una consulta está expandida
   */
  isConsultaExpandida(index: number): boolean {
    return this.consultasExpandidas[index] || false;
  }

  /**
   * Generar reporte PDF
   */
  generarReporte(): void {
    console.log('[EXPEDIENTE VIEW] Generando reporte PDF...');
    
    this.cargando = true;
    
    this.expedienteService.generarReporteMedico(this.expedienteId).subscribe({
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
  generarCertificado(): void {
    console.log('[EXPEDIENTE VIEW] Generando certificado...');
    
    this.cargando = true;
    
    this.expedienteService.generarCertificadoSalud(this.expedienteId).subscribe({
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
   * Volver a búsqueda
   */
  volver(): void {
    this.router.navigate(['/expedientes/buscar']);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('es-MX', opciones);
  }
}