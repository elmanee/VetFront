import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {

  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  subirImagenes(payload: any): Observable<ResponseDTO<any>> {
    return this.http.post<ResponseDTO<any>>(
      `${this.API_URL}/imagenes`,
      payload
    );
  }

  obtenerPorConsulta(id: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/imagenes/consulta/${id}`
    );
  }

  eliminar(id: number): Observable<ResponseDTO<any>> {
    return this.http.delete<ResponseDTO<any>>(
      `${this.API_URL}/imagenes/${id}`
    );
  }
}
