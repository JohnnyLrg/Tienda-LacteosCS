import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpresaService } from '../../../../controller/service/empresa/empresa.service';
import { EmpresaContextService } from '../../../../controller/service/empresa/empresa-context.service';
import { AuthService } from '../../../../controller/service/autenticacionController/auth.service';
import { Empresa } from '../../../../model/interface/Empresa';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-seleccionar-empresa',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Seleccionar Empresa
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Por favor, selecciona la empresa con la que deseas trabajar
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <form [formGroup]="empresaForm" (ngSubmit)="onSubmit()">
            <div>
              <label for="empresa" class="block text-sm font-medium text-gray-700">
                Empresa
              </label>
              <select
                id="empresa"
                formControlName="empresaCodigo"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                [class.border-red-500]="empresaForm.get('empresaCodigo')?.invalid && empresaForm.get('empresaCodigo')?.touched"
              >
                <option value="">Seleccione una empresa...</option>
                <option *ngFor="let empresa of empresas" [value]="empresa.EmpresaCodigo">
                  {{ empresa.EmpresaNombre }}
                </option>
              </select>
              <p *ngIf="empresaForm.get('empresaCodigo')?.invalid && empresaForm.get('empresaCodigo')?.touched" 
                 class="mt-1 text-sm text-red-600">
                Por favor selecciona una empresa
              </p>
            </div>

            <div class="mt-6">
              <button
                type="submit"
                [disabled]="empresaForm.invalid || cargando"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="cargando" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </span>
                <span *ngIf="!cargando">Continuar</span>
              </button>
            </div>
          </form>

          <div *ngIf="error" class="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            <div class="mt-6">
              <button
                type="button"
                (click)="cerrarSesion()"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export default class SeleccionarEmpresaComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private empresaContext = inject(EmpresaContextService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  empresaForm: FormGroup;
  empresas: Empresa[] = [];
  cargando = false;
  error = '';

  constructor() {
    this.empresaForm = this.fb.group({
      empresaCodigo: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarEmpresas();
  }

  async cargarEmpresas() {
    try {
      this.cargando = true;
      this.empresas = await firstValueFrom(this.empresaService.obtenerEmpresas()) || [];
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      this.error = 'Error al cargar las empresas disponibles';
    } finally {
      this.cargando = false;
    }
  }

  async onSubmit() {
    if (this.empresaForm.invalid) return;

    try {
      this.cargando = true;
      this.error = '';

      const empresaCodigo = this.empresaForm.value.empresaCodigo;
      const empresaSeleccionada = this.empresas.find(e => e.EmpresaCodigo === parseInt(empresaCodigo));

      if (empresaSeleccionada) {
        this.empresaContext.setEmpresaActual(empresaSeleccionada);
        this.router.navigateByUrl('/empresa');
      } else {
        this.error = 'Empresa no encontrada';
      }
    } catch (error) {
      console.error('Error al seleccionar empresa:', error);
      this.error = 'Error al seleccionar la empresa';
    } finally {
      this.cargando = false;
    }
  }

  async cerrarSesion() {
    try {
      await this.authService.cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}