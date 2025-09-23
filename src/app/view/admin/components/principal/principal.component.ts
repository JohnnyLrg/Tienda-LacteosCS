import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { routes } from '../../../../app.routes';
import { AuthService } from '../../../../controller/service/autenticacionController/auth.service';
import { InventarioService } from '../../../../controller/service/inventario/inventario.service';
import { HistorialinventarioService } from '../../../../controller/service/inventario/historialinventario.service';
import { Empleados } from '../../../../model/interface/empleados';
import { EmpleadosService } from '../../../../controller/service/autenticacionController/empleados.service';
import { EmpresaContextService } from '../../../../controller/service/empresa/empresa-context.service';
import { UserSession } from '../../../../model/interface/user';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrincipalComponent implements OnInit {
  _inventarioService = inject(InventarioService);
  _router = inject(Router);
  authService = inject(AuthService);
  private empleadosService = inject(EmpleadosService);
  private empresaContext = inject(EmpresaContextService);
  cdr = inject(ChangeDetectorRef);

  currentUserSession: UserSession | null = null;
  cargo: string | null = null;
  empleado: any = null; // Simplificamos el tipo para evitar conflictos
  isConversacionesExpanded = false;

  public menuItems = routes
    .filter((route) => route.path === 'empresa')
    .flatMap((route) => route.children ?? [])
    .filter((route) => route && route.path)
    .filter((route) => !route.path?.includes('**'))
    .filter((route) => !route.path?.includes('trabajadores'))
    .filter((route) => !route.path?.includes('informes'))
    .filter((route) => !route.path?.includes('conversaciones'))
    .map((route) => ({
      path: route.path,
      title: route.title,
    }));

  public menuItemsAdministrador = routes
    .filter((route) => route.path === 'empresa')
    .flatMap((route) => route.children ?? [])
    .filter((route) => route && route.path)
    .filter((route) => !route.path?.includes('**'))
    .map((route) => ({
      path: route.path,
      title: route.title,
    }));

  public subMenuConversaciones = (
    routes
      .find(route => route.path === 'empresa')?.children
      ?.find(child => child.path === 'conversaciones')?.children
      ?.filter(route => route && route.path && !route.path.includes('**'))
      ?.map(route => ({
        path: route.path,
        title: route.title,
      })) 
  ) || [];

  public iconItems = [
    'lni lni-home',
    'lni lni-dropbox',
    'lni lni-network',
    'lni lni-bubble',
    'lni lni-user',
    'lni lni-pencil-alt',
    'lni lni-users',
    'lni lni-stats-down',
    'lni lni-comments'
  ];

  public combinedMenuItems: any[] = [];

  ngOnInit(): void {
    console.log(this.subMenuConversaciones);
    
    // Suscribirse a la sesión del usuario (nuevo sistema multi-tenant)
    this.authService.userSession$.subscribe((userSession: UserSession | null) => {
      this.currentUserSession = userSession;
      console.log('Sesión de usuario actual desde principal:', this.currentUserSession);
      
      if (userSession?.empleado) {
        this.empleado = userSession.empleado;
        this.cargo = userSession.empleado.Cargo || null;
        this.actualizarMenu();
        this.cdr.markForCheck();
      }
    });
  }

  ObtenerEmpleadoActual(){
    // Este método ya no es necesario ya que el empleado viene en la sesión
    // Pero mantenemos la lógica para compatibilidad
    if (this.currentUserSession?.empleado) {
      this.empleado = this.currentUserSession.empleado;
      this.cargo = this.empleado?.Cargo || null;
      this.actualizarMenu();
    }
  }


  cerrarSesion(){
    this.authService.cerrarSesion().then(() => {
      this._router.navigate(['/login']);
    }).catch(error =>{
      console.error('Error al cerrar sesión:', error);
    });
  }

  actualizarMenu() {
    // Verificar si es administrador o super administrador
    if (this.cargo === 'Administrador' || this.cargo === 'SuperAdministrador') {
      this.combinedMenuItems = this.menuItemsAdministrador.map(
        (item, index) => ({
          ...item,
          icon: this.iconItems[index] ?? 'lni lni-default',
        })
      );
    } else {
      this.combinedMenuItems = this.menuItems.map((item, index) => ({
        ...item,
        icon: this.iconItems[index] ?? 'lni lni-default',
      }));
    }

    // Si es super administrador, agregar enlace al panel de super admin
    if (this.cargo === 'SuperAdministrador') {
      this.combinedMenuItems.push({
        path: '/super-admin/dashboard',
        title: 'Super Admin',
        icon: 'lni lni-crown'
      });
    }
  }


  ngAfterViewInit() {
    const hamBurger = document.querySelector('.toggle-btn') as HTMLElement;

    hamBurger.addEventListener('click', function () {
      document.querySelector('#sidebar')?.classList.toggle('expand');
    });
  }


  toggleConversaciones() {
    this.isConversacionesExpanded = !this.isConversacionesExpanded;
  }
}
