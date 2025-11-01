import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseDTO } from '../interfaces/response.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MisCitasService {
  API_URL = environment.apiUrlDos;
  
  constructor(private http: HttpClient) {
    console.log('🔧 MisCitasService creado');
    console.log('🌐 API_URL:', this.API_URL);
  }
  
  getCitasVeterinario(veterinarioId: string): Observable<ResponseDTO<any>> {
    const url = `${this.API_URL}/api/citas/veterinario/${veterinarioId}`;
    console.log('📡 Haciendo petición a:', url);
    return this.http.get<ResponseDTO<any>>(url);
  }
}