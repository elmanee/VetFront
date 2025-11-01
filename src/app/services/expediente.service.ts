import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export interface SignosVitales {
  peso?: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
}

export interface Diagnostico {
  descripcion: string;
  tipo: 'Primario' | 'Secundario' | 'Provisional' | 'Definitivo';
}

export interface Tratamiento {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion_dias?: number;
  via_administracion?: string;
  indicaciones?: string;
  fecha_inicio?: string;
}

export interface Vacuna {
  nombre_vacuna: string;
  fecha_aplicacion?: string;
  proxima_dosis?: string;
  sitio_aplicacion?: string;
  reacciones_adversas?: string;
}

export interface Procedimiento {
  tipo_procedimiento: string;
  nombre_procedimiento: string;
  descripcion: string;
  fecha_realizacion?: string;
  hora_inicio?: string;
  hora_fin?: string;
  anestesia_utilizada?: string;
  complicaciones?: string;
  observaciones?: string;
}

export interface ImagenExpediente {
  imagen_base64: string;
  descripcion?: string;
  tipo_imagen?: string;
}

export interface RegistrarConsultaRequest {
  cita_id?: number;
  mascota_id: number;
  expediente_id?: number;
  veterinario_id: number;
  signos_vitales?: SignosVitales;
  motivo_consulta: string;
  sintomas?: string;
  observaciones?: string;
  diagnosticos?: Diagnostico[];
  tratamientos?: Tratamiento[];
  vacunas?: Vacuna[];
  procedimientos?: Procedimiento[];
  imagenes?: ImagenExpediente[];
}

export interface Expediente {
  id_expediente: number;
  numero_expediente: string;
  fecha_apertura: string;
  estado: string;
  paciente_id?: number;
  mascota_nombre: string;
  tipo_animal: string;
  raza?: string;
  edad?: number;
  peso?: number;
  sexo?: string;
  propietario: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  cliente_id?: number;
  observaciones_generales?: string;
  total_consultas?: number;
  ultima_consulta?: string;
}

export interface Consulta {
  id_consulta: number;
  expediente_id: number;
  veterinario_id: number;
  veterinario_nombre?: string;
  fecha_consulta: string;
  peso_actual?: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  motivo_consulta: string;
  sintomas?: string;
  observaciones?: string;
  diagnosticos?: any[];
  tratamientos?: any[];
  vacunas?: any[];
  procedimientos?: any[];
  imagenes?: any[];
}

export interface ExpedienteCompleto {
  expediente: Expediente;
  consultas: Consulta[];
  historial_cambios?: any[];
}

export interface FiltrosBusqueda {
  nombreMascota?: string;
  propietario?: string;
  numeroExpediente?: string;
  fechaConsulta?: string;
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
  private REPORTES_URL = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {
    console.log(`[SERVICIO EXPEDIENTE] Inicializado. API URL: ${this.API_URL}`);
  }

  /**
   * Verificar si una cita puede ser atendida
   */
  verificarCita(citaId: number): Observable<any> {
    console.log(`[SERVICIO EXPEDIENTE] Verificando cita ID: ${citaId}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/verificar-cita/${citaId}`)
      .pipe(
        map(response => response.data),
        catchError(this.manejarError)
      );
  }

