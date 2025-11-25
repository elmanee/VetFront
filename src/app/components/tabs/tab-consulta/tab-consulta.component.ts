import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
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
export class TabConsultaComponent implements OnInit, OnChanges {

  @Input() cita: any;
  @Input() expediente: any;
  @Input() modoEdicion = false;
  @Input() consultaExistente: any;

  @Output() consultaCreada = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private consultaService: ConsultaService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    if (this.consultaExistente) {
      this.cargarDatosConsulta();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultaExistente'] && this.consultaExistente && this.form) {
      console.log('ngOnChanges detectó cambio en consultaExistente');
      this.cargarDatosConsulta();
    }
  }

  inicializarFormulario() {
    this.form = this.fb.group({
      peso_actual: [null],
      temperatura: [null],
      frecuencia_cardiaca: [null],
      frecuencia_respiratoria: [null],
      motivo_consulta: [this.cita?.motivo || '', Validators.required],
      sintomas: [''],
      observaciones: ['']
    });
  }

  cargarDatosConsulta() {
    if (!this.consultaExistente) {
      console.log('No hay consultaExistente para cargar');
      return;
    }

    console.log('Cargando datos de consulta existente:', this.consultaExistente);

    this.form.patchValue({
      peso_actual: this.consultaExistente.peso_actual,
      temperatura: this.consultaExistente.temperatura,
      frecuencia_cardiaca: this.consultaExistente.frecuencia_cardiaca,
      frecuencia_respiratoria: this.consultaExistente.frecuencia_respiratoria,
      motivo_consulta: this.consultaExistente.motivo_consulta,
      sintomas: this.consultaExistente.sintomas,
      observaciones: this.consultaExistente.observaciones
    });

    console.log('Datos de consulta cargados en el formulario');
  }

  guardarConsulta() {
    if (this.form.invalid || !this.expediente || !this.cita || !this.expediente.id_expediente) {
      console.log('Formulario inválido o faltan datos');
      return;
    }

    this.loading = true;

    const payload = {
      expediente_id: this.expediente.id_expediente,
      veterinario_id: this.cita.veterinario_id,
      fecha_consulta: new Date().toISOString().split('T')[0],
      ...this.form.value
    };

    console.log('Enviando consulta:', payload);

    this.consultaService.postConsulta(payload).subscribe({
      next: (resp) => {
        console.log('Consulta creada:', resp);
        this.loading = false;
        this.consultaCreada.emit(resp.data);
      },
      error: (err) => {
        console.error('Error al guardar consulta:', err);
        this.loading = false;
      }
    });
  }
}
