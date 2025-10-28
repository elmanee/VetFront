import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../services/inventario.service';

@Component({
  selector: 'app-inventario-lote-form',
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './inventario-lote-form.component.html',
  styleUrl: './inventario-lote-form.component.scss'
})
export class InventarioLoteFormComponent {
  @Input() producto: any | null = null;
  @Output() onGuardar = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<void>();

  isClosing = false;
  loteData: any = {};

  proveedores: any[] = [];



  constructor(
    private inventarioSrv: InventarioService,
    private alertServ: AlertsService
  ) {}

  ngOnInit() {
    this.cargarProveedores();
    if (this.producto) {
      this.loteData.producto_id = this.producto.id;
    }
  }

  cargarProveedores() {
    this.inventarioSrv.getProveedores().subscribe({
      next: (res) => {
        if (res.status === 'OK' && res.data) {
          this.proveedores = res.data;
        }
      },
      error: (err) => {
        console.error('Error al obtener proveedores:', err);
      }
    });
  }

  guardarLote() {
    this.inventarioSrv.postLote(this.loteData).subscribe({
      next: (res) => {
        console.log('✅ Lote registrado:', res);
        this.alertServ.showSuccessAlert('Éxito', 'Lote registrado correctamente');
        this.onGuardar.emit(res.data);
        this.triggerClose();
      },
      error: (err) => {
        console.error('❌ Error al registrar lote', err);
        this.alertServ.showErrorAlert('Error', 'No se pudo registrar el lote');
      }
    });
  }

  triggerClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.closeEvent.emit();
    }, 500);
  }
}
