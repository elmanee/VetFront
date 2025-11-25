// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { ExpedienteService } from '../../../services/expediente.service';

// @Component({
//   selector: 'app-expediente-detalle',
//   imports: [CommonModule],
//   templateUrl: './expediente-detalle.component.html',
//   styleUrl: './expediente-detalle.component.scss'
// })
// export class ExpedienteDetalleComponent {

//   loading = true;
//   expediente: any = null;

//   constructor(
//     private route: ActivatedRoute,
//     private expServ: ExpedienteService
//   ) {}

//   ngOnInit(): void {
//     const id = Number(this.route.snapshot.paramMap.get('id'));
//     this.cargarDetalle(id);
//   }

//   cargarDetalle(id: number) {
//     this.expServ.getDetalleExpediente(id).subscribe({
//       next: (resp) => {
//         this.expediente = resp.data;
//         this.loading = false;
//       }
//     });
//   }

// }
import { CommonModule, Location } from '@angular/common'; // Importar Location
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Importar RouterModule
import { ExpedienteService } from '../../../services/expediente.service';

@Component({
  selector: 'app-expediente-detalle',
  standalone: true, // Asegurando que sea standalone
  imports: [CommonModule, RouterModule], // RouterModule necesario para routerLink si se usa
  templateUrl: './expediente-detalle.component.html',
  styleUrl: './expediente-detalle.component.scss'
})
export class ExpedienteDetalleComponent implements OnInit {

  loading = true;
  expediente: any = null;

  constructor(
    private route: ActivatedRoute,
    private expServ: ExpedienteService,
    private location: Location // Inyectar Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarDetalle(id);
    } else {
      console.error('ID de expediente no válido');
      this.loading = false;
    }
  }

  cargarDetalle(id: number) {
    this.expServ.getDetalleExpediente(id).subscribe({
      next: (resp) => {
        // Corrección basada en tu response.interface.ts: resp.data es el objeto directo
        this.expediente = resp.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando expediente', err);
        this.loading = false;
      }
    });
  }

  // Función infalible para regresar a la pantalla anterior
  goBack(): void {
    this.location.back();
  }

}
