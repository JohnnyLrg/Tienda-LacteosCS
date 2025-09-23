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

// Interfaz para crear/registrar una nueva empresa
export interface EmpresaCreate {
    EmpresaNombre: string;
    EmpresaRUC?: string;
    EmpresaDireccion?: string;
    EmpresaTelefono?: string;
    EmpresaEmail?: string;
    EmpresaLogo?: string;
}