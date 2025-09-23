import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Empresa } from '../../../model/interface/Empresa';

/**
 * Servicio para manejar el contexto de empresa en el sistema multi-tenant
 */
@Injectable({
  providedIn: 'root'
})
export class EmpresaContextService {
  private empresaActualSubject = new BehaviorSubject<Empresa | null>(null);
  private empresaCodigoSubject = new BehaviorSubject<number | null>(null);

  /**
   * Observable de la empresa actual
   */
  empresaActual$ = this.empresaActualSubject.asObservable();

  /**
   * Observable del código de empresa actual
   */
  empresaCodigo$ = this.empresaCodigoSubject.asObservable();

  constructor() {
    // Cargar empresa desde localStorage al inicializar
    this.cargarEmpresaDesdeStorage();
  }

  /**
   * Establece la empresa actual en el contexto
   */
  setEmpresaActual(empresa: Empresa): void {
    this.empresaActualSubject.next(empresa);
    this.empresaCodigoSubject.next(empresa.EmpresaCodigo);
    this.guardarEmpresaEnStorage(empresa);
  }

  /**
   * Obtiene la empresa actual
   */
  getEmpresaActual(): Empresa | null {
    return this.empresaActualSubject.value;
  }

  /**
   * Obtiene el código de la empresa actual
   */
  getEmpresaCodigo(): number | null {
    return this.empresaCodigoSubject.value;
  }

  /**
   * Verifica si hay una empresa seleccionada
   */
  tieneEmpresaSeleccionada(): boolean {
    return this.empresaCodigoSubject.value !== null;
  }

  /**
   * Limpia el contexto de empresa (para logout)
   */
  limpiarContexto(): void {
    this.empresaActualSubject.next(null);
    this.empresaCodigoSubject.next(null);
    localStorage.removeItem('empresaActual');
  }

  /**
   * Valida que se tenga una empresa seleccionada, lanza error si no
   */
  validarEmpresaRequerida(): number {
    const empresaCodigo = this.getEmpresaCodigo();
    if (!empresaCodigo) {
      throw new Error('No hay empresa seleccionada. Debe seleccionar una empresa para continuar.');
    }
    return empresaCodigo;
  }

  /**
   * Guarda la empresa en localStorage
   */
  private guardarEmpresaEnStorage(empresa: Empresa): void {
    try {
      localStorage.setItem('empresaActual', JSON.stringify(empresa));
    } catch (error) {
      console.error('Error al guardar empresa en localStorage:', error);
    }
  }

  /**
   * Carga la empresa desde localStorage
   */
  private cargarEmpresaDesdeStorage(): void {
    try {
      const empresaGuardada = localStorage.getItem('empresaActual');
      if (empresaGuardada) {
        const empresa: Empresa = JSON.parse(empresaGuardada);
        this.empresaActualSubject.next(empresa);
        this.empresaCodigoSubject.next(empresa.EmpresaCodigo);
      }
    } catch (error) {
      console.error('Error al cargar empresa desde localStorage:', error);
      localStorage.removeItem('empresaActual');
    }
  }
}