// /home/agus/Documentos/VetHealth/VetFront/src/app/home/citas/cita-form/cita-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { 
  CitasService, 
  DatosCliente, 
  DatosCita, 
  ValidacionCliente, 
  Mascota,
  RegistroCitaRequest,
  Cita
} from '../../../../services/citas.service';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './cita-form.component.html',
  styleUrl: './cita-form.component.scss',
})
export class CitaFormComponent implements OnInit {
  
  paso: number = 1;
  correoCliente: string = '';
  esClienteExistente: boolean = false;
  clienteValidado: ValidacionCliente | null = null;
  
  datosClienteNuevo: DatosCliente = {
    nombre_completo: '',
    correo: '',
    telefono: '',
    direccion: ''
  };

  datosCita: DatosCita = {
    fecha_cita: '',
    hora_cita: '',
    motivo: '',
    animal_id: 0,
    mascota_id: null,
    veterinario_id: 1
  };

  categorias = [
    { id: 1, nombre: 'Mamífero' },
    { id: 2, nombre: 'Ave' },
    { id: 3, nombre: 'Reptil' },
    { id: 4, nombre: 'Pez' }
  ];

  animales = [
    { id: 1, nombre: 'Perro', categoria_id: 1 },
    { id: 2, nombre: 'Gato', categoria_id: 1 },
    { id: 3, nombre: 'Loro', categoria_id: 2 },
    { id: 4, nombre: 'Pichón', categoria_id: 2 },
    { id: 5, nombre: 'Iguana', categoria_id: 3 },
    { id: 6, nombre: 'Tortuga', categoria_id: 3 },
    { id: 7, nombre: 'Pez dorado', categoria_id: 4 },
    { id: 8, nombre: 'Betta', categoria_id: 4 }
  ];

  veterinarios = [
    { id: 1, nombre: 'Dr. Juan Pérez' },
    { id: 2, nombre: 'Dra. María García' }
  ];

  mensaje: string = '';
  mensajeClase: string = '';
  cargando: boolean = false;

