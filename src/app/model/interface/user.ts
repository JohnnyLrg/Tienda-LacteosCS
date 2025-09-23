import { FormControl } from "@angular/forms";
import { Empresa } from "./Empresa";

/**
 * Representa un usuario del sistema multi-tenant.
 */
export interface User {
    UsuarioCodigo?: number;
    UsuarioNombre: string;
    UsuarioContraseñaHash: string;
    UsuarioEmpleadoCodigo: number | null;
    UsuarioEmpresaCodigo: number;
}

/**
 * Representa un usuario con todos los campos necesarios para el registro.
 */
export interface UserRegistration {
    UsuarioNombre: string;
    Usuariocorreo_electronico: string;
    Usuariocontrasena: string;
    UsuarioTelefono: string;
    EmpresaCodigo: number; // Empresa a la que pertenece
}

/**
 * Representa un formulario de usuario para el registro,
 * donde cada campo es un FormControl.
 */
export interface UserForm {
    UsuarioNombre: FormControl<string>;
    UsuarioApellido: FormControl<string>;
    Usuariocorreo_electronico: FormControl<string>;
    Usuariocontrasena: FormControl<string>;
    UsuarioRepetirContrasena: FormControl<string>;
    UsuarioTelefono: FormControl<string>;
    EmpresaCodigo: FormControl<number>;
}

/**
 * Representa un formulario de login de usuario,
 * donde cada campo es un FormControl.
 */
export interface UserLoginForm {
    Usuariocorreo_electronico: FormControl<string>;
    Usuariocontrasena: FormControl<string>;
    EmpresaCodigo: FormControl<number>;
}

/**
 * Representa solo las propiedades necesarias para el login
 * extraídas de la interfaz UserRegistration.
 */
export type UserLogin = Pick<UserRegistration, 'Usuariocorreo_electronico' | 'Usuariocontrasena'> & {
    EmpresaCodigo: number;
};

/**
 * Contexto de sesión del usuario autenticado
 */
export interface UserSession {
    usuario: User;
    empresa: Empresa; // Empresa completa
    empleado?: {
        EmpleadoCodigo: number;
        EmpleadoNombre: string;
        EmpleadoApellidos: string;
        Cargo?: string;
    };
    token: string;
}


