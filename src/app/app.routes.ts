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
import { ServiciosPublicosComponent } from './components/home/servicios-publicos/servicios-publicos.component';
import { ServiciosAdminComponent } from './components/servicios-admin/servicios-admin.component';
import { LayoutAuxiliarComponent } from './shared/auxiliar/layout-auxiliar/layout-auxiliar.component';
import { MisCitasAuxiliarComponent } from './components/mis-citas-auxiliar/mis-citas-auxiliar.component';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    component: _DashboardComponent,
    title: 'El Morralito+'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión | El Morralito+'
  },
  {
    path: 'registro-personal',
    component: RegistroPersonalComponent,
    title: 'Registro de Personal | Veterinaria "El Morralito"'
  },
  {
    path: 'dashboard',
    component: _DashboardComponent,
    title: 'Dashboard | El Morralito+'
  },

  // RQF01 - Gestión de Citas
  {
    path: 'solicitar-cita',
    component: SolicitarcitaComponent,
    title: 'Solicitar Cita | El Morralito+'
  },
  {
    path: 'registrar-cita',
    component: CitaFormComponent,
    title: 'Registrar Cita | El Morralito+'
  },
  {
    path: 'agenda',
    component: AgendaViewComponent,
    title: 'Agenda de Citas | El Morralito+'
  },

  {
    path: 'citas-atender',
    component: CitasAtenderComponent,
    title: 'Citas por Atender | El Morralito+'
  },
      {
    path: 'servicios-morralito',
    component: ServiciosPublicosComponent,
    title: 'Servicios Públicos'
  },

  // // RQF02 - Expedientes Médicos
  // {
  //   path: 'expediente/registrar-consulta',
  //   // component: ,
  //   title: 'Registrar Consulta | El Morralito+'
  // },
  // {
  //   path: 'expedientes/buscar',
  //   // component: ,
  //   title: 'Buscar Expedientes | El Morralito+'
  // },
  // {
  //   path: 'expediente/ver/:id',
  //   // component: ,
  //   title: 'Ver Expediente | El Morralito+'
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
        title: 'Inventario | El Morralito+ Admin'
      },
      // PASO 1: Selección de Fecha (Lo que faltaba)
      // El sidebar debe apuntar AQUÍ: /admin/solicitar-cita
      {
        path: 'solicitar-cita',
        component: SolicitarcitaComponent,
        title: 'Solicitar Cita | El Morralito+ Admin'
      },
      
      // PASO 2: Formulario de Registro
      // El Paso 1 redirige AQUÍ: /admin/registrar-cita
      {
        path: 'registrar-cita',
        component: CitaFormComponent,
        title: 'Completar Registro | El Morralito+ Admin'
      },
      
      {
        path: 'agenda',
        component: AgendaViewComponent,
        title: 'Agenda de Citas | El Morralito+ Admin'
      },
      {
        path: 'citas-atender',
        component: CitasAtenderComponent,
        title: 'Citas por Atender | El Morralito+ Admin'
      },
      // {
      //   path: 'expedientes/buscar',
      //   // component: ,
      //   title: 'Buscar Expedientes | El Morralito+ Admin'
      // },
      // {
      //   path: 'expediente/ver/:id',
      //   // component: ,
      //   title: 'Ver Expediente | El Morralito+ Admin'
      // },
      // {
      //   path: 'expediente/registrar-consulta',
      //   // component: ,
      //   title: 'Registrar Consulta | El Morralito+ Admin'
      // },
      {
        path: 'lotes',
        component: LotesComponent,
        title: 'Lotes | El Morralito+ Admin'
      },
      {
        path: 'movimientos',
        component: MovimientosComponent,
        title: 'Moviemintos | El Morralito'
      },
       { path: 'servicios', 
        component: ServiciosAdminComponent
       },
    ]
  },

  //  Área de auxiliares
  {
    path: 'auxiliar',
    component: LayoutAuxiliarComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Auxiliar'] }, // Asegúrate de que tu AuthGuard soporte este rol
    children: [
      {
        path: '',
        redirectTo: 'mis-citas',
        pathMatch: 'full'
      },
      {
        path: 'mis-citas',
        component: MisCitasAuxiliarComponent // Aquí verán su agenda
      }
    ]
  },

  {
    path: '**',
    component: ErrorComponent,
    title: 'Página no encontrada | El Morralito+'
  }
];
