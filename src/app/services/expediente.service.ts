import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Expediente {
  id_expediente: number;
  numero_expediente: string;
  mascota_id: number;
  mascota_nombre: string;
  tipo_animal: string;
  raza?: string;
  edad?: number;
  cliente_id: number;
  propietario: string;
  propietario_correo: string;
  propietario_telefono: string;
  fecha_apertura: string;
  estado: string;
  observaciones_generales?: string;
  total_consultas?: number;
  ultima_consulta?: string;
}

export interface Consulta {
  id_consulta: number;
  expediente_id: number;
  cita_id: number;
  veterinario_id: number;
  veterinario?: string;
  fecha_consulta: string;
  peso_actual?: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  motivo_consulta: string;
  sintomas?: string;
  observaciones?: string;
  diagnosticos?: Diagnostico[];
  tratamientos?: Tratamiento[];
  vacunas?: Vacuna[];
  procedimientos?: Procedimiento[];
  imagenes?: Imagen[];
}

export interface Diagnostico {
  id?: number;
  descripcion: string;
  tipo: string; // Primario, Secundario, Provisional, Definitivo
  codigo_cie?: string;
}

export interface Tratamiento {
  id?: number;
  medicamento: string;
  principio_activo?: string;
  dosis: string;
  frecuencia: string;
  duracion_dias?: number;
  via_administracion?: string;
  indicaciones?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface Vacuna {
  id?: number;
  nombre_vacuna: string;
  laboratorio?: string;
  lote?: string;
  fecha_aplicacion: string;
  proxima_dosis?: string;
  veterinario_aplica?: number;
  via_administracion?: string;
  sitio_aplicacion?: string;
  reacciones_adversas?: string;
}

export interface Procedimiento {
  id?: number;
  tipo_procedimiento: string;
  nombre_procedimiento: string;
  descripcion: string;
  fecha_realizacion: string;
  hora_inicio?: string;
  duracion_minutos?: number;
  anestesia_utilizada?: string;
  complicaciones?: string;
  resultado?: string;
  observaciones?: string;
}

export interface Imagen {
  id?: number;
  url_imagen: string;
  descripcion?: string;
  tipo_imagen?: string; 
  subido_por?: number;
}

export interface RegistroConsultaRequest {
  cita_id: number;
  veterinario_id: number;
  mascota_id: number;
  peso_actual?: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  motivo_consulta: string;
  sintomas?: string;
  observaciones?: string;
  diagnosticos: Diagnostico[];
  tratamientos?: Tratamiento[];
  vacunas?: Vacuna[];
  procedimientos?: Procedimiento[];
  imagenes?: Imagen[];
}

export interface FiltrosBusqueda {
  nombre_mascota?: string;
  propietario?: string;
  numero_expediente?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  diagnostico?: string;
  estado?: string;
}

export interface RespuestaBackend {
  success?: boolean;
  message: string;
  data?: any;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {
  private API_URL = `${environment.apiUrl}/expedientes`;
  private CONSULTAS_URL = `${environment.apiUrl}/consultas`;
  private REPORTES_URL = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {
    console.log(`ExpedienteService inicializado. API URL: ${this.API_URL}`);
  }

  /* Obtener todos los expedientes */
  obtenerTodosLosExpedientes(): Observable<Expediente[]> {
    console.log('[SERVICIO EXPEDIENTE] Obteniendo todos los expedientes...');
    
    return this.http.get<RespuestaBackend>(this.API_URL)
      .pipe(
        map(response => {
          const expedientes = response.data as Expediente[];
          console.log(`[SERVICIO EXPEDIENTE] Se obtuvieron ${expedientes?.length || 0} expedientes`);
          return expedientes || [];
        }),
        catchError(this.manejarError)
      );
  }

  /* Obtener expediente por ID */
  obtenerExpedientePorId(id: number): Observable<Expediente> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo expediente ID: ${id}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => response.data as Expediente),
        catchError(this.manejarError)
      );
  }

  /* Obtener expediente por mascota */
  obtenerExpedientePorMascota(mascota_id: number): Observable<Expediente> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo expediente de mascota ID: ${mascota_id}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/mascota/${mascota_id}`)
      .pipe(
        map(response => response.data as Expediente),
        catchError(this.manejarError)
      );
  }

  /* Obtener expediente por número */
  obtenerExpedientePorNumero(numero: string): Observable<Expediente> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo expediente: ${numero}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/numero/${numero}`)
      .pipe(
        map(response => response.data as Expediente),
        catchError(this.manejarError)
      );
  }

  /* Búsqueda avanzada con múltiples filtros */
  buscarExpedientes(filtros: FiltrosBusqueda): Observable<Expediente[]> {
    console.log('[SERVICIO EXPEDIENTE] Buscando expedientes con filtros:', filtros);
    
    let params = new HttpParams();
    
    if (filtros.nombre_mascota) {
      params = params.set('nombre_mascota', filtros.nombre_mascota);
    }
    if (filtros.propietario) {
      params = params.set('propietario', filtros.propietario);
    }
    if (filtros.numero_expediente) {
      params = params.set('numero_expediente', filtros.numero_expediente);
    }
    if (filtros.fecha_desde) {
      params = params.set('fecha_desde', filtros.fecha_desde);
    }
    if (filtros.fecha_hasta) {
      params = params.set('fecha_hasta', filtros.fecha_hasta);
    }
    if (filtros.diagnostico) {
      params = params.set('diagnostico', filtros.diagnostico);
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/search`, { params })
      .pipe(
        map(response => {
          const expedientes = response.data as Expediente[];
          console.log(`[SERVICIO EXPEDIENTE] Se encontraron ${expedientes?.length || 0} expedientes`);
          return expedientes || [];
        }),
        catchError(this.manejarError)
      );
  }

  /* Obtener historial completo de un expediente */
  obtenerHistorialCompleto(id: number): Observable<any> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo historial del expediente ID: ${id}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/${id}/historial`)
      .pipe(
        map(response => response.data),
        catchError(this.manejarError)
      );
  }

  /* Crear expediente */
  crearExpediente(datos: any): Observable<RespuestaBackend> {
    console.log('[SERVICIO EXPEDIENTE] Creando expediente...', datos);
    
    return this.http.post<RespuestaBackend>(this.API_URL, datos)
      .pipe(
        tap(response => console.log('[SERVICIO EXPEDIENTE] Expediente creado:', response)),
        catchError(this.manejarError)
      );
  }

  /* Actualizar expediente */
  actualizarExpediente(id: number, datos: any): Observable<RespuestaBackend> {
    console.log(`[SERVICIO EXPEDIENTE] Actualizando expediente ID: ${id}`, datos);
    
    return this.http.put<RespuestaBackend>(`${this.API_URL}/${id}`, datos)
      .pipe(
        tap(response => console.log('[SERVICIO EXPEDIENTE] Expediente actualizado:', response)),
        catchError(this.manejarError)
      );
  }

  /* Registrar consulta completa */
  registrarConsulta(datos: RegistroConsultaRequest): Observable<RespuestaBackend> {
    console.log('[SERVICIO EXPEDIENTE] Registrando consulta completa...', datos);
    
    return this.http.post<RespuestaBackend>(this.CONSULTAS_URL, datos)
      .pipe(
        tap(response => console.log('[SERVICIO EXPEDIENTE] Consulta registrada:', response)),
        catchError(this.manejarError)
      );
  }

  /* Verificar si una cita puede ser atendida */
  verificarCita(cita_id: number): Observable<any> {
    console.log(`[SERVICIO EXPEDIENTE] Verificando cita ID: ${cita_id}`);
    
    return this.http.get<RespuestaBackend>(`${this.CONSULTAS_URL}/verificar-cita/${cita_id}`)
      .pipe(
        map(response => response.data),
        catchError(this.manejarError)
      );
  }

  /*  Obtener consulta por ID */
  obtenerConsultaPorId(id: number): Observable<Consulta> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo consulta ID: ${id}`);
    
    return this.http.get<RespuestaBackend>(`${this.CONSULTAS_URL}/${id}`)
      .pipe(
        map(response => response.data as Consulta),
        catchError(this.manejarError)
      );
  }

  /* Obtener consultas de un expediente */
  obtenerConsultasPorExpediente(expediente_id: number): Observable<any> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo consultas del expediente ID: ${expediente_id}`);
    
    return this.http.get<RespuestaBackend>(`${this.CONSULTAS_URL}/expediente/${expediente_id}`)
      .pipe(
        map(response => response.data),
        catchError(this.manejarError)
      );
  }

  /*  Generar reporte médico PDF */
  generarReporteMedico(expediente_id: number): Observable<any> {
    console.log(`[SERVICIO EXPEDIENTE] Generando reporte médico del expediente ID: ${expediente_id}`);
    
    return this.http.get<RespuestaBackend>(`${this.REPORTES_URL}/expediente/${expediente_id}`)
      .pipe(
        map(response => response.data),
        catchError(this.manejarError)
      );
  }

  /* Generar certificado de salud PDF */
  generarCertificadoSalud(expediente_id: number): Observable<any> {
    console.log(`[SERVICIO EXPEDIENTE] Generando certificado de salud del expediente ID: ${expediente_id}`);
    
    return this.http.get<RespuestaBackend>(`${this.REPORTES_URL}/certificado/${expediente_id}`)
      .pipe(
        map(response => response.data),
        catchError(this.manejarError)
      );
  }

  /* Descargar reporte PDF */
  descargarReporte(nombreArchivo: string): void {
    const url = `${this.REPORTES_URL}/descargar/${nombreArchivo}`;
    window.open(url, '_blank');
  }

  // Manejo de errores 
  
  private manejarError(error: HttpErrorResponse) {
    let mensajeError = 'Ocurrió un error desconocido.';
    
    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error de red: ${error.error.message}`;
    } else {
      if (error.status === 404) {
        mensajeError = error.error.message || 'Recurso no encontrado';
      } else if (error.status === 400) {
        mensajeError = error.error.message || 'Datos inválidos';
      } else if (error.status === 409) {
        mensajeError = error.error.message || 'Conflicto en los datos';
      } else if (error.status === 500) {
        mensajeError = error.error.message || 'Error en el servidor';
      } else {
        mensajeError = `Error ${error.status}: ${error.error.message || error.statusText}`;
      }
    }
    
    console.error('[SERVICIO EXPEDIENTE] Error:', mensajeError);
    return throwError(() => new Error(mensajeError));
  }
}