import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../app.config';
import { ClienteInfo, MostrarClientes } from '../../model/interface/cliente-info';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private http = inject(HttpClient);

  /**
   * Obtiene todos los clientes
   */
  obtenerTodosLosClientes(): Observable<MostrarClientes[]> {
    return this.http.get<MostrarClientes[]>(`${BASE_URL}/cliente/`);
  }

  /**
   * Busca un cliente por DNI con su historial de pedidos
   */
  buscarClientePorDni(dni: string): Observable<ClienteInfo> {
    return this.http.get<ClienteInfo>(`${BASE_URL}/cliente/dni/${dni}`);
  }

  /**
   * Busca un cliente por email
   */
  buscarClientePorEmail(email: string): Observable<ClienteInfo> {
    return this.http.get<ClienteInfo>(`${BASE_URL}/cliente/email/${email}`);
  }

  /**
   * Busca un cliente por código
   */
  buscarClientePorCodigo(codigo: number): Observable<ClienteInfo> {
    return this.http.get<ClienteInfo>(`${BASE_URL}/cliente/${codigo}`);
  }

  /**
   * Registra un nuevo cliente
   */
  registrarCliente(cliente: Partial<ClienteInfo>): Observable<any> {
    return this.http.post(`${BASE_URL}/cliente/registro`, cliente);
  }

  /**
   * Actualiza un cliente existente
   */
  actualizarCliente(codigo: number, cliente: Partial<ClienteInfo>): Observable<any> {
    return this.http.put(`${BASE_URL}/cliente/${codigo}`, cliente);
  }

  /**
   * Elimina un cliente
   */
  eliminarCliente(codigo: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/cliente/${codigo}`);
  }

}
