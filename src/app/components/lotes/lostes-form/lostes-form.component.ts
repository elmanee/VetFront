import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../services/inventario.service';
import { AlertsService } from '../../../shared/services/alerts.service';

@Component({
  selector: 'app-lostes-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lostes-form.component.html',
  styleUrls: ['./lostes-form.component.scss']
})
export class LostesFormComponent implements OnInit {
  @Input() lote: any | null = null;
  @Output() onGuardar = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<void>();

  isClosing = false;

  productos: any[] = [];
  proveedores: any[] = [];

  loteData = {
    producto_id: null,
    num_lote: '',
    cantidad_inicial: null,
    cantidad_disponible: null,
    fecha_ingreso: '',
    fecha_caducidad: '',
    proveedor_id: null
  };

  constructor(
    private inventarioSrv: InventarioService,
    private alertSrv: AlertsService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarProveedores();

    if (this.lote) {
      this.loteData = { ...this.lote };
    }
  }

  cargarProductos(): void {
    this.inventarioSrv.getProductos().subscribe({
      next: (res) => {
        if (res.status === 'OK' && res.data) {
          this.productos = res.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.alertSrv.showErrorAlert('Error', 'No se pudieron cargar los productos.');
      }
    });
  }

  cargarProveedores(): void {
    this.inventarioSrv.getProveedores().subscribe({
      next: (res) => {
        if (res.status === 'OK' && res.data) {
          this.proveedores = res.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
        this.alertSrv.showErrorAlert('Error', 'No se pudieron cargar los proveedores.');
      }
    });
  }

  // guardarLote(): void {
  //   if (!this.loteData.producto_id) {
  //     this.alertSrv.showErrorAlert('Faltan datos', 'Debes seleccionar un producto.');
  //     return;
  //   }

  //   if (!this.loteData.num_lote) {
  //     this.alertSrv.showErrorAlert('Faltan datos', 'Debes ingresar el número de lote.');
  //     return;
  //   }

  //   const payload = { ...this.loteData };

  //   if (this.lote) {
  //     // Actualización
  //     this.inventarioSrv.updateLote(this.lote.id, payload).subscribe({
  //       next: (res) => {
  //         if (res.status === 'OK') {
  //           this.alertSrv.showSuccessAlert('Actualizado', 'Lote actualizado correctamente.');
  //           this.onGuardar.emit(res.data);
  //           this.triggerClose();
  //         }
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.alertSrv.showErrorAlert('Error', 'No se pudo actualizar el lote.');
  //       }
  //     });
  //   } else {
  //     // Creación
  //     this.inventarioSrv.createLote(payload).subscribe({
  //       next: (res) => {
  //         if (res.status === 'OK') {
  //           this.alertSrv.showSuccessAlert('Registrado', 'Lote registrado correctamente.');
  //           this.onGuardar.emit(res.data);
  //           this.triggerClose();
  //         }
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.alertSrv.showErrorAlert('Error', 'No se pudo registrar el lote.');
  //       }
  //     });
  //   }
  // }

  guardarLote(): void {}

  triggerClose(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.closeEvent.emit();
    }, 400);
  }
}
