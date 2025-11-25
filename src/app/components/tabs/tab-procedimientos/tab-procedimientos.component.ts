import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
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
export class TabProcedimientosComponent implements OnInit, OnChanges {

  @Input() consulta: any;
  @Input() modoEdicion = false;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;
  procedimientosExistentes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private procedimientoServ: ProcedimientoService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      procedimientos: this.fb.array([
        this.crearProcedimientoForm()
      ])
    });
    if (this.consulta && this.modoEdicion) {
      this.cargarProcedimientosExistentes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consulta'] && this.consulta && this.modoEdicion && this.form) {
      this.cargarProcedimientosExistentes();
    }
  }

  get procedimientosArr(): FormArray {
    return this.form.get('procedimientos') as FormArray;
  }

  crearProcedimientoForm(procedimiento?: any): FormGroup {
    return this.fb.group({
      id_procedimiento: [procedimiento?.id_procedimiento || null],
      tipo_procedimiento: [procedimiento?.tipo_procedimiento || ''],
      nombre_procedimiento: [procedimiento?.nombre_procedimiento || '', Validators.required],
      descripcion: [procedimiento?.descripcion || ''],
      fecha_realizacion: [
        procedimiento?.fecha_realizacion ? procedimiento.fecha_realizacion.split('T')[0] : new Date().toISOString().split('T')[0]
      ],
      hora_inicio: [procedimiento?.hora_inicio || ''],
      hora_fin: [procedimiento?.hora_fin || ''],
      anestesia_utilizada: [procedimiento?.anestesia_utilizada || ''],
      complicaciones: [procedimiento?.complicaciones || ''],
      observaciones: [procedimiento?.observaciones || '']
    });
  }

  cargarProcedimientosExistentes() {
    if (!this.consulta?.id_consulta) {
      return;
    }


    this.procedimientoServ.obtenerPorConsulta(this.consulta.id_consulta).subscribe({
      next: (resp) => {
        this.procedimientosExistentes = resp.data || [];

        if (this.procedimientosExistentes.length > 0) {
          this.procedimientosArr.clear();

          this.procedimientosExistentes.forEach((proc, index) => {
            this.procedimientosArr.push(this.crearProcedimientoForm(proc));
          });

        } else {
          console.log('No hay procedimientos existentes');
        }
      },
      error: (err) => {
        console.error('Error al cargar procedimientos:', err);
      }
    });
  }

  agregarProcedimiento() {
    this.procedimientosArr.push(this.crearProcedimientoForm());
  }

  quitarProcedimiento(index: number) {
    const procedimiento = this.procedimientosArr.at(index).value;

    if (procedimiento.id_procedimiento) {
      this.procedimientoServ.eliminar(procedimiento.id_procedimiento).subscribe({
        next: () => {
          this.procedimientosArr.removeAt(index);
        },
        error: (err) => {
          console.error(' Error al eliminar:', err);
        }
      });
    } else {
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
        this.guardado.emit('ok');

        if (this.modoEdicion) {
          this.cargarProcedimientosExistentes();
        } else {
          this.form.reset();
          this.procedimientosArr.clear();
          this.procedimientosArr.push(this.crearProcedimientoForm());
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
