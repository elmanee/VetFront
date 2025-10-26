// /home/agus/Documentos/VetHealth/VetFront/src/app/home/citas/solicitarcita/solicitarcita.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { CitasService, Cita } from '../../../../services/citas.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitarcita',
  standalone: true,
  imports: [CommonModule, FullCalendarModule], 
  templateUrl: './solicitarcita.component.html',
  styleUrl: './solicitarcita.component.scss'
})
export class SolicitarcitaComponent implements OnInit {

  citasExistentes: Cita[] = [];
  calendarVisible: boolean = false;
  fechaSeleccionada: string | null = null;
  horaSeleccionada: string | null = null;
  
  constructor(
    private citasService: CitasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[SOLICITAR CITA] Componente cargado - Vista Cliente');
    this.cargarCitasDisponibilidad();
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    locale: esLocale,
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '18:00'
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this)
  };

  cargarCitasDisponibilidad(): void {
    console.log('[SOLICITAR CITA] Cargando disponibilidad...');
    
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        console.log('[SOLICITAR CITA] Citas recibidas del servidor:', citas);
        
        // Validar que sea un array
        if (!Array.isArray(citas)) {
          console.error('[SOLICITAR CITA] La respuesta no es un array:', citas);
          this.citasExistentes = [];
        } else {
          this.citasExistentes = citas;
        }
        
        this.actualizarEventosCalendario();
        this.calendarVisible = true;
        console.log(`[SOLICITAR CITA] ${this.citasExistentes.length} citas cargadas`);
      },
      error: (err) => {
        console.error('[SOLICITAR CITA] Error al cargar disponibilidad:', err);
        this.citasExistentes = [];
        this.calendarVisible = true;
      }
    });
  }

  actualizarEventosCalendario(): void {
    console.log('[SOLICITAR CITA] Actualizando eventos del calendario...');
    
    if (!Array.isArray(this.citasExistentes)) {
      console.error('[SOLICITAR CITA] citasExistentes no es un array');
      return;
    }

    const eventos: EventInput[] = this.citasExistentes.map(cita => {
      let backgroundColor = '#dc3545';
      let borderColor = '#dc3545';
      let textColor = '#ffffff';
      let title = 'Ocupado';
      
      if (cita.estado === 'Confirmada') {
        backgroundColor = '#ffc107';
        borderColor = '#ffc107';
        textColor = '#000000';
        title = 'Confirmada';
      } else if (cita.estado === 'Pendiente') {
        backgroundColor = '#17a2b8';
        borderColor = '#17a2b8';
        title = 'Pendiente';
      }

      // Asegurarse de que la fecha esté en formato correcto
      let fechaISO = cita.fecha_cita;
      if (fechaISO.includes('T')) {
        fechaISO = fechaISO.split('T')[0];
      }

      return {
        title: `${title} - ${cita.hora_cita}`,
        start: `${fechaISO}T${cita.hora_cita}`,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        textColor: textColor,
        extendedProps: {
          citaData: cita
        }
      };
    });

    console.log('[SOLICITAR CITA] Eventos generados:', eventos);

    this.calendarOptions = { 
      ...this.calendarOptions, 
      events: eventos 
    };
  }

  handleDateClick(arg: any): void {
    const fechaClickeada = arg.dateStr;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaSeleccionadaObj = new Date(fechaClickeada);
    
    if (fechaSeleccionadaObj < hoy) {
      alert('No puedes seleccionar fechas pasadas');
      return;
    }
    
    this.fechaSeleccionada = fechaClickeada;
    this.horaSeleccionada = null;
    console.log(`[SOLICITAR CITA] Fecha seleccionada: ${this.fechaSeleccionada}`);
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    const fechaSeleccionadaObj = new Date(selectInfo.startStr);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionadaObj < hoy) {
      alert('No puedes seleccionar fechas pasadas');
      return;
    }
    
    this.fechaSeleccionada = selectInfo.startStr.split('T')[0];
    console.log(`[SOLICITAR CITA] Fecha seleccionada: ${this.fechaSeleccionada}`);
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const cita: Cita = clickInfo.event.extendedProps['citaData'];
    alert(`Este horario ya está ocupado.\nFecha: ${cita.fecha_cita}\nHora: ${cita.hora_cita}\nEstado: ${cita.estado}`);
  }

  solicitarFormulario(): void {
    if (!this.fechaSeleccionada) {
      alert('Por favor selecciona una fecha disponible');
      return;
    }

    this.router.navigate(['/registrar-cita'], { 
      queryParams: { 
        fecha: this.fechaSeleccionada
      } 
    });
    
    console.log(`[SOLICITAR CITA] Redirigiendo a formulario con fecha: ${this.fechaSeleccionada}`);
  }
}