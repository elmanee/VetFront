import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-expedientes-lista',
  imports: [
    CommonModule
  ],
  templateUrl: './modal-expedientes-lista.component.html',
  styleUrl: './modal-expedientes-lista.component.scss'
})
export class ModalExpedientesListaComponent {
  @Input() paciente: any;
  @Input() expedientes: any[] = [];
  @Output() expedienteSeleccionado = new EventEmitter<any>();
  @Output() crearNuevoExpediente = new EventEmitter<void>();
  @Output() cerrarModal = new EventEmitter<void>();

  seleccionarExpediente(expediente: any) {
    console.log('Expediente seleccionado en modal:', expediente);
    this.expedienteSeleccionado.emit(expediente);
  }

  crearNuevo() {
    console.log('Crear nuevo desde modal');
    this.crearNuevoExpediente.emit();
  }

  cerrar() {
    console.log('Cerrar modal');
    this.cerrarModal.emit();
  }
}
