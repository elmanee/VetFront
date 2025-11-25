import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {

  private API_URL = environment.apiUrlDos;

  constructor(private http: HttpClient) {}

  private getNoCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  subirImagenes(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/api/imagenes`, payload);
  }

  obtenerPorConsulta(consulta_id: number): Observable<any> {
    const timestamp = new Date().getTime();
    return this.http.get<any>(
      `${this.API_URL}/api/imagenes/consulta/${consulta_id}?t=${timestamp}`,
      { headers: this.getNoCacheHeaders() }
    );
  }


  actualizar(id: number, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/api/imagenes/${id}`, payload);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/api/imagenes/${id}`);
  }
}
