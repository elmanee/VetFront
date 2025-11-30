import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, DayCellMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { CitasService, Cita } from '../../../../services/citas.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

const MAX_CAPACITY = 10;
const LIMITED_CAPACITY_THRESHOLD = 7;

@Component({
  selector: 'app-solicitarcita',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterLink],
  templateUrl: './solicitarcita.component.html',
  styleUrl: './solicitarcita.component.scss'
})
export class SolicitarcitaComponent implements OnInit {

  citasExistentes: Cita[] = [];
  calendarOptions!: CalendarOptions;
  calendarVisible = false;
  fechaSeleccionada: string | null = null;
  horaSeleccionada: string | null = null;

  citasPorDia: { [key: string]: number } = {};

  constructor(
    private citasService: CitasService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.citasService.obtenerTodasLasCitas().subscribe(
      (citas: Cita[]) => {
        this.citasExistentes = citas;
        console.log('[SOLICITAR CITA] Citas cargadas:', citas.length);
        this.procesarCitasYConfigurarCalendario();
      },
      (error: any) => {
        console.error('[SOLICITAR CITA] Error al cargar citas:', error);
        this.procesarCitasYConfigurarCalendario();
      }
    );
  }

  procesarCitasYConfigurarCalendario(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.citasPorDia = this.citasExistentes.reduce((acc, cita) => {
      const dateKey = cita.fecha_cita.split('T')[0]; // Formato YYYY-MM-DD
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      dateClick: this.handleDateClick.bind(this),
      dayCellDidMount: this.handleDayRender.bind(this),
      selectable: false,
      editable: false,
      // Usar bind(this) para asegurar que el contexto sea el componente al ejecutarse el evento
      eventClick: this.handleEventClickBloqueado.bind(this),
      events: []
    };

    this.calendarVisible = true;
  }

  getEstadoDelDia(dateString: string): { clase: string, estado: 'disponible' | 'limitado' | 'no-disponible' | 'pasado' } {
    const date = new Date(dateString + 'T00:00:00'); // Asegura que se compara solo la fecha
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return { clase: 'dia-pasado-oscuro', estado: 'pasado' };
    }

    if (date.getDay() === 0) {
      return { clase: 'estado-no-disponible', estado: 'no-disponible' };
    }
    const citasCount = this.citasPorDia[dateString] || 0;

    if (citasCount >= MAX_CAPACITY) {
      return { clase: 'estado-no-disponible', estado: 'no-disponible' };
    } else if (citasCount >= LIMITED_CAPACITY_THRESHOLD) {
      return { clase: 'estado-limitado', estado: 'limitado' };
    } else {
      return { clase: 'estado-disponible', estado: 'disponible' };
    }
  }

  handleDayRender(arg: DayCellMountArg): void {
    const dateString = arg.date.toISOString().split('T')[0];
    const { clase } = this.getEstadoDelDia(dateString);
    arg.el.classList.add(clase);
  }

  async handleDateClick(arg: DateClickArg): Promise<void> {
    const dateString = arg.dateStr;
    const { estado } = this.getEstadoDelDia(dateString);

    if (estado === 'pasado' || estado === 'no-disponible') {
      console.log(`[SOLICITAR CITA] Click en día no seleccionable (${estado}).`);
      Swal.fire({
        icon: 'error',
        title: 'Día no Seleccionable',
        text: estado === 'pasado' ? 'No puedes seleccionar fechas pasadas.' : 'Este día está bloqueado o no tiene disponibilidad.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#F27C2B'
      });
      return;
    }

    if (estado === 'limitado') {
      const citasCount = this.citasPorDia[dateString] || 0;
      const result = await Swal.fire({
        icon: 'warning',
        title: '¡Disponibilidad Limitada!',
        html: `
          <p class="text-start">Has seleccionado una fecha con <strong>Alta Ocupación</strong>.</p>
          <ul class="text-start">
            <li>Citas agendadas: <strong>${citasCount} de ${MAX_CAPACITY}</strong></li>
            <li>Existe una <strong>baja probabilidad</strong> de que el médico deba reajustar tu hora.</li>
            <li>Serás notificado por <strong>correo electrónico</strong> si ocurre un cambio.</li>
          </ul>
          <p class="text-center fw-bold mt-3 mb-0">¿Deseas continuar con esta fecha?</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, Aceptar Riesgo',
        cancelButtonText: 'No, Seleccionar Otra Fecha',
        confirmButtonColor: '#F27C2B', // Usando el Primary
        cancelButtonColor: '#6c757d',
        customClass: {
          title: 'text-dark fw-bold',
          htmlContainer: 'text-muted'
        }
      });

      if (!result.isConfirmed) {
        console.log('[SOLICITAR CITA] Usuario canceló por disponibilidad limitada.');
        return;
      }
    }

    this.seleccionarFecha(dateString);
  }

  //Registra la fecha seleccionada por el usuario.
  seleccionarFecha(fechaClickeada: string): void {
    // Aquí se asume que la fecha es una selección válida
    this.fechaSeleccionada = fechaClickeada;
    this.horaSeleccionada = null;
    console.log(`[SOLICITAR CITA] Fecha seleccionada: ${this.fechaSeleccionada}`);
  }

  // Corrección: Se cambia el tipo a 'any' o 'EventClickArg' si está importado
  handleEventClickBloqueado(clickInfo: any): void {
    clickInfo.jsEvent.preventDefault();
    Swal.fire({
      icon: 'info',
      title: 'Disponibilidad del día',
      text: 'Solo puedes seleccionar la fecha para continuar. El color indica la disponibilidad general.',
      confirmButtonText: 'Ok',
      confirmButtonColor: '#F27C2B' // Usando el Primary
    });
  }

  solicitarFormulario(): void {
    if (!this.fechaSeleccionada) {
      Swal.fire({
        icon: 'info',
        title: 'Selecciona una fecha',
        text: 'Por favor, haz clic en una fecha disponible en el calendario para continuar.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#F27C2B'
      });
      return;
    }

    // === CORRECCIÓN AQUÍ ===
    // Usamos '../registrar-cita' para subir un nivel y buscar el hermano.
    // Si estamos en /admin/solicitar-cita -> va a /admin/registrar-cita
    // Si estamos en /solicitar-cita -> va a /registrar-cita
    this.router.navigate(['../registrar-cita'], {
      relativeTo: this.route,
      queryParams: {
        fecha: this.fechaSeleccionada
      }
    });
  }
}