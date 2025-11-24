import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {

  API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registrarTratamientos(payload: any): Observable<ResponseDTO<any>> {
    return this.http.post<ResponseDTO<any>>(
      `${this.API_URL}/tratamientos`,
      payload
    );
  }

  obtenerPorConsulta(consulta_id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/tratamientos/consulta/${consulta_id}`
    );
  }

  eliminar(id: number): Observable<ResponseDTO<any>> {
    return this.http.delete<ResponseDTO<any>>(
      `${this.API_URL}/tratamientos/${id}`
    );
  }
}
