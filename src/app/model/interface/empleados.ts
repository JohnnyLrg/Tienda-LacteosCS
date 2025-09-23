export interface Cargo {
    CargoCodigo: number;
    CargoNombre: string;
    CargoDescripcion: string;
    CargoEmpresaCodigo: number;
}

export interface Empleados {
    EmpleadoCodigo: number;
    EmpleadoNombre: string;
    EmpleadoApellidos: string;
    EmpleadoDireccion: string;
    EmpleadoTelefono: string;
    EmpleadoEmail: string | null;
    EmpleadoEstado: 'Activo' | 'Inactivo';
    EmpleadoCargoCodigo: number | null;
    EmpleadoEmpresaCodigo: number;
    // Campo adicional para el nombre del cargo (usado en autenticación)
    Cargo?: 'Empleado' | 'Administrador' | 'SuperAdministrador';
}

export interface Usuario {
    UsuarioCodigo: number;
    UsuarioNombre: string;
    UsuarioContraseñaHash: string;
    UsuarioEmpleadoCodigo: number | null;
    UsuarioEmpresaCodigo: number;
}