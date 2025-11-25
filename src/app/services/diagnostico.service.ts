import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {

  API_URL = environment.apiUrlDos;

  constructor(private http: HttpClient) {}

  registrarDiagnosticos(payload: any): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/api/diagnosticos`, payload);
  }

  getDiagnosticosPorConsulta(consulta_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/diagnosticos/consulta/${consulta_id}`
    );
  }

  deleteDiagnostico(id: number): Observable<ResponseDTO<any>> {
    return this.http.delete<ResponseDTO<any>>(
      `${this.API_URL}/api/diagnosticos/${id}`
    );
  }
}
