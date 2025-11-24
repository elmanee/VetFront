import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiagnosticoService } from '../../../services/diagnostico.service';

@Component({
  selector: 'app-tab-diagnosticos',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-diagnosticos.component.html',
  styleUrl: './tab-diagnosticos.component.scss'
})
export class TabDiagnosticosComponent {

  @Input() consulta: any;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private diagnosticosServ: DiagnosticoService
  ) {}

  ngOnInit(): void {

    // Si no hay consulta aún, no cargamos nada
    if (!this.consulta) return;

    this.form = this.fb.group({
      diagnosticos: this.fb.array([
        this.crearDiagnosticoForm()
      ])
    });
  }

  get diagnosticosArr(): FormArray {
    return this.form.get('diagnosticos') as FormArray;
  }

  crearDiagnosticoForm(): FormGroup {
    return this.fb.group({
      descripcion: ['', Validators.required],
      tipo: ['Primario', Validators.required],
    });
  }

  agregarDiagnostico() {
    this.diagnosticosArr.push(this.crearDiagnosticoForm());
  }

  quitarDiagnostico(index: number) {
    if (this.diagnosticosArr.length > 1) {
      this.diagnosticosArr.removeAt(index);
    }
  }

  guardar() {
    if (this.form.invalid || !this.consulta?.id_consulta) return;

    this.loading = true;

    const payload = {
      consulta_id: this.consulta.id_consulta,
      diagnosticos: this.form.value.diagnosticos
    };

    this.diagnosticosServ.registrarDiagnosticos(payload).subscribe({
      next: (resp) => {
        this.loading = false;

        this.guardado.emit(resp.data);

        this.form.reset();
        this.form.setControl('diagnosticos', this.fb.array([this.crearDiagnosticoForm()]));
        this.guardado.emit('ok');

      },
      error: () => {
        this.loading = false;
      }
    });
  }

}
