export interface Inventario {
  ProductoCodigo: number;
  ProductoNombre: string;
  ProductoDescripcion: string;
  ProductoPrecio: number;
  ProductoCantidad: number;
  ProductoFoto: string;
  ProductoEstado: string; // 'V' para Vigente, 'D' para Descontinuado
  Categoria: string;
  CategoriaNombre: string; // Nombre de la categoría que viene del backend
  Producto_TipoProductoCodigo: number;
}export interface InventoryHistory {
  ProductoCodigo: number;
  ProductoNombre: string;
  CampoModificado: string;
  ValorAnterior: string;
  ValorNuevo: string;
  FechaCambio: string;
  TipoCambio: number;
}

export interface Categoria {
  TipoProductoCodigo: number;
  TipoProductoNombre: string;
}
