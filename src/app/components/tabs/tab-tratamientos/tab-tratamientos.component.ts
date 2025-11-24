import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TratamientoService } from '../../../services/tratamiento.service';

@Component({
  selector: 'app-tab-tratamientos',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-tratamientos.component.html',
  styleUrl: './tab-tratamientos.component.scss'
})
export class TabTratamientosComponent {

  @Input() consulta: any;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private tratamientoServ: TratamientoService
  ) {}

  ngOnInit(): void {

    if (!this.consulta) return;

    this.form = this.fb.group({
      tratamientos: this.fb.array([
        this.crearTratamientoForm()
      ])
    });
  }

  get tratamientosArr(): FormArray {
    return this.form.get('tratamientos') as FormArray;
  }

  crearTratamientoForm(): FormGroup {
    return this.fb.group({
      medicamento: ['', Validators.required],
      dosis: ['', Validators.required],
      frecuencia: ['', Validators.required],
      duracion_dias: [null],
      via_administracion: [''],
      indicaciones: ['']
    });
  }

  agregarTratamiento() {
    this.tratamientosArr.push(this.crearTratamientoForm());
  }

  quitarTratamiento(index: number) {
    if (this.tratamientosArr.length > 1) {
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

        this.guardado.emit(resp.data);

        this.form.reset();
        this.form.setControl('tratamientos', this.fb.array([this.crearTratamientoForm()]));
        this.guardado.emit('ok');

      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
