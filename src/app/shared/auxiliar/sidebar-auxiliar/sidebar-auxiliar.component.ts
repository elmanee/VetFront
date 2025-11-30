import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; 
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar-auxiliar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-auxiliar.component.html',
  styleUrl: './sidebar-auxiliar.component.scss'
})
export class SidebarAuxiliarComponent {

  userName: string = 'Auxiliar';
  userRole: string = 'Estilista';
  userImage: string = 'assets/logos/lgoo.png'; // Imagen por defecto

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData(): void {
    // Opción A: Obtener del servicio (si el servicio guarda el estado)
    const user = this.authService.getUsuario();
    
    // Opción B: Obtener del localStorage (más seguro si se recarga la página)
    const userJson = localStorage.getItem('usuario');
    const userStorage = userJson ? JSON.parse(userJson) : null;

    const usuarioFinal = user || userStorage;

    if (usuarioFinal) {
      this.userName = usuarioFinal.nombre_completo || usuarioFinal.nombre; // Ajusta según tu objeto
      this.userRole = usuarioFinal.rol || 'Auxiliar';
      
      // Generar avatar con iniciales si no hay foto
      this.userImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.userName
      )}&background=FFC040&color=fff&size=128`; // Color amarillo/naranja para auxiliar
    } else {
      // Si no hay usuario, mejor mandarlo al login
      this.logout();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  

}
