import { Injectable, inject } from '@angular/core';
import { Productos } from '../../../model/interface/Productos';
import { BehaviorSubject } from 'rxjs';
import { EmpresaContextService } from '../empresa/empresa-context.service';

@Injectable({
  providedIn: 'root',
})
export class CarritoServiceService {
  private carrito: Productos[] = [];
  private carritoSubject = new BehaviorSubject<Productos[]>([]);
  private empresaContext = inject(EmpresaContextService);

  constructor() {
    // Inicializar el carrito desde el localStorage al cargar el servicio
    this.cargarCarritoDesdeStorage();
    
    // Suscribirse a cambios de empresa para limpiar carrito si cambia
    this.empresaContext.empresaCodigo$.subscribe(empresaCodigo => {
      if (empresaCodigo) {
        this.cargarCarritoDesdeStorage();
      } else {
        this.vaciarCarrito();
      }
    });
  }

  private actualizarCarritoSubject() {
    this.carritoSubject.next(this.carrito);
    this.guardarCarritoEnLocalStorage();
  }

  private cargarCarritoDesdeStorage() {
    const empresaCodigo = this.empresaContext.getEmpresaCodigo();
    if (empresaCodigo) {
      this.carrito = this.obtenerCarritoDesdeLocalStorage(empresaCodigo);
      this.actualizarCarritoSubject();
    }
  }

  agregarAlCarrito(producto: Productos) {
    const empresaCodigo = this.empresaContext.getEmpresaCodigo();
    if (!empresaCodigo) {
      throw new Error('No hay empresa seleccionada para agregar productos al carrito');
    }

    // Validar que el producto pertenece a la empresa actual
    if (producto.ProductoEmpresaCodigo !== empresaCodigo) {
      throw new Error('El producto no pertenece a la empresa actual');
    }

    // Verifica si el producto ya está en el carrito
    const existe = this.carrito.some(
      (item) => item.ProductoCodigo === producto.ProductoCodigo && 
                item.ProductoEmpresaCodigo === producto.ProductoEmpresaCodigo
    );
    
    if (!existe) {
      // Si el producto no está en el carrito, crea un nuevo objeto con cantidad
      const nuevoProducto: Productos = { ...producto, quantity: producto.quantity || 1 };
      this.carrito.push(nuevoProducto);
      this.actualizarCarritoSubject();
    } else {
      // Si ya existe, actualizar cantidad
      const productoExistente = this.carrito.find(
        item => item.ProductoCodigo === producto.ProductoCodigo && 
                item.ProductoEmpresaCodigo === producto.ProductoEmpresaCodigo
      );
      if (productoExistente) {
        productoExistente.quantity = (productoExistente.quantity || 1) + (producto.quantity || 1);
        this.actualizarCarritoSubject();
      }
    }
  }

  eliminarDelCarrito(codigoProducto: number) {
    const empresaCodigo = this.empresaContext.getEmpresaCodigo();
    if (!empresaCodigo) return;

    const index = this.carrito.findIndex(
      (item) => item.ProductoCodigo === codigoProducto && 
                item.ProductoEmpresaCodigo === empresaCodigo
    );
    
    if (index !== -1) {
      this.carrito.splice(index, 1);
      this.actualizarCarritoSubject(); 
    }
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  actualizarCantidad(codigoProducto: number, nuevaCantidad: number) {
    const empresaCodigo = this.empresaContext.getEmpresaCodigo();
    if (!empresaCodigo) return;

    const producto = this.carrito.find(
      item => item.ProductoCodigo === codigoProducto && 
              item.ProductoEmpresaCodigo === empresaCodigo
    );

    if (producto) {
      producto.quantity = Math.max(1, nuevaCantidad); // Mínimo 1
      this.actualizarCarritoSubject();
    }
  }

  obtenerCarrito() {
    return this.carritoSubject.asObservable();
  }

  obtenerProductosCarrito() {
    return this.carrito; // Devuelve directamente el arreglo de productos del carrito
  }

  /**
   * Obtiene el total del carrito
   */
  obtenerTotalCarrito(): number {
    return this.carrito.reduce((total, producto) => {
      return total + (producto.ProductoPrecio * (producto.quantity || 1));
    }, 0);
  }

  /**
   * Obtiene la cantidad total de items en el carrito
   */
  obtenerCantidadItems(): number {
    return this.carrito.reduce((total, producto) => total + (producto.quantity || 1), 0);
  }

  vaciarCarrito() {
    this.carrito = [];
    this.actualizarCarritoSubject();
  }

  private guardarCarritoEnLocalStorage() {
    const empresaCodigo = this.empresaContext.getEmpresaCodigo();
    if (empresaCodigo) {
      const key = `carrito_empresa_${empresaCodigo}`;
      localStorage.setItem(key, JSON.stringify(this.carrito));
    }
  }

  private obtenerCarritoDesdeLocalStorage(empresaCodigo: number): Productos[] {
    const key = `carrito_empresa_${empresaCodigo}`;
    const carritoGuardado = localStorage.getItem(key);
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  }
}
