import { Component, OnInit, inject } from '@angular/core';
import { CitasService } from '../../services/citas.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-mis-citas-auxiliar',
  imports: [CommonModule],
  templateUrl: './mis-citas-auxiliar.component.html',
  styleUrl: './mis-citas-auxiliar.component.scss',
})
export class MisCitasAuxiliarComponent {
  private citasService = inject(CitasService);

  citas: any[] = [];
  usuarioId: number = 0;
  loading: boolean = true;
  nombreAuxiliar: string = '';

  constructor() {}

  ngOnInit() {
    // 1. Obtener datos del usuario logueado desde LocalStorage
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      const usuario = JSON.parse(usuarioJson);
      this.usuarioId = usuario.id;
      this.nombreAuxiliar = usuario.nombre_completo;

      // 2. Cargar sus citas
      this.cargarCitas();
    } else {
      console.error('No se encontró usuario en sesión');
      this.loading = false;
    }
  }

  cargarCitas() {
    this.citasService.getCitasAsignadas(this.usuarioId).subscribe({
      next: (res) => {
        this.citas = res.data || [];
        this.loading = false;
        console.log('Citas cargadas:', this.citas);
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.loading = false;
      },
    });
  }

  cambiarEstadoServicio(cita: any, servicio: any, event: any) {
    const nuevoEstado = event.target.checked ? 'Realizado' : 'Pendiente';
    
    this.citasService.actualizarEstadoServicio(cita.id_cita, servicio.id, nuevoEstado)
      .subscribe({
        next: () => {
          // Actualizamos la vista localmente para que se vea rápido
          servicio.estado = nuevoEstado;
          
          // Opcional: Verificar si todos están listos para sugerir finalizar la cita completa
          this.verificarProgresoCita(cita);
        },
        error: () => {
          // Si falla, revertimos el checkbox
          event.target.checked = !event.target.checked;
          alert('No se pudo actualizar el estado. Intente de nuevo.');
        }
      });
  }

  verificarProgresoCita(cita: any) {
      const todosListos = cita.servicios_agendados.every((s: any) => s.estado === 'Realizado');
      if (todosListos) {
          // Podrías mostrar un botón especial o una alerta suave
          console.log('Todos los servicios de esta cita están listos');
      }
  }

    finalizarServicio(cita: any) {
    // Validar que todos los servicios estén listos (Opcional)
    const pendientes = cita.servicios_agendados?.some((s: any) => s.estado === 'Pendiente');
    
    if (pendientes) {
       const confirmar = confirm('Aún hay servicios pendientes. ¿Deseas finalizar de todas formas?');
       if (!confirmar) return;
    }

    this.citasService.finalizarCita(cita.id_cita).subscribe({
      next: (res) => {
        Swal.fire('¡Listo!', 'Servicio finalizado y cliente notificado.', 'success');
        this.cargarCitas(); // Recargar para que desaparezca de la lista (ya no es 'Confirmada', es 'Completada')
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo finalizar la cita.', 'error');
      }
    });
  }
  
}
