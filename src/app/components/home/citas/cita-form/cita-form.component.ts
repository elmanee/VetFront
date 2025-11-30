import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventInput,
  DateSelectArg,
  EventClickArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CommonModule } from '@angular/common';
import {
  CitasService,
  DatosCliente,
  DatosCita,
  ValidacionCliente,
  Mascota,
  RegistroCitaRequest,
  Cita,
} from '../../../../services/citas.service';
import { Component, OnInit, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { ServiciosFacade } from '../../../../facades/servicios.facade';
import { map } from 'rxjs/operators';

const MAX_CAPACITY = 10;
const LIMITED_CAPACITY_THRESHOLD = 7;

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './cita-form.component.html',
  styleUrl: './cita-form.component.scss',
})
export class CitaFormComponent implements OnInit {
  private serviciosFacade = inject(ServiciosFacade);

  listaServicios$ = this.serviciosFacade.servicios$.pipe(
    map((servicios) => servicios.filter((servicio) => servicio.activo === true))
  );
  paso: number = 1;
  correoCliente: string = '';
  esClienteExistente: boolean = false;
  clienteValidado: ValidacionCliente | null = null;
  fechaPreseleccionada: string | null = null; // Fecha si viene de la URL (Paso 1 de solicitarcita)
  modoSeleccionHora: boolean = false; // Bandera para saber si se debe enfocar en la hora

  datosClienteNuevo: DatosCliente = {
    nombre_completo: '',
    correo: '',
    telefono: '',
    direccion: '',
  };

  datosCita: any = {
    fecha_cita: '',
    hora_cita: '',
    motivo: '',
    animal_id: 0,
    mascota_id: null,
    veterinario_id: null,
    servicios: [],
  };

  animales = [
    { id: 1, nombre: 'Perro', categoria_id: 1 },
    { id: 2, nombre: 'Gato', categoria_id: 1 },
    { id: 3, nombre: 'Loro', categoria_id: 2 },
    { id: 4, nombre: 'Pichón', categoria_id: 2 },
    { id: 5, nombre: 'Iguana', categoria_id: 3 },
    { id: 6, nombre: 'Tortuga', categoria_id: 3 },
    { id: 7, nombre: 'Pez dorado', categoria_id: 4 },
    { id: 8, nombre: 'Betta', categoria_id: 4 },
  ];

  mensaje: string = '';
  mensajeClase: string = '';
  cargando: boolean = false;

