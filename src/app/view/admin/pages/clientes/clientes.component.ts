import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MostrarClientes } from '../../../../model/interface/cliente-info';
import { ClientesService } from '../../../../controller/service/clientes.service';
import { ClienteInfo } from '../../../../model/interface/cliente-info';
import { ClienteInfoService } from '../../../../controller/service/pedidos/clienteInfo.service';
import EnviosComponent from '../../../pages/envios/envios.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClientesComponent {

  public clientes: MostrarClientes[] = [];
  public selectedCliente: MostrarClientes | null = null;
  private originalIndex: number | null = null;

  mostrarBuscarCliente : boolean = false;
  dniBusqueda: string = '';
  clienteBuscado: ClienteInfo | null = null;
  mensajeBusqueda: string = '';

  activarBuscarClienteDni(){
    this.mostrarBuscarCliente = !this.mostrarBuscarCliente;
  }

  private clienteInfoService = inject (ClienteInfoService);
  private clientesService = inject(ClientesService);
  cdr = inject(ChangeDetectorRef);
  
  ngOnInit(): void {
    this.listarClientes();
  }

  listarClientes() {
    this.clienteInfoService.mostrarClientes().subscribe(
      (data) => {
        this.clientes = data;
        console.log(this.clientes);
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error al cargar los clientes:', error);
        this.cdr.markForCheck();
      }
    );
  }

  seleccionarCliente(cliente: MostrarClientes) {
    this.originalIndex = this.clientes.indexOf(cliente);
    this.clientes = this.clientes.filter(c => c !== cliente);
    this.clientes.unshift(cliente);
    this.selectedCliente = cliente;

    this.scrollToTop();
    this.cdr.markForCheck();
  }

  deseleccionarCliente() {
    if (this.selectedCliente && this.originalIndex !== null) {
      this.clientes = this.clientes.filter(c => c !== this.selectedCliente);
      this.clientes.splice(this.originalIndex, 0, this.selectedCliente);
    }
    this.selectedCliente = null;
    this.originalIndex = null;
    this.cdr.markForCheck();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  buscarClientePorDni(): void {
    if (!this.dniBusqueda || this.dniBusqueda.length < 8) {
      this.mensajeBusqueda = 'Por favor ingrese un DNI válido (mínimo 8 dígitos)';
      this.clienteBuscado = null;
      return;
    }

    this.mensajeBusqueda = 'Buscando cliente...';
    this.clienteBuscado = null;

    this.clientesService.buscarClientePorDni(this.dniBusqueda).subscribe({
      next: (cliente: ClienteInfo) => {
        this.clienteBuscado = cliente;
        this.mensajeBusqueda = '';
        console.log('Cliente encontrado:', cliente);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al buscar cliente:', error);
        this.clienteBuscado = null;
        this.mensajeBusqueda = 'No se encontró ningún cliente con el DNI proporcionado.';
        this.cdr.markForCheck();
      }
    });
  }

  limpiarBusqueda(): void {
    this.dniBusqueda = '';
    this.clienteBuscado = null;
    this.mensajeBusqueda = '';
    this.cdr.markForCheck();
  }
}
