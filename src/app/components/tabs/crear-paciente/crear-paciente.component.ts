import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteService } from '../../../services/paciente.service';
import { ExpedienteService } from '../../../services/expediente.service';

@Component({
  selector: 'app-crear-paciente',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './crear-paciente.component.html',
  styleUrl: './crear-paciente.component.scss'
})
export class CrearPacienteComponent {

  @Input() cita: any;
  @Output() pacienteCreado = new EventEmitter<{ paciente: any, expediente: any }>();

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private expedienteService: ExpedienteService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      raza: [''],
      edad: [null],
      peso: [null]
    });
  }

  guardar() {
    if (this.form.invalid) return;

    this.loading = true;

    const pacientePayload = {
      cliente_id: this.cita.cliente_id,
      nombre: this.form.value.nombre,
      animal_id: this.cita.animal_id,
      raza: this.form.value.raza,
      edad: this.form.value.edad,
      peso: this.form.value.peso
    };

    this.pacienteService.postPaciente(pacientePayload).subscribe({
      next: (respPaciente) => {
        const paciente = respPaciente.data;

        const expedientePayload = {
          paciente_id: paciente.id,
          observaciones_generales: ''
        };

        this.expedienteService.postExpediente(expedientePayload).subscribe({
          next: (respExp) => {
            this.loading = false;

            const expediente = respExp.data;

            this.pacienteCreado.emit({
              paciente,
              expediente
            });

            
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }
}
