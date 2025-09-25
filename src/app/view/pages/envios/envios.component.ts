import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { ClienteInfoService } from '../../../controller/service/pedidos/clienteInfo.service';
import { ClientesService } from '../../../controller/service/clientes.service';
import { ClienteInfo } from '../../../model/interface/cliente-info';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-envios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './envios.component.html',
  styleUrl: './envios.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EnviosComponent {
  clienteInforService = inject(ClienteInfoService);
  clientesService = inject(ClientesService);

  dni: string = '';
  cdr = inject(ChangeDetectorRef);
  clienteInfo: ClienteInfo | null = null;

  private snackBar = inject(MatSnackBar);
  // MatSnackBar
  ngOnInit(): void {}
  buscarinformacionCliente() {
    if (this.dni && this.dni.length >= 8) {
      console.log('Enviando solicitud con DNI:', this.dni);
      this.clientesService.buscarClientePorDni(this.dni).subscribe({
        next: (data: ClienteInfo) => {
          console.log('Datos recibidos:', data);
          this.clienteInfo = data;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error al obtener la información del cliente', error);
          this.clienteInfo = null;
          this.snackBar.open('No se encontró ningún cliente con el DNI proporcionado', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center'
          });
          this.cdr.markForCheck();
        }
      });
    } else {
      this.snackBar.open('Por favor ingrese un DNI válido (mínimo 8 dígitos).', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center'
      });
    }
  }
}
