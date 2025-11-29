import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Si es standalone
import { FormsModule } from '@angular/forms';     // Importante para ngModel
import { ServiciosFacade } from '../../facades/servicios.facade';
import { Servicio } from '../../interfaces/servicio.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios-admin.component.html',
  styleUrls: ['./servicios-admin.component.scss']
})
export class ServiciosAdminComponent implements OnInit {


  private serviciosFacade = inject(ServiciosFacade);

  servicios$ = this.serviciosFacade.servicios$;

  // Objeto para el formulario
  formServicio: Servicio = {
    titulo: '',
    descripcion: '',
    imagen_url: '',
    activo: true,
    precio: 0
  };

  editando = false;

  constructor() { }

  ngOnInit(): void {
    this.serviciosFacade.loadServicios();
  }

  guardarServicio() {
    if (this.editando && this.formServicio.id) {
        this.serviciosFacade.editarServicio(this.formServicio.id, this.formServicio).subscribe(() => {
            this.resetForm();
            alert('Servicio actualizado');
        });
    } else {
        this.serviciosFacade.crearServicio(this.formServicio).subscribe(() => {
            this.resetForm();
            alert('Servicio creado');
        });
    }
  }

  cargarParaEditar(servicio: Servicio) {
      this.formServicio = { ...servicio }; 
      this.editando = true;
  }

  borrar(id: number) {
      if(confirm('¿Seguro que quieres borrar este servicio?')) {
          this.serviciosFacade.eliminarServicio(id).subscribe();
      }
  }

  resetForm() {
      this.editando = false;
      this.formServicio = {
        titulo: '',
        descripcion: '',
        imagen_url: '',
        activo: true,
        precio: 0
      };
  }
}