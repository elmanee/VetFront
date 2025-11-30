import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Si es standalone
import { FormsModule } from '@angular/forms';     // Importante para ngModel
import { ServiciosFacade } from '../../facades/servicios.facade';
import { Servicio } from '../../interfaces/servicio.interface';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

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
  mostrarFormulario = false; 

  constructor() { }

  ngOnInit(): void {
    this.serviciosFacade.loadServicios();
  }

  guardarServicio() {
    if (this.editando && this.formServicio.id) {
        this.serviciosFacade.editarServicio(this.formServicio.id, this.formServicio).subscribe(() => {
            this.resetForm();
            // Aquí podrías usar Swal.fire en lugar de alert
            alert('Servicio actualizado correctamente');
        });
    } else {
        this.serviciosFacade.crearServicio(this.formServicio).subscribe(() => {
            this.resetForm();
            alert('Servicio creado correctamente');
        });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      // Cuando termine de leer, guardamos el resultado (Base64) en el modelo
      reader.onload = (e: any) => {
        this.formServicio.imagen_url = e.target.result;
      };
      
      // Leemos el archivo como URL de datos (Base64)
      reader.readAsDataURL(file);
    }
  }

  cargarParaEditar(servicio: Servicio) {
      this.formServicio = { ...servicio };
      this.editando = true;
      this.mostrarFormulario = true; // Abrir el formulario automáticamente
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir para ver el form
  }

  borrar(id: number) {
      if(confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
          this.serviciosFacade.eliminarServicio(id).subscribe();
      }
  }

  resetForm() {
      this.editando = false;
      this.mostrarFormulario = false;
      this.formServicio = {
        titulo: '',
        descripcion: '',
        imagen_url: '',
        activo: true,
        precio: 0
      };
      // Limpiar el input file si fuera necesario (requiere ViewChild, pero por ahora así funciona)
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetForm();
    }
  }

}