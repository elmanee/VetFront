import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Cita {
  id_cita?: number;
  fecha_cita: string;
  hora_cita: string;
  cliente_id: number;
  mascota_id: number | null;
  veterinario_id: number;
  animal_id: number;
  motivo: string;
  estado?: string;
  created_at?: string;
  // Campos añadidos desde el JOIN del backend
  cliente_nombre?: string;
  cliente_correo?: string;
  mascota_nombre?: string;
}

export interface Veterinario {
  id: number;
  nombre_completo: string;
  correo: string;
  rol: string;
}

export interface DatosCliente {
  nombre_completo: string;
  correo: string;
  telefono: string;
  direccion?: string;
}

export interface DatosCita {
  fecha_cita: string;
  hora_cita: string;
  motivo: string;
  animal_id: number;
  mascota_id?: number | null;
  veterinario_id?: number;
}

export interface ValidacionCliente {
  existe: boolean;
  cliente_id?: number;
  nombre?: string;
  telefono?: string;
  mascotas?: Mascota[];
}

export interface Mascota {
  id: number;
  nombre: string;
  especie?: string;
  tipo_animal: string;
  raza?: string;
  edad?: number;
  peso?: number;
}

export interface RegistroCitaRequest {
  cliente: DatosCliente | { cliente_id: number };
  cita: DatosCita;
}

export interface RespuestaBackend {
  success?: boolean;
  message: string;
  data?: any;
  status?: string;
}

export interface ActualizarCitaRequest {
  fecha_cita: string;
  hora_cita: string;
  veterinario_id?: number;
}

@Injectable({
  providedIn: 'root'
})

export class CitasService {
  private API_URL = `${environment.apiUrl}/citas`;
  private CLIENTES_URL = `${environment.apiUrl}/clientes`;
private USUARIOS_URL = `${environment.apiUrl}/usuarios`; 

  constructor(private http: HttpClient) {
    console.log(`CitasService inicializado. API URL: ${this.API_URL}`);
  }

  validarCliente(correo: string): Observable<ValidacionCliente> {
    console.log(`[SERVICIO] Validando cliente con correo: ${correo}`);
    
    return this.http.get<RespuestaBackend>(`${this.CLIENTES_URL}/validar/${correo}`)
      .pipe(
        map(response => {
          console.log('[SERVICIO] Respuesta de validación recibida:', response);
          return response.data as ValidacionCliente;
        }),
        catchError(this.manejarError)
      );
  }

  registrarCita(datos: RegistroCitaRequest): Observable<RespuestaBackend> {
    console.log('[SERVICIO] Enviando datos para registrar cita:', datos);
    
    return this.http.post<RespuestaBackend>(this.API_URL, datos)
      .pipe(
        tap((respuesta) => {
          console.log('[SERVICIO] Cita registrada con éxito:', respuesta);
        }),
        catchError(this.manejarError)
      );
  }

  obtenerTodasLasCitas(): Observable<Cita[]> {
    console.log('[SERVICIO] Obteniendo todas las citas de la base de datos...');
    
    return this.http.get<RespuestaBackend>(this.API_URL)
      .pipe(
        map(response => {
          const citas = response.data as Cita[];
          console.log(`[SERVICIO] Se obtuvieron ${citas?.length || 0} citas`);
          return citas || [];
        }),
        catchError(this.manejarError)
      );
  }

  // Obtener citas asignadas a un usuario específico (Veterinario o Auxiliar)
  getCitasAsignadas(idUsuario: number): Observable<RespuestaBackend> {
    console.log(`[SERVICIO] Buscando citas asignadas al usuario ID: ${idUsuario}`);
    // Ajusta la ruta según lo que pusimos en el backend (/personal/:id)
    return this.http.get<RespuestaBackend>(`${this.API_URL}/personal/${idUsuario}`)
      .pipe(
        catchError(this.manejarError)
      );
  }
  

    getVeterinarios(): Observable<Veterinario[]> {
    console.log('[SERVICIO] Obteniendo lista de veterinarios...');
    
    // Asumimos que el token se inyecta automáticamente (Interceptor)
    return this.http.get<RespuestaBackend>(`${this.USUARIOS_URL}/veterinarios`)
      .pipe(
        map(response => {
          const veterinarios = response.data as Veterinario[];
          console.log(`[SERVICIO] Se obtuvieron ${veterinarios?.length || 0} veterinarios`);
          return veterinarios || [];
        }),
        catchError(this.manejarError)
      );
  }
  

  reprogramarCita(idCita: number, datos: ActualizarCitaRequest): Observable<RespuestaBackend> {
    console.log(`[SERVICIO] Reprogramando cita ID: ${idCita}`, datos);
    
    return this.http.put<RespuestaBackend>(`${this.API_URL}/${idCita}`, datos)
      .pipe(
        tap((respuesta) => {
          console.log('[SERVICIO] Cita reprogramada con éxito:', respuesta);
        }),
        catchError(this.manejarError)
      );
  }

  cancelarCita(idCita: number): Observable<RespuestaBackend> {
    console.log(`[SERVICIO] Cancelando cita ID: ${idCita}`);
    
    return this.http.delete<RespuestaBackend>(`${this.API_URL}/${idCita}`)
      .pipe(
        tap((respuesta) => {
          console.log('[SERVICIO] Cita cancelada con éxito:', respuesta);
        }),
        catchError(this.manejarError)
      );
  }

  // Actualizar estado de un servicio específico (Checklist)
  actualizarEstadoServicio(citaId: number, servicioId: number, estado: string): Observable<RespuestaBackend> {
    return this.http.put<RespuestaBackend>(
      `${this.API_URL}/${citaId}/servicios/${servicioId}`,
      { estado }
    ).pipe(
        tap(() => console.log(`[SERVICIO] Servicio ${servicioId} marcado como ${estado}`)),
        catchError(this.manejarError)
    );
  }

    finalizarCita(idCita: number): Observable<RespuestaBackend> {
    return this.http.put<RespuestaBackend>(
        `${this.API_URL}/${idCita}/completar`, 
        {} // Body vacío
    ).pipe(
        tap(() => console.log(`[SERVICIO] Cita ${idCita} finalizada.`)),
        catchError(this.manejarError)
    );
  }
  
  private manejarError(error: HttpErrorResponse) {
    let mensajeError = 'Ocurrió un error desconocido.';
    
    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error de red: ${error.error.message}`;
    } else {
      if (error.status === 409) {
        mensajeError = error.error.message || 'Ya existe una cita en ese horario';
      } else if (error.status === 400) {
        mensajeError = error.error.message || 'Los datos enviados son inválidos';
      } else if (error.status === 404) {
        mensajeError = error.error.message || 'Cita no encontrada';
      } else if (error.status === 500) {
        mensajeError = error.error.message || 'Error en el servidor';
      } else {
        mensajeError = `Error ${error.status}: ${error.error.message || error.statusText}`;
      }
    }
    
    console.error('[SERVICIO] Error:', mensajeError);
    return throwError(() => new Error(mensajeError));
  }

}