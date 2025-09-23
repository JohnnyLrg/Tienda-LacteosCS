import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { EmpresaService } from '../../../controller/service/empresa/empresa.service';
import { Empresa, EmpresaCreate } from '../../../model/interface/Empresa';

@Component({
  selector: 'app-gestionar-empresas',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
        <p class="text-gray-600 mt-2">Administra todas las empresas del sistema</p>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <i class="fas fa-building text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Empresas</p>
              <p class="text-2xl font-semibold text-gray-900">{{ empresas.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Empresas Activas</p>
              <p class="text-2xl font-semibold text-gray-900">{{ empresasActivas }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <i class="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Registros Hoy</p>
              <p class="text-2xl font-semibold text-gray-900">{{ registrosHoy }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <i class="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Crecimiento</p>
              <p class="text-2xl font-semibold text-gray-900">+12%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="flex space-x-4 mb-4 sm:mb-0">
          <button
            (click)="mostrarFormulario = !mostrarFormulario"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <i class="fas fa-plus mr-2"></i>
            {{ mostrarFormulario ? 'Cancelar' : 'Nueva Empresa' }}
          </button>
        </div>

        <!-- Búsqueda -->
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="terminoBusqueda"
            (input)="filtrarEmpresas()"
            placeholder="Buscar empresas..."
            class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
      </div>

      <!-- Formulario Nueva Empresa -->
      <div *ngIf="mostrarFormulario" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ empresaEditando ? 'Editar' : 'Nueva' }} Empresa
        </h2>
        
        <form [formGroup]="empresaForm" (ngSubmit)="onSubmitEmpresa()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                formControlName="EmpresaNombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="empresaForm.get('EmpresaNombre')?.invalid && empresaForm.get('EmpresaNombre')?.touched"
              >
              <p *ngIf="empresaForm.get('EmpresaNombre')?.invalid && empresaForm.get('EmpresaNombre')?.touched" 
                 class="text-red-500 text-sm mt-1">
                El nombre es requerido
              </p>
            </div>

            <!-- RUC -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                RUC/NIT
              </label>
              <input
                type="text"
                formControlName="EmpresaRUC"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                formControlName="EmpresaTelefono"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                formControlName="EmpresaEmail"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Logo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                URL del Logo
              </label>
              <input
                type="url"
                formControlName="EmpresaLogo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Dirección -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                formControlName="EmpresaDireccion"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              (click)="cancelarEdicion()"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="empresaForm.invalid || guardando"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : (empresaEditando ? 'Actualizar' : 'Crear Empresa') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de Empresas -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold">Lista de Empresas</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUC
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let empresa of empresasFiltradas" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      *ngIf="empresa.EmpresaLogo" 
                      [src]="empresa.EmpresaLogo" 
                      [alt]="empresa.EmpresaNombre"
                      class="h-10 w-10 rounded-full mr-3"
                      (error)="onImageError($event)"
                    >
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ empresa.EmpresaNombre }}
                      </div>
                      <div class="text-sm text-gray-500">
                        ID: {{ empresa.EmpresaCodigo }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ empresa.EmpresaEmail || 'Sin email' }}</div>
                  <div class="text-sm text-gray-500">{{ empresa.EmpresaTelefono || 'Sin teléfono' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ empresa.EmpresaRUC || 'Sin RUC' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ empresa.EmpresaFechaRegistro | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    (click)="editarEmpresa(empresa)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    (click)="verDetalles(empresa)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Ver
                  </button>
                  <button
                    (click)="eliminarEmpresa(empresa)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr *ngIf="empresasFiltradas.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  {{ terminoBusqueda ? 'No se encontraron empresas' : 'No hay empresas registradas' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Cargando empresas...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>
  `,
  styles: []
})
export default class GestionarEmpresasComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private fb = inject(FormBuilder);

  empresas: Empresa[] = [];
  empresasFiltradas: Empresa[] = [];
  empresaForm: FormGroup;
  mostrarFormulario = false;
  empresaEditando: Empresa | null = null;
  cargando = false;
  guardando = false;
  error = '';
  terminoBusqueda = '';

  // Estadísticas
  get empresasActivas(): number {
    return this.empresas.length; // Aquí podrías filtrar por estado activo
  }

  get registrosHoy(): number {
    const hoy = new Date();
    return this.empresas.filter(e => {
      const fechaRegistro = new Date(e.EmpresaFechaRegistro);
      return fechaRegistro.toDateString() === hoy.toDateString();
    }).length;
  }

  constructor() {
    this.empresaForm = this.fb.group({
      EmpresaNombre: ['', Validators.required],
      EmpresaRUC: [''],
      EmpresaDireccion: [''],
      EmpresaTelefono: [''],
      EmpresaEmail: ['', Validators.email],
      EmpresaLogo: ['']
    });
  }

  ngOnInit() {
    this.cargarEmpresas();
  }

  async cargarEmpresas() {
    try {
      this.cargando = true;
      this.error = '';
      const empresas = await this.empresaService.obtenerEmpresas().toPromise();
      this.empresas = empresas || [];
      this.empresasFiltradas = [...this.empresas];
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      this.error = 'Error al cargar la lista de empresas';
    } finally {
      this.cargando = false;
    }
  }

  filtrarEmpresas() {
    if (!this.terminoBusqueda.trim()) {
      this.empresasFiltradas = [...this.empresas];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    this.empresasFiltradas = this.empresas.filter(empresa =>
      empresa.EmpresaNombre.toLowerCase().includes(termino) ||
      empresa.EmpresaRUC?.toLowerCase().includes(termino) ||
      empresa.EmpresaEmail?.toLowerCase().includes(termino)
    );
  }

  async onSubmitEmpresa() {
    if (this.empresaForm.invalid) return;

    try {
      this.guardando = true;
      this.error = '';

      if (this.empresaEditando) {
        // Actualizar empresa existente
        const result = await this.empresaService.actualizarEmpresa(
          this.empresaEditando.EmpresaCodigo,
          this.empresaForm.value
        ).toPromise();
      } else {
        // Crear nueva empresa
        const nuevaEmpresa: EmpresaCreate = this.empresaForm.value;
        const result = await this.empresaService.crearEmpresa(nuevaEmpresa).toPromise();
      }

      this.cancelarEdicion();
      this.cargarEmpresas();
    } catch (error) {
      console.error('Error al guardar empresa:', error);
      this.error = 'Error al guardar la empresa';
    } finally {
      this.guardando = false;
    }
  }

  editarEmpresa(empresa: Empresa) {
    this.empresaEditando = empresa;
    this.empresaForm.patchValue(empresa);
    this.mostrarFormulario = true;
  }

  verDetalles(empresa: Empresa) {
    // Implementar vista de detalles o modal
    console.log('Ver detalles de:', empresa);
  }

  async eliminarEmpresa(empresa: Empresa) {
    if (confirm(`¿Estás seguro de que deseas eliminar la empresa "${empresa.EmpresaNombre}"?`)) {
      try {
        const result = await this.empresaService.eliminarEmpresa(empresa.EmpresaCodigo).toPromise();
        this.cargarEmpresas();
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
        this.error = 'Error al eliminar la empresa';
      }
    }
  }

  cancelarEdicion() {
    this.mostrarFormulario = false;
    this.empresaEditando = null;
    this.empresaForm.reset();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}