import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
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
export class TabDiagnosticosComponent implements OnInit, OnChanges {

  @Input() consulta: any;
  @Input() modoEdicion = false;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;
  diagnosticosExistentes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private diagnosticosServ: DiagnosticoService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      diagnosticos: this.fb.array([
        this.crearDiagnosticoForm()
      ])
    });


    if (this.consulta && this.modoEdicion) {
      this.cargarDiagnosticosExistentes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consulta'] && this.consulta && this.modoEdicion && this.form) {
      console.log('ngOnChanges detectó cambio en consulta');
      this.cargarDiagnosticosExistentes();
    }
  }

  get diagnosticosArr(): FormArray {
    return this.form.get('diagnosticos') as FormArray;
  }

  crearDiagnosticoForm(diagnostico?: any): FormGroup {
    return this.fb.group({
      id_diagnostico: [diagnostico?.id_diagnostico || null],
      descripcion: [diagnostico?.descripcion || '', Validators.required],
      tipo: [diagnostico?.tipo || 'Primario', Validators.required],
    });
  }

  cargarDiagnosticosExistentes() {
    if (!this.consulta?.id_consulta) {
      console.log('No hay consulta.id_consulta');
      return;
    }

    console.log('Cargando diagnósticos para consulta:', this.consulta.id_consulta);

    this.diagnosticosServ.getDiagnosticosPorConsulta(this.consulta.id_consulta).subscribe({
      next: (resp) => {
        this.diagnosticosExistentes = resp.data || [];
        console.log('Diagnósticos recibidos del backend:', this.diagnosticosExistentes);

        if (this.diagnosticosExistentes.length > 0) {
          this.diagnosticosArr.clear();

          this.diagnosticosExistentes.forEach((diag, index) => {
            this.diagnosticosArr.push(this.crearDiagnosticoForm(diag));
          });

        } else {
          console.log('No hay diagnósticos existentes');
        }
      },
      error: (err) => {
        console.error(' Error al cargar diagnósticos:', err);
      }
    });
  }

  agregarDiagnostico() {
    this.diagnosticosArr.push(this.crearDiagnosticoForm());
  }

  quitarDiagnostico(index: number) {
    const diagnostico = this.diagnosticosArr.at(index).value;

    if (diagnostico.id_diagnostico) {
      this.diagnosticosServ.deleteDiagnostico(diagnostico.id_diagnostico).subscribe({
        next: () => {
          console.log('Diagnóstico eliminado del backend');
          this.diagnosticosArr.removeAt(index);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
        }
      });
    } else {
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
        console.log('Diagnósticos guardados:', resp);
        this.loading = false;
        this.guardado.emit('ok');

        if (this.modoEdicion) {
          this.cargarDiagnosticosExistentes();
        } else {
          this.form.reset();
          this.diagnosticosArr.clear();
          this.diagnosticosArr.push(this.crearDiagnosticoForm());
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
