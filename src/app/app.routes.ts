import { Routes } from '@angular/router';
import { InicioComponent } from './home/inicio/inicio.component';
import { LoginComponent } from './authentication/login/login.component';
import { DasboardComponent } from './components/dasboard/dasboard.component';
import { ErrorComponent } from './components/error/error.component';
import { SolicitarcitaComponent } from './home/solicitarcita/solicitarcita.component';

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
  }
  ,
  {
    path: 'dashboard',
    component: DasboardComponent,
    title: 'Dasboard'
  },
   {
    path: 'solicitar-cita',
    component: SolicitarcitaComponent,
    title: 'Solicitar Cita'
  }
  ,{
    path: '**',
    component: ErrorComponent,
    title: 'Página no encontrada | Pet Health+'
  }
];
