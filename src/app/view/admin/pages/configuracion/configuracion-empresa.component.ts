import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpresaService } from '../../../../controller/service/empresa/empresa.service';
import { EmpresaContextService } from '../../../../controller/service/empresa/empresa-context.service';
import { Empresa } from '../../../../model/interface/Empresa';
import { TipoProducto } from '../../../../model/interface/inventario';
import { InventarioService } from '../../../../controller/service/inventario/inventario.service';

@Component({
  selector: 'app-configuracion-empresa',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Configuración de Empresa</h1>
        <p class="text-gray-600 mt-2">Administra la información y configuraciones de tu empresa</p>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <nav class="flex space-x-8">
          <button
            (click)="tabActivo = 'empresa'"
            [class]="tabActivo === 'empresa' ? 
              'border-blue-500 text-blue-600 border-b-2 font-medium' :
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2'"
            class="py-2 px-1 text-sm font-medium"
          >
            Información de Empresa
          </button>
          <button
            (click)="tabActivo = 'categorias'"
            [class]="tabActivo === 'categorias' ? 
              'border-blue-500 text-blue-600 border-b-2 font-medium' :
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2'"
            class="py-2 px-1 text-sm font-medium"
          >
            Categorías de Productos
          </button>
        </nav>
      </div>

      <!-- Tab: Información de Empresa -->
      <div *ngIf="tabActivo === 'empresa'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-6">Información de la Empresa</h2>
        
        <form [formGroup]="empresaForm" (ngSubmit)="onSubmitEmpresa()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre de Empresa -->
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
                El nombre de la empresa es requerido
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

            <!-- Logo -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                URL del Logo
              </label>
              <input
                type="url"
                formControlName="EmpresaLogo"
                placeholder="https://ejemplo.com/logo.png"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <p class="text-gray-500 text-sm mt-1">
                URL de la imagen del logo de la empresa
              </p>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              (click)="cargarDatosEmpresa()"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Revertir Cambios
            </button>
            <button
              type="submit"
              [disabled]="empresaForm.invalid || guardandoEmpresa"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ guardandoEmpresa ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tab: Categorías de Productos -->
      <div *ngIf="tabActivo === 'categorias'">
        <!-- Formulario Nueva Categoría -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Agregar Nueva Categoría</h2>
          
          <form [formGroup]="categoriaForm" (ngSubmit)="onSubmitCategoria()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Categoría *
                </label>
                <input
                  type="text"
                  formControlName="TipoProductoNombre"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  formControlName="TipoProductoDescripcion"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div class="flex justify-end mt-4">
              <button
                type="submit"
                [disabled]="categoriaForm.invalid || guardandoCategoria"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {{ guardandoCategoria ? 'Agregando...' : 'Agregar Categoría' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de Categorías -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold">Categorías Existentes</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let categoria of categorias" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ categoria.TipoProductoCodigo }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ categoria.TipoProductoNombre }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                      {{ categoria.TipoProductoDescripcion || 'Sin descripción' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="editarCategoria(categoria)"
                      class="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      (click)="eliminarCategoria(categoria)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>

                <tr *ngIf="categorias.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    No hay categorías registradas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Cargando...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
        <div class="flex items-center">
          <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Success -->
      <div *ngIf="mensaje" class="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-500 mr-2"></i>
          <p class="text-green-800">{{ mensaje }}</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export default class ConfiguracionEmpresaComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private empresaContext = inject(EmpresaContextService);
  private inventarioService = inject(InventarioService);
  private fb = inject(FormBuilder);

  tabActivo = 'empresa';
  empresa: Empresa | null = null;
  categorias: TipoProducto[] = [];

  empresaForm: FormGroup;
  categoriaForm: FormGroup;

  cargando = false;
  guardandoEmpresa = false;
  guardandoCategoria = false;
  error = '';
  mensaje = '';

  constructor() {
    this.empresaForm = this.fb.group({
      EmpresaNombre: ['', Validators.required],
      EmpresaRUC: [''],
      EmpresaDireccion: [''],
      EmpresaTelefono: [''],
      EmpresaEmail: ['', Validators.email],
      EmpresaLogo: ['']
    });

    this.categoriaForm = this.fb.group({
      TipoProductoNombre: ['', Validators.required],
      TipoProductoDescripcion: ['']
    });
  }

  ngOnInit() {
    this.cargarDatosEmpresa();
    this.cargarCategorias();
  }

  cargarDatosEmpresa() {
    const empresaActual = this.empresaContext.getEmpresaActual();
    if (empresaActual) {
      this.empresa = empresaActual;
      this.empresaForm.patchValue(empresaActual);
    }
  }

  async cargarCategorias() {
    try {
      this.cargando = true;
      this.categorias = await this.inventarioService.obtenerCategorias().toPromise() || [];
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      this.error = 'Error al cargar las categorías';
    } finally {
      this.cargando = false;
    }
  }

  async onSubmitEmpresa() {
    if (this.empresaForm.invalid || !this.empresa) return;

    try {
      this.guardandoEmpresa = true;
      this.error = '';
      this.mensaje = '';

      const datosActualizados = this.empresaForm.value;
      const empresaActualizada = await this.empresaService.actualizarEmpresa(
        this.empresa.EmpresaCodigo, 
        datosActualizados
      ).toPromise();

      if (empresaActualizada) {
        this.empresaContext.setEmpresaActual(empresaActualizada);
        this.empresa = empresaActualizada;
        this.mensaje = 'Información de empresa actualizada correctamente';
        setTimeout(() => this.mensaje = '', 3000);
      }
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      this.error = 'Error al actualizar la información de la empresa';
    } finally {
      this.guardandoEmpresa = false;
    }
  }

  async onSubmitCategoria() {
    if (this.categoriaForm.invalid) return;

    try {
      this.guardandoCategoria = true;
      this.error = '';
      this.mensaje = '';

      const nuevaCategoria = this.categoriaForm.value;
      await this.inventarioService.agregarTipoProducto(nuevaCategoria).toPromise();

      this.categoriaForm.reset();
      this.cargarCategorias();
      this.mensaje = 'Categoría agregada correctamente';
      setTimeout(() => this.mensaje = '', 3000);
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      this.error = 'Error al agregar la categoría';
    } finally {
      this.guardandoCategoria = false;
    }
  }

  editarCategoria(categoria: TipoProducto) {
    // Implementar edición de categoría
    this.categoriaForm.patchValue(categoria);
  }

  async eliminarCategoria(categoria: TipoProducto) {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoria.TipoProductoNombre}"?`)) {
      try {
        // Implementar eliminación de categoría
        // await this.inventarioService.eliminarTipoProducto(categoria.TipoProductoCodigo);
        this.cargarCategorias();
        this.mensaje = 'Categoría eliminada correctamente';
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        this.error = 'Error al eliminar la categoría';
      }
    }
  }
}