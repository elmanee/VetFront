import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CommonModule } from '@angular/common';
import { CitasService, DatosCliente,DatosCita,ValidacionCliente,Mascota,RegistroCitaRequest,Cita} from '../../../../services/citas.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2'

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
    eventClick: this.handleEventClick.bind(this),
    dayCellClassNames: this.obtenerClasesDia.bind(this)
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

  obtenerClasesDia(arg: any): string[] {
  const fechaDia = arg.date.toISOString().split('T')[0]; // "2025-01-08"
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); //resetea las horas
  
  const diaActual = new Date(fechaDia + 'T00:00:00');
  
  const clases: string[] = [];
  
  if (diaActual < hoy) {
    clases.push('dia-pasado');
  }
  
  return clases;
}

personalizarDiasPasados(arg: any): void {
  const fechaDia = arg.date.toISOString().split('T')[0];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const diaActual = new Date(fechaDia + 'T00:00:00');
  
  if (diaActual < hoy) {
    arg.el.style.backgroundColor = 'rgba(54, 52, 52, 1)'; // Rojo claro
    
    arg.el.style.opacity = '0.6';
  }
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
      let backgroundColor = '#520000'; // Rojo oscuro para Ocupado
      let borderColor = '#520000';
      let textColor = '#ffffff';
      let title = 'Ocupado';
      
      if (cita.estado === 'Confirmada') {
        // AMARILLO FUERTE para Confirmada
        backgroundColor = '#FFC040'; 
        borderColor = '#FFC040';
        textColor = '#5c5c5cff'; // Texto oscuro para contraste
        title = 'Confirmada';
      } else if (cita.estado === 'Pendiente') {
        // NEGRO/GRIS OSCURO para Pendiente
        backgroundColor = '#505050ff'; 
        borderColor = '#585858ff';
        textColor = '#FFD95A'; // Texto Amarillo para contraste
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
  Swal.fire({
    icon: 'error',
    title: 'Fecha no válida',
    text: 'No puedes seleccionar fechas pasadas',
    confirmButtonText: 'Entendido',
    confirmButtonColor: 'rgba(56, 56, 48, 1)'
  });
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
      // Muestra la advertencia pero NO actualiza la cita, solo deselecciona el calendario.
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
      return; // Retorna sin actualizar this.datosCita
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
    
    // Al cambiar la fecha, limpiamos la hora por seguridad, ya que la validación depende de ambos campos
    this.datosCita.hora_cita = ''; 

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
          // Muestra la advertencia y limpia la hora
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
          this.datosCita.hora_cita = ''; // Limpia la hora inválida
          return;
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

    const citaConflicto = this.citasExistentes.find(cita => {
        let fechaCitaISO = cita.fecha_cita;
        if (fechaCitaISO.includes('T')) {
            fechaCitaISO = cita.fecha_cita.split('T')[0];
        }
        return fechaCitaISO === this.datosCita.fecha_cita && 
               cita.hora_cita === this.datosCita.hora_cita;
    });

    if (citaConflicto) {
        Swal.fire({
            icon: 'error', 
            title: 'No se puede registrar la cita',
            html: `
                <p class="text-danger fw-bold">¡Conflicto de Horario Insalvable!</p>
                <p class="mt-3 text-muted">
                    Ya existe una cita confirmada o pendiente exactamente a las **${this.datosCita.hora_cita}** el día **${this.datosCita.fecha_cita}**.
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
      cita: this.datosCita
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
            confirmButton: 'text-dark fw-bold'
          }
        });        


        setTimeout(() => {
          this.resetFormulario();
        }, 5000);


      },
      error: (err: Error) => {
        this.cargando = false;
        
        // >>> INICIO: LÓGICA SweetAlert2 para errores del servicio (ej. 409 Conflict)
        if (err.message && err.message.includes('Conflicto de Horario')) {
             Swal.fire({
                icon: 'error',
                title: 'Error de Servidor: Horario Ocupado',
                html: `
                    <p class="text-danger fw-bold">El servidor ha rechazado el registro:</p>
                    <p class="mt-2 text-dark">${err.message.replace('Error: ', '')}</p>
                    <p class="mt-3 text-muted">
                        Esto confirma que la hora ${this.datosCita.hora_cita} el día ${this.datosCita.fecha_cita} no está disponible.
                    </p>
                    <p class="fw-bold text-dark">
                        Por favor, elija un horario que esté libre en el calendario.
                    </p>
                `,
                confirmButtonText: 'Seleccionar otro horario',
                confirmButtonColor: '#dcc335ff',
            });
        } else {
            // Manejo de otros errores del servicio (ej. 400, 500)
            Swal.fire({
                icon: 'error',
                title: 'Error de Registro',
                text: err.message,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: 'rgba(220, 53, 69, 1)',
            });
        }
        // <<< FIN: LÓGICA SweetAlert2 para errores del servicio
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
