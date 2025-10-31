import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  correo = '';
  password = '';
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  ingresar() {
    this.authService.login(this.correo, this.password).subscribe((res) => {
      if (res && res.token) {
        const rol = res.usuario.rol;
        localStorage.setItem('rol', rol);
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));

        if (rol === 'Admin') {
          this.router.navigate(['/admin/das-admin']);
        } else if (rol === 'Veterinario') {
          this.router.navigate(['/veterinario/mis-citas']);
        } else {
          this.router.navigate(['/login']);
        }
      } else {
        this.errorMsg = 'Credenciales inválidas.';
      }
    });
  }
}
