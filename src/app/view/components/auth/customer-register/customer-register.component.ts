import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CarritoServiceService } from '../../../../controller/service/carrito/CarritoService.service';
import { CustomerIntegrationService } from '../../../../controller/service/customer-integration.service';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-register.component.html',
  styleUrl: './customer-register.component.css'
})
export default class CustomerRegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerIntegration = inject(CustomerIntegrationService);
  private router = inject(Router);
  private carritoService = inject(CarritoServiceService);

  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showLoginRedirect: boolean = false;
  isFromCheckout: boolean = false;

  ngOnInit(): void {
    // Verificar si viene del checkout
    this.isFromCheckout = localStorage.getItem('requiresCheckout') === 'true';
    
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { nombre, apellido, dni, direccion, email, telefono, password } = this.registerForm.value;
        
        // Registro completo: Firebase + Base de Datos
        await this.customerIntegration.registerCustomer({
          nombre,
          apellido,
          dni,
          direccion,
          email,
          telefono,
          password
        });
        
        // Recuperar carrito si existe
        const savedCart = localStorage.getItem('guestCart');
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          for (const item of cartItems) {
            this.carritoService.agregarAlCarrito(item);
          }
          localStorage.removeItem('guestCart');
        }

        // Verificar si viene del checkout y redirigir apropiadamente
        const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard/envios';
        const requiresCheckout = localStorage.getItem('requiresCheckout');
        
        localStorage.removeItem('redirectUrl');
        localStorage.removeItem('requiresCheckout');
        
        this.router.navigate([redirectUrl]);

      } catch (error: any) {
        console.error('Error de registro:', error);
        
        // Detectar si es error de email duplicado
        if (error.message && error.message.includes('ya está registrado')) {
          this.showLoginRedirect = true;
        } else {
          this.showLoginRedirect = false;
        }
        
        // Usar el mensaje específico del error
        this.errorMessage = error.message || 'Error al crear la cuenta';
      } finally {
        this.isLoading = false;
      }
    }
  }

  goToLogin(): void {
    // Pre-llenar el email en el formulario de login si es posible
    const email = this.registerForm.get('email')?.value;
    if (email) {
      // Guardar el email para pre-llenarlo en el login
      sessionStorage.setItem('prefilledEmail', email);
    }
    this.router.navigate(['/customer-login']);
  }

  goBack(): void {
    window.history.back();
  }
}