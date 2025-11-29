// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
// import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { TratamientoService } from '../../../services/tratamiento.service';

// @Component({
//   selector: 'app-tab-tratamientos',
//   imports: [
//     CommonModule, ReactiveFormsModule
//   ],
//   templateUrl: './tab-tratamientos.component.html',
//   styleUrl: './tab-tratamientos.component.scss'
// })
// export class TabTratamientosComponent implements OnInit, OnChanges {

//   @Input() consulta: any;
//   @Input() modoEdicion = false;
//   @Output() guardado = new EventEmitter<any>();

//   form!: FormGroup;
//   loading = false;
//   tratamientosExistentes: any[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private tratamientoServ: TratamientoService
//   ) {}

//   ngOnInit(): void {
//     this.form = this.fb.group({
//       tratamientos: this.fb.array([
//         this.crearTratamientoForm()
//       ])
//     });
//     if (this.consulta && this.modoEdicion) {
//       this.cargarTratamientosExistentes();
//     }
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['consulta'] && this.consulta && this.modoEdicion && this.form) {
//       this.cargarTratamientosExistentes();
//     }
//   }

//   get tratamientosArr(): FormArray {
//     return this.form.get('tratamientos') as FormArray;
//   }

//   crearTratamientoForm(tratamiento?: any): FormGroup {
//     return this.fb.group({
//       id_tratamiento: [tratamiento?.id_tratamiento || null],
//       medicamento: [tratamiento?.medicamento || '', Validators.required],
//       dosis: [tratamiento?.dosis || '', Validators.required],
//       frecuencia: [tratamiento?.frecuencia || '', Validators.required],
//       duracion_dias: [tratamiento?.duracion_dias || null],
//       via_administracion: [tratamiento?.via_administracion || ''],
//       indicaciones: [tratamiento?.indicaciones || '']
//     });
//   }

//   cargarTratamientosExistentes() {
//     if (!this.consulta?.id_consulta) {
//       return;
//     }

//     this.tratamientoServ.obtenerPorConsulta(this.consulta.id_consulta).subscribe({
//       next: (resp) => {
//         this.tratamientosExistentes = resp.data || [];

//         if (this.tratamientosExistentes.length > 0) {
//           this.tratamientosArr.clear();

//           this.tratamientosExistentes.forEach((trat, index) => {
//             this.tratamientosArr.push(this.crearTratamientoForm(trat));
//           });

//         } else {
//           console.log('No hay tratamientos existentes');
//         }
//       },
//       error: (err) => {
//         console.error('Error al cargar tratamientos:', err);
//       }
//     });
//   }

//   agregarTratamiento() {
//     this.tratamientosArr.push(this.crearTratamientoForm());
//   }

//   quitarTratamiento(index: number) {
//     const tratamiento = this.tratamientosArr.at(index).value;

//     if (tratamiento.id_tratamiento) {
//       this.tratamientoServ.eliminar(tratamiento.id_tratamiento).subscribe({
//         next: () => {
//           this.tratamientosArr.removeAt(index);
//         },
//         error: (err) => {
//           console.error(' Error al eliminar:', err);
//         }
//       });
//     } else {
//       this.tratamientosArr.removeAt(index);
//     }
//   }

//   guardar() {
//     if (this.form.invalid || !this.consulta?.id_consulta) return;

//     this.loading = true;

//     const payload = {
//       consulta_id: this.consulta.id_consulta,
//       tratamientos: this.form.value.tratamientos
//     };

//     this.tratamientoServ.registrarTratamientos(payload).subscribe({
//       next: (resp) => {
//         this.loading = false;
//         this.guardado.emit('ok');

//         if (this.modoEdicion) {
//           this.cargarTratamientosExistentes();
//         } else {
//           this.form.reset();
//           this.tratamientosArr.clear();
//           this.tratamientosArr.push(this.crearTratamientoForm());
//         }
//       },
//       error: () => {
//         this.loading = false;
//       }
//     });
//   }
// }

























import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TratamientoService } from '../../../services/tratamiento.service';
import { InventarioService } from '../../../services/inventario.service'; // Importamos servicio de inventario

@Component({
  selector: 'app-tab-tratamientos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-tratamientos.component.html',
  styleUrl: './tab-tratamientos.component.scss'
})
export class TabTratamientosComponent implements OnInit, OnChanges {