  citasExistentes: Cita[] = [];
  calendarVisible: boolean = false;
  mascotaSeleccionadaInfo: Mascota | null = null;
  calendarApi: any; // Referencia al API del calendario

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay', // Se ajusta en ngOnInit
    },
    initialView: 'dayGridMonth', // Se ajusta en ngOnInit
    locale: esLocale,
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    selectOverlap: false,
    dayMaxEvents: true,
    allDaySlot: false,
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '18:00',
    },
    selectConstraint: 'businessHours',
    eventConstraint: 'businessHours',
    events: [],
    dateClick: this.handleCalendarDateClick.bind(this),
    select: this.handleCalendarSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    dayCellClassNames: this.obtenerClasesDia.bind(this), // Evento para obtener la referencia del API
    datesSet: (info) => {
      this.calendarApi = info.view.calendar;
    },
  };

  constructor(
    private citasService: CitasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[CITA FORM] Componente de registro de citas cargado.');
    // --- 4. CARGAR SERVICIOS AL INICIAR ---
    this.serviciosFacade.loadServicios();

    this.route.queryParams.subscribe((params) => {
      if (params['fecha']) {
        this.fechaPreseleccionada = params['fecha']; // Aquí this.datosCita.fecha_cita se asigna con un string válido
        this.datosCita.fecha_cita = this.fechaPreseleccionada!;
        this.modoSeleccionHora = true; // Activamos el modo de selección de hora
        this.paso = 1; // Mantenemos en el paso 1 (Validación de Cliente)

        console.log(
          '[CITA FORM] Modo Seleccionar Hora activado. Fecha:',
          this.fechaPreseleccionada
        ); // Cargamos las citas para poder mostrar los horarios ocupados
        // Corrección: Usamos '!' para asegurar que es string si pasa el 'if'
        this.cargarCitasParaCalendario(this.fechaPreseleccionada!);
      } else {
        // Modo normal (Paso 1: Validar Cliente)
        this.modoSeleccionHora = false;
        this.paso = 1;
      }
    });
  }
  toggleServicio(servicioId: number) {
    const index = this.datosCita.servicios.indexOf(servicioId);

    if (index === -1) {
      this.datosCita.servicios.push(servicioId);
    } else {
      this.datosCita.servicios.splice(index, 1);
    }
  }

  esServicioSeleccionado(servicioId: number): boolean {
    return this.datosCita.servicios.includes(servicioId);
  }

  configurarCalendarioParaDia(initialDate: string): void {
    const initialDateObj = new Date(initialDate + 'T12:00:00');

    this.calendarOptions = {
      ...this.calendarOptions,
      initialView: 'timeGridDay', // Cambiamos a la vista de día para seleccionar hora
      initialDate: initialDateObj, // Centramos en la fecha preseleccionada
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: '', // Eliminamos los botones de vista de mes/semana/día
      }, // Bloqueamos navegación para que el usuario se quede en la fecha preseleccionada
      dateClick: this.handleDayNavigationClick.bind(this),
    };
    this.calendarVisible = true;
  }
  handleDayNavigationClick(arg: any): void {
    if (!this.modoSeleccionHora) return;

    const dateString = arg.dateStr.split('T')[0];
    if (!this.fechaPreseleccionada) return; // Si la fecha clickeada es diferente a la preseleccionada, se bloquea la navegación

    if (dateString !== this.fechaPreseleccionada) {
      Swal.fire({
        icon: 'info',
        title: 'Día Fijo',
        text: `Solo puedes seleccionar horas para el día ${this.fechaPreseleccionada}. Por favor, usa las flechas de navegación del calendario solo para ver.`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#F27C2B',
      });
      if (this.calendarApi) {
        this.calendarApi.gotoDate(this.fechaPreseleccionada!);
      }
    } else {
      this.handleCalendarDateClick(arg);
    }
  }

  manejarRetroceso(): void {
    if (this.paso === 2) {
      this.volverPaso1();
      console.log(
        '[CITA FORM] Retrocediendo de Paso 2 a Paso 1 (Validar Cliente).'
      );
    } else if (this.modoSeleccionHora) {
      console.log(
        '[CITA FORM] Volviendo a Solicitar Cita para cambiar la fecha.'
      );
      this.router.navigate(['/solicitar-cita']);
    } else {
      console.log('[CITA FORM] Navegando al Dashboard.');
      this.router.navigate(['/dashboard']);
    }
  }

  validarCliente(): void {
    if (!this.correoCliente || !this.correoCliente.includes('@')) {
      this.mensaje = 'Por favor ingrese un correo válido.';
      this.mensajeClase = 'error';
      return;
    }

    this.cargando = true;
    this.mensaje = 'Validando cliente...';
    this.mensajeClase = 'info';

    this.citasService.validarCliente(this.correoCliente).subscribe({
      next: (response: ValidacionCliente) => {
        this.cargando = false;
        this.clienteValidado = response;

        if (response.existe) {
          this.esClienteExistente = true;
          this.mensaje = `Cliente encontrado: ${response.nombre}`;
          this.mensajeClase = 'success';
          if (response.mascotas && response.mascotas.length > 0) {
            console.log('[CITA FORM] Mascotas del cliente:', response.mascotas);
          }
        } else {
          this.esClienteExistente = false;
          this.mensaje = 'Cliente nuevo. Complete los datos para continuar.';
          this.mensajeClase = 'info';
          this.datosClienteNuevo.correo = this.correoCliente;
        }

        this.paso = 2;
        if (!this.modoSeleccionHora) {
          this.cargarCitasParaCalendario();
        }
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mensaje = `Error: ${err.message}`;
        this.mensajeClase = 'error';
      },
    });
  }

  obtenerClasesDia(arg: any): string[] {
    const fechaDia = arg.date.toISOString().split('T')[0];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diaActual = new Date(fechaDia + 'T00:00:00');
    const clases: string[] = [];
    if (diaActual < hoy) {
      clases.push('dia-pasado');
    }
    if (
      this.modoSeleccionHora &&
      this.fechaPreseleccionada &&
      fechaDia !== this.fechaPreseleccionada
    ) {
      clases.push('dia-pasado'); // Usamos la clase para inhabilitarlo
    }

    return clases;
  }

  cargarCitasParaCalendario(initialDate?: string): void {
    console.log('[CITA FORM] Cargando citas para el calendario...');
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        if (Array.isArray(citas)) {
          this.citasExistentes = citas;
          this.actualizarEventosCalendario(initialDate);
          if (!this.modoSeleccionHora) {
            this.calendarVisible = true;
          } else {
          }
          console.log(
            `[CITA FORM] ${citas.length} citas cargadas en calendario`
          );
        }
      },
      error: (err) => {
        console.error('[CITA FORM] Error al cargar citas:', err);
        this.calendarVisible = true;
      },
    });
    if (initialDate && this.modoSeleccionHora) {
      this.configurarCalendarioParaDia(initialDate);
    }
  }

  actualizarEventosCalendario(initialDate?: string): void {
    if (!Array.isArray(this.citasExistentes)) return;

    let citasFiltradas = this.citasExistentes;

    if (this.modoSeleccionHora && this.fechaPreseleccionada) {
      citasFiltradas = this.citasExistentes.filter((cita) => {
        let fechaCitaISO = cita.fecha_cita;
        if (fechaCitaISO.includes('T')) {
          fechaCitaISO = fechaCitaISO.split('T')[0];
        }
        return fechaCitaISO === this.fechaPreseleccionada;
      });
      console.log(
        `[CITA FORM] Mostrando ${citasFiltradas.length} citas para el día fijo: ${this.fechaPreseleccionada}`
      );
    }

    const eventos: EventInput[] = citasFiltradas.map((cita) => {
      let backgroundColor = '#520000'; // Rojo oscuro para Ocupado
      let borderColor = '#520000';
      let textColor = '#ffffff';
      let title = 'Ocupado';
      if (cita.estado === 'Confirmada') {
        backgroundColor = '#FFC040';
        borderColor = '#FFC040';
        textColor = '#5c5c5cff';
        title = 'Confirmada';
      } else if (cita.estado === 'Pendiente') {
        backgroundColor = '#505050ff';
        borderColor = '#585858ff';
        textColor = '#FFD95A';
        title = 'Pendiente';
      }

      let fechaISO = cita.fecha_cita;
      if (fechaISO.includes('T')) {
        fechaISO = fechaISO.split('T')[0];
      }

      const horaInicio = cita.hora_cita;
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const minutosFinales = minutos + 30;
      const horaFin =
        minutosFinales >= 60
          ? `${String(horas + 1).padStart(2, '0')}:${String(
              minutosFinales - 60
            ).padStart(2, '0')}`
          : `${String(horas).padStart(2, '0')}:${String(
              minutosFinales
            ).padStart(2, '0')}`;

      return {
        title: title,
        start: `${fechaISO}T${horaInicio}`,
        end: `${fechaISO}T${horaFin}`,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        textColor: textColor,
        editable: false,
        extendedProps: { citaData: cita },
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: eventos,
    };
    if (this.modoSeleccionHora && this.calendarApi && initialDate) {
      this.calendarApi.gotoDate(initialDate);
    }

    console.log('[CITA FORM] Eventos actualizados en calendario');
  }

  handleCalendarDateClick(arg: any): void {
    if (this.modoSeleccionHora) {
      this.mensaje = `Por favor, selecciona un bloque de 30 minutos dentro de la vista de horario para elegir la hora de tu cita.`;
      this.mensajeClase = 'info';
      return;
    }
    const fechaClickeada = arg.dateStr;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionadaObj = new Date(fechaClickeada);
    if (fechaSeleccionadaObj < hoy) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha no válida',
        text: 'No puedes seleccionar fechas pasadas',
        confirmButtonText: 'Entendido',
        confirmButtonColor: 'rgba(56, 56, 48, 1)',
      });
      return;
    }
    this.datosCita.fecha_cita = fechaClickeada;
    this.mensaje = `Fecha seleccionada: ${fechaClickeada}. Ahora selecciona una hora en la vista de Día.`;
    this.mensajeClase = 'info';
    console.log(`[CITA FORM] Fecha seleccionada: ${fechaClickeada}`); // Si no estamos en modo selección de hora, cambiamos la vista a día

    if (this.calendarApi) {
      this.calendarApi.changeView('timeGridDay', fechaClickeada);
    }
  }

  handleCalendarSelect(selectInfo: DateSelectArg): void {
    const inicio = selectInfo.start;
    const hoy = new Date();
    if (inicio < hoy) {
      this.mensaje = 'No puedes seleccionar fechas u horas pasadas';
      this.mensajeClase = 'error';
      selectInfo.view.calendar.unselect();
      return;
    }

    const horaInicio = inicio.getHours();
    if (horaInicio < 8 || horaInicio >= 18) {
      this.mensaje =
        'Horario no disponible. Selecciona entre 8:00 AM y 6:00 PM';
      this.mensajeClase = 'error';
      selectInfo.view.calendar.unselect();
      return;
    }

    const fechaISO = inicio.toISOString().split('T')[0];
    const horaFormateada = `${String(inicio.getHours()).padStart(
      2,
      '0'
    )}:${String(inicio.getMinutes()).padStart(2, '0')}`; // Si estamos en modo de selección de hora, aseguramos que la fecha sea la preseleccionada

    // Corrección: Comprobamos this.fechaPreseleccionada para evitar errores
    if (
      this.modoSeleccionHora &&
      this.fechaPreseleccionada &&
      fechaISO !== this.fechaPreseleccionada
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha Incorrecta',
        text: `Solo puedes seleccionar horas para la fecha ${this.fechaPreseleccionada}. Por favor, selecciona dentro de este día.`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#F27C2B',
      });
      selectInfo.view.calendar.unselect();
      return;
    } // Validación de conflicto de horario
    const citaConflicto = this.citasExistentes.find((cita) => {
      let fechaCitaISO = cita.fecha_cita;
      if (fechaCitaISO.includes('T')) {
        fechaCitaISO = fechaCitaISO.split('T')[0];
      }
      return fechaCitaISO === fechaISO && cita.hora_cita === horaFormateada;
    });

    if (citaConflicto) {
      Swal.fire({
        icon: 'warning',
        title: '¡Conflicto de Horario Detectado!',
        html: `
          <p class="text-secondary fw-bold">El veterinario ya tiene una cita agendada a esta hora.</p>
          <p class="mt-3 text-muted">
            **Aviso Importante:** Si elige un horario inmediatamente después de una cita ya tomada, existe la posibilidad de que la consulta anterior se extienda.
          </p>
          <p class="fw-bold text-danger">
            Su turno podría empezar tarde o no ser atendido en el horario exacto seleccionado.
          </p>
          <p class="mt-3">
            Por favor, seleccione un horario con un margen de tiempo adecuado para asegurar un servicio oportuno.
          </p>
        `,
        confirmButtonText: 'Entendido, elegiré otro',
        confirmButtonColor: 'rgba(56, 56, 48, 1)',
      });
      selectInfo.view.calendar.unselect();
      return;
    } // Corrección: this.datosCita.fecha_cita se inicializó como string, esto es seguro

    this.datosCita.fecha_cita = fechaISO;
    this.datosCita.hora_cita = horaFormateada;
    this.mensaje = `Fecha y hora seleccionadas: ${fechaISO} a las ${horaFormateada}`;
    this.mensajeClase = 'success';
    console.log(`[CITA FORM] Fecha: ${fechaISO}, Hora: ${horaFormateada}`);
    selectInfo.view.calendar.unselect();
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const cita: Cita = clickInfo.event.extendedProps['citaData']; // Corrección: Usamos '!' ya que la cita contiene estos campos como string
    this.mensaje = `Horario ocupado: ${cita.fecha_cita!} a las ${cita.hora_cita!} - Estado: ${cita.estado!}`;
    this.mensajeClase = 'error';
  }

  onFechaChange(): void {
    console.log(
      '[CITA FORM] Fecha cambiada manualmente:',
      this.datosCita.fecha_cita
    );
    this.datosCita.hora_cita = ''; // Corrección: Comprobamos this.datosCita.fecha_cita antes de usarlo
    if (this.datosCita.fecha_cita) {
      // Intenta cambiar la vista del calendario al día seleccionado manualmente
      if (this.calendarApi) {
        this.calendarApi.changeView('timeGridDay', this.datosCita.fecha_cita);
      } else {
        // Esto solo ocurriría en el modo normal, si el calendario aún no está visible
        this.calendarOptions = {
          ...this.calendarOptions,
          // Corrección: Creamos un Date object solo si fecha_cita tiene valor
          initialDate: new Date(this.datosCita.fecha_cita + 'T12:00:00'),
        };
      }
    }
  }

  onHoraChange(): void {
    console.log(
      '[CITA FORM] Hora cambiada manualmente:',
      this.datosCita.hora_cita
    );
    // Corrección: Comprobamos ambas propiedades
    if (this.datosCita.hora_cita && this.datosCita.fecha_cita) {
      const [horas, minutos] = this.datosCita.hora_cita.split(':').map(Number);
      if (horas < 8 || horas >= 18 || (horas === 17 && minutos >= 30)) {
        this.mensaje =
          'Horario fuera de servicio. Selecciona entre 8:00 AM y 5:30 PM';
        this.mensajeClase = 'error';
        this.datosCita.hora_cita = '';
        return;
      } // Validación de conflicto de horario

      const citaConflicto = this.citasExistentes.find((cita) => {
        let fechaCitaISO = cita.fecha_cita;
        if (fechaCitaISO.includes('T')) {
          fechaCitaISO = cita.fecha_cita.split('T')[0];
        }
        // Corrección: this.datosCita.fecha_cita ya no es null
        return (
          fechaCitaISO === this.datosCita.fecha_cita &&
          cita.hora_cita === this.datosCita.hora_cita
        );
      });

      if (citaConflicto) {
        Swal.fire({
          icon: 'warning',
          title: '¡Conflicto de Horario Detectado!',
          html: `
              <p class="text-secondary fw-bold">El veterinario ya tiene una cita agendada a esta hora.</p>
              <p class="mt-3">Por favor, seleccione un horario con un margen de tiempo adecuado.</p>
            `,
          confirmButtonText: 'Entendido, elegiré otro',
          confirmButtonColor: 'rgba(56, 56, 48, 1)',
        });
        this.datosCita.hora_cita = '';
        return;
      }
    }
  } // Lógica de registro (sin cambios funcionales, solo utiliza el modo)

  registrarCita(): void {
    // Corrección: Comprobación estricta al inicio de la función
    if (
      !this.datosCita.fecha_cita ||
      !this.datosCita.hora_cita ||
      !this.datosCita.motivo ||
      this.datosCita.animal_id === 0
    ) {
      this.mensaje = 'Complete todos los campos de la cita.';
      this.mensajeClase = 'error';
      return;
    }

    if (!this.esClienteExistente && this.paso === 2) {
      if (
        !this.datosClienteNuevo.nombre_completo ||
        !this.datosClienteNuevo.telefono
      ) {
        this.mensaje = 'Complete el nombre y teléfono del cliente.';
        this.mensajeClase = 'error';
        return;
      }
    }

    const citaConflicto = this.citasExistentes.find((cita) => {
      let fechaCitaISO = cita.fecha_cita;
      if (fechaCitaISO.includes('T')) {
        fechaCitaISO = cita.fecha_cita.split('T')[0];
      }
      // Corrección: this.datosCita.fecha_cita ya no es null
      return (
        fechaCitaISO === this.datosCita.fecha_cita &&
        cita.hora_cita === this.datosCita.hora_cita
      );
    });

    if (citaConflicto) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede registrar la cita',
        html: `
                <p class="text-danger fw-bold">¡Conflicto de Horario Insalvable!</p>
                <p class="mt-3 text-muted">
                    Ya existe una cita confirmada o pendiente exactamente a las <strong>${this.datosCita.hora_cita}</strong> el día <strong>${this.datosCita.fecha_cita}</strong>.
                </p>
                <p class="fw-bold text-dark">
                    Por favor, verifique el calendario o seleccione manualmente un horario libre.
                </p>
            `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: 'rgba(220, 53, 69, 1)',
      });
      return;
    }

    this.cargando = true;
    this.mensaje = 'Registrando cita...';
    this.mensajeClase = 'info';

    const request: RegistroCitaRequest = {
      cliente: this.esClienteExistente
        ? { cliente_id: this.clienteValidado!.cliente_id! }
        : this.datosClienteNuevo,
      cita: this.datosCita,
    };

    console.log('CITA FORM Request a enviar:', request);

    this.citasService.registrarCita(request).subscribe({
      next: (response) => {
        this.cargando = false;
        const fechaCita = this.datosCita.fecha_cita;
        const horaCita = this.datosCita.hora_cita;
        const mascota = this.mascotaSeleccionadaInfo?.nombre || 'Mascota Nueva';

        Swal.fire({
          icon: 'success',
          title: '¡Cita Registrada!',
          html: `
            <p class="text-secondary">Tu cita para ${mascota} ha sido agendada con éxito.</p>
            <p class="mb-1 fw-bold text-dark">Día: ${fechaCita}</p>
            <p class="fw-bold text-dark">Hora: ${horaCita}</p>
            <hr>
            <small class="text-muted">
              Recibirás una confirmación por correo electrónico con todos los detalles de la consulta.
            </small>
          `,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#FFD95A',
          customClass: {
            confirmButton: 'text-dark fw-bold',
          },
        });
        setTimeout(() => {
          this.resetFormulario();
          this.router.navigate(['/dashboard']); // Redirigir al dashboard después del éxito
        }, 5000);
      },
      error: (err: Error) => {
        this.cargando = false;
        const message = err.message.includes('Error: ')
          ? err.message.replace('Error: ', '')
          : err.message;

        Swal.fire({
          icon: 'error',
          title: 'Error de Registro',
          text: message,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: 'rgba(220, 53, 69, 1)',
        });
      },
    });
  } // --- Funciones de navegación y selección de mascota (sin cambios) ---

  seleccionarMascota(mascotaId: number): void {
    this.datosCita.mascota_id = mascotaId;
    const mascotaSeleccionada = this.clienteValidado?.mascotas?.find(
      (m) => m.id === mascotaId
    );
    if (mascotaSeleccionada) {
      this.mascotaSeleccionadaInfo = mascotaSeleccionada;
      const animalEncontrado = this.animales.find(
        (a) =>
          a.nombre.toLowerCase() ===
          mascotaSeleccionada.tipo_animal.toLowerCase()
      );
      if (animalEncontrado) {
        this.datosCita.animal_id = animalEncontrado.id;
        this.mensaje = `Mascota seleccionada: ${mascotaSeleccionada.nombre} (${mascotaSeleccionada.tipo_animal})`;
      } else {
        this.mensaje = `Mascota seleccionada: ${mascotaSeleccionada.nombre}. Seleccione el tipo de animal.`;
      }
      this.mensajeClase = 'info';
      console.log('[CITA FORM] Mascota seleccionada:', mascotaSeleccionada);
    }
  }

  mascotaNueva(): void {
    this.datosCita.mascota_id = null;
    this.datosCita.animal_id = 0;
    this.mascotaSeleccionadaInfo = null;
    this.mensaje =
      'Registrará una mascota nueva. Complete los datos de la cita.';
    this.mensajeClase = 'info';
  }

  volverPaso1(): void {
    this.paso = 1;
    this.correoCliente = '';
    this.clienteValidado = null;
    this.esClienteExistente = false;
    this.mensaje = ''; // Si estamos en modo de selección de hora, mantenemos el calendario visible y la fecha
    if (!this.modoSeleccionHora) {
      this.calendarVisible = false;
      this.datosCita.fecha_cita = '';
      this.datosCita.hora_cita = '';
    }
  }

  resetFormulario(): void {
    this.paso = 1;
    this.correoCliente = '';
    this.esClienteExistente = false;
    this.clienteValidado = null;
    this.mascotaSeleccionadaInfo = null;
    this.fechaPreseleccionada = null;
    this.modoSeleccionHora = false;
    this.datosClienteNuevo = {
      nombre_completo: '',
      correo: '',
      telefono: '',
      direccion: '',
    };

    this.datosCita = {
      fecha_cita: '',
      hora_cita: '',
      motivo: '',
      animal_id: 0,
      mascota_id: null,
      veterinario_id: null,
      servicios: [],
    };

    this.mensaje = '';
    this.mensajeClase = '';
    this.calendarVisible = false;
  }
}
