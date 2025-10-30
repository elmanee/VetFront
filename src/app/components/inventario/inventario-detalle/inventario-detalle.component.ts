import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-inventario-detalle',
  imports: [
    CommonModule
  ],
  templateUrl: './inventario-detalle.component.html',
  styleUrl: './inventario-detalle.component.scss'
})
export class InventarioDetalleComponent {
  @Input() detalle: any = null;
  @Output() close = new EventEmitter<void>();

    isClosing = false;


  cerrar() {
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.close.emit();
    }, 500);

  }
}