  /**
   * Obtener o crear expediente por mascota
   */
  obtenerPorMascota(mascotaId: number): Observable<Expediente> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo expediente de mascota ID: ${mascotaId}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/mascota/${mascotaId}`)
      .pipe(
        map(response => response.data as Expediente),
        tap(expediente => {
          console.log('[SERVICIO EXPEDIENTE] Expediente obtenido:', expediente.numero_expediente);
        }),
        catchError(this.manejarError)
      );
  }

  /**
   * Registrar consulta médica completa (RQF02 - PRINCIPAL)
   */
  registrarConsulta(datos: RegistrarConsultaRequest): Observable<RespuestaBackend> {
    console.log('[SERVICIO EXPEDIENTE] Registrando consulta médica');
    console.log('[SERVICIO EXPEDIENTE] Datos:', datos);
    
    return this.http.post<RespuestaBackend>(`${this.API_URL}/registrar-consulta`, datos)
      .pipe(
        tap(response => {
          console.log('[SERVICIO EXPEDIENTE] ✅ Consulta registrada exitosamente');
        }),
        catchError(this.manejarError)
      );
  }

  /**
   * Buscar expedientes con múltiples filtros (RQF02)
   */
  buscarExpedientes(filtros: FiltrosBusqueda): Observable<Expediente[]> {
    console.log('[SERVICIO EXPEDIENTE] Buscando expedientes con filtros:', filtros);
    
    let params = new HttpParams();
    
    if (filtros.nombreMascota) params = params.set('nombreMascota', filtros.nombreMascota);
    if (filtros.propietario) params = params.set('propietario', filtros.propietario);
    if (filtros.numeroExpediente) params = params.set('numeroExpediente', filtros.numeroExpediente);
    if (filtros.fechaConsulta) params = params.set('fechaConsulta', filtros.fechaConsulta);
    if (filtros.diagnostico) params = params.set('diagnostico', filtros.diagnostico);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/buscar`, { params })
      .pipe(
        map(response => response.data as Expediente[]),
        tap(expedientes => {
          console.log(`[SERVICIO EXPEDIENTE] Se encontraron ${expedientes.length} expedientes`);
        }),
        catchError(this.manejarError)
      );
  }

  /**
   * Obtener expediente completo con historial (RQF02)
   */
  obtenerExpedienteCompleto(idExpediente: number): Observable<ExpedienteCompleto> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo expediente completo ID: ${idExpediente}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/${idExpediente}`)
      .pipe(
        map(response => response.data as ExpedienteCompleto),
        tap(expediente => {
          console.log('[SERVICIO EXPEDIENTE] Expediente completo obtenido');
        }),
        catchError(this.manejarError)
      );
  }

  /**
   * Buscar expediente por número
   */
  buscarPorNumero(numeroExpediente: string): Observable<Expediente> {
    console.log(`[SERVICIO EXPEDIENTE] Buscando expediente: ${numeroExpediente}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/numero/${numeroExpediente}`)
      .pipe(
        map(response => response.data as Expediente),
        catchError(this.manejarError)
      );
  }

  /**
   * Actualizar observaciones generales
   */
  actualizarObservaciones(idExpediente: number, observaciones: string): Observable<RespuestaBackend> {
    console.log(`[SERVICIO EXPEDIENTE] Actualizando observaciones expediente ID: ${idExpediente}`);
    
    return this.http.put<RespuestaBackend>(`${this.API_URL}/${idExpediente}/observaciones`, {
      observaciones
    }).pipe(
      tap(() => {
        console.log('[SERVICIO EXPEDIENTE] Observaciones actualizadas');
      }),
      catchError(this.manejarError)
    );
  }

  /**
   * Obtener consulta específica
   */
  obtenerConsulta(consultaId: number): Observable<Consulta> {
    console.log(`[SERVICIO EXPEDIENTE] Obteniendo consulta ID: ${consultaId}`);
    
    return this.http.get<RespuestaBackend>(`${this.API_URL}/consulta/${consultaId}`)
      .pipe(
        map(response => response.data as Consulta),
        catchError(this.manejarError)
      );
  }

  /**
   * Generar reporte PDF del expediente (RQF02)
   */
  generarReportePDF(idExpediente: number): Observable<Blob> {
    console.log(`[SERVICIO EXPEDIENTE] Generando reporte PDF expediente ID: ${idExpediente}`);
    
    return this.http.get(`${this.REPORTES_URL}/expediente/${idExpediente}`, {
      responseType: 'blob'
    }).pipe(
      tap(() => {
        console.log('[SERVICIO EXPEDIENTE] ✅ Reporte PDF generado');
      }),
      catchError(this.manejarError)
    );
  }

  /**
   * Generar certificado de salud PDF (RQF02)
   */
  generarCertificadoPDF(idExpediente: number): Observable<Blob> {
    console.log(`[SERVICIO EXPEDIENTE] Generando certificado PDF expediente ID: ${idExpediente}`);
    
    return this.http.get(`${this.REPORTES_URL}/certificado/${idExpediente}`, {
      responseType: 'blob'
    }).pipe(
      tap(() => {
        console.log('[SERVICIO EXPEDIENTE] ✅ Certificado PDF generado');
      }),
      catchError(this.manejarError)
    );
  }

  /**
   * Convertir archivo a Base64
   */
  convertirImagenABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Manejo de errores
   */
  private manejarError(error: HttpErrorResponse) {
    let mensajeError = 'Ocurrió un error desconocido.';
    
    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error de red: ${error.error.message}`;
    } else {
      if (error.status === 400) {
        mensajeError = error.error.message || 'Datos inválidos';
      } else if (error.status === 404) {
        mensajeError = error.error.message || 'No encontrado';
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