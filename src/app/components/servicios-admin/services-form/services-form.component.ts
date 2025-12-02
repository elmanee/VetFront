import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Servicio } from '../../../interfaces/servicio.interface';
import { ServiciosFacade } from '../../../facades/servicios.facade';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services-form.component.html',
  styleUrl: './services-form.component.scss'
})
export class ServicesFormComponent implements OnInit {

  private serviciosFacade = inject(ServiciosFacade);

  @Input() servicioEditando: Servicio | null = null;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() onGuardar = new EventEmitter<void>();

  formServicio: Servicio = {
    titulo: '',
    descripcion: '',
    imagen_url: '',
    activo: true,
    precio: 0
  };

  editando = false;
  isClosing = false;

  constructor() { }

  ngOnInit(): void {
    if (this.servicioEditando) {
      this.formServicio = { ...this.servicioEditando };
      this.editando = true;
    }
  }

  guardarServicio() {
    if (this.editando && this.formServicio.id) {
        this.serviciosFacade.editarServicio(this.formServicio.id, this.formServicio).subscribe(() => {
            alert('Servicio actualizado correctamente');
            this.onGuardar.emit();
            this.triggerClose();
        });
    } else {
        this.serviciosFacade.crearServicio(this.formServicio).subscribe(() => {
            alert('Servicio creado correctamente');
            this.onGuardar.emit();
            this.triggerClose();
        });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.formServicio.imagen_url = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  triggerClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.closeEvent.emit();
    }, 400);
  }

  cancelar() {
    this.triggerClose();
  }
}
