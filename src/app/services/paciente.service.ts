import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  API_URL = environment.apiUrlDos;

  constructor(private http: HttpClient) {}

  postPaciente(payload: any): Observable<ResponseDTO<any>> {
    return this.http.post<ResponseDTO<any>>(
      `${this.API_URL}/api/pacientes`,
      payload
    );
  }

  getPaciente(id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/pacientes/${id}`
    );
  }

  updatePaciente(id: number, payload: any): Observable<ResponseDTO<any>> {
    return this.http.patch<ResponseDTO<any>>(
      `${this.API_URL}/api/pacientes/${id}`,
      payload
    );
  }

  getPacientesPorCliente(cliente_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/pacientes/cliente/${cliente_id}`
    );
  }
}
