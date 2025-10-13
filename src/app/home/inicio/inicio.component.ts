import { Component } from '@angular/core';
import { FooterComponent } from "../../shared/common/footer/footer.component";
import { HeaderComponent } from "../../shared/common/header/header.component";

@Component({
  selector: 'app-inicio',
  imports: [FooterComponent, HeaderComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})
export class InicioComponent { }
