import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerIntegrationService } from '../../../../controller/service/customer-integration.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private customerIntegration: CustomerIntegrationService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      dni: [{value: '', disabled: true}], // DNI es solo lectura, no se puede editar
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      // Obtener usuario actual de Firebase
      this.currentUser = this.customerIntegration.getCurrentUser();
      if (this.currentUser) {
        console.log('🔍 Cargando perfil completo desde BD...');
        
        // Obtener datos completos desde la base de datos
        const clienteCompleto = await this.customerIntegration.getCustomerProfile(this.currentUser.email);
        
        if (clienteCompleto) {
          console.log('✅ Datos del cliente cargados desde BD:', clienteCompleto);
          this.profileForm.patchValue({
            nombre: clienteCompleto.ClienteNombre || '',
            apellido: clienteCompleto.ClienteApellidos || '',
            dni: clienteCompleto.ClienteDni || '',
            direccion: clienteCompleto.ClienteDireccion || '',
            email: this.currentUser.email, // Siempre usar el email de Firebase
            telefono: clienteCompleto.ClienteTelefono || ''
          });
        } else {
          // Fallback a datos de Firebase si no hay datos en BD
          console.log('ℹ️ Usando datos de Firebase como fallback');
          this.profileForm.patchValue({
            nombre: this.currentUser.nombre || '',
            apellido: this.currentUser.apellido || '',
            dni: '',
            direccion: '',
            email: this.currentUser.email || '',
            telefono: this.currentUser.telefono || ''
          });
        }
      } else {
        this.router.navigate(['/customer-login']);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.showMessage('Error al cargar el perfil', 'error');
    }
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      try {
        const formData = this.profileForm.getRawValue(); // Obtiene todos los valores incluso deshabilitados
        
        console.log('🔄 Actualizando perfil completo...');
        
        // Asegurar que el email esté definido (usar el del usuario actual)
        // No incluir DNI ya que no se puede editar
        const updateData = {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          direccion: formData.direccion.trim(),
          email: this.currentUser.email, // Usar el email del usuario actual, no del formulario
          telefono: formData.telefono.trim()
        };
        
        console.log('📋 Datos a actualizar:', updateData);
        
        // Usar el servicio de integración para actualizar en ambos lados
        await this.customerIntegration.updateCustomerProfile(this.currentUser.email, updateData);
        
        // Verificar que la sesión siga activa después de la actualización
        const userStillLoggedIn = this.customerIntegration.getCurrentUser();
        if (!userStillLoggedIn) {
          console.error('⚠️ La sesión se cerró durante la actualización del perfil');
          this.showMessage('Error: La sesión se cerró. Por favor, inicia sesión nuevamente.', 'error');
          this.router.navigate(['/customer-login']);
          return;
        }
        
        console.log('✅ Perfil actualizado en Firebase + BD');
        this.showMessage('Perfil actualizado correctamente', 'success');
        
        // Recargar los datos del perfil para mostrar los cambios
        setTimeout(() => {
          this.loadUserProfile();
        }, 1000);
      } catch (error: any) {
        console.error('Error updating profile:', error);
        this.showMessage('Error al actualizar el perfil: ' + error.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  async changePassword() {
    if (this.currentUser?.email) {
      try {
        await this.customerIntegration.sendPasswordResetEmail(this.currentUser.email);
        this.showMessage('Se ha enviado un email para cambiar tu contraseña', 'success');
      } catch (error: any) {
        console.error('Error sending password reset:', error);
        this.showMessage('Error al enviar email de cambio de contraseña', 'error');
      }
    }
  }

  async logout() {
    try {
      await this.customerIntegration.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

export default CustomerProfileComponent;