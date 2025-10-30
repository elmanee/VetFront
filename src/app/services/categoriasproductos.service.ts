import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriasProductosService {
  API_URL = environment.apiUrlDos

  constructor(private http: HttpClient) { }


  getCategorias(): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/categorias`
    );
  }

}
