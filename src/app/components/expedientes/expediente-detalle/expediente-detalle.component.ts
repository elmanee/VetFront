import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExpedienteService } from '../../../services/expediente.service';

@Component({
  selector: 'app-expediente-detalle',
  imports: [CommonModule],
  templateUrl: './expediente-detalle.component.html',
  styleUrl: './expediente-detalle.component.scss'
})
export class ExpedienteDetalleComponent {

  loading = true;
  expediente: any = null;

  constructor(
    private route: ActivatedRoute,
    private expServ: ExpedienteService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDetalle(id);
  }

  cargarDetalle(id: number) {
    this.expServ.getDetalleExpediente(id).subscribe({
      next: (resp) => {
        this.expediente = resp.data;
        this.loading = false;
      }
    });
  }

}
