// /home/agus/Documentos/VetHealth/VetFront/src/app/home/citas/solicitarcita/solicitarcita.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
// Importamos DateClickArg en lugar de DateSelectArg, ya que solo usaremos clicks de día
import { CalendarOptions, EventInput, EventClickArg, DayCellMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
// timeGridPlugin ya no es necesario, lo quitamos
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { CitasService, Cita } from '../../../../services/citas.service';
import { Router, RouterLink } from '@angular/router';
// Importamos SweetAlert2
import Swal from 'sweetalert2'; 

// Constantes para la lógica de disponibilidad
const MAX_CAPACITY = 10; // Citas máximas por día
const LIMITED_CAPACITY_THRESHOLD = 7; // Umbral para estado 'limitado' (Amarillo)

@Component({
  selector: 'app-solicitarcita',
  standalone: true,
  // timeGridPlugin ya no es necesario
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

  // Nueva propiedad para almacenar el conteo de citas por día (YYYY-MM-DD -> count)
  citasPorDia: { [key: string]: number } = {};

  constructor(
    private citasService: CitasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // CORRECCIÓN 1: Cambiado de getAllCitas() a obtenerTodasLasCitas()
    this.citasService.obtenerTodasLasCitas().subscribe(
      // CORRECCIÓN 2: Agregado tipo explícito a 'citas'
      (citas: Cita[]) => {
        this.citasExistentes = citas;
        console.log('[SOLICITAR CITA] Citas cargadas:', citas.length);
        this.procesarCitasYConfigurarCalendario();
      },
      // CORRECCIÓN 3: Agregado tipo explícito a 'error'
      (error: any) => {
        console.error('[SOLICITAR CITA] Error al cargar citas:', error);
        // Mostrar un error amigable o continuar con un calendario vacío
        this.procesarCitasYConfigurarCalendario();
      }
    );
  }

  procesarCitasYConfigurarCalendario(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparación

    // 1. Contar citas por día y clasificar
    const eventos: EventInput[] = [];
    
    // Contar las citas (ahora almacenamos el conteo en citasPorDia)
    this.citasPorDia = this.citasExistentes.reduce((acc, cita) => {
      // CORRECCIÓN 4: Cambiado de cita.fecha a cita.fecha_cita
      const dateKey = cita.fecha_cita.split('T')[0]; // Formato YYYY-MM-DD
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    // 2. Configurar el calendario
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      // Hacemos que los días sean clickeables
      dateClick: this.handleDateClick.bind(this),
      // Permitir la personalización del día
      dayCellDidMount: this.handleDayRender.bind(this),
      // Deshabilitar la selección de rango
      selectable: false,
      editable: false,
      // Deshabilitar el evento click, solo nos interesa el click en la celda
      eventClick: this.handleEventClickBloqueado.bind(this),
      // Mostrar solo los días, no los eventos, ya que usamos el fondo de la celda
      events: [] 
    };

    this.calendarVisible = true;
  }

  /**
   * Determina la clase CSS y el estado de disponibilidad del día.
   */
  getEstadoDelDia(dateString: string): { clase: string, estado: 'disponible' | 'limitado' | 'no-disponible' | 'pasado' } {
    const date = new Date(dateString + 'T00:00:00'); // Asegura que se compara solo la fecha
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Días pasados
    if (date < today) {
      return { clase: 'dia-pasado-oscuro', estado: 'pasado' };
    }

    // 2. Días No Hábiles (Solo Domingo)
    // El domingo es 0. El sábado es 6 (hábil).
    if (date.getDay() === 0) { 
       return { clase: 'estado-no-disponible', estado: 'no-disponible' };
    }
    
    // 3. Contar citas para el día
    const citasCount = this.citasPorDia[dateString] || 0;

    if (citasCount >= MAX_CAPACITY) {
      return { clase: 'estado-no-disponible', estado: 'no-disponible' };
    } else if (citasCount >= LIMITED_CAPACITY_THRESHOLD) {
      return { clase: 'estado-limitado', estado: 'limitado' };
    } else {
      // CORRECCIÓN: Si no tiene citas, no está pasado y es hábil, es "disponible".
      return { clase: 'estado-disponible', estado: 'disponible' };
    }
  }


  /**
   * Personaliza la apariencia de la celda del día (fondo de disponibilidad).
   */
  handleDayRender(arg: DayCellMountArg): void {
    // Obtenemos la fecha en formato YYYY-MM-DD
    const dateString = arg.date.toISOString().split('T')[0];
    const { clase } = this.getEstadoDelDia(dateString);
    
    // Agregamos la clase CSS al elemento de la celda. 
    // Esto asegura que TODOS los días futuros tengan una clase (pasado, no disponible, limitado o disponible)
    arg.el.classList.add(clase);
  }

  /**
   * Manejador de click de celda (fecha).
   */
  async handleDateClick(arg: DateClickArg): Promise<void> {
    const dateString = arg.dateStr;
    const { estado } = this.getEstadoDelDia(dateString);

    if (estado === 'pasado' || estado === 'no-disponible') {
      console.log(`[SOLICITAR CITA] Click en día no seleccionable (${estado}).`);
      // Si se da click en un día no disponible (Domingo o Lleno), mostramos una alerta informativa
       Swal.fire({
          icon: 'error',
          title: 'Día no Seleccionable',
          text: estado === 'pasado' ? 'No puedes seleccionar fechas pasadas.' : 'Este día está bloqueado o no tiene disponibilidad.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#F27C2B'
      });
      return; 
    }

    // Si el día está limitado, mostrar SweetAlert de advertencia
    // Esta es la lógica que solicitaste mejorar: advertir sobre reagendamiento en días de alta ocupación.
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
      
      // Si el usuario cancela, salimos sin seleccionar la fecha
      if (!result.isConfirmed) {
        console.log('[SOLICITAR CITA] Usuario canceló por disponibilidad limitada.');
        return;
      }
    }
    
    // Si el estado es 'disponible' o si el usuario confirmó el 'limitado'
    this.seleccionarFecha(dateString);
  }

  /**
   * Registra la fecha seleccionada por el usuario.
   */
  seleccionarFecha(fechaClickeada: string): void {
    // Aquí se asume que la fecha es una selección válida
    this.fechaSeleccionada = fechaClickeada;
    this.horaSeleccionada = null;
    console.log(`[SOLICITAR CITA] Fecha seleccionada: ${this.fechaSeleccionada}`);
  }

  /**
   * Manejador de click de evento. Bloquea el evento ya que solo se usan eventos de fondo.
   */
  handleEventClickBloqueado(clickInfo: EventClickArg): void {
    // Evita la acción por defecto y el alert original
    clickInfo.jsEvent.preventDefault(); 
    // Muestra SweetAlert si por alguna razón el usuario intenta hacer click en el evento (aunque se usa background display)
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
        confirmButtonColor: '#F27C2B' // Usando el Primary
      });
      return;
    }

    // Redirección al componente de registro de cita con el query param de la fecha
    this.router.navigate(['/registrar-cita'], { 
      queryParams: { 
        fecha: this.fechaSeleccionada
      } 
    });
  }
}
