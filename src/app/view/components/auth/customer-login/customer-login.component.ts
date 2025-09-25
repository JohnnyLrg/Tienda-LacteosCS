import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CarritoServiceService } from '../../../../controller/service/carrito/CarritoService.service';
import { CustomerIntegrationService } from '../../../../controller/service/customer-integration.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.css'
})
export default class CustomerLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerIntegration = inject(CustomerIntegrationService);
  private router = inject(Router);
  private carritoService = inject(CarritoServiceService);

  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isFromCheckout: boolean = false;

  ngOnInit(): void {
    // Verificar si hay un email pre-llenado desde el registro
    const prefilledEmail = sessionStorage.getItem('prefilledEmail');
    
    // Verificar si viene del checkout
    this.isFromCheckout = localStorage.getItem('requiresCheckout') === 'true';
    
    this.loginForm = this.fb.group({
      email: [prefilledEmail || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Limpiar el email pre-llenado después de usarlo
    if (prefilledEmail) {
      sessionStorage.removeItem('prefilledEmail');
    }
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password } = this.loginForm.value;
        
        // Login completo: Firebase + obtener datos de BD
        const result = await this.customerIntegration.loginAndGetProfile(email, password);
        
        // Recuperar carrito si existe
        const savedCart = localStorage.getItem('guestCart');
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          for (const item of cartItems) {
            this.carritoService.agregarAlCarrito(item);
          }
          localStorage.removeItem('guestCart');
        }

        // Redirigir a la página que intentaba acceder o a pedidos
        const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard/envios';
        const requiresCheckout = localStorage.getItem('requiresCheckout');
        
        localStorage.removeItem('redirectUrl');
        localStorage.removeItem('requiresCheckout');
        
        this.router.navigate([redirectUrl]);

      } catch (error: any) {
        this.errorMessage = 'Email o contraseña incorrectos';
        console.error('Error de login:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  goBack(): void {
    window.history.back();
  }
}