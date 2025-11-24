import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcedimientoService } from '../../../services/procedimiento.service';

@Component({
  selector: 'app-tab-procedimientos',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-procedimientos.component.html',
  styleUrl: './tab-procedimientos.component.scss'
})
export class TabProcedimientosComponent {

  @Input() consulta: any;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private procedimientoServ: ProcedimientoService
  ) {}

  ngOnInit(): void {
    if (!this.consulta) return;

    this.form = this.fb.group({
      procedimientos: this.fb.array([
        this.crearProcedimientoForm()
      ])
    });
  }

  get procedimientosArr(): FormArray {
    return this.form.get('procedimientos') as FormArray;
  }

  crearProcedimientoForm(): FormGroup {
    return this.fb.group({
      tipo_procedimiento: [''],
      nombre_procedimiento: ['', Validators.required],
      descripcion: [''],
      fecha_realizacion: [new Date().toISOString().split('T')[0]],
      hora_inicio: [''],
      hora_fin: [''],
      anestesia_utilizada: [''],
      complicaciones: [''],
      observaciones: ['']
    });
  }

  agregarProcedimiento() {
    this.procedimientosArr.push(this.crearProcedimientoForm());
  }

  quitarProcedimiento(index: number) {
    if (this.procedimientosArr.length > 1) {
      this.procedimientosArr.removeAt(index);
    }
  }

  guardar() {
    if (this.form.invalid || !this.consulta?.id_consulta) return;

    this.loading = true;

    const payload = {
      consulta_id: this.consulta.id_consulta,
      procedimientos: this.form.value.procedimientos
    };

    this.procedimientoServ.registrarProcedimientos(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.guardado.emit(resp.data);

        this.form.reset();
        this.form.setControl('procedimientos', this.fb.array([
          this.crearProcedimientoForm()
        ]));
        this.guardado.emit('ok');

      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
