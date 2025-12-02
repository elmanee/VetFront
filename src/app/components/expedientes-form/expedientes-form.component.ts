import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CrearPacienteComponent } from '../tabs/crear-paciente/crear-paciente.component';
import { TabConsultaComponent } from '../tabs/tab-consulta/tab-consulta.component';
import { TabDiagnosticosComponent } from '../tabs/tab-diagnosticos/tab-diagnosticos.component';
import { TabTratamientosComponent } from "../tabs/tab-tratamientos/tab-tratamientos.component";
import { TabVacunasComponent } from "../tabs/tab-vacunas/tab-vacunas.component";
import { TabProcedimientosComponent } from "../tabs/tab-procedimientos/tab-procedimientos.component";
import { TabImagenesComponent } from "../tabs/tab-imagenes/tab-imagenes.component";
import { ModalExpedientesListaComponent } from '../modal-expedientes-lista/modal-expedientes-lista.component';
import { ExpedienteService } from '../../services/expediente.service';
import { PacienteService } from '../../services/paciente.service';
import { AlertsService } from '../../shared/services/alerts.service';
import { CitasService } from '../../services/citas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expedientes-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrearPacienteComponent,
    TabConsultaComponent,
    TabDiagnosticosComponent,
    TabTratamientosComponent,
    TabVacunasComponent,
    TabProcedimientosComponent,
    TabImagenesComponent,
    ModalExpedientesListaComponent
  ],
  templateUrl: './expedientes-form.component.html',
  styleUrl: './expedientes-form.component.scss'
})
export class ExpedientesFormComponent implements OnInit {

  cita: any = null;
  paciente: any = null;
  expediente: any = null;
  consulta: any = null;

  form!: FormGroup;
  loading = false;
  cargandoDatos = false;

  mostrarCrearPaciente = false;
  mostrarTabs = false;

  // Control de tabs
  tabActiva = 'paciente';
  tabs = {
    paciente: true,
    consulta: false,
    diagnosticos: false,
    tratamientos: false,
    vacunas: false,
    procedimientos: false,
    imagenes: false
  };

  // Modal de expedientes
  expedientesDisponibles: any[] = [];
  mostrarModalExpedientes = false;

