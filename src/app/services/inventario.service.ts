import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDTO } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  API_URL = environment.apiUrlDos

  constructor( private http : HttpClient){}

  getProductos(): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/productos`
    );
  }

  postProducto(payload :any) :Observable<ResponseDTO<any>> {
    return this.http.post<ResponseDTO<any>>(
      `${this.API_URL}/api/productos`, payload
    )
  }

  getLotes(): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(
      `${this.API_URL}/api/lotes`
    );
  }

  postLote(payload :any) :Observable<ResponseDTO<any>> {
    return this.http.post<ResponseDTO<any>>(
      `${this.API_URL}/api/lotes`, payload
    )
  }

  updateLote(id: number, payload: any): Observable<ResponseDTO<any>> {
    return this.http.patch<ResponseDTO<any>>(
      `${this.API_URL}/api/lotes/${id}`, payload
    );
  }

  deleteLote(id: number): Observable<ResponseDTO<any>> {
    return this.http.delete<ResponseDTO<any>>(
      `${this.API_URL}/api/lotes/${id}`
    );
  }

  getProveedores(): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(`${this.API_URL}/api/proveedores`);
  }

  getDetalleProductoYLote(productoId: number): Observable<ResponseDTO<any>> {
    return this.http.get<ResponseDTO<any>>(`${this.API_URL}/api/lotes/detalle/${productoId}`);
  }

  updateProducto(id: number, data: any) {
    return this.http.patch<any>(`${this.API_URL}/api/productos/${id}`, data);
  }
}
