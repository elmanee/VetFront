import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-veterinario',
  imports: [
    CommonModule
  ],
  templateUrl: './footer-veterinario.component.html',
  styleUrl: './footer-veterinario.component.scss'
})
export class FooterVeterinarioComponent {
 constructor() {}
 currentYear: number = new Date().getFullYear();
}
