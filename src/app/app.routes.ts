import { Routes } from '@angular/router';
import { InicioComponent } from './home/inicio/inicio.component';
import { LoginComponent } from './authentication/login/login.component';
import { DasboardComponent } from './components/dasboard/dasboard.component';
import { ErrorComponent } from './components/error/error.component';
import { CitaFormComponent } from './home/citas/cita-form/cita-form.component';
import { AgendaViewComponent } from './home/citas/agenda-view/agenda-view.component';
import { SolicitarcitaComponent } from './home/citas/solicitarcita/solicitarcita.component';

export const routes: Routes = [
  {
    path: '',
    component: InicioComponent,
    title: 'Pet Health+'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Pet Health+'
  },
  {
    path: 'dashboard',
    component: DasboardComponent,
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
