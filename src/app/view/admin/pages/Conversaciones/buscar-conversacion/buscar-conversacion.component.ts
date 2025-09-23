import { Component } from '@angular/core';

@Component({
  selector: 'app-buscar-conversacion',
  standalone: true,
  imports: [],
  templateUrl: './buscar-conversacion.component.html',
  styleUrl: './buscar-conversacion.component.css'
})
export default class BuscarConversacionComponent {
  searchType: string = 'dni';
  searchValue: string = '';

  buscarConversacion() {
    // Implementación futura
    console.log('Buscando conversación:', this.searchType, this.searchValue);
  }
}