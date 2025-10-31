import { Component, OnInit } from '@angular/core';
import { MisCitasService } from '../../services/mis-citas.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  constructor(private misCitasService: MisCitasService) {}

ngOnInit(): void {
  console.log('🔍 ngOnInit ejecutado');
  
  // Verificar qué hay en localStorage
  const userData = localStorage.getItem('usuario'); // <--- ¡AQUÍ ESTÁ EL CAMBIO!
  console.log('📦 userData raw:', userData);
  
  if (userData) {
    console.log('✅ userData existe');
    const user = JSON.parse(userData);
    console.log('👤 User parseado:', user);
    
    this.veterinarioId = user.id || user._id;
    console.log('🆔 veterinarioId:', this.veterinarioId);
    
    if (this.veterinarioId) {
      console.log('🚀 Llamando cargarCitas...');
      this.cargarCitas();
    } else {
      console.error('❌ No se encontró ID del veterinario');
    }
  } else {
    console.error('❌ No hay datos de usuario en localStorage');
    console.log('📋 Todas las keys en localStorage:', Object.keys(localStorage));
  }
}

cargarCitas(): void {
  console.log('📞 cargarCitas iniciado');
  console.log('🆔 Buscando citas para veterinario:', this.veterinarioId);
  
  this.loading = true;
  
  this.misCitasService.getCitasVeterinario(this.veterinarioId).subscribe({
    next: (response) => {
      console.log('✅ Respuesta recibida:', response);
      console.log('📊 Datos:', response.data);
      this.citas = response.data || [];
      console.log('📋 Citas asignadas:', this.citas);
      this.loading = false;
    },
    error: (error) => {
      console.error('❌ Error al cargar citas:', error);
      console.error('📄 Detalle del error:', error.message);
      console.error('🔍 Status:', error.status);
      this.loading = false;
    }
  });
}

  atenderCita(citaId: string): void {
    // Navegar a la página de atención o abrir modal
    console.log('Atender cita:', citaId);
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