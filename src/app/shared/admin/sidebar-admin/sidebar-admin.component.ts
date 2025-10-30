import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive,  } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-admin',
  imports: [
    CommonModule,
    RouterLink, RouterLinkActive,
  ],
  templateUrl: './sidebar-admin.component.html',
  styleUrl: './sidebar-admin.component.scss'
})
export class SidebarAdminComponent implements OnInit {

  isCollapsed: boolean = false;

  userName: string = 'Dr. Juan Pérez';
  userRole: string = 'Veterinario';
  userImage: string = 'https://ui-avatars.com/api/?name=Juan+Perez&background=7c3aed&color=fff&size=128';

  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });

    this.loadUserData();
  }

  loadUserData(): void {

  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  logout(): void {


    console.log('Cerrando sesión...');

    // Limpiar localStorage (ejemplo)
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
