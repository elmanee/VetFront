import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  ExpedienteService, 
  Diagnostico, 
  Tratamiento, 
  Vacuna, 
  Procedimiento, 
  Imagen,
  RegistroConsultaRequest 
} from '../../../services/expediente.service';
import { CitasService, Cita } from '../../../services/citas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expediente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expediente-form.component.html',
  styleUrl: './expediente-form.component.scss'
})
export class ExpedienteFormComponent implements OnInit {
  
  // Datos de la cita
  cita_id: number = 0;
  cliente_id: number = 0;
  mascota_id: number | null = null;
  veterinario_id: number = 1; // TODO: Obtener del usuario logueado
  motivo_cita: string = '';
  
  // Información de la cita
  citaInfo: Cita | null = null;
  
  // Datos de la consulta
  consultaData = {
    peso_actual: null as number | null,
    temperatura: null as number | null,
    frecuencia_cardiaca: null as number | null,
    frecuencia_respiratoria: null as number | null,
    
    // Información general
    motivo_consulta: '',
    sintomas: '',
    observaciones: ''
  };
  
  // Arrays para datos múltiples
  diagnosticos: Diagnostico[] = [];
  tratamientos: Tratamiento[] = [];
  vacunas: Vacuna[] = [];
  procedimientos: Procedimiento[] = [];
  imagenes: Imagen[] = [];
  
  // Formularios temporales para agregar items
  nuevoDiagnostico: Diagnostico = {
    descripcion: '',
    tipo: 'Primario',
    codigo_cie: ''
  };
  
  nuevoTratamiento: Tratamiento = {
    medicamento: '',
    principio_activo: '',
    dosis: '',
    frecuencia: '',
    duracion_dias: undefined,
    via_administracion: 'Oral',
    indicaciones: ''
  };
  
  nuevaVacuna: Vacuna = {
    nombre_vacuna: '',
    laboratorio: '',
    lote: '',
    fecha_aplicacion: new Date().toISOString().split('T')[0],
    proxima_dosis: '',
    via_administracion: 'Subcutánea',
    sitio_aplicacion: '',
    reacciones_adversas: ''
  };
  
  nuevoProcedimiento: Procedimiento = {
    tipo_procedimiento: '',
    nombre_procedimiento: '',
    descripcion: '',
    fecha_realizacion: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    duracion_minutos: undefined,
    anestesia_utilizada: '',
    resultado: 'Exitoso',
    observaciones: ''
  };
  
  nuevaImagen: Imagen = {
    url_imagen: '',
    descripcion: '',
    tipo_imagen: 'Fotografía'
  };
  
  // Opciones para selects
  tiposDiagnostico = ['Primario', 'Secundario', 'Provisional', 'Definitivo'];
  viasAdministracion = ['Oral', 'Intravenosa', 'Intramuscular', 'Subcutánea', 'Tópica', 'Inhalatoria'];
  tiposProcedimiento = ['Cirugía', 'Esterilización', 'Limpieza Dental', 'Extracción', 'Radiografía', 'Ecografía', 'Análisis de Laboratorio', 'Otro'];
  tiposImagen = ['Fotografía', 'Radiografía', 'Ecografía', 'Análisis de Laboratorio', 'Otro'];
  
  // Control de UI
  cargando: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';
  
