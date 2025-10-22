import { Component } from '@angular/core';
import { FiltradoPorId } from '../../pipes/filtrado-por-id.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cita, CitasService } from '../../services/citas.service';

@Component({
  selector: 'app-agenda-view',
  imports: [CommonModule, FormsModule, FiltradoPorId],
  templateUrl: './agenda-view.component.html',
  styleUrl: './agenda-view.component.scss'
})
export class AgendaViewComponent {

  // RQF01 - DATOS DE SELECCIÓN MÍNIMOS: Listas necesarias para que el 'filtradoPorId' funcione.
  // NOTA: Estos se reemplazarán por llamadas a la API en la capa de Backend.
  veterinarios: { id: number, nombre: string }[] = [
    { id: 1, nombre: 'Dr. Torres' },
    { id: 2, nombre: 'Dra. Pérez' }
  ];
  clientes: { id: number, nombre: string }[] = [
    { id: 101, nombre: 'Cliente 101' },
    { id: 102, nombre: 'Cliente 102' }
  ];
  mascotas: { id: number, nombre: string }[] = [
    { id: 1, nombre: 'Mascota 1' },
    { id: 2, nombre: 'Mascota 2' }
  ];

  // RQF01 - ALCANCE: Lista que contendrá las citas filtradas para la vista.
  citasAgenda: Cita[] = [];

    // Variables de Filtro (para simular la consulta diaria/semanal).
  // Los valores iniciales son para mostrar una agenda por defecto.
  veterinarioSeleccionadoId: number = 1;
  fechaSeleccionada: string = new Date().toISOString().substring(0, 10); // Inicializa a la fecha de hoy

  // RQF01 - Evidencia de Arquitectura (Actividad 3): INYECCIÓN DEL SERVICIO.
  // Conexión a la Capa de Lógica.
  constructor(private citasService: CitasService) { }

  ngOnInit(): void {
    // RQF01 - Salida Esperada: Al cargar, se consulta la agenda.
    this.cargarCitas();
  }

    /**
   * RQF01 - ALCANCE: Carga y filtra las citas usando el servicio.
   * Esto simula la consulta a la agenda diaria/semanal.
   */
  cargarCitas(): void {
    console.log(`Agenda: Solicitando citas para el Vet ID ${this.veterinarioSeleccionadoId}.`);

    // Llamada al servicio (simulando la consulta al backend)
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        // RQF01 - Lógica: Filtramos las citas por Veterinario y Fecha seleccionados.
        this.citasAgenda = citas.filter(cita =>
          cita.veterinarioId === this.veterinarioSeleccionadoId &&
          cita.fecha === this.fechaSeleccionada
        );
        // RQF01 - Salida Esperada: Muestra cuántas citas se cargaron.
        console.log(`Agenda cargada. Mostrando ${this.citasAgenda.length} citas.`);
      },
      error: (err) => {
        console.error('Error al cargar la agenda:', err);
        this.citasAgenda = [];
      }
    });
  }

  /**
   * RQF01 - ALCANCE: Simula la modificación o cancelación de una cita.
   * @param cita Cita a gestionar.
   * @param accion 'cancelar' o 'reprogramar'.
   */
  gestionarCita(cita: Cita, accion: 'cancelar' | 'reprogramar'): void {
    console.log(`RQF01 - ALCANCE: Iniciando acción de ${accion} para Cita ID ${cita.id}.`);

    // NOTA: En un desarrollo real, aquí se llamaría a:
    // this.citasService.modificarCita(cita) o this.citasService.cancelarCita(cita.id)

    // Usamos console.info en lugar de alert() para seguir las buenas prácticas.
    console.info(`SIMULACIÓN: Se ha solicitado la acción '${accion}' para la cita ID ${cita.id}. Notificación enviada al Backend.`);

    // Recargamos la agenda para reflejar cambios (simulando que el backend actualizó los datos).
    this.cargarCitas();
  }


}
