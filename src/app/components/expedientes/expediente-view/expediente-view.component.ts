import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpedienteService, ExpedienteCompleto } from '../../../services/expediente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expediente-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expediente-view.component.html',
  styleUrl: './expediente-view.component.scss'
})
export class ExpedienteViewComponent implements OnInit {
  
  expedienteId?: number;
  expediente?: ExpedienteCompleto;
  cargando: boolean = false;
  generandoPDF: boolean = false;
  
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
      
      if (!this.expedienteId || isNaN(this.expedienteId)) {
        this.mostrarErrorYRedirigir('ID de expediente inválido');
        return;
      }
      
      this.cargarExpediente();
    });
  }

  /**
   * Cargar expediente completo
   */
  cargarExpediente(): void {
    if (!this.expedienteId) return;
    
    this.cargando = true;
    console.log('[EXPEDIENTE VIEW] Cargando expediente ID:', this.expedienteId);
    
    this.expedienteService.obtenerExpedienteCompleto(this.expedienteId).subscribe({
      next: (expediente) => {
        this.expediente = expediente;
        this.cargando = false;
        console.log('[EXPEDIENTE VIEW] Expediente cargado:', expediente.expediente.numero_expediente);
        
        // Inicializar todas las consultas como expandidas
        if (expediente.consultas) {
          expediente.consultas.forEach((consulta, index) => {
            this.consultasExpandidas[index] = index === 0; // Solo la primera expandida
          });
        }
      },
      error: (error) => {
        console.error('[EXPEDIENTE VIEW] Error al cargar expediente:', error);
        this.cargando = false;
        this.mostrarErrorYRedirigir(error.message || 'No se pudo cargar el expediente');
      }
    });
  }

  /**
   * Toggle consulta expandida
   */
  toggleConsulta(index: number): void {
    this.consultasExpandidas[index] = !this.consultasExpandidas[index];
  }

  /**
   * Generar reporte PDF (RQF02)
   */
  generarReportePDF(): void {
    if (!this.expedienteId) return;
    
    this.generandoPDF = true;
    console.log('[EXPEDIENTE VIEW] Generando reporte PDF...');
    
    this.expedienteService.generarReportePDF(this.expedienteId).subscribe({
      next: (blob) => {
        this.generandoPDF = false;
        
        // Crear URL del blob y descargarlo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expediente_${this.expediente?.expediente?.numero_expediente || 'desconocido'}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        console.log('[EXPEDIENTE VIEW] ✅ Reporte PDF generado');
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Reporte PDF generado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.generandoPDF = false;
        console.error('[EXPEDIENTE VIEW] Error al generar PDF:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el reporte PDF',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Generar certificado de salud PDF (RQF02)
   */
  generarCertificadoPDF(): void {
    if (!this.expedienteId) return;
    
    this.generandoPDF = true;
    console.log('[EXPEDIENTE VIEW] Generando certificado PDF...');
    
    this.expedienteService.generarCertificadoPDF(this.expedienteId).subscribe({
      next: (blob) => {
        this.generandoPDF = false;
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado_${this.expediente?.expediente?.numero_expediente || 'desconocido'}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        console.log('[EXPEDIENTE VIEW] ✅ Certificado PDF generado');
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Certificado de salud generado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.generandoPDF = false;
        console.error('[EXPEDIENTE VIEW] Error al generar certificado:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el certificado',
          confirmButtonText: 'Aceptar'
        });
      }
    });
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
   * Volver a búsqueda
   */
  volver(): void {
    this.router.navigate(['/expedientes/buscar']);
  }

  /**
   * Mostrar error y redirigir
   */
  private mostrarErrorYRedirigir(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonText: 'Volver'
    }).then(() => {
      this.router.navigate(['/expedientes/buscar']);
    });
  }
}