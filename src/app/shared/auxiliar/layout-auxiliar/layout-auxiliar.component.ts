import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { SidebarAuxiliarComponent } from "../sidebar-auxiliar/sidebar-auxiliar.component";
import { FooterAuxiliarComponent } from "../footer-auxiliar/footer-auxiliar.component";

@Component({
  selector: 'app-layout-auxiliar',
  imports: [RouterOutlet, SidebarAuxiliarComponent, FooterAuxiliarComponent],
  templateUrl: './layout-auxiliar.component.html',
  styleUrl: './layout-auxiliar.component.scss'
})
export class LayoutAuxiliarComponent {

}
