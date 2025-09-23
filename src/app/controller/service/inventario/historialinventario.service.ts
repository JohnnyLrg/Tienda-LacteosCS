import { Injectable, inject } from '@angular/core';
import { BASE_URL } from '../../../app.config';
import { HttpClient } from '@angular/common/http';
import { HistoriaInventario } from '../../../model/interface/inventario';
import { Observable } from 'rxjs';
import { EmpresaContextService } from '../empresa/empresa-context.service';

@Injectable({
  providedIn: 'root'
})
export class HistorialinventarioService {

  private historial: HistoriaInventario[] = [];
  private http = inject(HttpClient);
  private empresaContext = inject(EmpresaContextService);

  cargarHistorial(): Observable<HistoriaInventario[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<HistoriaInventario[]>(`${BASE_URL}/company/${empresaCodigo}/historial-inventario`);
  }

  /**
   * Obtiene el historial de un producto específico
   */
  cargarHistorialProducto(productoCodigo: number): Observable<HistoriaInventario[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<HistoriaInventario[]>(`${BASE_URL}/company/${empresaCodigo}/productos/${productoCodigo}/historial`);
  }

  getHistorial(): HistoriaInventario[] {
    return this.historial; 
  }

  actualizarHistorial(): void {
    this.cargarHistorial().subscribe(
      (data) => {
        this.historial = data;
        console.log('Historial cargado para empresa:', this.empresaContext.getEmpresaCodigo());
      },
      (error) => {
        console.error('Error al cargar historial de inventario:', error);
      }
    );
  }

  /**
   * Obtiene estadísticas del historial de inventario
   */
  obtenerEstadisticasHistorial(): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get(`${BASE_URL}/company/${empresaCodigo}/historial-inventario/estadisticas`);
  }
}
