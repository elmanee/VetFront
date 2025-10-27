import { Component, OnInit } from '@angular/core';
import { FooterAdminComponent } from '../footer-admin/footer-admin.component';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-layout-admin',
  imports: [
    CommonModule, RouterModule,
    FooterAdminComponent, SidebarAdminComponent,
  ],
  templateUrl: './layout-admin.component.html',
  styleUrl: './layout-admin.component.scss'
})
export class LayoutAdminComponent implements OnInit {

  isCollapsed: boolean = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
  }
}
