import { Routes } from '@angular/router';
import { _DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './authentication/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { CitaFormComponent } from './components/home/citas/cita-form/cita-form.component';
import { AgendaViewComponent } from './components/home/citas/agenda-view/agenda-view.component';
import { SolicitarcitaComponent } from './components/home/citas/solicitarcita/solicitarcita.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { LayoutAdminComponent } from './shared/admin/layout-admin/layout-admin.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { LotesComponent } from './components/lotes/lotes.component';

export const routes: Routes = [
  {
    path: '',
    component: _DashboardComponent,
    title: 'Pet Health+'
  },
  {
  path: 'login',
    component: LoginComponent,
    title: 'Pet Health+'
  },
  {
    path: 'dashboard',
    component: _DashboardComponent,
    title: 'Dasboard'
  },
    // RQF01 - Rutas de Gestión de Citas (Para Recepcionista/Admin/Veterinario)
  { path: 'registrar-cita', component: CitaFormComponent },
  { path: 'agenda', component: AgendaViewComponent },
  { path: 'solicitar-cita', component: SolicitarcitaComponent },


  {
    path: 'admin',
    component: LayoutAdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'das-admin',
        pathMatch: 'full'
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
        path: 'das-admin',
        component: DashboardAdminComponent,
        title: 'Dashboard | Pet Health+ Admin'
      },
      {
        path: 'lotes',
        component: LotesComponent,
        title: 'Dashboard | Pet Health+ Admin'
      },

    ]
  },
  {
    path: '**',
    component: ErrorComponent,
    title: 'Página no encontrada | Pet Health+'
  }
];
