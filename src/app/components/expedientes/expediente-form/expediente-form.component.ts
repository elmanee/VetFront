import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpedienteService, RegistrarConsultaRequest, Diagnostico, Tratamiento, Vacuna, Procedimiento, ImagenExpediente } from '../../../services/expediente.service';
import { AuthService } from '../../../services/auth.service';
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
  citaId?: number;
  clienteId?: number;
  mascotaId?: number;
  veterinarioId?: number;
  motivoCita?: string;

  // Información del expediente
  expediente: any = null;
  cargandoExpediente: boolean = false;

  // Datos del formulario
  signosVitales = {
    peso: null as number | null,
    temperatura: null as number | null,
    frecuencia_cardiaca: null as number | null,
    frecuencia_respiratoria: null as number | null
  };

  motivoConsulta: string = '';
  sintomas: string = '';
  observaciones: string = '';

  // Arrays dinámicos
  diagnosticos: Diagnostico[] = [];
  tratamientos: Tratamiento[] = [];
  vacunas: Vacuna[] = [];
  procedimientos: Procedimiento[] = [];
  imagenes: ImagenExpediente[] = [];

  // Nuevos items temporales
  nuevoDiagnostico: Diagnostico = { descripcion: '', tipo: 'Primario' };
  nuevoTratamiento: Tratamiento = { medicamento: '', dosis: '', frecuencia: '' };
  nuevaVacuna: Vacuna = { nombre_vacuna: '' };
  nuevoProcedimiento: Procedimiento = {
    tipo_procedimiento: '',
    nombre_procedimiento: '',
    descripcion: ''
  };

  // Control de secciones expandidas
  seccionesExpandidas = {
    signosVitales: true,
    diagnosticos: true,
    tratamientos: false,
    vacunas: false,
    procedimientos: false,
    imagenes: false
  };

  // Estados
  cargando: boolean = false;
  guardando: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';

  // Catálogos
  tiposDiagnostico = ['Primario', 'Secundario', 'Provisional', 'Definitivo'];
  viasAdministracion = ['Oral', 'Intravenosa', 'Intramuscular', 'Subcutánea', 'Tópica', 'Inhalatoria'];
  tiposProcedimiento = ['Cirugía', 'Esterilización', 'Limpieza Dental', 'Radiografía', 'Ecografía', 'Análisis', 'Otro'];
  tiposImagen = ['Radiografía', 'Ecografía', 'Fotografía', 'Laboratorio', 'Otro'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expedienteService: ExpedienteService,
    private authService: AuthService
  ) {}

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.citaId = +params['id_cita'];
    this.clienteId = +params['cliente_id'];
    this.mascotaId = +params['mascota_id'];
    this.veterinarioId = +params['veterinario_id'];
    this.motivoCita = params['motivo'] || '';

    // Campos extra de la cita
    const citaInfo = {
      animal_id: params['animal_id'],
      fecha_cita: params['fecha_cita'],
      hora_cita: params['hora_cita'],
      estado: params['estado'],
      created_at: params['created_at'],
      token_confirmacion: params['token_confirmacion']
    };

    console.log('📋 Datos de la cita recibidos:', {
      citaId: this.citaId,
      clienteId: this.clienteId,
      mascotaId: this.mascotaId,
      veterinarioId: this.veterinarioId,
      motivo: this.motivoCita,
      ...citaInfo
    });

    // 🔍 Si la cita tiene mascota, cargar su expediente
    if (this.mascotaId) {
      this.cargarExpediente();
    } else {
      console.warn('❌ No se encontró mascota asociada a la cita');
    }
  });
}


  /**
   * Cargar expediente de la mascota
   */
  cargarExpediente(): void {
    if (!this.mascotaId) return;

    this.cargandoExpediente = true;
    console.log('[EXPEDIENTE FORM] Cargando expediente de mascota ID:', this.mascotaId);

    this.expedienteService.obtenerPorMascota(this.mascotaId).subscribe({
      next: (expediente) => {
        this.expediente = expediente;
        this.cargandoExpediente = false;
        console.log('[EXPEDIENTE FORM] Expediente cargado:', expediente.numero_expediente);

        // Si hay peso previo, mostrarlo como referencia
        if (expediente.peso) {
          console.log(`[EXPEDIENTE FORM] Peso anterior: ${expediente.peso} kg`);
        }
      },
      error: (error) => {
        console.error('[EXPEDIENTE FORM] Error al cargar expediente:', error);
        this.cargandoExpediente = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el expediente de la mascota',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Toggle de secciones
   */
  toggleSeccion(seccion: keyof typeof this.seccionesExpandidas): void {
    this.seccionesExpandidas[seccion] = !this.seccionesExpandidas[seccion];
  }

  /**
   * DIAGNÓSTICOS
   */
  agregarDiagnostico(): void {
    if (!this.nuevoDiagnostico.descripcion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe ingresar una descripción del diagnóstico',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.diagnosticos.push({ ...this.nuevoDiagnostico });
    this.nuevoDiagnostico = { descripcion: '', tipo: 'Primario' };
    console.log('[EXPEDIENTE FORM] Diagnóstico agregado. Total:', this.diagnosticos.length);
  }

  eliminarDiagnostico(index: number): void {
    this.diagnosticos.splice(index, 1);
  }

  /**
   * TRATAMIENTOS
   */
  agregarTratamiento(): void {
    if (!this.nuevoTratamiento.medicamento.trim() ||
        !this.nuevoTratamiento.dosis.trim() ||
        !this.nuevoTratamiento.frecuencia.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe completar medicamento, dosis y frecuencia',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.tratamientos.push({ ...this.nuevoTratamiento });
    this.nuevoTratamiento = { medicamento: '', dosis: '', frecuencia: '' };
    console.log('[EXPEDIENTE FORM] Tratamiento agregado. Total:', this.tratamientos.length);
  }

  eliminarTratamiento(index: number): void {
    this.tratamientos.splice(index, 1);
  }

  /**
   * VACUNAS
   */
  agregarVacuna(): void {
    if (!this.nuevaVacuna.nombre_vacuna.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe ingresar el nombre de la vacuna',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.vacunas.push({ ...this.nuevaVacuna });
    this.nuevaVacuna = { nombre_vacuna: '' };
    console.log('[EXPEDIENTE FORM] Vacuna agregada. Total:', this.vacunas.length);
  }

  eliminarVacuna(index: number): void {
    this.vacunas.splice(index, 1);
  }

  /**
   * PROCEDIMIENTOS
   */
  agregarProcedimiento(): void {
    if (!this.nuevoProcedimiento.tipo_procedimiento.trim() ||
        !this.nuevoProcedimiento.nombre_procedimiento.trim() ||
        !this.nuevoProcedimiento.descripcion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe completar tipo, nombre y descripción del procedimiento',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.procedimientos.push({ ...this.nuevoProcedimiento });
    this.nuevoProcedimiento = {
      tipo_procedimiento: '',
      nombre_procedimiento: '',
      descripcion: ''
    };
    console.log('[EXPEDIENTE FORM] Procedimiento agregado. Total:', this.procedimientos.length);
  }

  eliminarProcedimiento(index: number): void {
    this.procedimientos.splice(index, 1);
  }

  /**
   * IMÁGENES
   */
  async onImagenSeleccionada(event: any): Promise<void> {
    const file = event.target.files[0];

    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Solo se permiten archivos de imagen',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La imagen no debe superar los 5MB',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    try {
      const base64 = await this.expedienteService.convertirImagenABase64(file);

      this.imagenes.push({
        imagen_base64: base64,
        descripcion: '',
        tipo_imagen: 'Fotografía'
      });

      console.log('[EXPEDIENTE FORM] Imagen agregada. Total:', this.imagenes.length);

      // Resetear input
      event.target.value = '';

    } catch (error) {
      console.error('[EXPEDIENTE FORM] Error al procesar imagen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la imagen',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  eliminarImagen(index: number): void {
    this.imagenes.splice(index, 1);
  }

  /**
   * Validar formulario antes de guardar
   */
  validarFormulario(): boolean {
    // Validar motivo de consulta
    if (!this.motivoConsulta.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Debe ingresar el motivo de la consulta',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }

    // Validar que tenga al menos un diagnóstico
    if (this.diagnosticos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Debe agregar al menos un diagnóstico',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }

    // Validar veterinario
    if (!this.veterinarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al veterinario',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }

    return true;
  }

  /**
   * Guardar consulta médica completa
   */
  guardarConsulta(): void {
    console.log('[EXPEDIENTE FORM] Iniciando guardado de consulta...');

    // Validar formulario
    if (!this.validarFormulario()) {
      return;
    }

    // Confirmar guardado
    Swal.fire({
      title: '¿Guardar consulta médica?',
      text: 'Se registrará la consulta en el expediente de la mascota',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enviarConsulta();
      }
    });
  }

  /**
   * Enviar consulta al backend
   */
  private enviarConsulta(): void {
    this.guardando = true;

    const datos: RegistrarConsultaRequest = {
      cita_id: this.citaId,
      mascota_id: this.mascotaId!,
      expediente_id: this.expediente?.id_expediente,
      veterinario_id: this.veterinarioId!,
      signos_vitales: {
        peso: this.signosVitales.peso || undefined,
        temperatura: this.signosVitales.temperatura || undefined,
        frecuencia_cardiaca: this.signosVitales.frecuencia_cardiaca || undefined,
        frecuencia_respiratoria: this.signosVitales.frecuencia_respiratoria || undefined
      },
      motivo_consulta: this.motivoConsulta,
      sintomas: this.sintomas || undefined,
      observaciones: this.observaciones || undefined,
      diagnosticos: this.diagnosticos.length > 0 ? this.diagnosticos : undefined,
      tratamientos: this.tratamientos.length > 0 ? this.tratamientos : undefined,
      vacunas: this.vacunas.length > 0 ? this.vacunas : undefined,
      procedimientos: this.procedimientos.length > 0 ? this.procedimientos : undefined,
      imagenes: this.imagenes.length > 0 ? this.imagenes : undefined
    };

    console.log('[EXPEDIENTE FORM] Enviando datos:', datos);

    this.expedienteService.registrarConsulta(datos).subscribe({
      next: (response) => {
        this.guardando = false;
        console.log('[EXPEDIENTE FORM] ✅ Consulta registrada exitosamente');

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: response.message || 'Consulta médica registrada exitosamente',
          confirmButtonText: 'Ver expediente',
          showCancelButton: true,
          cancelButtonText: 'Volver a citas'
        }).then((result) => {
          if (result.isConfirmed && response.data?.expediente?.id) {
            // Redirigir a ver expediente completo
            this.router.navigate(['/expediente/ver', response.data.expediente.id]);
          } else {
            // Volver a citas por atender
            this.router.navigate(['/citas-atender']);
          }
        });
      },
      error: (error) => {
        this.guardando = false;
        console.error('[EXPEDIENTE FORM] ❌ Error al guardar consulta:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: error.message || 'Ocurrió un error al registrar la consulta',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Cancelar y volver
   */
  cancelar(): void {
    Swal.fire({
      title: '¿Cancelar registro?',
      text: 'Se perderán todos los datos ingresados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Continuar editando'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/citas-atender']);
      }
    });
  }
}
