import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EmpresaConfigService } from './empresa-config.service';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleService = inject(Title);
  private empresaConfigService = inject(EmpresaConfigService);

  constructor() {
    // Suscribirse a cambios en la configuración de empresa
    this.empresaConfigService.getConfig$().subscribe(config => {
      this.updateTitle(config.nombre);
    });
  }

  updateTitle(empresaNombre: string = 'Sistema Comercial'): void {
    this.titleService.setTitle(empresaNombre);
  }

  setPageTitle(pageTitle: string): void {
    const config = this.empresaConfigService.getConfig();
    this.titleService.setTitle(`${pageTitle} - ${config.nombre}`);
  }
}