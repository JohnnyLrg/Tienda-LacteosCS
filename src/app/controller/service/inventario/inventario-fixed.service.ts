import { Injectable, inject } from '@angular/core';
import { BASE_URL } from '../../../app.config';
import { HttpClient } from '@angular/common/http';
import { Categoria, Inventario } from '../../../model/interface/inventario';
import{tipoproducto}from '../../../model/interface/Productos';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private inventario = new BehaviorSubject<Inventario[]>([]);
  private http = inject(HttpClient);

  // Cambiar a usar el endpoint de productos del nuevo backend
  cargarInventario(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${BASE_URL}/products/productosMostrar`);
  }

  // NUEVO: Método para cargar inventario admin con filtro de estado
  cargarInventarioAdmin(estado?: string): Observable<Inventario[]> {
    const url = estado 
      ? `${BASE_URL}/products/inventario-admin?estado=${estado}`
      : `${BASE_URL}/products/inventario-admin`;
    return this.http.get<Inventario[]>(url);
  }

  actualizarInventario(): void {
    this.cargarInventario().subscribe(
      (data) => {
        console.log('datos obtenidos del inventario (productos)')
        this.inventario.next(data);
      },
      (error) => {
        console.error('Error al cargar inventario:', error);
      }
    );
  }

  // NUEVO: Actualizar inventario admin con estado específico
  actualizarInventarioAdmin(estado?: string): void {
    this.cargarInventarioAdmin(estado).subscribe(
      (data) => {
        console.log('datos obtenidos del inventario admin:', data);
        this.inventario.next(data);
      },
      (error) => {
        console.error('Error al cargar inventario admin:', error);
      }
    );
  }

  obtenerInventario(): Observable<Inventario[]> {
    return this.inventario.asObservable();
  }

  // Método corregido para actualizar producto con ID
  modificarInventario(productoCodigo: number, formData: FormData): Observable<any> {
    return this.http.put(`${BASE_URL}/products/actualizarProducto/${productoCodigo}`, formData);
  }

  // Este endpoint ya existe en el backend
  agregarProducto(producto: FormData): Observable<any> {
    return this.http.post(`${BASE_URL}/products/ingresarProductos`, producto);
  }

  // Este endpoint necesitará ser implementado para tipos de producto
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${BASE_URL}/products/categorias`);
  }

  // Este endpoint necesitará ser implementado en el backend
  agregartipoProducto(categorias: tipoproducto): Observable<any> {
    return this.http.post(`${BASE_URL}/products/agregar-tipo-producto`, categorias);
  }
}