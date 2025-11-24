import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpedienteService } from '../../services/expediente.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expedientes.component.html',
  styleUrl: './expedientes.component.scss'
})
export class ExpedientesComponent {

  expedientes: any[] = [];
  expedientesFiltrados: any[] = [];
  displayedExpedientes: any[] = [];

  filtros = {
    numero_expediente: '',
    paciente: '',
    estado: ''
  };

  filtrosVisible = false;

  // Paginación
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalItems = 0;
  totalPages = 0;
  visiblePages: number[] = [];

  rangeStart = 0;
  rangeEnd = 0;

  constructor(private expedientesServ: ExpedienteService, private router: Router ) {}

  ngOnInit(): void {
    this.cargarExpedientes();
  }

  cargarExpedientes() {
    this.expedientesServ.getExpedientes().subscribe({
      next: (resp) => {
        this.expedientes = resp.data;
        this.expedientesFiltrados = [...this.expedientes];
        this.totalItems = this.expedientesFiltrados.length;
        this.aplicarPaginacion();
      }
    });
  }

  toggleFiltros() {
    this.filtrosVisible = !this.filtrosVisible;
  }

  aplicarFiltros() {
    this.expedientesFiltrados = this.expedientes.filter(exp => {

      const porNumero =
        !this.filtros.numero_expediente ||
        exp.numero_expediente.toLowerCase().includes(this.filtros.numero_expediente.toLowerCase());

      const porPaciente =
        !this.filtros.paciente ||
        exp.paciente_nombre.toLowerCase().includes(this.filtros.paciente.toLowerCase());

      const porEstado =
        !this.filtros.estado ||
        exp.estado === this.filtros.estado;

      return porNumero && porPaciente && porEstado;
    });

    this.totalItems = this.expedientesFiltrados.length;
    this.goToPage(1);
  }

  aplicarPaginacion() {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.displayedExpedientes = this.expedientesFiltrados.slice(start, end);

    this.rangeStart = this.totalItems === 0 ? 0 : start + 1;
    this.rangeEnd = Math.min(end, this.totalItems);

    this.actualizarPaginasVisibles();
  }

  actualizarPaginasVisibles() {
    this.visiblePages = [];

    const maxBtns = 5;
    let start = Math.max(1, this.page - 2);
    let end = Math.min(this.totalPages, start + maxBtns - 1);

    for (let p = start; p <= end; p++) {
      this.visiblePages.push(p);
    }
  }

  goToPage(num: number) {
    this.page = num;
    this.aplicarPaginacion();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.aplicarPaginacion();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.aplicarPaginacion();
    }
  }

  editarExpediente(exp: any) {
    console.log("Editar expediente", exp);
  }

  verDetalle(exp: any) {
    this.router.navigate(
      ['/veterinario/expedientes/detalle', exp.id_expediente]
    );
  }

}
