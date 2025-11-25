import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {

  API_URL = environment.apiUrlDos;

  constructor(private http: HttpClient) {}

  postExpediente(payload: any): Observable<ResponseDTO<any>> {
    return this.http.post<ResponseDTO<any>>(
      `${this.API_URL}/api/expedientes`,
      payload
    );
  }

  getExpedientes(): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/expedientes`
    );
  }

  getExpediente(id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/expedientes/${id}`
    );
  }

  getExpedientePorPaciente(paciente_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/expedientes/paciente/${paciente_id}`
    );
  }

  getExpedientesPorPaciente(paciente_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/expedientes/paciente/${paciente_id}/todos`
    );
  }

  getExpedienteCompleto(expediente_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/expedientes/${expediente_id}/completo`
    );
  }

  updateExpediente(id: number, payload: any): Observable<ResponseDTO<any>> {
    return this.http.patch<ResponseDTO<any>>(
      `${this.API_URL}/api/expedientes/${id}`,
      payload
    );
  }

  getDetalleExpediente(id: number) {
    return this.http.get<any>(`${this.API_URL}/api/expedientes/${id}/detalle`);
  }
}
