export interface Productos {
    ProductoCodigo: number;  
    ProductoEmpresaCodigo: number; // Campo requerido para multi-tenant
    ProductoNombre: string;  
    ProductoDescripcion: string | null;  
    ProductoPrecio: number;  
    ProductoCantidad: number;  
    ProductoFoto: string | null;  
    ProductoEstado: 'Disponible' | 'Agotado' | 'Descontinuado';  
    Producto_TipoProductoCodigo: number | null;
    quantity?: number; // Campo opcional para carrito de compras
}

export interface TipoProducto {
    TipoProductoCodigo: number;
    TipoProductoNombre: string | null;
    TipoProductoDescripcion: string | null;
    TipoProductoEmpresaCodigo: number;
}

// Nueva interfaz para la empresa (tenant)
export interface Empresa {
    EmpresaCodigo: number;
    EmpresaNombre: string;
    EmpresaRUC: string | null;
    EmpresaDireccion: string | null;
    EmpresaTelefono: string | null;
    EmpresaEmail: string | null;
    EmpresaLogo: string | null;
    EmpresaFechaRegistro: Date;
}
