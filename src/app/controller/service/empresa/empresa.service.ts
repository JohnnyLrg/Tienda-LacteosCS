import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../app.config';
import { Empresa, EmpresaCreate } from '../../../model/interface/Empresa';

/**
 * Servicio para gestionar las operaciones CRUD de empresas
 */
@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);

  /**
   * Obtiene todas las empresas disponibles
   */
  obtenerEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${BASE_URL}/empresas`);
  }

  /**
   * Obtiene una empresa por su código
   */
  obtenerEmpresaPorCodigo(empresaCodigo: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${BASE_URL}/empresas/${empresaCodigo}`);
  }

  /**
   * Crea una nueva empresa
   */
  crearEmpresa(empresa: EmpresaCreate): Observable<Empresa> {
    return this.http.post<Empresa>(`${BASE_URL}/empresas`, empresa);
  }

  /**
   * Actualiza una empresa existente
   */
  actualizarEmpresa(empresaCodigo: number, empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.put<Empresa>(`${BASE_URL}/empresas/${empresaCodigo}`, empresa);
  }

  /**
   * Elimina una empresa (soft delete)
   */
  eliminarEmpresa(empresaCodigo: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/empresas/${empresaCodigo}`);
  }

  /**
   * Verifica si una empresa existe
   */
  verificarEmpresaExiste(empresaCodigo: number): Observable<boolean> {
    return this.http.get<boolean>(`${BASE_URL}/empresas/${empresaCodigo}/exists`);
  }
}