  // Modo edición
  modoEdicion = false;
  expedienteCompleto: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private citasService: CitasService,
    private pacienteService: PacienteService,
    private expedienteService: ExpedienteService,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCita();
  }

  inicializarFormulario() {
    this.form = this.fb.group({
      observaciones: ['']
    });
  }

  cargarCita() {
    const citaId = this.route.snapshot.paramMap.get('id');

    if (!citaId) {
      this.alertsService.showErrorAlert('Error', 'No se proporcionó ID de cita');
      this.router.navigate(['/veterinario/mis-citas']);
      return;
    }

    this.cargandoDatos = true;

    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        this.cita = citas.find(c => c.id_cita === parseInt(citaId));

        if (!this.cita) {
          this.alertsService.showErrorAlert('Error', 'Cita no encontrada');
          this.router.navigate(['/mis-citas']);
          return;
        }

        console.log('cita cargada:', this.cita);

        // Si tiene mascota_id, cargar paciente y verificar expedientes
        if (this.cita.mascota_id) {
          this.verificarExpedientesExistentes();
        } else {
          // Mostrar formulario de crear paciente
          this.mostrarCrearPaciente = true;
          this.cargandoDatos = false;
        }
      },
      error: () => {
        this.cargandoDatos = false;
        this.alertsService.showErrorAlert('Error', 'Error al cargar cita');
        this.router.navigate(['/veterinario/mis-citas']);
      }
    });
  }

  verificarExpedientesExistentes() {
    console.log('Verificando expedientes para paciente:', this.cita.mascota_id);

    // Cargar paciente
    this.pacienteService.getPaciente(this.cita.mascota_id).subscribe({
      next: (resp) => {
        this.paciente = resp.data;
        console.log('Paciente cargado:', this.paciente);

        // Buscar expedientes del paciente
        this.expedienteService.getExpedientesPorPaciente(this.paciente.id).subscribe({
          next: (respExp) => {
            this.expedientesDisponibles = respExp.data;
            console.log('Expedientes encontrados:', this.expedientesDisponibles);

            this.cargandoDatos = false;

            if (this.expedientesDisponibles.length > 0) {
              // Mostrar alerta de expedientes existentes
              this.mostrarAlertaExpedientes();
            } else {
              // Crear nuevo expediente
              this.crearExpedienteParaPacienteExistente();
            }
          },
          error: (err) => {
            console.error('Error al buscar expedientes:', err);
            this.cargandoDatos = false;
            this.crearExpedienteParaPacienteExistente();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar paciente:', err);
        this.cargandoDatos = false;
      }
    });
  }

  mostrarAlertaExpedientes() {
    this.alertsService.showExpedientesExistentesAlert().then((result) => {
      if (result.isDenied) {
        // Ver expedientes existentes
        console.log('Usuario eligió ver expedientes existentes');
        this.mostrarModalExpedientes = true;
      } else if (result.isConfirmed) {
        // Crear nuevo expediente
        this.crearExpedienteParaPacienteExistente();
      } else {
        // Cancelar - volver a mis citas
        console.log('Usuario canceló');
        this.router.navigate(['/mis-citas']);
      }
    });
  }

  onExpedienteSeleccionado(expediente: any) {
    console.log('Expediente seleccionado:', expediente);
    this.mostrarModalExpedientes = false;
    this.cargandoDatos = true;

    // Cargar expediente completo
    this.expedienteService.getExpedienteCompleto(expediente.id_expediente).subscribe({
      next: (resp) => {
        this.expedienteCompleto = resp.data;
        this.expediente = this.expedienteCompleto;
        this.modoEdicion = true; // ACTIVAR MODO EDICIÓN

        console.log('Expediente completo cargado:', this.expedienteCompleto);

        // Pre-llenar datos de la última consulta si existe
        if (this.expedienteCompleto.ultima_consulta) {
          this.consulta = this.expedienteCompleto.ultima_consulta;
        }

        this.habilitarTodosLosTabs();
        this.mostrarTabs = true;
        this.tabActiva = 'consulta';
        this.cargandoDatos = false;

        this.alertsService.showSuccessAlert(
          'Expediente Cargado',
          'Puedes editar o agregar nueva información'
        );
      },
      error: (err) => {
        console.error('Error al cargar expediente completo:', err);
        this.cargandoDatos = false;
        this.alertsService.showErrorAlert('Error', 'Error al cargar expediente completo');
      }
    });
  }

  onCrearNuevoExpedienteDesdeModal() {
    this.mostrarModalExpedientes = false;
    this.crearExpedienteParaPacienteExistente();
  }

  onCerrarModal() {
    console.log('❌ Cerrar modal y volver');
    this.mostrarModalExpedientes = false;
    this.router.navigate(['/veterinario/mis-citas']);
  }

  crearExpedienteParaPacienteExistente() {
    const payload = {
      paciente_id: this.paciente.id,
      observaciones_generales: `Expediente creado para cita del ${new Date().toLocaleDateString()}`
    };

    this.expedienteService.postExpediente(payload).subscribe({
      next: (resp) => {
        this.expediente = resp.data;
        this.modoEdicion = false;
        this.tabs.consulta = true;
        this.mostrarTabs = true;
        this.tabActiva = 'consulta';

        this.alertsService.showSuccessAlert('Expediente creado', 'Ahora puedes registrar la consulta');
      },
      error: (err) => {
        console.error('Error al crear expediente:', err);
        this.alertsService.showErrorAlert('Error', 'Error al crear expediente');
      }
    });
  }

  onPacienteCreado(evento: { paciente: any; expediente: any }) {
    this.paciente = evento.paciente;
    this.expediente = evento.expediente;
    this.modoEdicion = false;

    this.mostrarCrearPaciente = false;
    this.tabs.consulta = true;
    this.mostrarTabs = true;
    this.tabActiva = 'consulta';

    this.alertsService.showSuccessAlert(
      'Paciente registrado',
      'Ahora puedes registrar la consulta'
    );
  }

  onConsultaCreada(consulta: any) {
    this.consulta = consulta;

    this.habilitarTodosLosTabs();
    this.goToNextTab();
  }

  habilitarTodosLosTabs() {
    this.tabs = {
      paciente: true,
      consulta: true,
      diagnosticos: true,
      tratamientos: true,
      vacunas: true,
      procedimientos: true,
      imagenes: true
    };
  }

  cambiarTab(tab: string) {
    if (this.tabs[tab as keyof typeof this.tabs]) {
      this.tabActiva = tab;
    }
  }

  goToNextTab() {
    const orden = ['consulta', 'diagnosticos', 'tratamientos', 'vacunas', 'procedimientos', 'imagenes'];
    const indiceActual = orden.indexOf(this.tabActiva);

    if (indiceActual < orden.length - 1) {
      this.tabActiva = orden[indiceActual + 1];
    }
  }

  async finalizarAtencion() {
      const idCita = this.cita?.id_cita;

      if (!idCita) {
          this.alertsService.showErrorAlert('Error', 'No se puede obtener el ID de la cita para finalizar.');
          return;
      }

      const result = await Swal.fire({
          title: 'Confirmar Finalización',
          text: '¿Está seguro de que desea marcar la consulta como COMPLETADA? Se enviará una notificación al cliente.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#FFC040',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, Completar',
          cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
          this.loading = true;

          this.citasService.finalizarCita(idCita).subscribe({
              next: (resp) => {
                  this.loading = false;
                  Swal.fire(
                      '¡Consulta Finalizada!',
                      'La cita ha sido marcada como COMPLETADA y el cliente ha sido notificado.',
                      'success'
                  ).then(() => {
                      this.router.navigate(['/veterinario/mis-citas']);
                  });
              },
              error: (err) => {
                  this.loading = false;
                  console.error('Error al finalizar la cita:', err);
                  const message = err.error?.message || 'Ocurrió un error al intentar completar la cita.';
                  this.alertsService.showErrorAlert(
                      'Error al Finalizar',
                      message
                  );
              }
          });
      }
  }

  volver() {
    this.router.navigate(['/veterinario/mis-citas']);
  }
}
