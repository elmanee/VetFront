import { Component } from '@angular/core';
import { FooterComponent } from "../../shared/common/footer/footer.component";
import { HeaderComponent } from "../../shared/common/header/header.component";

@Component({
  selector: 'app-dashboard',
  imports: [FooterComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class _DashboardComponent { }
