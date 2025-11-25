import { Routes } from '@angular/router';
import { _DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './authentication/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { LayoutAdminComponent } from './shared/admin/layout-admin/layout-admin.component';
import { CitaFormComponent } from './components/home/citas/cita-form/cita-form.component';
import { AgendaViewComponent } from './components/home/citas/agenda-view/agenda-view.component';
import { SolicitarcitaComponent } from './components/home/citas/solicitarcita/solicitarcita.component';
import { CitasAtenderComponent } from './components/home/citas/citas-atender/citas-atender.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { AuthGuard } from '../guards/auth.guard';
import { LotesComponent } from './components/lotes/lotes.component';
import { MovimientosComponent } from './components/movimientos/movimientos.component';
import { RegistroPersonalComponent } from './authentication/registro-personal/registro-personal.component';
import { MisCitasVetComponent } from './components/mis-citas-vet/mis-citas-vet.component';
import { LayoutVeterinarioComponent } from './shared/veterinario/layout-veterinario/layout-veterinario.component';
import { ExpedientesComponent } from './components/expedientes/expedientes.component';
import { ExpedientesFormComponent } from './components/expedientes-form/expedientes-form.component';
import { ExpedienteDetalleComponent } from './components/expedientes/expediente-detalle/expediente-detalle.component';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    component: _DashboardComponent,
    title: 'Pet Health+'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión | Pet Health+'
  },
  {
    path: 'registro-personal',
    component: RegistroPersonalComponent,
    title: 'Registro de Personal | Veterinaria "El Morralito"'
  },
  {
    path: 'dashboard',
    component: _DashboardComponent,
    title: 'Dashboard | Pet Health+'
  },

  // RQF01 - Gestión de Citas
  {
    path: 'solicitar-cita',
    component: SolicitarcitaComponent,
    title: 'Solicitar Cita | Pet Health+'
  },
  {
    path: 'registrar-cita',
    component: CitaFormComponent,
    title: 'Registrar Cita | Pet Health+'
  },
  {
    path: 'agenda',
    component: AgendaViewComponent,
    title: 'Agenda de Citas | Pet Health+'
  },

  {
    path: 'citas-atender',
    component: CitasAtenderComponent,
    title: 'Citas por Atender | Pet Health+'
  },

  // // RQF02 - Expedientes Médicos
  // {
  //   path: 'expediente/registrar-consulta',
  //   // component: ,
  //   title: 'Registrar Consulta | Pet Health+'
  // },
  // {
  //   path: 'expedientes/buscar',
  //   // component: ,
  //   title: 'Buscar Expedientes | Pet Health+'
  // },
  // {
  //   path: 'expediente/ver/:id',
  //   // component: ,
  //   title: 'Ver Expediente | Pet Health+'
  // },

  {
    path: 'veterinario',
    component: LayoutVeterinarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Veterinario'] },
    children: [
      {
        path: '',
        redirectTo: 'mis-citas',
        pathMatch: 'full'
      },
      {
        path: 'mis-citas',
        component: MisCitasVetComponent
      },
      {
        path: 'expedientes',
        component: ExpedientesComponent
      },
      {
        path: 'expedientes-form/:id',
        component:ExpedientesFormComponent
      },
      {
        path: 'expedientes/detalle/:id',
        component: ExpedienteDetalleComponent
      }

    ]
  },

  // Área de administración
  {
    path: 'admin',
    component: LayoutAdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
    children: [
      {
        path: '',
        redirectTo: 'das-admin',
        pathMatch: 'full'
      },
      {
        path: 'das-admin',
        component: DashboardAdminComponent
      },
      {
        path: 'inventario',
        component: InventarioComponent,
        title: 'Inventario | Pet Health+ Admin'
      },
      {
        path: 'registrar-cita',
        component: CitaFormComponent,
        title: 'Registrar Cita | Pet Health+ Admin'
      },
      {
        path: 'agenda',
        component: AgendaViewComponent,
        title: 'Agenda de Citas | Pet Health+ Admin'
      },
      {
        path: 'citas-atender',
        component: CitasAtenderComponent,
        title: 'Citas por Atender | Pet Health+ Admin'
      },
      // {
      //   path: 'expedientes/buscar',
      //   // component: ,
      //   title: 'Buscar Expedientes | Pet Health+ Admin'
      // },
      // {
      //   path: 'expediente/ver/:id',
      //   // component: ,
      //   title: 'Ver Expediente | Pet Health+ Admin'
      // },
      // {
      //   path: 'expediente/registrar-consulta',
      //   // component: ,
      //   title: 'Registrar Consulta | Pet Health+ Admin'
      // },
      {
        path: 'lotes',
        component: LotesComponent,
        title: 'Lotes | Pet Health+ Admin'
      },
      {
        path: 'movimientos',
        component: MovimientosComponent,
        title: 'Moviemintos | El Morralito'
      },
    ]
  },

  {
    path: '**',
    component: ErrorComponent,
    title: 'Página no encontrada | Pet Health+'
  }
];
