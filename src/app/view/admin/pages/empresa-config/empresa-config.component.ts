import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmpresaConfigService, EmpresaConfig } from '../../../../controller/service/empresa-config.service';

@Component({
  selector: 'app-empresa-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">
                <i class="fas fa-building me-2"></i>
                Configuración de la Empresa
              </h4>
            </div>
            
            <div class="card-body">
              <!-- Vista previa actual -->
              <div class="row mb-4">
                <div class="col-12">
                  <h5 class="text-muted">Vista Previa Actual</h5>
                  <div class="preview-container p-3 bg-light rounded">
                    <div class="d-flex align-items-center">
                      <img 
                        [src]="currentConfig().logo" 
                        alt="Logo empresa"
                        class="logo-preview me-3"
                        style="height: 60px; width: auto; object-fit: contain;"
                      >
                      <h4 class="mb-0 text-primary">{{ currentConfig().nombre }}</h4>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Formulario de edición -->
              <form (ngSubmit)="onSubmit()" #configForm="ngForm">
                <!-- Nombre de la empresa -->
                <div class="mb-4">
                  <label for="nombreEmpresa" class="form-label">
                    <i class="fas fa-tag me-2"></i>Nombre de la Empresa
                  </label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="nombreEmpresa"
                    [(ngModel)]="formData.nombre"
                    name="nombreEmpresa"
                    placeholder="Ingresa el nombre de tu empresa"
                    maxlength="100"
                    required
                  >
                  <div class="form-text">
                    {{ formData.nombre.length }}/100 caracteres
                  </div>
                </div>

                <!-- Logo de la empresa -->
                <div class="mb-4">
                  <label for="logoEmpresa" class="form-label">
                    <i class="fas fa-image me-2"></i>Logo de la Empresa
                  </label>
                  
                  <!-- Preview del nuevo logo -->
                  @if (previewLogo()) {
                    <div class="mb-3">
                      <div class="d-flex align-items-center">
                        <img 
                          [src]="previewLogo()" 
                          alt="Vista previa del nuevo logo"
                          class="logo-preview me-3"
                          style="height: 80px; width: auto; object-fit: contain; border: 2px dashed #007bff;"
                        >
                        <div>
                          <small class="text-muted d-block">Vista previa del nuevo logo</small>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger mt-1"
                            (click)="clearPreview()"
                          >
                            <i class="fas fa-times me-1"></i>Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                  
                  <input 
                    type="file" 
                    class="form-control" 
                    id="logoEmpresa"
                    (change)="onFileSelected($event)"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    #fileInput
                  >
                  <div class="form-text">
                    <i class="fas fa-info-circle me-1"></i>
                    Formatos permitidos: PNG, JPG, JPEG, GIF, WebP. Tamaño máximo: 2MB
                  </div>
                </div>

                <!-- Información de almacenamiento -->
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  <strong>Información:</strong> La configuración se guarda localmente en tu navegador. 
                  Tamaño actual: {{ storageSize() }}
                </div>

                <!-- Botones de acción -->
                <div class="d-flex gap-2 flex-wrap">
                  <button 
                    type="submit" 
                    class="btn btn-success"
                    [disabled]="!configForm.form.valid || isLoading()"
                  >
                    @if (isLoading()) {
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    }
                    <i class="fas fa-save me-2"></i>Guardar Cambios
                  </button>
                  
                  <button 
                    type="button" 
                    class="btn btn-outline-warning"
                    (click)="resetLogo()"
                    [disabled]="isLoading()"
                  >
                    <i class="fas fa-undo me-2"></i>Restaurar Logo Original
                  </button>
                  
                  <button 
                    type="button" 
                    class="btn btn-outline-danger"
                    (click)="resetAll()"
                    [disabled]="isLoading()"
                  >
                    <i class="fas fa-trash-restore me-2"></i>Restaurar Todo
                  </button>
                </div>

                @if (hasCustomConfig()) {
                  <div class="mt-3">
                    <small class="text-success">
                      <i class="fas fa-check me-1"></i>
                      Tienes configuraciones personalizadas aplicadas
                    </small>
                  </div>
                }
              </form>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="card mt-4">
            <div class="card-body">
              <h6 class="card-title">
                <i class="fas fa-question-circle me-2"></i>¿Cómo funciona?
              </h6>
              <ul class="mb-0 text-muted small">
                <li>Los cambios se guardan localmente en tu navegador usando localStorage</li>
                <li>La imagen anterior se elimina automáticamente al subir una nueva</li>
                <li>Si cambias de navegador o borras los datos, se restaurará la configuración por defecto</li>
                <li>El logo se convierte a Base64 para un acceso más rápido</li>
                <li>No se requiere conexión a la base de datos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./empresa-config.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class EmpresaConfigComponent {
  private empresaConfigService = inject(EmpresaConfigService);
  private snackBar = inject(MatSnackBar);

  // Signals
  currentConfig = this.empresaConfigService.getConfigSignal();
  isLoading = signal(false);
  previewLogo = signal<string | null>(null);
  storageSize = signal('0 KB');

  // Formulario
  formData = {
    nombre: '',
    logoFile: null as File | null
  };

  constructor() {
    // Inicializar formulario con datos actuales
    const config = this.currentConfig();
    this.formData.nombre = config.nombre;
    this.updateStorageSize();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) {
      this.clearPreview();
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Tipo de archivo no permitido. Use PNG, JPG, JPEG, GIF o WebP', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      this.clearPreview();
      return;
    }

    // Validar tamaño (2MB máximo)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      this.snackBar.open('El archivo es demasiado grande. Máximo 2MB permitido', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      this.clearPreview();
      return;
    }

    this.formData.logoFile = file;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewLogo.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearPreview(): void {
    this.previewLogo.set(null);
    this.formData.logoFile = null;
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    try {
      // Actualizar nombre si cambió
      const currentConfig = this.currentConfig();
      if (this.formData.nombre.trim() !== currentConfig.nombre) {
        this.empresaConfigService.updateNombre(this.formData.nombre.trim());
      }

      // Actualizar logo si se seleccionó uno nuevo
      if (this.formData.logoFile) {
        await this.empresaConfigService.updateLogo(this.formData.logoFile);
        this.clearPreview();
      }

      this.updateStorageSize();
      
      this.snackBar.open('Configuración guardada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

    } catch (error) {
      console.error('Error al guardar configuración:', error);
      this.snackBar.open('Error al guardar la configuración', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  resetLogo(): void {
    if (this.isLoading()) return;

    this.empresaConfigService.resetLogo();
    this.clearPreview();
    this.updateStorageSize();
    
    this.snackBar.open('Logo restaurado al original', 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  resetAll(): void {
    if (this.isLoading()) return;

    this.empresaConfigService.resetToDefault();
    this.formData.nombre = this.currentConfig().nombre;
    this.clearPreview();
    this.updateStorageSize();
    
    this.snackBar.open('Configuración restaurada completamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  hasCustomConfig(): boolean {
    return this.empresaConfigService.hasCustomConfig();
  }

  private updateStorageSize(): void {
    const size = this.empresaConfigService.getStorageSize();
    this.storageSize.set(size);
  }
}