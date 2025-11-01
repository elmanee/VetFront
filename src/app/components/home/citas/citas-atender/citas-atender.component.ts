import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CitasService, Cita } from '../../../../services/citas.service';

@Component({
  selector: 'app-citas-atender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas-atender.component.html',
  styleUrl: './citas-atender.component.scss'
})
export class CitasAtenderComponent implements OnInit {
  
  citasConfirmadas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  
  // Filtros
  veterinarioSeleccionado: number = 0;
  fechaSeleccionada: string = '';
  busquedaTexto: string = '';
  
  veterinarios = [
    { id: 0, nombre: 'Todos los veterinarios' },
    { id: 1, nombre: 'Dr. Juan Pérez' },
    { id: 2, nombre: 'Dra. María García' }
  ];
  
  cargando: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';

  constructor(
    private citasService: CitasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[CITAS ATENDER] Componente inicializado');
    this.cargarCitasConfirmadas();
  }

  cargarCitasConfirmadas(): void {
    this.cargando = true;
    console.log('[CITAS ATENDER] Cargando citas confirmadas...');
    
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (todasLasCitas) => {
        // Filtrar solo citas confirmadas
        this.citasConfirmadas = todasLasCitas.filter(cita => 
          cita.estado === 'Confirmada'
        );
        
        // Ordenar por fecha y hora
        this.citasConfirmadas.sort((a, b) => {
          const fechaA = new Date(`${a.fecha_cita}T${a.hora_cita}`);
          const fechaB = new Date(`${b.fecha_cita}T${b.hora_cita}`);
          return fechaA.getTime() - fechaB.getTime();
        });
        
        this.citasFiltradas = [...this.citasConfirmadas];
        this.cargando = false;
        
        console.log(`[CITAS ATENDER] Se encontraron ${this.citasConfirmadas.length} citas confirmadas`);
        
        if (this.citasConfirmadas.length === 0) {
          this.mensaje = 'No hay citas confirmadas pendientes de atender.';
          this.mensajeClase = 'info';
        }
      },
      error: (error) => {
        console.error('[CITAS ATENDER] Error al cargar citas:', error);
        this.cargando = false;
        this.mensaje = 'Error al cargar las citas.';
        this.mensajeClase = 'error';
      }
    });
  }

  aplicarFiltros(): void {
    console.log('[CITAS ATENDER] Aplicando filtros...');
    
    this.citasFiltradas = this.citasConfirmadas.filter(cita => {
      let coincide = true;
      
      // Filtro por veterinario
      if (this.veterinarioSeleccionado !== 0) {
        coincide = coincide && cita.veterinario_id === this.veterinarioSeleccionado;
      }
      
      // Filtro por fecha
      if (this.fechaSeleccionada) {
        let fechaCita = cita.fecha_cita;
        if (fechaCita.includes('T')) {
          fechaCita = fechaCita.split('T')[0];
        }
        coincide = coincide && fechaCita === this.fechaSeleccionada;
      }
      
      // Filtro por texto de búsqueda
      if (this.busquedaTexto.trim()) {
        const busqueda = this.busquedaTexto.toLowerCase();
        coincide = coincide && (
          cita.motivo.toLowerCase().includes(busqueda) ||
          (cita.id_cita !== undefined && cita.id_cita.toString().includes(busqueda))
        );
      }
      
      return coincide;
    });
    
    console.log(`[CITAS ATENDER] Resultados filtrados: ${this.citasFiltradas.length}`);
  }

  limpiarFiltros(): void {
    this.veterinarioSeleccionado = 0;
    this.fechaSeleccionada = '';
    this.busquedaTexto = '';
    this.citasFiltradas = [...this.citasConfirmadas];
    this.mensaje = '';
  }

  /**
   * Redirigir al formulario de registro de consulta
   */
  atenderCita(cita: Cita): void {
    console.log('[CITAS ATENDER] Atendiendo cita:', cita);
    
    this.router.navigate(['/expediente/registrar-consulta'], {
      queryParams: {
        cita_id: cita.id_cita,
        cliente_id: cita.cliente_id,
        mascota_id: cita.mascota_id,
        veterinario_id: cita.veterinario_id,
        motivo: cita.motivo
      }
    });
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    
    let fechaISO = fecha;
    if (fechaISO.includes('T')) {
      fechaISO = fechaISO.split('T')[0];
    }
    
    const date = new Date(fechaISO + 'T00:00:00');
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('es-MX', opciones);
  }

  esHoy(fecha: string): boolean {
    let fechaISO = fecha;
    if (fechaISO.includes('T')) {
      fechaISO = fechaISO.split('T')[0];
    }
    
    const hoy = new Date().toISOString().split('T')[0];
    return fechaISO === hoy;
  }

  esProxima(fecha: string, hora: string): boolean {
    const ahora = new Date();
    let fechaISO = fecha;
    if (fechaISO.includes('T')) {
      fechaISO = fechaISO.split('T')[0];
    }
    
    const fechaCita = new Date(`${fechaISO}T${hora}`);
    const diferencia = fechaCita.getTime() - ahora.getTime();
    const dosHorasEnMs = 2 * 60 * 60 * 1000;
    
    return diferencia > 0 && diferencia <= dosHorasEnMs;
  }
  
  contarCitasHoy(): number {
    return this.citasFiltradas.filter(c => this.esHoy(c.fecha_cita)).length;
  }
}