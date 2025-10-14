import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-solicitarcita',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './solicitarcita.component.html',
  styleUrls: ['./solicitarcita.component.scss']
})
export class SolicitarcitaComponent {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'es', // Español
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    dateClick: this.handleDateClick.bind(this),
    events: [
      // Citas de ejemplo
      { title: 'Consulta - Max', date: '2025-01-15', color: '#4CAF50' },
      { title: 'Vacunación - Luna', date: '2025-01-16', color: '#2196F3' },
      { title: 'Cirugía - Rocky', date: '2025-01-17', color: '#FF9800' }
    ],
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true
  };

  handleDateClick(arg: any) {
    alert('Fecha seleccionada: ' + arg.dateStr);
    // Aquí puedes abrir un modal para solicitar la cita
  }
}