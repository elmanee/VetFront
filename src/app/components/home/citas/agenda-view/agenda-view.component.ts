// /home/agus/Documentos/VetHealth/VetFront/src/app/components/home/citas/agenda-view/agenda-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { Cita, CitasService, ActualizarCitaRequest, Veterinario } from '../../../../services/citas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agenda-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './agenda-view.component.html',
  styleUrl: './agenda-view.component.scss'
})
export class AgendaViewComponent implements OnInit {
  
  veterinarios: Veterinario[] = [];

  // --- CAMBIOS EN LA LÓGICA DE DATOS ---
  // citasAgenda ahora es la "lista maestra" que contiene TODO de la API
  citasAgenda: Cita[] = []; 
  // citasFiltradas es lo que realmente se muestra en la pantalla
  citasFiltradas: Cita[] = []; 
  
  // 'todos' (string) será nuestro valor para "Todos los Veterinarios"
  veterinarioSeleccionadoId: number | string = 'todos'; 
  // Un string vacío '' significará "Todas las Fechas"
  fechaSeleccionada: string = ''; 
  busquedaTexto: string = '';
  // --- FIN DE CAMBIOS LÓGICOS ---
  
  cargando: boolean = false;
  mensaje: string = '';
  mensajeClase: string = '';

  mostrarModal: boolean = false;
  citaSeleccionada: Cita | null = null;
  accionModal: 'cancelar' | 'reprogramar' | null = null;
  
  nuevaFecha: string = '';
  nuevaHora: string = '';

  constructor(private citasService: CitasService) {
    console.log('[AGENDA] Componente de agenda inicializado');
  }

  ngOnInit(): void {
    console.log('[AGENDA] Cargando veterinarios y citas al iniciar...');
    this.cargarVeterinarios();
    // Ahora cargamos las citas independientemente
    this.cargarCitas(); 
  }

  cargarVeterinarios(): void {
    this.citasService.getVeterinarios().subscribe({
      next: (vets) => {
        this.veterinarios = vets;
      },
      error: (error) => {
        console.error('[AGENDA] Error al cargar veterinarios:', error.message);
        this.mensaje = 'Error al cargar lista de doctores';
        this.mensajeClase = 'error';
      }
    });
  }

