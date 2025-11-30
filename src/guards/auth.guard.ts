import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../app/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = this.authService.getToken();
    const rol = this.authService.getUserRole() || ''; // 👈 tu método correcto
    const allowedRoles = route.data['roles'] as string[];

    if (!token) {
      console.warn('⛔ No hay token, redirigiendo al login');
      return this.router.createUrlTree(['/login']);
    }

    if (allowedRoles && !allowedRoles.includes(rol)) {
      console.warn(`🚫 Acceso denegado: rol "${rol}" no permitido para esta ruta`);
      if (rol === 'Veterinario') return this.router.createUrlTree(['/veterinario']);
      if (rol === 'Admin') return this.router.createUrlTree(['/admin']);
      if (rol === 'Auxiliar') return this.router.createUrlTree(['/auxiliar']);
      return this.router.createUrlTree(['/login']);
    }

    return true;
  }
}
