import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BASE_URL } from '../../../app.config';
import { Observable, catchError, throwError } from 'rxjs';
import { ClienteInfo, MostrarClientes } from '../../../model/interface/cliente-info';

@Injectable({
  providedIn: 'root',
})
export class ClienteInfoService {
  private http = inject(HttpClient);

  private mostrarCli: MostrarClientes[] = [];
  constructor() {}

  // Buscar cliente por DNI o Email usando el nuevo backend
  buscarClienteInfo(cliente: { ClienteDni?: string, ClienteEmail?: string }): Observable<any> {     
    console.log('Enviando datos al servidor:', cliente);

    // Si se proporciona email, buscar por email
    if (cliente.ClienteEmail) {
      return this.http.get(`${BASE_URL}/cliente/email/`).pipe(
        catchError((error) => {
          console.error('Error en la solicitud:', error);
          return throwError(() => new Error('Error en la solicitud'));
        })
      );
    }

    // Para buscar por DNI, necesitaríamos agregar un endpoint en el backend
    // Por ahora, obtenemos todos los clientes y filtramos
    return this.http.get<any[]>(`${BASE_URL}/cliente/`).pipe(
      catchError((error) => {
        console.error('Error en la solicitud:', error);
        return throwError(() => new Error('Error en la solicitud'));
      })
    );
  }

  // Usar el nuevo endpoint de clientes
  mostrarClientes(): Observable<MostrarClientes[]> {
    return this.http.get<MostrarClientes[]>(`${BASE_URL}/cliente/`)
  }

  getClientes(): MostrarClientes[] {
    return this.mostrarCli;
  }

  actualizarClientes(): void {
    this.mostrarClientes().subscribe(
      (data) => {
        this.mostrarCli = data;
      },
      (error) => {
        console.error('Error al cargar los clientes:', error);
      }
    );
  }
}