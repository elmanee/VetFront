import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  constructor() {}
showConfirmAlert(title: string, text: string, icon: 'warning' | 'question' = 'warning') {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: '#FFC040', // color dorado como tu tema
      cancelButtonColor: '#6c757d',  // gris para cancelar
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    });
  }

  showSuccessAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      timer: 1500,
      confirmButtonColor: '#FFC040',
    });
  }

  showInfoAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'info',
      confirmButtonColor: '#FFC040',
    });
  }

  showErrorAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonColor: '#FFC040',
    });
  }

showExpedientesExistentesAlert() {
    return Swal.fire({
      title: 'Expedientes Encontrados',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="font-size: 15px; color: #555; margin-bottom: 15px;">
            Este paciente ya tiene expedientes médicos registrados en el sistema.
          </p>
          <p style="font-size: 14px; color: #666;">
            <strong>¿Qué deseas hacer?</strong>
          </p>
        </div>
      `,
      icon: 'info',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonColor: '#FFC040',
      denyButtonColor: '#3085d6',
      confirmButtonText: '<i class="bi bi-plus-circle"></i> Crear Nuevo Expediente',
      denyButtonText: '<i class="bi bi-folder-open"></i> Ver Expedientes Existentes',
      reverseButtons: true,
      width: '500px',
      customClass: {
        confirmButton: 'btn btn-warning px-4',
        denyButton: 'btn btn-primary px-4'
      }
    });
  }
}
