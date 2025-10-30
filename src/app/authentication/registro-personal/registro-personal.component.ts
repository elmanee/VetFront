import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-personal',
  standalone: true, // Asumo que estás usando componentes standalone en Angular 19+
  imports: [
    CommonModule, 
    FormsModule
  ],
  templateUrl: './registro-personal.component.html',
  styleUrl: './registro-personal.component.scss'
})
export class RegistroPersonalComponent {

  // Propiedades basadas en la tabla tusuarios
  usuario = {
    nombre_completo: '',
    correo: '',
    telefono: '',
    rol: 'Veterinario', // Valor por defecto
    password: '',
    password_confirm: '' // Campo extra para confirmar contraseña
  };

  roles: string[] = ['Veterinario', 'Recepcionista', 'Admin'];
  errorMsg: string | null = null;
  successMsg: string | null = null;

  constructor() {}

  /**
   * Maneja el envío del formulario de registro.
   * Aquí se implementaría la lógica de validación y la llamada al servicio de API.
   */
  registrarPersonal() {
    this.errorMsg = null;
    this.successMsg = null;

    // Validación básica de contraseñas
    if (this.usuario.password !== this.usuario.password_confirm) {
      this.errorMsg = 'Las contraseñas no coinciden. Por favor, verifica.';
      return;
    }

    // Lógica de registro simulada
    console.log('Datos a registrar:', this.usuario);
    
    // Aquí iría la llamada a tu AuthService o UserService para registrar
    // Ejemplo de éxito simulado:
    this.successMsg = `Personal registrado con éxito: ${this.usuario.nombre_completo} (${this.usuario.rol}).`;
    
    // Opcional: Limpiar formulario después del éxito
    this.usuario = {
      nombre_completo: '',
      correo: '',
      telefono: '',
      rol: 'Veterinario',
      password: '',
      password_confirm: ''
    };
  }
}
