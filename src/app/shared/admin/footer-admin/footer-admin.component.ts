import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-admin',
  imports: [
    CommonModule
  ],
  templateUrl: './footer-admin.component.html',
  styleUrl: './footer-admin.component.scss'
})
export class FooterAdminComponent {
 constructor() {}
 currentYear: number = new Date().getFullYear();
}
