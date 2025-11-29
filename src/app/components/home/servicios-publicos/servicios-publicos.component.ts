import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ServiciosFacade } from '../../../facades/servicios.facade';
import { HeaderComponent } from '../../../shared/common/header/header.component';
import { FooterComponent } from '../../../shared/common/footer/footer.component';

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
  servicios$ = this.serviciosFacade.servicios$;

  // 4. Constructor vacío
  constructor() {}

  ngOnInit() {
    this.serviciosFacade.loadServicios();
  }
}