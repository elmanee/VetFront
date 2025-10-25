import { Routes } from '@angular/router';
import { _DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './authentication/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { CitaFormComponent } from './components/home/citas/cita-form/cita-form.component';
import { AgendaViewComponent } from './components/home/citas/agenda-view/agenda-view.component';
import { SolicitarcitaComponent } from './components/home/citas/solicitarcita/solicitarcita.component';

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
    path: '**',
    component: ErrorComponent,
    title: 'Página no encontrada | Pet Health+'
  }
];
