// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
// import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { VacunaService } from '../../../services/vacuna.service';
// import { InventarioService } from '../../../services/inventario.service';

// @Component({
//   selector: 'app-tab-vacunas',
//   imports: [
//     CommonModule, ReactiveFormsModule
//   ],
//   templateUrl: './tab-vacunas.component.html',
//   styleUrl: './tab-vacunas.component.scss'
// })
// export class TabVacunasComponent implements OnInit, OnChanges {

//   // Inyección del servicio existente
//   private inventarioService = inject(InventarioService);

//   // Variables para el selector
//   productosInventario: any[] = [];
//   @Input() vacunas: any[] = [];
//   @Input() consulta: any;
//   @Input() modoEdicion = false;
//   @Output() guardado = new EventEmitter<any>();

//   form!: FormGroup;
//   loading = false;
//   vacunasExistentes: any[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private vacunaServ: VacunaService
//   ) {}

//   ngOnInit(): void {
//       this.form = this.fb.group({
//       vacunas: this.fb.array([
//         this.crearVacunaForm()
//       ])
//     });


//     if (this.consulta && this.modoEdicion) {
//       this.cargarVacunasExistentes();
//     }
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['consulta'] && this.consulta && this.modoEdicion && this.form) {
//       this.cargarVacunasExistentes();
//     }
//   }

//   get vacunasArr(): FormArray {
//     return this.form.get('vacunas') as FormArray;
//   }

//   crearVacunaForm(vacuna?: any): FormGroup {
//     return this.fb.group({
//       id_vacuna: [vacuna?.id_vacuna || null],
//       nombre_vacuna: [vacuna?.nombre_vacuna || '', Validators.required],
//       fecha_aplicacion: [
//         vacuna?.fecha_aplicacion ? vacuna.fecha_aplicacion.split('T')[0] : new Date().toISOString().split("T")[0],
//         Validators.required
//       ],
//       proxima_dosis: [vacuna?.proxima_dosis ? vacuna.proxima_dosis.split('T')[0] : ''],
//       sitio_aplicacion: [vacuna?.sitio_aplicacion || ''],
//       reacciones_adversas: [vacuna?.reacciones_adversas || '']
//     });
//   }

//   cargarVacunasExistentes() {
//     if (!this.consulta?.id_consulta) {
//       return;
//     }


//     this.vacunaServ.obtenerPorConsulta(this.consulta.id_consulta).subscribe({
//       next: (resp) => {
//         this.vacunasExistentes = resp.data || [];

//         if (this.vacunasExistentes.length > 0) {
//           this.vacunasArr.clear();

//           this.vacunasExistentes.forEach((vac, index) => {
//             this.vacunasArr.push(this.crearVacunaForm(vac));
//           });

//         } else {
//           console.log('No hay vacunas existentes');
//         }
//       },
//       error: (err) => {
//         console.error('Error al cargar vacunas:', err);
//       }
//     });
//   }

//   agregarVacuna() {
//     this.vacunasArr.push(this.crearVacunaForm());
//   }

//   quitarVacuna(index: number) {
//     const vacuna = this.vacunasArr.at(index).value;

//     if (vacuna.id_vacuna) {
//       this.vacunaServ.eliminar(vacuna.id_vacuna).subscribe({
//         next: () => {
//           this.vacunasArr.removeAt(index);
//         },
//         error: (err) => {
//           console.error(' Error al eliminar:', err);
//         }
//       });
//     } else {
//       this.vacunasArr.removeAt(index);
//     }
//   }

//   calcularProximaDosis(i: number) {
//     const vacuna = this.vacunasArr.at(i);

//     const nombre = vacuna.get('nombre_vacuna')?.value?.toLowerCase();
//     const fecha = new Date(vacuna.get('fecha_aplicacion')?.value);

//     if (!nombre || !fecha) return;

//     if (nombre.includes('rabia')) {
//       fecha.setFullYear(fecha.getFullYear() + 1);
//     } else if (nombre.includes('bordetella')) {
//       fecha.setMonth(fecha.getMonth() + 6);
//     } else if (nombre.includes('desparasit')) {
//       fecha.setMonth(fecha.getMonth() + 3);
//     } else {
//       fecha.setFullYear(fecha.getFullYear() + 1);
//     }

//     vacuna.get('proxima_dosis')?.setValue(fecha.toISOString().split("T")[0]);
//   }

//   guardar() {
//     if (this.form.invalid || !this.consulta?.id_consulta) return;

//     this.loading = true;

//     const payload = {
//       consulta_id: this.consulta.id_consulta,
//       vacunas: this.form.value.vacunas
//     };

//     this.vacunaServ.registrarVacunas(payload).subscribe({
//       next: (resp) => {
//         this.loading = false;
//         this.guardado.emit('ok');

//         if (this.modoEdicion) {
//           this.cargarVacunasExistentes();
//         } else {
//           this.form.reset();
//           this.vacunasArr.clear();
//           this.vacunasArr.push(this.crearVacunaForm());
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
import { VacunaService } from '../../../services/vacuna.service';
import { InventarioService } from '../../../services/inventario.service';

@Component({
  selector: 'app-tab-vacunas',
  standalone: true, // Asegúrate de que sea standalone si así lo usas
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-vacunas.component.html',
  styleUrl: './tab-vacunas.component.scss'
})
export class TabVacunasComponent implements OnInit, OnChanges {

  private inventarioService = inject(InventarioService);

  productosInventario: any[] = [];
  
  @Input() vacunas: any[] = [];
  @Input() consulta: any;
  @Input() modoEdicion = false;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;
  vacunasExistentes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private vacunaServ: VacunaService
  ) {}

  ngOnInit(): void {
    this.cargarInventario(); // Cargar productos al iniciar

    this.form = this.fb.group({
      vacunas: this.fb.array([
        this.crearVacunaForm()
      ])
    });

    if (this.consulta && this.modoEdicion) {
      this.cargarVacunasExistentes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consulta'] && this.consulta && this.modoEdicion && this.form) {
      this.cargarVacunasExistentes();
    }
  }

  // Cargar productos del inventario (Filtrando por vacunas si es posible)
  cargarInventario() {
    this.inventarioService.getProductos().subscribe({
      next: (resp) => {
        const todos = resp.data || [];
        // Filtro opcional: Mostrar solo lo que parezca vacuna
        // Ajusta la lógica según tus datos reales (ej. categoria_id)
        this.productosInventario = todos.filter((p: any) => 
           p.categoria_id === 2 || p.nombre.toLowerCase().includes('vacuna')
        );
      },
      error: (err) => console.error('Error cargando inventario', err)
    });
  }

  get vacunasArr(): FormArray {
    return this.form.get('vacunas') as FormArray;
  }

  crearVacunaForm(vacuna?: any): FormGroup {
    return this.fb.group({
      id_vacuna: [vacuna?.id_vacuna || null],
      nombre_vacuna: [vacuna?.nombre_vacuna || '', Validators.required],
      fecha_aplicacion: [
        vacuna?.fecha_aplicacion ? vacuna.fecha_aplicacion.split('T')[0] : new Date().toISOString().split("T")[0],
        Validators.required
      ],
      proxima_dosis: [vacuna?.proxima_dosis ? vacuna.proxima_dosis.split('T')[0] : ''],
      sitio_aplicacion: [vacuna?.sitio_aplicacion || ''],
      reacciones_adversas: [vacuna?.reacciones_adversas || ''],
      
      // CAMBIO IMPORTANTE: Agregamos el control para producto_id
      producto_id: [vacuna?.producto_id || null] 
    });
  }

  cargarVacunasExistentes() {
    if (!this.consulta?.id_consulta) {
      return;
    }

    this.vacunaServ.obtenerPorConsulta(this.consulta.id_consulta).subscribe({
      next: (resp) => {
        this.vacunasExistentes = resp.data || [];

        if (this.vacunasExistentes.length > 0) {
          this.vacunasArr.clear();

          this.vacunasExistentes.forEach((vac, index) => {
            this.vacunasArr.push(this.crearVacunaForm(vac));
          });

        } else {
          console.log('No hay vacunas existentes');
        }
      },
      error: (err) => {
        console.error('Error al cargar vacunas:', err);
      }
    });
  }

  agregarVacuna() {
    this.vacunasArr.push(this.crearVacunaForm());
  }

  quitarVacuna(index: number) {
    const vacuna = this.vacunasArr.at(index).value;

    if (vacuna.id_vacuna) {
      this.vacunaServ.eliminar(vacuna.id_vacuna).subscribe({
        next: () => {
          this.vacunasArr.removeAt(index);
        },
        error: (err) => {
          console.error(' Error al eliminar:', err);
        }
      });
    } else {
      this.vacunasArr.removeAt(index);
    }
  }

  calcularProximaDosis(i: number) {
    const vacuna = this.vacunasArr.at(i);

    const nombre = vacuna.get('nombre_vacuna')?.value?.toLowerCase();
    const fecha = new Date(vacuna.get('fecha_aplicacion')?.value);

    if (!nombre || !fecha) return;

    if (nombre.includes('rabia')) {
      fecha.setFullYear(fecha.getFullYear() + 1);
    } else if (nombre.includes('bordetella')) {
      fecha.setMonth(fecha.getMonth() + 6);
    } else if (nombre.includes('desparasit')) {
      fecha.setMonth(fecha.getMonth() + 3);
    } else {
      fecha.setFullYear(fecha.getFullYear() + 1);
    }

    vacuna.get('proxima_dosis')?.setValue(fecha.toISOString().split("T")[0]);
  }

  // Evento para autocompletar el nombre cuando eligen un producto
  onProductoChange(index: number) {
    const group = this.vacunasArr.at(index);
    const prodId = group.get('producto_id')?.value;
    
    if (prodId) {
      const producto = this.productosInventario.find(p => p.id === prodId);
      if (producto) {
        // Opcional: Rellenar el nombre automáticamente
        group.get('nombre_vacuna')?.setValue(producto.nombre);
        this.calcularProximaDosis(index);
      }
    }
  }

  guardar() {
    if (this.form.invalid || !this.consulta?.id_consulta) return;

    this.loading = true;

    const payload = {
      consulta_id: this.consulta.id_consulta,
      vacunas: this.form.value.vacunas
    };

    this.vacunaServ.registrarVacunas(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.guardado.emit('ok');

        if (this.modoEdicion) {
          this.cargarVacunasExistentes();
        } else {
          this.form.reset();
          this.vacunasArr.clear();
          this.vacunasArr.push(this.crearVacunaForm());
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}