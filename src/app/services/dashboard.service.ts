import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData, StockBajo, ProductoAVencer, TopProductoVendido } from '../interfaces/dashboard.interface'; 
import { ResponseDTO } from '../interfaces/response.interface'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // URL base del backend (ejemplo: 'http://localhost:3000/api')
  private baseUrl: string = environment.apiUrl; 
  private dashboardUrl: string = `${this.baseUrl}/alertas/dashboard-data`; 

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los datos necesarios para el dashboard de administrador:
   * 1. Alertas de Stock Bajo
   * 2. Alertas de Productos a Vencer
   * 3. Datos para la Gráfica (Top Productos Vendidos)
   * * @returns Observable con la respuesta tipada que contiene DashboardData.
   */
  getDashboardAdminData(): Observable<ResponseDTO<DashboardData>> {
    // El TokenInterceptor (si lo usas) se encargará de adjuntar el token de autenticación.
    return this.http.get<ResponseDTO<DashboardData>>(this.dashboardUrl);
  }
}