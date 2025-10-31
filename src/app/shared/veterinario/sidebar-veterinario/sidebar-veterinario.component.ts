import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-veterinario',
  imports: [
    CommonModule, RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar-veterinario.component.html',
  styleUrl: './sidebar-veterinario.component.scss'
})
export class SidebarVeterinarioComponent implements OnInit {

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
    const user = this.authService.getUsuario();

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
