import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class TabVacunasComponent {

  @Input() consulta: any;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private vacunaServ: VacunaService
  ) {}

  ngOnInit(): void {

    if (!this.consulta) return;

    this.form = this.fb.group({
      vacunas: this.fb.array([
        this.crearVacunaForm()
      ])
    });
  }

  get vacunasArr(): FormArray {
    return this.form.get('vacunas') as FormArray;
  }

  crearVacunaForm(): FormGroup {
    return this.fb.group({
      nombre_vacuna: ['', Validators.required],
      fecha_aplicacion: [new Date().toISOString().split("T")[0], Validators.required],
      proxima_dosis: [''],
      sitio_aplicacion: [''],
      reacciones_adversas: ['']
    });
  }

  agregarVacuna() {
    this.vacunasArr.push(this.crearVacunaForm());
  }

  quitarVacuna(index: number) {
    if (this.vacunasArr.length > 1) {
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
        this.guardado.emit(resp.data);

        this.form.reset();
        this.form.setControl('vacunas', this.fb.array([this.crearVacunaForm()]));
        this.guardado.emit('ok');

      },
      error: () => {
        this.loading = false;
      }
    });
  }

}
