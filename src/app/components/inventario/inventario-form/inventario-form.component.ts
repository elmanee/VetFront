import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InventarioService } from '../../../services/inventario.service';
import { FormsModule } from '@angular/forms';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CategoriasProductosService } from '../../../services/categoriasproductos.service';

@Component({
  selector: 'app-inventario-form',
  imports: [
    CommonModule, FormsModule,
  ],
  templateUrl: './inventario-form.component.html',
  styleUrl: './inventario-form.component.scss'
})
export class InventarioFormComponent {
  @Input() producto: any | null = null;
  @Output() onGuardar = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<void>();

  cagetorias: any | null = null
  isClosing = false;

  productoData: any = {
    nombre: '',
    descripcion: '',
    precio_venta: '',
    unidad_medida: '',
    categoria_id: null
  };


  constructor(
    private inventarioSrv: InventarioService,
    private alertServ: AlertsService,
    private categoriaPServ: CategoriasProductosService

  ) {}

  ngOnInit() {
    this.cargarCategorias()
    if (this.producto) {
      const { categoria, ...rest } = this.producto;
      this.productoData = { ...rest };
    }
  }

  cargarCategorias() {
    this.categoriaPServ.getCategorias().subscribe({
      next: (resp) => {
        if (resp.status === 'OK'){
          this.cagetorias = resp.data
        }
      }
    })
  }

  guardarProducto() {
    if (this.producto && this.producto.id) {
      console.log('Payload que se enviará:', this.productoData);
      this.inventarioSrv.updateProducto(this.producto.id, this.productoData).subscribe({

        next: (res) => {
          if (res.status === 'OK'){
            console.log(res);
            this.alertServ.showSuccessAlert(
              'Éxito',
              'Producto actualizado con exito'
            )
            this.onGuardar.emit({ data: res.data, tipo: 'editado' });
            this.triggerClose();
          }else{
            this.alertServ.showErrorAlert(
              'Error',
              'Error al actualizar, revisada todos los campos'
            )
          }

        },
        error: (err) => {
          console.error('Error al actualizar producto:', err)
          this.alertServ.showErrorAlert(
            'Error',
            'Error interno, intenta más tade'
          )
        }
      });
    } else {
      this.inventarioSrv.postProducto(this.productoData).subscribe({
        next: (res) => {
          console.log('Producto registrado:', res);
          this.alertServ.showSuccessAlert(
            'Éxito',
            'Producto registrado correctamente'
          )
          this.onGuardar.emit({ data: res.data, tipo: 'nuevo' });
          this.triggerClose();
        },
        error: (err) => {
          console.error('Error al registrar producto', err);
          alert('Error al registrar producto');
        }
      });
    }
  }


  triggerClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.closeEvent.emit();
    }, 500);
  }
}
