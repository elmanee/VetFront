import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiciosFacade } from '../../../facades/servicios.facade';
import { HeaderComponent } from '../../../shared/common/header/header.component';
import { FooterComponent } from '../../../shared/common/footer/footer.component';
import { map } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-servicios-publicos',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent ],
  templateUrl: './servicios-publicos.component.html',
  styleUrls: ['./servicios-publicos.component.scss']
})
export class ServiciosPublicosComponent implements OnInit {

  // 2. Inyección de dependencias moderna
  private serviciosFacade = inject(ServiciosFacade);

  // 3. Asignación directa (ahora sí funciona porque serviciosFacade ya existe)
  // servicios$ = this.serviciosFacade.servicios$;

  servicios$ = this.serviciosFacade.servicios$.pipe(
    map(servicios => servicios.filter(s => s.activo === true))
  );

  // 4. Constructor vacío
  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.serviciosFacade.loadServicios();
  }

  reservarCita(servicioId: number): void {
    // Navega a la ruta de solicitud de cita, pasando el ID como Query Parameter
    this.router.navigate(['/solicitar-cita'], {
      queryParams: { servicioId: servicioId }
    });
    // Nota: Reemplaza '/ruta-a-solicitar-cita' con tu ruta real.
  }
}
