import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// RQF01 - Importar el servicio y las interfaces para la lógica de negocio
import { CitasService, Cita } from '../../services/citas.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitarcita',
  standalone: true,
  // RQF01 - Dependencias: FullCalendar para la vista de agenda.
  imports: [CommonModule, FullCalendarModule], 
  templateUrl: './solicitarcita.component.html',
  styleUrl: './solicitarcita.component.scss'
})
export class SolicitarcitaComponent implements OnInit {

  // RQF01 - ALCANCE: Lista de citas para mostrar en el calendario (disponibilidad)
  citasDisponibles: Cita[] = [];
  
  // Variables de control para la interfaz de usuario
  calendarVisible: boolean = true;
  fechaSeleccionada: string | null = null;
  
  // RQF01 - Evidencia de Arquitectura (Actividad 3): Inyección del Servicio
  constructor(
    private citasService: CitasService,
    private router: Router // Para navegar al formulario de registro
  ) {}

  ngOnInit(): void {
    // RQF01 - Salida Esperada: Carga las citas al iniciar el componente
    this.cargarCitasParaCliente();
  }

  // RQF01 - CONFIGURACIÓN DEL CALENDARIO
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: false, // El cliente solo consulta, no edita
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    // RQF01 - ALCANCE: Mostrar las citas como eventos
    events: this.citasDisponibles.map(cita => ({
      title: 'Disponible',
      date: cita.fecha,
      start: `${cita.fecha}T${cita.hora}`,
      backgroundColor: '#28a745', // Verde para disponible
      borderColor: '#28a745',
      extendedProps: {
        citaData: cita
      }
    })),
    // RQF01 - FUNCIONALIDAD: Al hacer clic en un slot, se selecciona la fecha
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  // RQF01 - LÓGICA: Simula la carga de las citas que tiene el servicio.
  cargarCitasParaCliente(): void {
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        this.citasDisponibles = citas;
        this.updateCalendarEvents();
        console.log(`Cliente: ${this.citasDisponibles.length} citas cargadas para visualizar disponibilidad.`);
      },
      error: (err) => {
        console.error('Error al cargar la disponibilidad de citas:', err);
      }
    });
  }

  // RQF01 - LÓGICA: Actualiza la fuente de eventos del calendario
  updateCalendarEvents(): void {
    const events = this.citasDisponibles.map(cita => ({
      title: 'Disponible',
      date: cita.fecha,
      start: `${cita.fecha}T${cita.hora}`,
      backgroundColor: '#28a745', // Verde
      borderColor: '#28a745',
      extendedProps: {
        citaData: cita
      }
    }));
    this.calendarOptions = { ...this.calendarOptions, events: events };
  }

  // Maneja el clic en una fecha vacía
  handleDateClick(arg: any): void {
    this.fechaSeleccionada = arg.dateStr;
    console.log(`Cliente: Fecha seleccionada para solicitar: ${this.fechaSeleccionada}`);
  }

  // Maneja el clic en un evento (cita ya programada)
  handleEventClick(clickInfo: { event: EventApi }): void {
    const event = clickInfo.event;
    this.fechaSeleccionada = event.startStr ? event.startStr.substring(0, 10) : null;
    console.log(`Cliente: Cita disponible seleccionada en: ${this.fechaSeleccionada}`);
  }

  // RQF01 - ALCANCE: Navega al formulario de registro
  solicitarFormulario(): void {
    if (this.fechaSeleccionada) {
      // Navegamos al formulario de registro, tal vez pasando la fecha pre-seleccionada como parámetro
      this.router.navigate(['/registrar-cita'], { queryParams: { date: this.fechaSeleccionada } });
      console.log(`Cliente: Redirigiendo a formulario de registro con fecha: ${this.fechaSeleccionada}`);
    } else {
      console.warn('Cliente: Debe seleccionar una fecha antes de continuar.');
    }
  }
}
