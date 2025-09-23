export interface Cliente {
  ClienteCodigo?: number;
  ClienteIdentificacion: string | null;
  ClienteNombre: string;
  ClienteApellidos: string | null;
  ClienteDireccion: string | null;
  ClienteTelefono: string | null;
  ClienteEmail: string | null;
  ClienteFecha?: Date;
  ClienteEmpresaCodigo: number;
}

export interface Pedido {
  PedidoCodigo?: number;
  PedidoFecha?: Date;
  PedidoTotal: number;
  PedidoClienteCodigo: number | null;
  PedidoEmpresaCodigo: number;
  PedidoEstado: 'Pendiente' | 'EnProceso' | 'Entregado' | 'Cancelado' | 'Devuelto';
}

export interface DetallePedido {
  DetallePedidoCodigo?: number;
  DetallePedidoPedidoCodigo: number;
  DetallePedidoPedidoEmpresaCodigo: number;
  DetallePedidoProductoCodigo: number;
  DetallePedidoProductoEmpresaCodigo: number;
  DetallePedidoCantidad: number;
  DetallePedidoSubtotal: number;
  DetallePedidoEmpresaCodigo: number;
}

export interface FormasPago {
  Formas_PagoCodigo: number;
  Formas_PagoNombre: string;
  Formas_PagoEmpresaCodigo: number;
}

export interface Pago {
  PagoCodigo?: number;
  PagosFormas_PagoCodigo: number | null;
  Pagosmonto_pagado: number | null;
  Pagosfecha_pago: Date | null;
  PagoPedidoCodigo: number | null;
  PagoPedidoEmpresaCodigo: number;
  PagoEmpresaCodigo: number;
}

export interface PedidoRequest {
  cliente: Cliente;
  pedido: Pedido;
  detalles: DetallePedido[];
  pago: Pago;
}

export interface HistorialPedido {
  PedidoCodigo: number;
  PedidoFecha: Date;
  PedidoTotal: number;
  PedidoEstado: string;
  PedidoEmpresaCodigo: number;
  ClienteCodigo: number;
  ClienteNombre: string;
  ClienteApellidos: string;
  ClienteDireccion: string;
  ClienteTelefono: string;
  ClienteEmail: string;
  DetallePedidoCodigo: number;
  DetallePedidoCantidad: number;
  DetallePedidoSubtotal: number;
  ProductoCodigo: number;
  ProductoNombre: string;
  ProductoDescripcion: string;
  ProductoPrecio: number;
  TipoProductoNombre: string;
}
