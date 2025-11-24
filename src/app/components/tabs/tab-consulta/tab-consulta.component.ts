import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsultaService } from '../../../services/consulta.service';

@Component({
  selector: 'app-tab-consulta',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-consulta.component.html',
  styleUrl: './tab-consulta.component.scss'
})
export class TabConsultaComponent {

  @Input() cita: any;
  @Input() expediente: any;
  @Output() consultaCreada = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private consultaService: ConsultaService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      peso_actual: [null],
      temperatura: [null],
      frecuencia_cardiaca: [null],
      frecuencia_respiratoria: [null],
      motivo_consulta: [this.cita?.motivo || '', Validators.required],
      sintomas: [''],
      observaciones: ['Revisar en 7 días']
    });
  }

  guardarConsulta() {
    if (this.form.invalid || !this.expediente || !this.cita || !this.expediente.id_expediente) return;

    this.loading = true;

    const payload = {
      expediente_id: this.expediente.id_expediente,
      veterinario_id: this.cita.veterinario_id,
      fecha_consulta: new Date().toISOString().split('T')[0],
      ...this.form.value
    };

    this.consultaService.postConsulta(payload).subscribe({
      next: (resp) => {
        console.log('log de crear la consulta',resp);

        this.loading = false;
        this.consultaCreada.emit(resp.data);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
