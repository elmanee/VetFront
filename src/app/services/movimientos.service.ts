import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  API_URL = environment.apiUrlDos

  constructor( private http : HttpClient) { }

  getMovimientos(): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/movimientos`
    );
  }

  getUsuarioById(id: number) {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/usuarios/${id}`
    );
  }
}
