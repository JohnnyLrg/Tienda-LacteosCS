export interface Empleado {
  EmpleadoCodigo: number;
  EmpleadoNombre: string;
  EmpleadoApellidos: string;
  EmpleadoEmail: string | null;
  EmpleadoEmpresaCodigo: number;
}

export interface Mensaje {
  MensajesId: number;
  MensajesClienteIdentificacion: string | null;
  MensajesTexto: string;
  EsUsuario: boolean; // 1 cliente / 0 empleado
  Mensajestimestamp: Date;
  MensajesCodigoEmpleado: number | null;
  MensajesEmpresaCodigo: number;
  MensajesEstado: string;
}

export interface ClienteConMensajes {
  ClienteIdentificacion: string;
  mensajes: Mensaje[];
  EmpresaCodigo: number;
}

export interface ClienteConEmpleado {
  ClienteIdentificacion: string;
  Empleado: Empleado;
  Mensajes: Mensaje[];
  EmpresaCodigo: number;
}
