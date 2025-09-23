import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BASE_URL } from '../../../app.config';
import { Observable, catchError, throwError } from 'rxjs';
import { ClienteInfo, MostrarClientes } from '../../../model/interface/cliente-info';
import { Cliente } from '../../../model/interface/pedidos';
import { EmpresaContextService } from '../empresa/empresa-context.service';

@Injectable({
  providedIn: 'root',
})
export class ClienteInfoService {
  private http = inject(HttpClient);
  private empresaContext = inject(EmpresaContextService);

  private mostrarCli: MostrarClientes[] = [];
  constructor() {}

  buscarClienteInfo(clienteIdentificacion: string): Observable<ClienteInfo> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    console.log('Buscando cliente por identificación:', clienteIdentificacion, 'en empresa:', empresaCodigo);
    
    return this.http.get<ClienteInfo>(`${BASE_URL}/company/${empresaCodigo}/clientes/${encodeURIComponent(clienteIdentificacion)}`).pipe(
      catchError((error) => {
        console.error('Error al buscar cliente:', error);
        return throwError(() => new Error('Error al buscar información del cliente'));
      })
    );
  }

  /**
   * Crea un nuevo cliente
   */
  crearCliente(cliente: Omit<Cliente, 'ClienteCodigo'>): Observable<Cliente> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    const clienteConEmpresa = {
      ...cliente,
      ClienteEmpresaCodigo: empresaCodigo
    };
    return this.http.post<Cliente>(`${BASE_URL}/company/${empresaCodigo}/clientes`, clienteConEmpresa);
  }

  /**
   * Actualiza un cliente existente
   */
  actualizarCliente(clienteCodigo: number, cliente: Partial<Cliente>): Observable<Cliente> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.put<Cliente>(`${BASE_URL}/company/${empresaCodigo}/clientes/${clienteCodigo}`, cliente);
  }

  mostrarClientes(): Observable<MostrarClientes[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<MostrarClientes[]>(`${BASE_URL}/company/${empresaCodigo}/clientes`);
  }

  /**
   * Busca clientes por término de búsqueda
   */
  buscarClientes(termino: string): Observable<MostrarClientes[]> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<MostrarClientes[]>(`${BASE_URL}/company/${empresaCodigo}/clientes/buscar?q=${encodeURIComponent(termino)}`);
  }

  /**
   * Obtiene un cliente específico por código
   */
  obtenerCliente(clienteCodigo: number): Observable<ClienteInfo> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get<ClienteInfo>(`${BASE_URL}/company/${empresaCodigo}/clientes/codigo/${clienteCodigo}`);
  }

  getClientes(): MostrarClientes[] {
    return this.mostrarCli;
  }

  actualizarClientes(): void {
    this.mostrarClientes().subscribe(
      (data) => {
        this.mostrarCli = data;
        console.log('Clientes cargados para empresa:', this.empresaContext.getEmpresaCodigo());
      },
      (error) => {
        console.error('Error al cargar los clientes:', error);
      }
    );
  }

  /**
   * Obtiene estadísticas de clientes
   */
  obtenerEstadisticasClientes(): Observable<any> {
    const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
    return this.http.get(`${BASE_URL}/company/${empresaCodigo}/clientes/estadisticas`);
  }
}
