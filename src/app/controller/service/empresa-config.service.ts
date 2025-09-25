import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface EmpresaConfig {
  nombre: string;
  logo: string; // Base64 string de la imagen
  logoOriginal: string; // Logo por defecto
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaConfigService {
  private readonly STORAGE_KEY = 'empresa_config';
  
  // Configuración por defecto
  private defaultConfig: EmpresaConfig = {
    nombre: 'Sistema Comercial',
    logo: '../../../../assets/logoEmpresa.png',
    logoOriginal: '../../../../assets/logoEmpresa.png'
  };

  // Signal reactivo para la configuración
  private configSignal = signal<EmpresaConfig>(this.getConfig());
  
  // BehaviorSubject para compatibilidad con observables
  private configSubject = new BehaviorSubject<EmpresaConfig>(this.getConfig());

  constructor() {
    // Inicializar con la configuración guardada o la por defecto
    const savedConfig = this.getConfig();
    this.configSignal.set(savedConfig);
    this.configSubject.next(savedConfig);
  }

  /**
   * Obtiene la configuración actual como signal (reactivo)
   */
  getConfigSignal(): import('@angular/core').Signal<EmpresaConfig> {
    return this.configSignal.asReadonly();
  }

  /**
   * Obtiene la configuración actual como observable
   */
  getConfig$(): Observable<EmpresaConfig> {
    return this.configSubject.asObservable();
  }

  /**
   * Obtiene la configuración actual de forma síncrona
   */
  getConfig(): EmpresaConfig {
    try {
      const savedConfig = localStorage.getItem(this.STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        return { ...this.defaultConfig, ...parsed };
      }
    } catch (error) {
      console.error('Error al cargar configuración de empresa:', error);
    }
    return { ...this.defaultConfig };
  }

  /**
   * Actualiza el nombre de la empresa
   */
  updateNombre(nombre: string): void {
    const currentConfig = this.getConfig();
    const newConfig = { ...currentConfig, nombre };
    this.saveConfig(newConfig);
  }

  /**
   * Actualiza el logo de la empresa
   */
  updateLogo(logoFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const base64String = e.target?.result as string;
          const currentConfig = this.getConfig();
          
          // Si había un logo personalizado anterior, lo eliminamos del localStorage
          if (currentConfig.logo !== currentConfig.logoOriginal) {
            // El logo anterior ya se sobrescribirá, no necesitamos hacer nada especial
          }
          
          const newConfig = { ...currentConfig, logo: base64String };
          this.saveConfig(newConfig);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(logoFile);
    });
  }

  /**
   * Restaura la configuración por defecto
   */
  resetToDefault(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    const defaultConfig = { ...this.defaultConfig };
    this.configSignal.set(defaultConfig);
    this.configSubject.next(defaultConfig);
  }

  /**
   * Restaura solo el logo por defecto
   */
  resetLogo(): void {
    const currentConfig = this.getConfig();
    const newConfig = { ...currentConfig, logo: currentConfig.logoOriginal };
    this.saveConfig(newConfig);
  }

  /**
   * Guarda la configuración en localStorage
   */
  private saveConfig(config: EmpresaConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      this.configSignal.set(config);
      this.configSubject.next(config);
    } catch (error) {
      console.error('Error al guardar configuración de empresa:', error);
      throw new Error('No se pudo guardar la configuración');
    }
  }

  /**
   * Verifica si hay una configuración personalizada
   */
  hasCustomConfig(): boolean {
    const config = this.getConfig();
    return config.nombre !== this.defaultConfig.nombre || 
           config.logo !== this.defaultConfig.logo;
  }

  /**
   * Obtiene el tamaño aproximado de los datos guardados en localStorage
   */
  getStorageSize(): string {
    try {
      const config = localStorage.getItem(this.STORAGE_KEY);
      if (config) {
        const sizeInBytes = new Blob([config]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        return `${sizeInKB} KB`;
      }
    } catch (error) {
      console.error('Error al calcular tamaño:', error);
    }
    return '0 KB';
  }
}