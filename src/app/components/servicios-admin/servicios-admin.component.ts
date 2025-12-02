import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosFacade } from '../../facades/servicios.facade';
import { Servicio } from '../../interfaces/servicio.interface';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ServicesFormComponent } from './services-form/services-form.component'; // Importar el nuevo componente

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ServicesFormComponent], // Agregar el formulario
  templateUrl: './servicios-admin.component.html',
  styleUrls: ['./servicios-admin.component.scss']
})
export class ServiciosAdminComponent implements OnInit {

  private serviciosFacade = inject(ServiciosFacade);

  servicios$ = this.serviciosFacade.servicios$;

  mostrarFormulario = false;
  servicioSeleccionado: Servicio | null = null;

  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalItems = 0;
  totalPages = 1;

  get visiblePages(): number[] {
    return [1];
  }
  get rangeStart(): number { return 1; }
  get rangeEnd(): number { return 1; }

  constructor() { }

  ngOnInit(): void {
    this.serviciosFacade.loadServicios();
  }

  goToPage(p: number) { this.page = p; }
  prevPage() { this.goToPage(this.page - 1); }
  nextPage() { this.goToPage(this.page + 1); }

  cargarParaEditar(servicio: Servicio) {
      this.servicioSeleccionado = servicio;
      this.mostrarFormulario = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  borrar(id: number) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¡Esta acción no se puede deshacer!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.serviciosFacade.eliminarServicio(id).subscribe(() => {
            Swal.fire('¡Eliminado!', 'El servicio ha sido eliminado.', 'success');
          });
        }
      });
  }

  abrirFormulario(): void {
    this.servicioSeleccionado = null;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.servicioSeleccionado = null;
  }

  handleGuardar(): void {
    this.serviciosFacade.loadServicios();
  }
}