  citasExistentes: Cita[] = [];
  calendarVisible: boolean = false;
  mascotaSeleccionadaInfo: Mascota | null = null;

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
      hour12: false
    },
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '18:00'
    },
    selectConstraint: 'businessHours',
    eventConstraint: 'businessHours',
    events: [],
    dateClick: this.handleCalendarDateClick.bind(this),
    select: this.handleCalendarSelect.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(
    private citasService: CitasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('[CITA FORM] Componente de registro de citas cargado.');
    
    this.route.queryParams.subscribe(params => {
      if (params['fecha']) {
        this.datosCita.fecha_cita = params['fecha'];
        console.log('[CITA FORM] Fecha preseleccionada:', params['fecha']);
      }
    });
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
        this.cargarCitasParaCalendario();
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mensaje = `Error: ${err.message}`;
        this.mensajeClase = 'error';
      }
    });
  }

  cargarCitasParaCalendario(): void {
    console.log('[CITA FORM] Cargando citas para el calendario...');
    
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        if (Array.isArray(citas)) {
          this.citasExistentes = citas;
          this.actualizarEventosCalendario();
          this.calendarVisible = true;
          console.log(`[CITA FORM] ${citas.length} citas cargadas en calendario`);
        }
      },
      error: (err) => {
        console.error('[CITA FORM] Error al cargar citas:', err);
        this.calendarVisible = true;
      }
    });
  }

  actualizarEventosCalendario(): void {
    if (!Array.isArray(this.citasExistentes)) return;

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

      let fechaISO = cita.fecha_cita;
      if (fechaISO.includes('T')) {
        fechaISO = fechaISO.split('T')[0];
      }

      const horaInicio = cita.hora_cita;
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const minutosFinales = minutos + 30;
      const horaFin = minutosFinales >= 60 
        ? `${String(horas + 1).padStart(2, '0')}:${String(minutosFinales - 60).padStart(2, '0')}`
        : `${String(horas).padStart(2, '0')}:${String(minutosFinales).padStart(2, '0')}`;

      return {
        title: title,
        start: `${fechaISO}T${horaInicio}`,
        end: `${fechaISO}T${horaFin}`,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        textColor: textColor,
        editable: false,
        extendedProps: { citaData: cita }
      };
    });

    this.calendarOptions = { 
      ...this.calendarOptions, 
      events: eventos 
    };

    console.log('[CITA FORM] Eventos actualizados en calendario');
  }

  handleCalendarDateClick(arg: any): void {
    const fechaClickeada = arg.dateStr;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaSeleccionadaObj = new Date(fechaClickeada);
    
    if (fechaSeleccionadaObj < hoy) {
      this.mensaje = 'No puedes seleccionar fechas pasadas';
      this.mensajeClase = 'error';
      return;
    }
    
    this.datosCita.fecha_cita = fechaClickeada;
    this.mensaje = `Fecha seleccionada: ${fechaClickeada}. Ahora selecciona una hora.`;
    this.mensajeClase = 'info';
    console.log(`[CITA FORM] Fecha seleccionada: ${fechaClickeada}`);
  }

  handleCalendarSelect(selectInfo: DateSelectArg): void {
    const inicio = selectInfo.start;
    const fin = selectInfo.end;
    const hoy = new Date();
    
    if (inicio < hoy) {
      this.mensaje = 'No puedes seleccionar fechas u horas pasadas';
      this.mensajeClase = 'error';
      selectInfo.view.calendar.unselect();
      return;
    }

    const horaInicio = inicio.getHours();
    if (horaInicio < 8 || horaInicio >= 18) {
      this.mensaje = 'Horario no disponible. Selecciona entre 8:00 AM y 6:00 PM';
      this.mensajeClase = 'error';
      selectInfo.view.calendar.unselect();
      return;
    }

    const fechaISO = inicio.toISOString().split('T')[0];
    const horaFormateada = `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`;

    const citaConflicto = this.citasExistentes.find(cita => {
      let fechaCitaISO = cita.fecha_cita;
      if (fechaCitaISO.includes('T')) {
        fechaCitaISO = fechaCitaISO.split('T')[0];
      }
      return fechaCitaISO === fechaISO && cita.hora_cita === horaFormateada;
    });

    if (citaConflicto) {
      this.mensaje = 'Este horario ya está ocupado. Selecciona otro horario.';
      this.mensajeClase = 'error';
      selectInfo.view.calendar.unselect();
      return;
    }

    this.datosCita.fecha_cita = fechaISO;
    this.datosCita.hora_cita = horaFormateada;
    this.mensaje = `Fecha y hora seleccionadas: ${fechaISO} a las ${horaFormateada}`;
    this.mensajeClase = 'success';
    
    console.log(`[CITA FORM] Fecha: ${fechaISO}, Hora: ${horaFormateada}`);
    
    selectInfo.view.calendar.unselect();
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const cita: Cita = clickInfo.event.extendedProps['citaData'];
    this.mensaje = `Horario ocupado: ${cita.fecha_cita} a las ${cita.hora_cita} - Estado: ${cita.estado}`;
    this.mensajeClase = 'error';
  }

  onFechaChange(): void {
    console.log('[CITA FORM] Fecha cambiada manualmente:', this.datosCita.fecha_cita);
    
    if (this.datosCita.fecha_cita) {
      const calendarApi = document.querySelector('full-calendar');
      if (calendarApi) {
        const fecha = new Date(this.datosCita.fecha_cita + 'T12:00:00');
        this.calendarOptions = {
          ...this.calendarOptions,
          initialDate: fecha
        };
      }
    }
  }

  onHoraChange(): void {
    console.log('[CITA FORM] Hora cambiada manualmente:', this.datosCita.hora_cita);
    
    if (this.datosCita.hora_cita) {
      const [horas, minutos] = this.datosCita.hora_cita.split(':').map(Number);
      
      if (horas < 8 || horas >= 18 || (horas === 17 && minutos >= 30)) {
        this.mensaje = 'Horario fuera de servicio. Selecciona entre 8:00 AM y 5:30 PM';
        this.mensajeClase = 'error';
        this.datosCita.hora_cita = '';
        return;
      }

      if (this.datosCita.fecha_cita) {
        const citaConflicto = this.citasExistentes.find(cita => {
          let fechaCitaISO = cita.fecha_cita;
          if (fechaCitaISO.includes('T')) {
            fechaCitaISO = fechaCitaISO.split('T')[0];
          }
          return fechaCitaISO === this.datosCita.fecha_cita && 
                 cita.hora_cita === this.datosCita.hora_cita;
        });

        if (citaConflicto) {
          this.mensaje = 'Este horario ya está ocupado. Selecciona otro horario.';
          this.mensajeClase = 'error';
          this.datosCita.hora_cita = '';
        }
      }
    }
  }

  registrarCita(): void {
    if (!this.datosCita.fecha_cita || !this.datosCita.hora_cita || !this.datosCita.motivo || this.datosCita.animal_id === 0) {
      this.mensaje = 'Complete todos los campos de la cita.';
      this.mensajeClase = 'error';
      return;
    }

    if (!this.esClienteExistente) {
      if (!this.datosClienteNuevo.nombre_completo || !this.datosClienteNuevo.telefono) {
        this.mensaje = 'Complete el nombre y teléfono del cliente.';
        this.mensajeClase = 'error';
        return;
      }
    }

    this.cargando = true;
    this.mensaje = 'Registrando cita...';
    this.mensajeClase = 'info';

    const request: RegistroCitaRequest = {
      cliente: this.esClienteExistente 
        ? { cliente_id: this.clienteValidado!.cliente_id! }
        : this.datosClienteNuevo,
      cita: this.datosCita
    };

    console.log('[CITA FORM] Request a enviar:', request);

    this.citasService.registrarCita(request).subscribe({
      next: (response) => {
        this.cargando = false;
        this.mensaje = `¡Cita registrada exitosamente! La confirmación fue enviada.`;
        this.mensajeClase = 'success';
        
        setTimeout(() => {
          this.resetFormulario();
        }, 3000);
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mensaje = `Error: ${err.message}`;
        this.mensajeClase = 'error';
      }
    });
  }

  seleccionarMascota(mascotaId: number): void {
    this.datosCita.mascota_id = mascotaId;
    
    const mascotaSeleccionada = this.clienteValidado?.mascotas?.find(m => m.id === mascotaId);
    if (mascotaSeleccionada) {
      this.mascotaSeleccionadaInfo = mascotaSeleccionada;
      
      const animalEncontrado = this.animales.find(a => 
        a.nombre.toLowerCase() === mascotaSeleccionada.tipo_animal.toLowerCase()
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
    this.mensaje = 'Registrará una mascota nueva. Complete los datos de la cita.';
    this.mensajeClase = 'info';
  }

  volverPaso1(): void {
    this.paso = 1;
    this.correoCliente = '';
    this.clienteValidado = null;
    this.esClienteExistente = false;
    this.mensaje = '';
    this.calendarVisible = false;
  }

  resetFormulario(): void {
    this.paso = 1;
    this.correoCliente = '';
    this.esClienteExistente = false;
    this.clienteValidado = null;
    this.mascotaSeleccionadaInfo = null;
    
    this.datosClienteNuevo = {
      nombre_completo: '',
      correo: '',
      telefono: '',
      direccion: ''
    };

    this.datosCita = {
      fecha_cita: '',
      hora_cita: '',
      motivo: '',
      animal_id: 0,
      mascota_id: null,
      veterinario_id: 1
    };

    this.mensaje = '';
    this.mensajeClase = '';
    this.calendarVisible = false;
  }
}