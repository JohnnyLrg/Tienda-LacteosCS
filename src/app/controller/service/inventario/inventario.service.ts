import { Injectable, inject } from '@angular/core';
import { BASE_URL } from '../../../app.config';
import { HttpClient } from '@angular/common/http';
import { TipoProducto, Inventario } from '../../../model/interface/inventario';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmpresaContextService } from '../empresa/empresa-context.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private inventario = new BehaviorSubject<Inventario[]>([]);
  private http = inject(HttpClient);
  private empresaContext = inject(EmpresaContextService);

  cargarInventario(): Observable<Inventario[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<Inventario[]>(`${BASE_URL}/company/${empresaCodigo}/inventario`);
  }

  actualizarInventario(): void {
    this.cargarInventario().subscribe(
      (data) => {
        console.log('datos obtenidos del INVENTARIO para empresa:', this.empresaContext.getEmpresaCodigo());
        this.inventario.next(data);
      },
      (error) => {
        console.error('Error al cargar inventario:', error);
      }
    );
  }

  obtenerInventario(): Observable<Inventario[]> {
    return this.inventario.asObservable();
  }

  modificarInventario(formData: FormData): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    // Agregar empresaCodigo al FormData
    formData.append('ProductoEmpresaCodigo', empresaCodigo.toString());
    return this.http.put(`${BASE_URL}/company/${empresaCodigo}/inventario`, formData);
  }

  agregarProducto(producto: FormData): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    // Agregar empresaCodigo al FormData
    producto.append('ProductoEmpresaCodigo', empresaCodigo.toString());
    return this.http.post(`${BASE_URL}/company/${empresaCodigo}/productos`, producto);
  }

  obtenerCategorias(): Observable<TipoProducto[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<TipoProducto[]>(`${BASE_URL}/company/${empresaCodigo}/categorias`);
  }
  
  agregarTipoProducto(categoria: TipoProducto): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    // Asegurar que la categoría incluya el código de empresa
    const categoriaConEmpresa = {
      ...categoria,
      TipoProductoEmpresaCodigo: empresaCodigo
    };
    return this.http.post(`${BASE_URL}/company/${empresaCodigo}/tipo-producto`, categoriaConEmpresa);
  }

  /**
   * Obtiene un producto específico por su código dentro de la empresa actual
   */
  obtenerProducto(productoCodigo: number): Observable<Inventario> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<Inventario>(`${BASE_URL}/company/${empresaCodigo}/productos/${productoCodigo}`);
  }

  /**
   * Elimina un producto (cambio de estado)
   */
  eliminarProducto(productoCodigo: number): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.delete(`${BASE_URL}/company/${empresaCodigo}/productos/${productoCodigo}`);
  }
}