import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { routes } from '../../../app.routes';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPhone,
  faUser,
  faCartShopping,
  faHeart,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { CarritoServiceService } from '../../../controller/service/carrito/CarritoService.service';
import { Productos } from '../../../model/interface/Productos';
import { AuthService } from '../../../controller/service/autenticacionController/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit {
  _carritoService = inject(CarritoServiceService);
  _authService = inject(AuthService);

  //ICONOS
  faUser = faUser;
  faCartShopping = faCartShopping;
  faHeart = faHeart;
  faTrash = faTrash;

  productosCarrito: Productos[] = [];
  dataUser: any;
  spinner: boolean = true;
  currentUser: any = null;

  ngOnInit(): void {
    this._carritoService.obtenerCarrito().subscribe((carrito) => {
      this.productosCarrito = carrito;
    });

    // Suscribirse al estado de autenticación
    this._authService.user$.subscribe(user => {
      this.currentUser = user;
      this.updateMenuItems(); // Actualizar menú cuando cambie el estado de auth
    });

    // Inicializar menú
    this.updateMenuItems();
  }

  public menuItems: any[] = [];

  private updateMenuItems(): void {
    const allDashboardItems = routes
      .filter((route) => route.path === 'dashboard') // Encuentra la ruta 'dashboard'
      .flatMap((route) => route.children ?? []) // Extrae las rutas hijas
      .filter((route) => route && route.path) // Filtra las rutas válidas
      .filter((route) => !route.path?.includes('**')) // Elimina las rutas comodín
      .map((route) => ({
        path: route.path,
        title: route.title,
        requiresAuth: !!route.canActivate, // Si tiene canActivate, requiere autenticación
      }));

    // Filtrar elementos basándose en el estado de autenticación
    if (this.currentUser) {
      // Usuario autenticado: mostrar todos los elementos
      this.menuItems = allDashboardItems.map(item => ({
        path: item.path,
        title: item.title
      }));
    } else {
      // Usuario no autenticado: solo mostrar elementos públicos
      this.menuItems = allDashboardItems
        .filter(item => !item.requiresAuth)
        .map(item => ({
          path: item.path,
          title: item.title
        }));
    }
  }

  private _router = inject(Router);

  redirectToPantallaCarga() {
    this._router.navigate(['/cargando']);
  }

  calcularTotal(): string {
    let total = 0;
    for (const producto of this.productosCarrito) {
      total += producto.ProductoPrecio * producto.quantity!;
    }
    return total.toFixed(2);
  }

  async logout(): Promise<void> {
    try {
      await this._authService.cerrarSesion();
      this._router.navigate(['/dashboard/home']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  goToLogin(): void {
    this._router.navigate(['/customer-login']);
  }

  goToRegister(): void {
    this._router.navigate(['/customer-register']);
  }

  proceedToCheckout(): void {
    if (this.currentUser) {
      // Usuario autenticado: ir directamente a pedido
      this._router.navigate(['/pedido']);
    } else {
      // Usuario no autenticado: guardar destino y redirigir a login
      localStorage.setItem('redirectUrl', '/pedido');
      localStorage.setItem('requiresCheckout', 'true'); // Flag para indicar que viene del checkout
      this._router.navigate(['/customer-login']);
    }
  }

}
