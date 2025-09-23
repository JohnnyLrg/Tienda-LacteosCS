import { inject } from '@angular/core';
import { Router, type CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../service/autenticacionController/auth.service';
import { EmpresaContextService } from '../service/empresa/empresa-context.service';
import { map, take } from 'rxjs';

export const routerInjection = () => inject(Router);
export const authStateObs$ = () => inject(AuthService).userSession$;
export const empresaContextService = () => inject(EmpresaContextService);

/**
 * Guard que verifica autenticación y contexto de empresa
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = routerInjection();
  const authService = inject(AuthService);
  const empresaContext = empresaContextService();

  return authStateObs$().pipe(
    take(1),
    map((userSession) => {
      // 1. Verificar si el usuario está autenticado
      if (!userSession) {
        router.navigateByUrl('/login');
        return false;
      }

      // 2. Verificar si hay contexto de empresa
      if (!empresaContext.tieneEmpresaSeleccionada()) {
        router.navigateByUrl('/seleccionar-empresa');
        return false;
      }

      // 3. Verificar que la empresa del usuario coincida con la del contexto
      const empresaActual = empresaContext.getEmpresaCodigo();
      if (userSession.usuario.UsuarioEmpresaCodigo !== empresaActual) {
        console.error('Inconsistencia en empresa del usuario');
        authService.cerrarSesion();
        return false;
      }

      return true;
    })
  );
};

/**
 * Guard para rutas públicas (login, register)
 */
export const publicGuard: CanActivateFn = () => {
  const router = routerInjection();
  const authService = inject(AuthService);

  return authStateObs$().pipe(
    take(1),
    map((userSession) => {
      if (userSession) {
        // Si ya está autenticado, redirigir al dashboard de empresa
        router.navigateByUrl('/empresa');
        return false;
      }
      return true;
    })
  );
};

/**
 * Guard para verificar permisos de administrador
 */
export const adminGuard: CanActivateFn = () => {
  const router = routerInjection();
  const authService = inject(AuthService);

  return authStateObs$().pipe(
    take(1),
    map((userSession) => {
      if (!userSession) {
        router.navigateByUrl('/login');
        return false;
      }

      // Verificar si es administrador
      if (!authService.isAdmin) {
        router.navigateByUrl('/empresa/home');
        return false;
      }

      return true;
    })
  );
};

/**
 * Guard que verifica solo autenticación (sin requerir empresa)
 * Para rutas como selección de empresa
 */
export const authOnlyGuard: CanActivateFn = () => {
  const router = routerInjection();

  return authStateObs$().pipe(
    take(1),
    map((userSession) => {
      if (!userSession) {
        router.navigateByUrl('/login');
        return false;
      }
      return true;
    })
  );
};

/**
 * Guard para verificar permisos de super administrador
 */
export const superAdminGuard: CanActivateFn = () => {
  const router = routerInjection();
  const authService = inject(AuthService);

  return authStateObs$().pipe(
    take(1),
    map((userSession) => {
      if (!userSession) {
        router.navigateByUrl('/login');
        return false;
      }

      // Verificar si es super administrador
      if (!authService.isSuperAdmin) {
        router.navigateByUrl('/empresa/dashboard');
        return false;
      }

      return true;
    })
  );
};

/**
 * Guard para verificar que el usuario pertenece a la empresa en la URL
 * Útil para rutas como /empresa/{empresaId}/...
 */
export const empresaOwnerGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = routerInjection();
  const empresaContext = empresaContextService();
  
  const empresaIdFromRoute = route.paramMap.get('empresaId');
  const empresaActual = empresaContext.getEmpresaCodigo();

  if (empresaIdFromRoute && parseInt(empresaIdFromRoute) !== empresaActual) {
    router.navigateByUrl('/empresa');
    return false;
  }

  return true;
};
