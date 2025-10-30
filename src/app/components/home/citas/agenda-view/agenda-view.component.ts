// /home/agus/Documentos/VetHealth/VetFront/src/app/home/citas/agenda-view/agenda-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { Cita, CitasService, ActualizarCitaRequest } from '../../../../services/citas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agenda-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './agenda-view.component.html',
  styleUrl: './agenda-view.component.scss'
})
export class AgendaViewComponent implements OnInit {
  
  veterinarios: { id: number, nombre: string }[] = [
    { id: 1, nombre: 'Dr. Juan Pérez' },
    { id: 2, nombre: 'Dra. María García' }
  ];
  
  citasAgenda: Cita[] = [];
  citasFiltradas: Cita[] = [];
  
  veterinarioSeleccionadoId: number = 1;
  fechaSeleccionada: string = new Date().toISOString().substring(0, 10);
  busquedaTexto: string = '';
  
  cargando: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';

  mostrarModal: boolean = false;
  citaSeleccionada: Cita | null = null;
  accionModal: 'cancelar' | 'reprogramar' | null = null;
  
  nuevaFecha: string = '';
  nuevaHora: string = '';

  constructor(private citasService: CitasService) {
    console.log('[AGENDA] Componente de agenda inicializado');
  }

  ngOnInit(): void {
    console.log('[AGENDA] Cargando citas al iniciar...');
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    console.log(`[AGENDA] Buscando citas para Veterinario ID: ${this.veterinarioSeleccionadoId}, Fecha: ${this.fechaSeleccionada}`);
    
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (todasLasCitas) => {
        console.log(`[AGENDA] Se recibieron ${todasLasCitas.length} citas del backend`);
        
        this.citasAgenda = todasLasCitas.filter(cita => {
          let fechaCitaISO = cita.fecha_cita;
          if (fechaCitaISO.includes('T')) {
            fechaCitaISO = fechaCitaISO.split('T')[0];
          }
          
          const coincideVeterinario = cita.veterinario_id === this.veterinarioSeleccionadoId;
          const coincideFecha = fechaCitaISO === this.fechaSeleccionada;
          
          return coincideVeterinario && coincideFecha;
        });
        
        this.citasAgenda.sort((a, b) => {
          return a.hora_cita.localeCompare(b.hora_cita);
        });
        
        this.citasFiltradas = [...this.citasAgenda];
        this.cargando = false;
        
        console.log(`[AGENDA] Después del filtro quedan ${this.citasAgenda.length} citas`);
      },
      error: (error) => {
        console.error('[AGENDA] Error al cargar citas:', error.message);
        this.citasAgenda = [];
        this.citasFiltradas = [];
        this.cargando = false;
        this.mensaje = 'Error al cargar las citas';
        this.mensajeClase = 'error';
      }
    });
  }

  filtrarCitas(): void {
    if (!this.busquedaTexto.trim()) {
      this.citasFiltradas = [...this.citasAgenda];
      return;
    }

    const busqueda = this.busquedaTexto.toLowerCase();
    this.citasFiltradas = this.citasAgenda.filter(cita => 
      cita.motivo.toLowerCase().includes(busqueda) ||
      cita.hora_cita.includes(busqueda)
    );
  }

  verHoy(): void {
    this.fechaSeleccionada = new Date().toISOString().substring(0, 10);
    this.cargarCitas();
  }

  cambiarFecha(dias: number): void {
    const fecha = new Date(this.fechaSeleccionada);
    fecha.setDate(fecha.getDate() + dias);
    this.fechaSeleccionada = fecha.toISOString().substring(0, 10);
    this.cargarCitas();
  }

  abrirModal(cita: Cita, accion: 'cancelar' | 'reprogramar'): void {
    this.citaSeleccionada = cita;
    this.accionModal = accion;
    this.mostrarModal = true;
    
    if (accion === 'reprogramar') {
      let fechaCitaISO = cita.fecha_cita;
      if (fechaCitaISO.includes('T')) {
        fechaCitaISO = fechaCitaISO.split('T')[0];
      }
      this.nuevaFecha = fechaCitaISO;
      this.nuevaHora = cita.hora_cita;
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaSeleccionada = null;
    this.accionModal = null;
    this.nuevaFecha = '';
    this.nuevaHora = '';
  }

  confirmarCancelar(): void {
    if (!this.citaSeleccionada || !this.citaSeleccionada.id_cita) return;
    
    Swal.fire({
      title: '¿Cancelar cita?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        
        this.citasService.cancelarCita(this.citaSeleccionada!.id_cita!).subscribe({
          next: (response) => {
            this.cargando = false;
            
            Swal.fire({
              title: '¡Cancelada!',
              text: response.message,
              icon: 'success',
              timer: 2000
            });
            
            this.cerrarModal();
            this.cargarCitas();
          },
          error: (err: Error) => {
            this.cargando = false;
            Swal.fire({
              title: 'Error',
              text: err.message,
              icon: 'error'
            });
          }
        });
      }
    });
  }

  confirmarReprogramar(): void {
    if (!this.citaSeleccionada || !this.citaSeleccionada.id_cita || !this.nuevaFecha || !this.nuevaHora) {
      this.mensaje = 'Completa la nueva fecha y hora';
      this.mensajeClase = 'error';
      return;
    }
    
    console.log(`[AGENDA] Reprogramando cita ID: ${this.citaSeleccionada.id_cita}`);
    console.log(`[AGENDA] Nueva fecha: ${this.nuevaFecha}, Nueva hora: ${this.nuevaHora}`);
    
    this.cargando = true;
    
    const datos: ActualizarCitaRequest = {
      fecha_cita: this.nuevaFecha,
      hora_cita: this.nuevaHora,
      veterinario_id: this.citaSeleccionada.veterinario_id
    };
    
    this.citasService.reprogramarCita(this.citaSeleccionada.id_cita, datos).subscribe({
      next: (response) => {
        this.cargando = false;
        this.mensaje = response.message || 'Cita reprogramada exitosamente';
        this.mensajeClase = 'success';
        
        setTimeout(() => {
          this.cerrarModal();
          this.cargarCitas();
        }, 2000);
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mensaje = `Error: ${err.message}`;
        this.mensajeClase = 'error';
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'Confirmada': return 'bg-success';
      case 'Pendiente': return 'bg-warning';
      case 'Cancelada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getEstadoCardClass(estado: string): string {
    switch(estado) {
      case 'Confirmada': return 'border-success';
      case 'Pendiente': return 'border-warning';
      case 'Cancelada': return 'border-danger';
      default: return 'border-secondary';
    }
  }
}