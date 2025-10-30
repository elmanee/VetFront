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
}
