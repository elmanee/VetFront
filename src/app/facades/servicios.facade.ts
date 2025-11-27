import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Servicio } from '../interfaces/servicio.interface';

@Injectable({
  providedIn: 'root'
})
export class ServiciosFacade {
  private apiUrl = `${environment.apiUrl}/servicios`;

  // --- ESTADO (STATE) ---
  // Aquí guardamos la lista de servicios para que todos los componentes la vean actualizada
  private serviciosSubject = new BehaviorSubject<Servicio[]>([]);
  public servicios$ = this.serviciosSubject.asObservable();

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE LA FACHADA ---

  // 1. Cargar servicios (Admin ve todos, Público ve solo activos - eso lo filtra el Backend)
  loadServicios() {
    this.http.get<{data: Servicio[]}>(this.apiUrl).subscribe({
      next: (response) => {
        this.serviciosSubject.next(response.data); 
      },
      error: (err) => console.error('Error cargando servicios', err)
    });
  }

  // 2. Crear Servicio
  crearServicio(servicio: Servicio) {
    return this.http.post(this.apiUrl, servicio).pipe(
      tap(() => this.loadServicios()) 
    );
  }

  // 3. Editar Servicio
  editarServicio(id: number, servicio: Servicio) {
    return this.http.put(`${this.apiUrl}/${id}`, servicio).pipe(
      tap(() => this.loadServicios())
    );
  }

  // 4. Eliminar Servicio
  eliminarServicio(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadServicios())
    );
  }
}