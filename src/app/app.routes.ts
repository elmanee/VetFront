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
import { ExpedienteFormComponent } from './components/expedientes/expediente-form/expediente-form.component';
import { BuscarExpedienteComponent } from './components/expedientes/buscar-expediente/buscar-expediente.component';
import { ExpedienteViewComponent } from './components/expedientes/expediente-view/expediente-view.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { AuthGuard } from '../guards/auth.guard';
import { LotesComponent } from './components/lotes/lotes.component';
import { MovimientosComponent } from './components/movimientos/movimientos.component';

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

  // RQF02 - Expedientes Médicos
  {
    path: 'expediente/registrar-consulta',
    component: ExpedienteFormComponent,
    title: 'Registrar Consulta | Pet Health+'
  },
  {
    path: 'expedientes/buscar',
    component: BuscarExpedienteComponent,
    title: 'Buscar Expedientes | Pet Health+'
  },
  {
    path: 'expediente/ver/:id',
    component: ExpedienteViewComponent,
    title: 'Ver Expediente | Pet Health+'
  },

  // Área de administración
  {
    path: 'admin',
    component: LayoutAdminComponent,
    canActivate: [AuthGuard],
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
      {
        path: 'expedientes/buscar',
        component: BuscarExpedienteComponent,
        title: 'Buscar Expedientes | Pet Health+ Admin'
      },
      {
        path: 'expediente/ver/:id',
        component: ExpedienteViewComponent,
        title: 'Ver Expediente | Pet Health+ Admin'
      },
      {
        path: 'expediente/registrar-consulta',
        component: ExpedienteFormComponent,
        title: 'Registrar Consulta | Pet Health+ Admin'
      },
      {
        path: 'lotes',
        component: LotesComponent,
        title: 'Lotes | Pet Health+ Admin'
      },
      {
        path: 'movimientos',
        component: MovimientosComponent,
        title: 'Moviemintos | El Morralito'
      }
    ]
  },

  {
    path: '**',
    component: ErrorComponent,
    title: 'Página no encontrada | Pet Health+'
  }
];
