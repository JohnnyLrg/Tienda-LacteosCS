import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerAuthService } from '../service/customer-auth.service';
import { map, take } from 'rxjs/operators';

export const customerAuthGuard: CanActivateFn = (route, state) => {
  const customerAuthService = inject(CustomerAuthService);
  const router = inject(Router);

  return customerAuthService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        // Usuario logueado, permitir acceso
        return true;
      } else {
        // No logueado, guardar la ruta a la que intentaba acceder y redirigir a login
        localStorage.setItem('redirectUrl', state.url);
        router.navigate(['/customer-login']);
        return false;
      }
    })
  );
};

export const customerPublicGuard: CanActivateFn = (route, state) => {
  const customerAuthService = inject(CustomerAuthService);
  const router = inject(Router);

  return customerAuthService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        // Ya está logueado, redirigir a pedidos
        router.navigate(['/dashboard/envios']);
        return false;
      } else {
        // No logueado, permitir acceso a login/registro
        return true;
      }
    })
  );
};