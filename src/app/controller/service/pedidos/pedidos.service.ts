import { Injectable, inject } from '@angular/core';
import {
  HistorialPedido,
  PedidoRequest,
  Pedido,
  DetallePedido,
  Pago,
  FormasPago
} from '../../../model/interface/pedidos';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../app.config';
import { EmpresaContextService } from '../empresa/empresa-context.service';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private http = inject(HttpClient);
  private empresaContext = inject(EmpresaContextService);

  constructor() {}

  crearPedido(pedido: PedidoRequest): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    
    // Asegurar que todos los elementos incluyan el código de empresa
    const pedidoConEmpresa = {
      ...pedido,
      cliente: {
        ...pedido.cliente,
        ClienteEmpresaCodigo: empresaCodigo
      },
      pedido: {
        ...pedido.pedido,
        PedidoEmpresaCodigo: empresaCodigo
      },
      detalles: pedido.detalles.map(detalle => ({
        ...detalle,
        DetallePedidoEmpresaCodigo: empresaCodigo,
        DetallePedidoPedidoEmpresaCodigo: empresaCodigo,
        DetallePedidoProductoEmpresaCodigo: empresaCodigo
      })),
      pago: {
        ...pedido.pago,
        PagoEmpresaCodigo: empresaCodigo,
        PagoPedidoEmpresaCodigo: empresaCodigo
      }
    };

    return this.http.post(`${BASE_URL}/company/${empresaCodigo}/pedidos`, pedidoConEmpresa);
  }

  listarHistoriaPedido(): Observable<HistorialPedido[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<HistorialPedido[]>(`${BASE_URL}/company/${empresaCodigo}/pedidos/historial`);
  }

  /**
   * Obtiene los pedidos pendientes de la empresa
   */
  obtenerPedidosPendientes(): Observable<HistorialPedido[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<HistorialPedido[]>(`${BASE_URL}/company/${empresaCodigo}/pedidos/pendientes`);
  }

  /**
   * Obtiene un pedido específico por código
   */
  obtenerPedido(pedidoCodigo: number): Observable<HistorialPedido> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<HistorialPedido>(`${BASE_URL}/company/${empresaCodigo}/pedidos/${pedidoCodigo}`);
  }

  actualizarPedido(pedidoCodigo: number, estado: string): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    const body = { 
      PedidoCodigo: pedidoCodigo, 
      PedidoEstado: estado,
      PedidoEmpresaCodigo: empresaCodigo 
    };
    return this.http.put(`${BASE_URL}/company/${empresaCodigo}/pedidos/${pedidoCodigo}/estado`, body);
  }

  /**
   * Obtiene las formas de pago disponibles para la empresa
   */
  obtenerFormasPago(): Observable<FormasPago[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<FormasPago[]>(`${BASE_URL}/company/${empresaCodigo}/formas-pago`);
  }

  /**
   * Crea una nueva forma de pago para la empresa
   */
  crearFormaPago(formaPago: Omit<FormasPago, 'Formas_PagoCodigo'>): Observable<FormasPago> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    const formaPagoConEmpresa = {
      ...formaPago,
      Formas_PagoEmpresaCodigo: empresaCodigo
    };
    return this.http.post<FormasPago>(`${BASE_URL}/company/${empresaCodigo}/formas-pago`, formaPagoConEmpresa);
  }

  /**
   * Obtiene estadísticas de pedidos
   */
  obtenerEstadisticasPedidos(): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get(`${BASE_URL}/company/${empresaCodigo}/pedidos/estadisticas`);
  }
}
