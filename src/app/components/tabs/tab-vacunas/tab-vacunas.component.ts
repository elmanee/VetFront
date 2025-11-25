import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VacunaService } from '../../../services/vacuna.service';

@Component({
  selector: 'app-tab-vacunas',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-vacunas.component.html',
  styleUrl: './tab-vacunas.component.scss'
})
export class TabVacunasComponent implements OnInit, OnChanges {

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
      reacciones_adversas: [vacuna?.reacciones_adversas || '']
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