  // cargarCitas() AHORA SÓLO OBTIENE DATOS, NO FILTRA
  cargarCitas(): void {
    this.cargando = true;
    console.log(`[AGENDA] Obteniendo TODAS las citas del backend...`);
    
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (todasLasCitas) => {
        console.log(`[AGENDA] Se recibieron ${todasLasCitas.length} citas del backend`);
        
        // 1. Guardar en la lista maestra
        this.citasAgenda = todasLasCitas;
        
        // 2. Aplicar los filtros seleccionados (por defecto 'todos' y '')
        this.aplicarFiltros(); 
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('[AGENDA] Error al cargar citas:', error.message);
        this.citasAgenda = [];
        this.citasFiltradas = [];
        this.cargando = false;
        this.mensaje = 'Error al cargar las citas';
        this.mensajeClase = 'error';
      }
    });
  }

  // --- ¡NUEVA FUNCIÓN PRINCIPAL DE FILTRADO! ---
  aplicarFiltros(): void {
    console.log(`[AGENDA] Aplicando filtros. Vet: ${this.veterinarioSeleccionadoId}, Fecha: ${this.fechaSeleccionada}, Búsqueda: ${this.busquedaTexto}`);
    
    // Empezamos con la lista maestra completa
    let citasTemp = [...this.citasAgenda];

    // 1. Filtro por Veterinario
    if (this.veterinarioSeleccionadoId !== 'todos') {
      citasTemp = citasTemp.filter(cita => 
        cita.veterinario_id === Number(this.veterinarioSeleccionadoId)
      );
    }

    // 2. Filtro por Fecha (solo si hay una fecha seleccionada)
    if (this.fechaSeleccionada) {
      citasTemp = citasTemp.filter(cita => {
        let fechaCitaISO = cita.fecha_cita;
        if (fechaCitaISO.includes('T')) {
          fechaCitaISO = fechaCitaISO.split('T')[0];
        }
        return fechaCitaISO === this.fechaSeleccionada;
      });
    }

    // 3. Filtro por Texto (search)
    const busqueda = this.busquedaTexto.toLowerCase().trim();
    if (busqueda) {
      citasTemp = citasTemp.filter(cita => 
        (cita.motivo && cita.motivo.toLowerCase().includes(busqueda)) ||
        (cita.hora_cita && cita.hora_cita.includes(busqueda)) ||
        (cita.cliente_nombre && cita.cliente_nombre.toLowerCase().includes(busqueda)) ||
        (cita.cliente_correo && cita.cliente_correo.toLowerCase().includes(busqueda)) ||
        (cita.mascota_nombre && cita.mascota_nombre.toLowerCase().includes(busqueda))
      );
    }

    // 4. Ordenar (¡Importante! Ordenar por fecha PRIMERO, luego por hora)
    citasTemp.sort((a, b) => {
      const fechaA = a.fecha_cita || '';
      const fechaB = b.fecha_cita || '';
      if (fechaA < fechaB) return -1;
      if (fechaA > fechaB) return 1;
      // Si las fechas son iguales, ordena por hora
      return a.hora_cita.localeCompare(b.hora_cita);
    });

    // 5. Asignar a la lista visible
    this.citasFiltradas = citasTemp;
    console.log(`[AGENDA] Después del filtro quedan ${this.citasFiltradas.length} citas`);
  }

  // filtrarCitas() ahora se llama onBusquedaInput() y solo llama a aplicarFiltros()
  onBusquedaInput(): void {
    this.aplicarFiltros();
  }

  verHoy(): void {
    this.fechaSeleccionada = new Date().toISOString().substring(0, 10);
    this.aplicarFiltros();
  }

  // --- ¡NUEVA FUNCIÓN! ---
  verTodasLasFechas(): void {
    this.fechaSeleccionada = ''; // Limpiar la fecha activa el filtro "todos"
    this.aplicarFiltros();
  }

  cambiarFecha(dias: number): void {
    // Si no hay fecha, no podemos sumar/restar. Empezamos desde hoy.
    const fechaBase = this.fechaSeleccionada ? new Date(this.fechaSeleccionada) : new Date();
    
    fechaBase.setDate(fechaBase.getDate() + dias);
    this.fechaSeleccionada = fechaBase.toISOString().substring(0, 10);
    this.aplicarFiltros();
  }

  abrirModal(cita: Cita, accion: 'cancelar' | 'reprogramar'): void {
    this.citaSeleccionada = cita;
    this.accionModal = accion;
    this.mostrarModal = true;
    
    if (accion === 'reprogramar') {
      let fechaCitaISO = cita.fecha_cita;
      if (fechaCitaISO.includes('T')) {
        fechaCitaISO = fechaCitaISO.split('T')[0];
      }
      this.nuevaFecha = fechaCitaISO;
      this.nuevaHora = cita.hora_cita;
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaSeleccionada = null;
    this.accionModal = null;
    this.nuevaFecha = '';
    this.nuevaHora = '';
    this.mensaje = ''; // Limpiar mensaje del modal
  }

  confirmarCancelar(): void {
    if (!this.citaSeleccionada || !this.citaSeleccionada.id_cita) return;
    
    Swal.fire({
      title: '¿Cancelar cita?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        
        this.citasService.cancelarCita(this.citaSeleccionada!.id_cita!).subscribe({
          next: (response) => {
            this.cargando = false;
            
            Swal.fire({
              title: '¡Cancelada!',
              text: response.message,
              icon: 'success',
              timer: 2000
            });
            
            this.cerrarModal();
            this.cargarCitas(); // Recargamos todo
          },
          error: (err: Error) => {
            this.cargando = false;
            Swal.fire({
              title: 'Error',
              text: err.message,
              icon: 'error'
            });
          }
        });
      }
    });
  }

  confirmarReprogramar(): void {
    if (!this.citaSeleccionada || !this.citaSeleccionada.id_cita || !this.nuevaFecha || !this.nuevaHora) {
      this.mensaje = 'Completa la nueva fecha y hora';
      this.mensajeClase = 'error';
      return;
    }
    
    console.log(`[AGENDA] Reprogramando cita ID: ${this.citaSeleccionada.id_cita}`);
    console.log(`[AGENDA] Nueva fecha: ${this.nuevaFecha}, Nueva hora: ${this.nuevaHora}`);
    
    this.cargando = true;
    
    const datos: ActualizarCitaRequest = {
      fecha_cita: this.nuevaFecha,
      hora_cita: this.nuevaHora,
      veterinario_id: this.citaSeleccionada.veterinario_id
    };
    
    this.citasService.reprogramarCita(this.citaSeleccionada.id_cita, datos).subscribe({
      next: (response) => {
        this.cargando = false;
        this.mensaje = response.message || 'Cita reprogramada exitosamente';
        this.mensajeClase = 'success';
        
        setTimeout(() => {
          this.cerrarModal();
          this.cargarCitas(); // Recargamos todo
        }, 2000);
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mensaje = `Error: ${err.message}`;
        this.mensajeClase = 'error';
      }
    });
  }

  // --- CÁLCULO DE ESTADÍSTICAS (MODIFICADO) ---
  // Ahora calculan sobre la lista FILTRADA (citasFiltradas)
  get totalCitasFiltradas(): number {
    return this.citasFiltradas.length;
  }
  
  get totalConfirmadas(): number {
    return this.citasFiltradas.filter(c => c.estado === 'Confirmada').length;
  }
  
  get totalPendientes(): number {
    return this.citasFiltradas.filter(c => c.estado === 'Pendiente' || c.estado === 'Por Confirmar').length;
  }
  // --- FIN DE CÁLCULO DE ESTADÍSTICAS ---

  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'Confirmada': return 'badge-success-si';
      case 'Por Confirmar': return 'badge-warning-si';
      case 'Pendiente': return 'badge-warning-si';
      case 'Cancelada': return 'badge-danger-si';
      case 'Completada': return 'badge-secondary-si';
      default: return 'badge-secondary-si';
    }
  }

  getEstadoCardClass(estado: string): string {
    switch(estado) {
      case 'Confirmada': return 'border-success';
      case 'Por Confirmar': return 'border-warning';
      case 'Pendiente': return 'border-warning';
      case 'Cancelada': return 'border-danger';
      case 'Completada': return 'border-secondary';
      default: return 'border-secondary';
    }
  }
}
