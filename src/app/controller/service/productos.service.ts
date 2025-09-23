import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { BASE_URL } from '../../app.config';
import { Productos } from '../../model/interface/Productos';
import { Observable, delay } from 'rxjs';
import { User } from '../../model/interface/user';
import { EmpresaContextService } from './empresa/empresa-context.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private productos: Productos[] = [];
  private http = inject(HttpClient);
  private empresaContext = inject(EmpresaContextService);

  cargarProductos(): Observable<Productos[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<Productos[]>(`${BASE_URL}/company/${empresaCodigo}/productos`);
  }

  /**
   * Obtiene productos disponibles (estado = 'Disponible')
   */
  cargarProductosDisponibles(): Observable<Productos[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<Productos[]>(`${BASE_URL}/company/${empresaCodigo}/productos/disponibles`);
  }

  /**
   * Busca productos por término de búsqueda
   */
  buscarProductos(termino: string): Observable<Productos[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<Productos[]>(`${BASE_URL}/company/${empresaCodigo}/productos/buscar?q=${encodeURIComponent(termino)}`);
  }

  /**
   * Obtiene productos por tipo/categoría
   */
  obtenerProductosPorTipo(tipoProductoCodigo: number): Observable<Productos[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<Productos[]>(`${BASE_URL}/company/${empresaCodigo}/productos/tipo/${tipoProductoCodigo}`);
  }

  /**
   * Obtiene un producto específico por código
   */
  obtenerProducto(productoCodigo: number): Observable<Productos> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<Productos>(`${BASE_URL}/company/${empresaCodigo}/productos/${productoCodigo}`);
  }

  getProductos(): Productos[] {
    return this.productos; // Método para obtener los productos almacenados
  }

  actualizarProductos(): void {
    this.cargarProductosDisponibles().subscribe(
      (data) => {
        this.productos = data.map(producto => ({ ...producto, quantity: 1 }));
        console.log('Productos cargados para empresa:', this.empresaContext.getEmpresaCodigo());
      },
      (error) => {
        console.error('Error al cargar productos:', error);
      }
    );
  }

  /**
   * Verifica disponibilidad de stock de un producto
   */
  verificarStock(productoCodigo: number, cantidad: number): Observable<boolean> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<boolean>(`${BASE_URL}/company/${empresaCodigo}/productos/${productoCodigo}/stock?cantidad=${cantidad}`);
  }
}
