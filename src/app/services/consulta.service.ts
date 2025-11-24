import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {

  API_URL = environment.apiUrlDos;

  constructor(private http: HttpClient) {}

  postConsulta(payload: any): Observable<ResponseDTO<any>> {
    return this.http.post<ResponseDTO<any>>(
      `${this.API_URL}/api/consultas`,
      payload
    );
  }

  getConsulta(id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/consultas/${id}`
    );
  }

  getConsultasPorExpediente(expediente_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/consultas/expediente/${expediente_id}`
    );
  }

  patchConsulta(id: number, payload: any): Observable<ResponseDTO<any>> {
    return this.http.patch<ResponseDTO<any>>(
      `${this.API_URL}/api/consultas/${id}`,
      payload
    );
  }

  verificarCita(cita_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/consultas/verificar-cita/${cita_id}`
    );
  }
}
