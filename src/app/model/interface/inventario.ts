export interface Inventario {
  ProductoCodigo: number;
  ProductoEmpresaCodigo: number;
  ProductoNombre: string;
  ProductoDescripcion: string | null;
  ProductoPrecio: number;
  ProductoCantidad: number;
  ProductoFoto: string | null;
  ProductoEstado: 'Disponible' | 'Agotado' | 'Descontinuado';
  Producto_TipoProductoCodigo: number | null;
}

export interface HistoriaInventario {
  HistorialId: number;
  ProductoCodigo: number;
  ProductoEmpresaCodigo: number;
  CampoModificado: string | null;
  ValorAnterior: string | null;
  ValorNuevo: string | null;
  FechaCambio: Date;
  TipoCambio: 'Creacion' | 'Actualizacion' | null;
  EmpleadoCodigo: number | null;
  HistoriaEmpresaCodigo: number;
}

export interface TipoProducto {
  TipoProductoCodigo: number;
  TipoProductoNombre: string | null;
  TipoProductoDescripcion: string | null;
  TipoProductoEmpresaCodigo: number;
}