  // Secciones expandidas
  seccionSignosVitales = true;
  seccionDiagnosticos = true;
  seccionTratamientos = false;
  seccionVacunas = false;
  seccionProcedimientos = false;
  seccionImagenes = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expedienteService: ExpedienteService,
    private citasService: CitasService
  ) {}

  ngOnInit(): void {
    console.log('[EXPEDIENTE FORM] Componente inicializado');
    
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.cita_id = +params['cita_id'] || 0;
      this.cliente_id = +params['cliente_id'] || 0;
      this.mascota_id = params['mascota_id'] ? +params['mascota_id'] : null;
      this.veterinario_id = +params['veterinario_id'] || 1;
      this.motivo_cita = params['motivo'] || '';
      
      console.log('[EXPEDIENTE FORM] Parámetros recibidos:', {
        cita_id: this.cita_id,
        cliente_id: this.cliente_id,
        mascota_id: this.mascota_id,
        veterinario_id: this.veterinario_id
      });
      
      if (this.cita_id) {
        this.cargarDatosCita();
      }
      
      // Pre-llenar motivo de consulta
      this.consultaData.motivo_consulta = this.motivo_cita;
    });
  }

  /**
   * Cargar información de la cita
   */
  cargarDatosCita(): void {
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        this.citaInfo = citas.find(c => c.id_cita === this.cita_id) || null;
        console.log('[EXPEDIENTE FORM] Información de la cita:', this.citaInfo);
      },
      error: (error) => {
        console.error('[EXPEDIENTE FORM] Error al cargar cita:', error);
      }
    });
  }

  // Diagnósticos
  agregarDiagnostico(): void {
    if (!this.nuevoDiagnostico.descripcion.trim()) {
      this.mensaje = 'La descripción del diagnóstico es obligatoria.';
      this.mensajeClase = 'error';
      return;
    }
    
    this.diagnosticos.push({ ...this.nuevoDiagnostico });
    
    // Limpiar formulario
    this.nuevoDiagnostico = {
      descripcion: '',
      tipo: 'Primario',
      codigo_cie: ''
    };
    
    this.mensaje = 'Diagnóstico agregado.';
    this.mensajeClase = 'success';
    setTimeout(() => this.mensaje = '', 2000);
  }
  
  eliminarDiagnostico(index: number): void {
    this.diagnosticos.splice(index, 1);
  }

  // Gestión de tratamientos
  
  agregarTratamiento(): void {
    if (!this.nuevoTratamiento.medicamento.trim() || 
        !this.nuevoTratamiento.dosis.trim() || 
        !this.nuevoTratamiento.frecuencia.trim()) {
      this.mensaje = 'Medicamento, dosis y frecuencia son obligatorios.';
      this.mensajeClase = 'error';
      return;
    }
    
    this.tratamientos.push({ ...this.nuevoTratamiento });
    
    // Limpiar formulario
    this.nuevoTratamiento = {
      medicamento: '',
      principio_activo: '',
      dosis: '',
      frecuencia: '',
      duracion_dias: undefined,
      via_administracion: 'Oral',
      indicaciones: ''
    };
    
    this.mensaje = 'Tratamiento agregado.';
    this.mensajeClase = 'success';
    setTimeout(() => this.mensaje = '', 2000);
  }
  
  eliminarTratamiento(index: number): void {
    this.tratamientos.splice(index, 1);
  }

  // Gestión de vacunas
  
  agregarVacuna(): void {
    if (!this.nuevaVacuna.nombre_vacuna.trim() || 
        !this.nuevaVacuna.fecha_aplicacion) {
      this.mensaje = 'Nombre de vacuna y fecha son obligatorios.';
      this.mensajeClase = 'error';
      return;
    }
    
    this.vacunas.push({ ...this.nuevaVacuna });
    
    // Limpiar formulario
    this.nuevaVacuna = {
      nombre_vacuna: '',
      laboratorio: '',
      lote: '',
      fecha_aplicacion: new Date().toISOString().split('T')[0],
      proxima_dosis: '',
      via_administracion: 'Subcutánea',
      sitio_aplicacion: '',
      reacciones_adversas: ''
    };
    
    this.mensaje = 'Vacuna agregada.';
    this.mensajeClase = 'success';
    setTimeout(() => this.mensaje = '', 2000);
  }
  
  eliminarVacuna(index: number): void {
    this.vacunas.splice(index, 1);
  }

  // Gestión de procedimientos
  
  agregarProcedimiento(): void {
    if (!this.nuevoProcedimiento.tipo_procedimiento.trim() || 
        !this.nuevoProcedimiento.nombre_procedimiento.trim() ||
        !this.nuevoProcedimiento.descripcion.trim()) {
      this.mensaje = 'Tipo, nombre y descripción del procedimiento son obligatorios.';
      this.mensajeClase = 'error';
      return;
    }
    
    this.procedimientos.push({ ...this.nuevoProcedimiento });
    
    // Limpiar formulario
    this.nuevoProcedimiento = {
      tipo_procedimiento: '',
      nombre_procedimiento: '',
      descripcion: '',
      fecha_realizacion: new Date().toISOString().split('T')[0],
      hora_inicio: '',
      duracion_minutos: undefined,
      anestesia_utilizada: '',
      resultado: 'Exitoso',
      observaciones: ''
    };
    
    this.mensaje = 'Procedimiento agregado.';
    this.mensajeClase = 'success';
    setTimeout(() => this.mensaje = '', 2000);
  }
  
  eliminarProcedimiento(index: number): void {
    this.procedimientos.splice(index, 1);
  }

  // Imagenes
  
  agregarImagen(): void {
    if (!this.nuevaImagen.url_imagen.trim()) {
      this.mensaje = 'La URL de la imagen es obligatoria.';
      this.mensajeClase = 'error';
      return;
    }
    
    // Validar que sea una URL válida
    try {
      new URL(this.nuevaImagen.url_imagen);
    } catch (e) {
      this.mensaje = 'La URL no es válida. Debe incluir http:// o https://';
      this.mensajeClase = 'error';
      return;
    }
    
    this.imagenes.push({ ...this.nuevaImagen });
    
    // Limpiar formulario
    this.nuevaImagen = {
      url_imagen: '',
      descripcion: '',
      tipo_imagen: 'Fotografía'
    };
    
    this.mensaje = 'Imagen agregada.';
    this.mensajeClase = 'success';
    setTimeout(() => this.mensaje = '', 2000);
  }
  
  eliminarImagen(index: number): void {
    this.imagenes.splice(index, 1);
  }

  // Guardar consulta completa
  registrarConsulta(): void {
    console.log('[EXPEDIENTE FORM] Iniciando registro de consulta...');
    
    // Validaciones
    if (!this.consultaData.motivo_consulta.trim()) {
      this.mostrarError('El motivo de la consulta es obligatorio.');
      return;
    }
    
    if (this.diagnosticos.length === 0) {
      this.mostrarError('Debe agregar al menos un diagnóstico.');
      return;
    }
    
    if (!this.mascota_id) {
      this.mostrarError('No se ha identificado la mascota.');
      return;
    }
    
    // Confirmar antes de guardar
    Swal.fire({
      title: '¿Registrar Consulta?',
      html: `
        <div class="text-start">
          <p><strong>Diagnósticos:</strong> ${this.diagnosticos.length}</p>
          <p><strong>Tratamientos:</strong> ${this.tratamientos.length}</p>
          <p><strong>Vacunas:</strong> ${this.vacunas.length}</p>
          <p><strong>Procedimientos:</strong> ${this.procedimientos.length}</p>
          <p><strong>Imágenes:</strong> ${this.imagenes.length}</p>
        </div>
        <p class="mt-3">La cita será marcada como <strong>Completada</strong>.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, Registrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarConsulta();
      }
    });
  }
  
  private guardarConsulta(): void {
    this.cargando = true;
    
    const request: RegistroConsultaRequest = {
      cita_id: this.cita_id,
      veterinario_id: this.veterinario_id,
      mascota_id: this.mascota_id!,
      peso_actual: this.consultaData.peso_actual || undefined,
      temperatura: this.consultaData.temperatura || undefined,
      frecuencia_cardiaca: this.consultaData.frecuencia_cardiaca || undefined,
      frecuencia_respiratoria: this.consultaData.frecuencia_respiratoria || undefined,
      motivo_consulta: this.consultaData.motivo_consulta,
      sintomas: this.consultaData.sintomas || undefined,
      observaciones: this.consultaData.observaciones || undefined,
      diagnosticos: this.diagnosticos,
      tratamientos: this.tratamientos.length > 0 ? this.tratamientos : undefined,
      vacunas: this.vacunas.length > 0 ? this.vacunas : undefined,
      procedimientos: this.procedimientos.length > 0 ? this.procedimientos : undefined,
      imagenes: this.imagenes.length > 0 ? this.imagenes : undefined
    };
    
    console.log('[EXPEDIENTE FORM] Enviando datos:', request);
    
    this.expedienteService.registrarConsulta(request).subscribe({
      next: (response) => {
        this.cargando = false;
        
        Swal.fire({
          title: '¡Consulta Registrada!',
          html: `
            <p class="mb-2">${response.message}</p>
            <p class="text-muted small">La cita ha sido marcada como completada.</p>
          `,
          icon: 'success',
          confirmButtonText: 'Ver Expediente',
          showCancelButton: true,
          cancelButtonText: 'Volver a Citas'
        }).then((result) => {
          if (result.isConfirmed) {
            // TODO: Navegar a vista de expediente
            this.router.navigate(['/citas-atender']);
          } else {
            this.router.navigate(['/citas-atender']);
          }
        });
      },
      error: (error) => {
        this.cargando = false;
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Utilidades
  private mostrarError(mensaje: string): void {
    this.mensaje = mensaje;
    this.mensajeClase = 'error';
    
    Swal.fire({
      title: 'Validación',
      text: mensaje,
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
  }
  
  cancelar(): void {
    Swal.fire({
      title: '¿Cancelar Registro?',
      text: 'Se perderá toda la información ingresada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, Cancelar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/citas-atender']);
      }
    });
  }
  
  toggleSeccion(seccion: string): void {
    switch(seccion) {
      case 'vitales':
        this.seccionSignosVitales = !this.seccionSignosVitales;
        break;
      case 'diagnosticos':
        this.seccionDiagnosticos = !this.seccionDiagnosticos;
        break;
      case 'tratamientos':
        this.seccionTratamientos = !this.seccionTratamientos;
        break;
      case 'vacunas':
        this.seccionVacunas = !this.seccionVacunas;
        break;
      case 'procedimientos':
        this.seccionProcedimientos = !this.seccionProcedimientos;
        break;
      case 'imagenes':
        this.seccionImagenes = !this.seccionImagenes;
        break;
    }
  }
}