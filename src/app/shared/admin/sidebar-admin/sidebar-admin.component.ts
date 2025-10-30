import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive,  } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

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

  userName: string = '';
  userRole: string = '';
  userImage: string = '';

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });

    this.loadUserData();
  }

  loadUserData(): void {
    // 🔹 obtener el usuario guardado en localStorage
    const user = this.authService.getUsuarioActual();

    if (user) {
      this.userName = user.nombre;
      this.userRole = user.rol;
      this.userImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.nombre
      )}&background=7c3aed&color=fff&size=128`;
    } else {
      this.logout();
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  logout(): void {
    this.authService.logout();
  }
}
