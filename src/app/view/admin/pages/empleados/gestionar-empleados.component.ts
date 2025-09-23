import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadosService } from '../../../../controller/service/autenticacionController/empleados.service';
import { EmpresaContextService } from '../../../../controller/service/empresa/empresa-context.service';
import { Empleados, Cargo } from '../../../../model/interface/empleados';

@Component({
  selector: 'app-gestionar-empleados',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
        <p class="text-gray-600 mt-2">Administra los empleados de tu empresa</p>
      </div>

      <!-- Botón Agregar Empleado -->
      <div class="mb-6">
        <button
          (click)="mostrarFormulario = !mostrarFormulario"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <i class="fas fa-plus mr-2"></i>
          {{ mostrarFormulario ? 'Cancelar' : 'Agregar Empleado' }}
        </button>
      </div>

      <!-- Formulario Agregar/Editar Empleado -->
      <div *ngIf="mostrarFormulario" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ empleadoEditando ? 'Editar' : 'Agregar' }} Empleado
        </h2>
        
        <form [formGroup]="empleadoForm" (ngSubmit)="onSubmitEmpleado()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                formControlName="EmpleadoNombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="empleadoForm.get('EmpleadoNombre')?.invalid && empleadoForm.get('EmpleadoNombre')?.touched"
              >
              <p *ngIf="empleadoForm.get('EmpleadoNombre')?.invalid && empleadoForm.get('EmpleadoNombre')?.touched" 
                 class="text-red-500 text-sm mt-1">
                El nombre es requerido
              </p>
            </div>

            <!-- Apellidos -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                formControlName="EmpleadoApellidos"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="empleadoForm.get('EmpleadoApellidos')?.invalid && empleadoForm.get('EmpleadoApellidos')?.touched"
              >
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                formControlName="EmpleadoEmail"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                formControlName="EmpleadoTelefono"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Dirección -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                formControlName="EmpleadoDireccion"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Cargo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cargo
              </label>
              <select
                formControlName="EmpleadoCargoCodigo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cargo...</option>
                <option *ngFor="let cargo of cargos" [value]="cargo.CargoCodigo">
                  {{ cargo.CargoNombre }}
                </option>
              </select>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                formControlName="EmpleadoEstado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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
              [disabled]="empleadoForm.invalid || guardando"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : (empleadoEditando ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de Empleados -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold">Lista de Empleados</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let empleado of empleados" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ empleado.EmpleadoNombre }} {{ empleado.EmpleadoApellidos }}
                    </div>
                    <div class="text-sm text-gray-500">
                      ID: {{ empleado.EmpleadoCodigo }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ empleado.EmpleadoEmail || 'Sin email' }}</div>
                  <div class="text-sm text-gray-500">{{ empleado.EmpleadoTelefono }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ obtenerNombreCargo(empleado.EmpleadoCargoCodigo) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="empleado.EmpleadoEstado === 'Activo' ? 
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800' :
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'">
                    {{ empleado.EmpleadoEstado }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    (click)="editarEmpleado(empleado)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    (click)="cambiarEstadoEmpleado(empleado)"
                    [class]="empleado.EmpleadoEstado === 'Activo' ? 
                      'text-red-600 hover:text-red-900' :
                      'text-green-600 hover:text-green-900'"
                  >
                    {{ empleado.EmpleadoEstado === 'Activo' ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>

              <tr *ngIf="empleados.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  No hay empleados registrados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Cargando empleados...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>
  `,
  styles: []
})
export default class GestionarEmpleadosComponent implements OnInit {
  private empleadosService = inject(EmpleadosService);
  private empresaContext = inject(EmpresaContextService);
  private fb = inject(FormBuilder);

  empleados: Empleados[] = [];
  cargos: Cargo[] = [];
  empleadoForm: FormGroup;
  mostrarFormulario = false;
  empleadoEditando: Empleados | null = null;
  cargando = false;
  guardando = false;
  error = '';

  constructor() {
    this.empleadoForm = this.fb.group({
      EmpleadoNombre: ['', Validators.required],
      EmpleadoApellidos: ['', Validators.required],
      EmpleadoDireccion: ['', Validators.required],
      EmpleadoTelefono: ['', Validators.required],
      EmpleadoEmail: [''],
      EmpleadoEstado: ['Activo', Validators.required],
      EmpleadoCargoCodigo: [null]
    });
  }

  ngOnInit() {
    this.cargarEmpleados();
    this.cargarCargos();
  }

  async cargarEmpleados() {
    try {
      this.cargando = true;
      this.error = '';
      // Aquí llamarías al servicio para obtener empleados
      // this.empleados = await this.empleadosService.obtenerEmpleados();
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      this.error = 'Error al cargar la lista de empleados';
    } finally {
      this.cargando = false;
    }
  }

  async cargarCargos() {
    try {
      // Aquí llamarías al servicio para obtener cargos
      // this.cargos = await this.empleadosService.obtenerCargos();
    } catch (error) {
      console.error('Error al cargar cargos:', error);
    }
  }

  async onSubmitEmpleado() {
    if (this.empleadoForm.invalid) return;

    try {
      this.guardando = true;
      this.error = '';
      
      const empresaCodigo = this.empresaContext.validarEmpresaRequerida();
      const datosEmpleado = {
        ...this.empleadoForm.value,
        EmpleadoEmpresaCodigo: empresaCodigo
      };

      if (this.empleadoEditando) {
        // Actualizar empleado existente
        // await this.empleadosService.actualizarEmpleado(this.empleadoEditando.EmpleadoCodigo, datosEmpleado);
      } else {
        // Crear nuevo empleado
        // await this.empleadosService.crearEmpleado(datosEmpleado);
      }

      this.cancelarEdicion();
      this.cargarEmpleados();
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      this.error = 'Error al guardar el empleado';
    } finally {
      this.guardando = false;
    }
  }

  editarEmpleado(empleado: Empleados) {
    this.empleadoEditando = empleado;
    this.empleadoForm.patchValue(empleado);
    this.mostrarFormulario = true;
  }

  async cambiarEstadoEmpleado(empleado: Empleados) {
    try {
      const nuevoEstado = empleado.EmpleadoEstado === 'Activo' ? 'Inactivo' : 'Activo';
      // await this.empleadosService.actualizarEmpleado(empleado.EmpleadoCodigo, { EmpleadoEstado: nuevoEstado });
      this.cargarEmpleados();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.error = 'Error al cambiar el estado del empleado';
    }
  }

  cancelarEdicion() {
    this.mostrarFormulario = false;
    this.empleadoEditando = null;
    this.empleadoForm.reset();
    this.empleadoForm.patchValue({ EmpleadoEstado: 'Activo' });
  }

  obtenerNombreCargo(cargoCodigo: number | null): string {
    if (!cargoCodigo) return 'Sin cargo';
    const cargo = this.cargos.find(c => c.CargoCodigo === cargoCodigo);
    return cargo?.CargoNombre || 'Cargo desconocido';
  }
}