  // Inyección de inventario
  private inventarioService = inject(InventarioService);
  
  // Lista de productos para el selector
  productosInventario: any[] = [];

  @Input() consulta: any;
  @Input() modoEdicion = false;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;
  tratamientosExistentes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private tratamientoServ: TratamientoService
  ) {}

  ngOnInit(): void {
    // Cargar productos al iniciar
    this.cargarInventario();

    this.form = this.fb.group({
      tratamientos: this.fb.array([
        this.crearTratamientoForm()
      ])
    });
    if (this.consulta && this.modoEdicion) {
      this.cargarTratamientosExistentes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consulta'] && this.consulta && this.modoEdicion && this.form) {
      this.cargarTratamientosExistentes();
    }
  }

  // Método para cargar productos
  cargarInventario() {
    this.inventarioService.getProductos().subscribe({
      next: (resp) => {
        // Filtramos para mostrar medicamentos o todos (ajusta según tus categorías)
        // Ejemplo: ID 1 para medicamentos
        const todos = resp.data || [];
        this.productosInventario = todos; // O todos.filter(p => p.categoria_id === 1);
      },
      error: (err) => console.error('Error cargando inventario', err)
    });
  }

  get tratamientosArr(): FormArray {
    return this.form.get('tratamientos') as FormArray;
  }

  crearTratamientoForm(tratamiento?: any): FormGroup {
    return this.fb.group({
      id_tratamiento: [tratamiento?.id_tratamiento || null],
      medicamento: [tratamiento?.medicamento || '', Validators.required],
      dosis: [tratamiento?.dosis || '', Validators.required],
      frecuencia: [tratamiento?.frecuencia || '', Validators.required],
      duracion_dias: [tratamiento?.duracion_dias || null],
      via_administracion: [tratamiento?.via_administracion || ''],
      indicaciones: [tratamiento?.indicaciones || ''],
      
      // NUEVOS CAMPOS PARA INVENTARIO
      producto_id: [tratamiento?.producto_id || null],
      cantidad_inventario: [1] // Por defecto 1 unidad
    });
  }

  // Método para autocompletar nombre al seleccionar producto
  onProductoChange(index: number) {
    const group = this.tratamientosArr.at(index);
    const prodId = group.get('producto_id')?.value;
    
    if (prodId) {
      const producto = this.productosInventario.find(p => p.id === prodId);
      if (producto) {
        // Rellenar el nombre del medicamento automáticamente
        group.get('medicamento')?.setValue(producto.nombre);
        // Podrías rellenar la dosis también si tienes esa info en el producto
      }
    }
  }

  cargarTratamientosExistentes() {
    if (!this.consulta?.id_consulta) {
      return;
    }

    this.tratamientoServ.obtenerPorConsulta(this.consulta.id_consulta).subscribe({
      next: (resp) => {
        this.tratamientosExistentes = resp.data || [];

        if (this.tratamientosExistentes.length > 0) {
          this.tratamientosArr.clear();

          this.tratamientosExistentes.forEach((trat, index) => {
            this.tratamientosArr.push(this.crearTratamientoForm(trat));
          });

        } else {
          console.log('No hay tratamientos existentes');
        }
      },
      error: (err) => {
        console.error('Error al cargar tratamientos:', err);
      }
    });
  }

  agregarTratamiento() {
    this.tratamientosArr.push(this.crearTratamientoForm());
  }

  quitarTratamiento(index: number) {
    const tratamiento = this.tratamientosArr.at(index).value;

    if (tratamiento.id_tratamiento) {
      this.tratamientoServ.eliminar(tratamiento.id_tratamiento).subscribe({
        next: () => {
          this.tratamientosArr.removeAt(index);
        },
        error: (err) => {
          console.error(' Error al eliminar:', err);
        }
      });
    } else {
      this.tratamientosArr.removeAt(index);
    }
  }

  guardar() {
    if (this.form.invalid || !this.consulta?.id_consulta) return;

    this.loading = true;

    const payload = {
      consulta_id: this.consulta.id_consulta,
      tratamientos: this.form.value.tratamientos
    };

    this.tratamientoServ.registrarTratamientos(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.guardado.emit('ok');

        if (this.modoEdicion) {
          this.cargarTratamientosExistentes();
        } else {
          this.form.reset();
          this.tratamientosArr.clear();
          this.tratamientosArr.push(this.crearTratamientoForm());
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}