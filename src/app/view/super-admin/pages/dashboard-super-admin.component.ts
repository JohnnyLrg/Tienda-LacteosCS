import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmpresaService } from '../../../controller/service/empresa/empresa.service';
import { EmpleadosService } from '../../../controller/service/autenticacionController/empleados.service';

@Component({
  selector: 'app-dashboard-super-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Super Admin</h1>
        <p class="text-gray-600 mt-2">Panel de control general del sistema</p>
      </div>

      <!-- Estadísticas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Empresas -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Empresas</p>
              <p class="text-3xl font-bold text-blue-600">{{ estadisticas.totalEmpresas }}</p>
              <p class="text-sm text-green-600 mt-1">
                <i class="fas fa-arrow-up mr-1"></i>
                +{{ estadisticas.nuevasEmpresasEsteMes }} este mes
              </p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <i class="fas fa-building text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Empleados -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Empleados</p>
              <p class="text-3xl font-bold text-green-600">{{ estadisticas.totalEmpleados }}</p>
              <p class="text-sm text-green-600 mt-1">
                <i class="fas fa-arrow-up mr-1"></i>
                +{{ estadisticas.nuevosEmpleadosEsteMes }} este mes
              </p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <i class="fas fa-users text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Empresas Activas -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Empresas Activas</p>
              <p class="text-3xl font-bold text-purple-600">{{ estadisticas.empresasActivas }}</p>
              <p class="text-sm text-gray-600 mt-1">
                {{ ((estadisticas.empresasActivas / estadisticas.totalEmpresas) * 100).toFixed(1) }}% del total
              </p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <i class="fas fa-check-circle text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Crecimiento -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Crecimiento</p>
              <p class="text-3xl font-bold text-orange-600">{{ estadisticas.crecimientoPorcentaje }}%</p>
              <p class="text-sm text-gray-600 mt-1">vs mes anterior</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <i class="fas fa-chart-line text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos y Tablas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Empresas por Mes -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">Registro de Empresas (Últimos 6 meses)</h3>
          <div class="space-y-3">
            <div *ngFor="let mes of estadisticas.empresasPorMes" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ mes.mes }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    [style.width.%]="(mes.cantidad / estadisticas.maxEmpresasMes) * 100"
                  ></div>
                </div>
                <span class="text-sm font-medium">{{ mes.cantidad }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de Empresas -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">Estado de Empresas</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span class="text-sm font-medium">Activas</span>
              </div>
              <span class="text-lg font-bold text-green-600">{{ estadisticas.empresasActivas }}</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span class="text-sm font-medium">En Prueba</span>
              </div>
              <span class="text-lg font-bold text-yellow-600">{{ estadisticas.empresasEnPrueba }}</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span class="text-sm font-medium">Suspendidas</span>
              </div>
              <span class="text-lg font-bold text-red-600">{{ estadisticas.empresasSuspendidas }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empresas Recientes -->
      <div class="bg-white rounded-lg shadow-md mb-8">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Empresas Registradas Recientemente</h3>
          <button 
            routerLink="/super-admin/gestionar-empresas"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver todas →
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleados</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let empresa of empresasRecientes" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      *ngIf="empresa.EmpresaLogo" 
                      [src]="empresa.EmpresaLogo" 
                      [alt]="empresa.EmpresaNombre"
                      class="h-8 w-8 rounded-full mr-3"
                      (error)="onImageError($event)"
                    >
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ empresa.EmpresaNombre }}</div>
                      <div class="text-sm text-gray-500">{{ empresa.EmpresaRUC }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ empresa.EmpresaFechaRegistro | date:'shortDate' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ empresa.cantidadEmpleados || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activa
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          routerLink="/super-admin/gestionar-empresas"
          class="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left transition-colors"
        >
          <i class="fas fa-building text-2xl mb-3"></i>
          <h4 class="font-semibold mb-2">Gestionar Empresas</h4>
          <p class="text-sm opacity-90">Crear, editar y administrar empresas del sistema</p>
        </button>

        <button 
          routerLink="/super-admin/gestionar-empleados"
          class="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left transition-colors"
        >
          <i class="fas fa-users text-2xl mb-3"></i>
          <h4 class="font-semibold mb-2">Gestionar Empleados</h4>
          <p class="text-sm opacity-90">Administrar empleados de todas las empresas</p>
        </button>

        <button 
          routerLink="/super-admin/configuracion"
          class="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-left transition-colors"
        >
          <i class="fas fa-cog text-2xl mb-3"></i>
          <h4 class="font-semibold mb-2">Configuración</h4>
          <p class="text-sm opacity-90">Configuración general del sistema</p>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Cargando estadísticas...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>
  `,
  styles: []
})
export default class DashboardSuperAdminComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private empleadosService = inject(EmpleadosService);

  estadisticas: any = {
    totalEmpresas: 0,
    totalEmpleados: 0,
    empresasActivas: 0,
    nuevasEmpresasEsteMes: 0,
    nuevosEmpleadosEsteMes: 0,
    crecimientoPorcentaje: 0,
    empresasEnPrueba: 0,
    empresasSuspendidas: 0,
    empresasPorMes: [],
    maxEmpresasMes: 1
  };

  empresasRecientes: any[] = [];
  cargando = false;
  error = '';

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.cargando = true;
      this.error = '';

      // Cargar estadísticas de empresas
      await this.cargarEstadisticasEmpresas();
      
      // Cargar empresas recientes
      await this.cargarEmpresasRecientes();

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      this.error = 'Error al cargar las estadísticas';
    } finally {
      this.cargando = false;
    }
  }

  private async cargarEstadisticasEmpresas() {
    try {
      const empresas = await this.empresaService.obtenerEmpresas().toPromise();
      const empresasArray = empresas || [];

      this.estadisticas.totalEmpresas = empresasArray.length;
      this.estadisticas.empresasActivas = empresasArray.length; // Todos activos por defecto

      // Calcular empresas del mes actual
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      this.estadisticas.nuevasEmpresasEsteMes = empresasArray.filter(e => 
        new Date(e.EmpresaFechaRegistro) >= inicioMes
      ).length;

      // Generar datos para gráfico de últimos 6 meses
      this.generarDatosGrafico(empresasArray);
      
      // Simular otras estadísticas
      this.estadisticas.empresasEnPrueba = Math.floor(empresasArray.length * 0.1);
      this.estadisticas.empresasSuspendidas = Math.floor(empresasArray.length * 0.05);
      this.estadisticas.crecimientoPorcentaje = 12; // Simulado

    } catch (error) {
      console.error('Error al cargar estadísticas de empresas:', error);
    }
  }

  private async cargarEmpresasRecientes() {
    try {
      const empresas = await this.empresaService.obtenerEmpresas().toPromise();
      this.empresasRecientes = (empresas || [])
        .sort((a, b) => new Date(b.EmpresaFechaRegistro).getTime() - new Date(a.EmpresaFechaRegistro).getTime())
        .slice(0, 5)
        .map(empresa => ({
          ...empresa,
          cantidadEmpleados: Math.floor(Math.random() * 50) + 1 // Simulado
        }));
    } catch (error) {
      console.error('Error al cargar empresas recientes:', error);
    }
  }

  private generarDatosGrafico(empresas: any[]) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const ahora = new Date();
    const datos = [];
    let maxCantidad = 1;

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

      const cantidadMes = empresas.filter(e => {
        const fechaRegistro = new Date(e.EmpresaFechaRegistro);
        return fechaRegistro >= inicioMes && fechaRegistro <= finMes;
      }).length;

      maxCantidad = Math.max(maxCantidad, cantidadMes);

      datos.push({
        mes: meses[fecha.getMonth()],
        cantidad: cantidadMes
      });
    }

    this.estadisticas.empresasPorMes = datos;
    this.estadisticas.maxEmpresasMes = maxCantidad;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}