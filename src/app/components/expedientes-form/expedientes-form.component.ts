import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrearPacienteComponent } from '../tabs/crear-paciente/crear-paciente.component';
import { TabConsultaComponent } from '../tabs/tab-consulta/tab-consulta.component';
import { TabDiagnosticosComponent } from '../tabs/tab-diagnosticos/tab-diagnosticos.component';
import { TabTratamientosComponent } from "../tabs/tab-tratamientos/tab-tratamientos.component";
import { TabVacunasComponent } from "../tabs/tab-vacunas/tab-vacunas.component";
import { TabProcedimientosComponent } from "../tabs/tab-procedimientos/tab-procedimientos.component";
import { TabImagenesComponent } from "../tabs/tab-imagenes/tab-imagenes.component";

@Component({
  selector: 'app-expedientes-form',
  imports: [
    CommonModule, CrearPacienteComponent,
    TabConsultaComponent, TabDiagnosticosComponent,
    TabTratamientosComponent,
    TabVacunasComponent,
    TabProcedimientosComponent,
    TabImagenesComponent
],
  templateUrl: './expedientes-form.component.html',
  styleUrl: './expedientes-form.component.scss'
})
export class ExpedientesFormComponent {
  currentTab = 'consulta';

  tabsOrder = [
    'consulta',
    'diagnosticos',
    'tratamientos',
    'vacunas',
    'procedimientos',
    'imagenes'
  ];

  tabs = {
    consulta: false,
    diagnosticos: false,
    tratamientos: false,
    vacunas: false,
    procedimientos: false,
    imagenes: false
  };

  // Datos cargados
  cita: any = null;
  paciente: any = null;
  expediente: any = null;
  consulta: any = null;

  // Control de flujo visual
  mostrarCrearPaciente = false;
  mostrarTabs = false;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.cita = nav?.extras.state?.['cita'] || null;
  }

  ngOnInit(): void {

    // Si entraron sin datos, regresamos
    if (!this.cita) {
      this.router.navigate(['/veterinario/mis-citas']);
      return;
    }

    // Determinar si primero se crea paciente o no
    if (!this.cita.mascota_id) {
      this.mostrarCrearPaciente = true;
    } else {
      // Ya tiene paciente → mostrar tabs
      this.mostrarTabs = true;
    }
  }

  onPacienteCreado(event: any) {
    this.paciente = event.paciente;
    this.expediente = event.expediente;

    this.tabs.consulta = true;
    this.mostrarCrearPaciente = false;
    this.mostrarTabs = true;

    setTimeout(() => {
      document.getElementById('btn_consulta')?.click();
    }, 100);
  }


  onConsultaCreada(consulta: any) {
    this.consulta = consulta;

    this.tabs.diagnosticos = true;
    this.tabs.tratamientos = true;
    this.tabs.vacunas = true;
    this.tabs.procedimientos = true;
    this.tabs.imagenes = true;

    setTimeout(() => {
      document.getElementById('btnDiagnosticos')?.click();
    }, 150);
  }

  onDiagnosticosGuardados(event: any) {
    console.log('Diagnósticos guardados:', event);
  }

  onProcedimientosGuardados(data: any) {
  console.log('Procedimientos guardados:', data);
}

onImagenesGuardadas(data: any) {
  console.log("Imágenes guardadas:", data);
}
goToNextTab() {
  const index = this.tabsOrder.indexOf(this.currentTab);

  if (index < this.tabsOrder.length - 1) {
    this.currentTab = this.tabsOrder[index + 1];

    setTimeout(() => {
      document.getElementById(`btn_${this.currentTab}`)?.click();
    }, 150);
  } else {
    this.finalizarExpediente();
  }
}

finalizarExpediente() {
  this.router.navigate(['/veterinario/mis-citas']);
}

finalizarAtencion() {
  this.router.navigate(['/veterinario/mis-citas']);
}

}
