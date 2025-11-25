import { Component, OnInit } from '@angular/core';
import { MisCitasService } from '../../services/mis-citas.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-citas-vet',
  imports: [
    CommonModule, RouterModule
  ],
  templateUrl: './mis-citas-vet.component.html',
  styleUrl: './mis-citas-vet.component.scss'
})
export class MisCitasVetComponent implements OnInit {
  citas: any[] = [];
  loading: boolean = false;
  veterinarioId: string = '';

  constructor(private misCitasService: MisCitasService, private router: Router) {}

ngOnInit(): void {
  console.log('ngOnInit ejecutado');

  // Verificar qué hay en localStorage
  const userData = localStorage.getItem('usuario');
  console.log('userData raw:', userData);

  if (userData) {
    console.log('userData existe');
    const user = JSON.parse(userData);
    console.log('User parseado:', user);

    this.veterinarioId = user.id || user._id;
    console.log('veterinarioId:', this.veterinarioId);

    if (this.veterinarioId) {
      console.log('Llamando cargarCitas...');
      this.cargarCitas();
    } else {
      console.log('No se encontró ID del veterinario');
    }
  } else {
    console.log('No hay datos de usuario en localStorage');
    console.log('Todas las keys en localStorage:', Object.keys(localStorage));
  }
}

cargarCitas(): void {
  this.loading = true;
  this.misCitasService.getCitasVeterinario(this.veterinarioId).subscribe({
    next: (response) => {
      console.log('Citas recibidas:', response.data);
      console.log('Respuesta recibida:', response);
      console.log('Datos:', response.data);
      this.citas = response.data || [];
      this.citas = this.citas.sort((a, b) => {
        if (a.fecha_cita === b.fecha_cita) {
          return a.hora_cita.localeCompare(b.hora_cita);
        }
        return a.fecha_cita.localeCompare(b.fecha_cita);
      });

      console.log('Citas asignadas y ordenadas:', this.citas);

      this.loading = false;
    },
    error: (error) => {
      console.log('Error al cargar citas:', error);
      console.log('Detalle del error:', error.message);
      console.log('Status:', error.status);
      this.loading = false;
    }
  });
}


atenderCita(cita: any) {
  console.log('Atendiendo cita:', cita);
  this.router.navigate(['/veterinario/expedientes-form', cita.id_cita]);

}

  getEstadoBadgeClass(estado: string): string {
    const estados: any = {
      'Confirmada': 'bg-success',
      'Pendiente': 'bg-warning',
      'Cancelada': 'bg-danger',
      'Completada': 'bg-primary'
    };
    return estados[estado] || 'bg-secondary';
  }
}
