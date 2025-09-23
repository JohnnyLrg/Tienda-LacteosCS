export interface ClienteInfo {
  ClienteCodigo: number;
  ClienteIdentificacion: string | null;
  ClienteNombre: string;
  ClienteApellidos: string | null;
  ClienteDireccion: string | null;
  ClienteTelefono: string | null;
  ClienteEmail: string | null;
  ClienteFecha: Date;
  ClienteEmpresaCodigo: number;
  Pedidos: Pedido[];
}

export interface Pedido {
  PedidoCodigo: number;
  PedidoFecha: Date;
  PedidoTotal: number;
  PedidoEstado: 'Pendiente' | 'EnProceso' | 'Entregado' | 'Cancelado' | 'Devuelto';
  PedidoEmpresaCodigo: number;
  Detalles: DetallePedido[];
}

export interface DetallePedido {
  DetallePedidoCodigo: number;
  DetallePedidoCantidad: number;
  DetallePedidoSubtotal: number;
  ProductoNombre: string;
  ProductoDescripcion: string;
  ProductoPrecio: number;
  ProductoCodigo: number;
  ProductoEmpresaCodigo: number;
}

export interface MostrarClientes {
  ClienteCodigo: number;
  ClienteIdentificacion: string | null;
  ClienteNombre: string;
  ClienteApellidos: string | null;
  ClienteDireccion: string | null;
  ClienteTelefono: string | null;
  ClienteEmail: string | null;
  ClienteFecha: Date;
  ClienteEmpresaCodigo: number;
  CantidadPedidos: number;
  TotalCompras: number;
  ProductosComprados: string;
  CategoriasMasCompradas: string;
}
