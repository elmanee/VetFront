import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterVeterinarioComponent } from '../footer-veterinario/footer-veterinario.component';
import { SidebarVeterinarioComponent } from '../sidebar-veterinario/sidebar-veterinario.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-layout-veterinario',
  imports: [
    CommonModule, RouterModule,
    FooterVeterinarioComponent, SidebarVeterinarioComponent
  ],
  templateUrl: './layout-veterinario.component.html',
  styleUrl: './layout-veterinario.component.scss'
})
export class LayoutVeterinarioComponent {
  isCollapsed: boolean = false;

    constructor(private sidebarService: SidebarService) {}

    ngOnInit(): void {
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isCollapsed = collapsed;
      });
    }
}
