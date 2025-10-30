import { AfterViewInit, Component } from '@angular/core';
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit { 

  constructor() { }

  ngAfterViewInit(): void {
    // 1. Obtener todos los elementos con la clase 'dropdown-toggle'
    const dropdownToggleEl = document.querySelectorAll('.dropdown-toggle');
    
    // 2. Iterar sobre ellos e inicializar el componente Dropdown de Bootstrap
    dropdownToggleEl.forEach((element: Element) => {
        // La variable 'bootstrap' está disponible gracias a la declaración 'declare var bootstrap: any;'
        // Se inicializa cada Dropdown.
        new bootstrap.Dropdown(element); 
    });

  }
}
