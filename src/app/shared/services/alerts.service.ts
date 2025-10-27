import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  constructor() {}

  // exito
  showSuccessAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      timer: 1000,
    });
  }

  // info
  showInfoAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'info',
    });
  }

  // error
  showErrorAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
    });
  }
}
