import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PedidosService } from '../../../../controller/service/pedidos/pedidos.service';
import { FormsModule, NgForm } from '@angular/forms';
import { PedidoRequest } from '../../../../model/interface/pedidos';
import { CarritoServiceService } from '../../../../controller/service/carrito/CarritoService.service';
import { Productos } from '../../../../model/interface/Productos';
import { Router, RouterModule } from '@angular/router';
import { ClienteInfoService } from '../../../../controller/service/pedidos/clienteInfo.service';
import { ClienteInfo } from '../../../../model/interface/cliente-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../controller/service/autenticacionController/auth.service';
import { CustomerIntegrationService } from '../../../../controller/service/customer-integration.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pedido.component.html',
  styleUrl: './pedido.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export default class PedidoComponent implements OnInit, AfterViewInit {
  @ViewChild('pedidoForm') pedidoForm!: NgForm;
  productosCarrito: Productos[] = [];
  clienteInfo: ClienteInfo | null = null;
  currentUser: any = null;
  isUserDataLoaded: boolean = false;
  selectedPaymentMethod: string = '';
  showPaymentError: boolean = false;
  formasPago: any[] = [];

  constructor(
    private pedidosService: PedidosService,
    private carritoService: CarritoServiceService,
    private _routes: Router,
    private clienteInfoService: ClienteInfoService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private customerIntegrationService: CustomerIntegrationService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.carritoService.obtenerCarrito().subscribe((carrito) => {
      this.productosCarrito = carrito;
    });

    // Suscribirse a cambios de autenticación en tiempo real
    this.authService.user$.subscribe(async (user: any) => {
      console.log('🔄 Estado de autenticación cambió:', user);
      const previousUser = this.currentUser;
      this.currentUser = user;
      
      // Solo cargar datos si cambió el usuario o es la primera vez
      if (user && user.email && (!previousUser || previousUser.email !== user.email)) {
        await this.loadUserData();
      } else if (!user) {
        this.clienteInfo = null;
        this.isUserDataLoaded = false;
      }
      
      this.cdr.detectChanges();
    });

    // Cargar formas de pago disponibles
    this.cargarFormasPago();
  }

  private cargarFormasPago(): void {
    this.pedidosService.obtenerFormasPago().subscribe(
      (formas) => {
        this.formasPago = formas;
        console.log('💳 Formas de pago cargadas:', formas);
      },
      (error) => {
        console.warn('⚠️ No se pudieron cargar las formas de pago:', error);
        // Usar formas de pago por defecto si no se pueden cargar desde el servidor
        this.formasPago = [
          { Formas_PagoCodigo: 1, Formas_Pagonombre: 'Efectivo' },
          { Formas_PagoCodigo: 2, Formas_Pagonombre: 'Tarjeta de Crédito/Débito' },
          { Formas_PagoCodigo: 3, Formas_Pagonombre: 'Transferencia Bancaria' }
        ];
      }
    );
  }

  private async loadUserData(): Promise<void> {
    try {
      if (this.currentUser && this.currentUser.email) {
        console.log('🔄 Usuario autenticado encontrado, cargando datos del perfil...');
        
        // Obtener datos completos del cliente desde la BD
        this.clienteInfo = await this.customerIntegrationService.getCustomerProfile(this.currentUser.email);
        
        if (this.clienteInfo) {
          console.log('✅ Datos del cliente cargados desde BD:', this.clienteInfo);
          
          // Verificar que los datos estén completos
          const datosCompletos = this.clienteInfo.ClienteNombre && 
                               this.clienteInfo.ClienteApellidos && 
                               this.clienteInfo.ClienteEmail && 
                               this.clienteInfo.ClienteTelefono && 
                               this.clienteInfo.ClienteDni && 
                               this.clienteInfo.ClienteDni !== '00000000' &&
                               this.clienteInfo.ClienteDireccion &&
                               this.clienteInfo.ClienteDireccion !== 'Sin especificar';
          
          if (!datosCompletos) {
            console.log('⚠️ Datos del cliente incompletos, mostrando formulario tradicional');
            console.log('📋 Datos faltantes:', {
              nombre: !this.clienteInfo.ClienteNombre,
              apellidos: !this.clienteInfo.ClienteApellidos,
              email: !this.clienteInfo.ClienteEmail,
              telefono: !this.clienteInfo.ClienteTelefono,
              dni: !this.clienteInfo.ClienteDni || this.clienteInfo.ClienteDni === '00000000',
              direccion: !this.clienteInfo.ClienteDireccion || this.clienteInfo.ClienteDireccion === 'Sin especificar'
            });
            this.clienteInfo = null; // Forzar formulario tradicional
          } else {
            console.log('✅ Todos los datos del cliente están completos, usando vista simplificada');
          }
        } else {
          console.log('ℹ️ Cliente no encontrado en BD, mostrando formulario tradicional');
          this.clienteInfo = null;
        }
        
        this.isUserDataLoaded = true;
        console.log('✅ Datos del usuario procesados:', this.clienteInfo ? 'Vista simplificada' : 'Vista completa');
      } else {
        console.log('ℹ️ No hay usuario autenticado');
      }
    } catch (error) {
      console.warn('⚠️ Error cargando datos del usuario:', error);
        // En caso de error, no fallar la carga de la página
    }
  }

  ngAfterViewInit(): void {
    // Solo auto-completar si el usuario viene de una sesión iniciada directamente
    // y no ha interactuado con el formulario aún
    if (this.shouldAutoFill()) {
      setTimeout(() => {
        this.autoFillFormOnce();
      }, 500);
    }
  }

  private shouldAutoFill(): boolean {
    // Verificar si viene del checkout (con sesión) y tiene datos completos
    const fromCheckout = localStorage.getItem('requiresCheckout') === 'true';
    const hasCompleteData = this.isUserDataLoaded && !!this.clienteInfo;
    
    // Solo auto-completar si viene del checkout y tiene datos
    return fromCheckout && hasCompleteData;
  }

  private autoFillFormOnce(): void {
    if (this.isUserDataLoaded && this.clienteInfo && this.pedidoForm) {
      console.log('🔄 Auto-completando formulario una sola vez...');
      
      // Verificar que los campos estén vacíos antes de llenarlos
      const controls = this.pedidoForm.controls;
      
      if (!controls['dni']?.value && this.clienteInfo.ClienteDni) {
        controls['dni']?.setValue(this.clienteInfo.ClienteDni);
      }
      
      if (!controls['nombre']?.value && this.clienteInfo.ClienteNombre) {
        controls['nombre']?.setValue(this.clienteInfo.ClienteNombre);
      }
      
      if (!controls['apellido']?.value && this.clienteInfo.ClienteApellidos) {
        controls['apellido']?.setValue(this.clienteInfo.ClienteApellidos);
      }
      
      if (!controls['direccion']?.value && this.clienteInfo.ClienteDireccion && this.clienteInfo.ClienteDireccion !== 'Sin especificar') {
        controls['direccion']?.setValue(this.clienteInfo.ClienteDireccion);
      }
      
      if (!controls['telefono']?.value && this.clienteInfo.ClienteTelefono) {
        controls['telefono']?.setValue(this.clienteInfo.ClienteTelefono);
      }
      
      if (!controls['correo']?.value && this.clienteInfo.ClienteEmail) {
        controls['correo']?.setValue(this.clienteInfo.ClienteEmail);
      }
      
      console.log('✅ Formulario auto-completado una vez');
      
      // Limpiar el flag para evitar auto-completados futuros
      localStorage.removeItem('requiresCheckout');
    }
  }

  canAutoFillPartialData(): boolean {
    // Verificar si el usuario tiene algunos datos que se pueden usar
    if (!this.currentUser) return false;
    
    // Verificar si tiene datos en Firebase o datos parciales
    const hasFirebaseData = this.currentUser.displayName || 
                           this.currentUser.nombre || 
                           this.currentUser.email ||
                           this.currentUser.telefono;
    
    return !!hasFirebaseData;
  }

  fillWithUserData(form: NgForm): void {
    if (!this.currentUser) return;
    
    console.log('🔄 Rellenando formulario con datos disponibles del usuario...');
    
    // Rellenar con datos de Firebase si están disponibles
    const controls = form.controls;
    
    // Nombre (de displayName o nombre directo)
    if (!controls['nombre']?.value) {
      const nombre = this.currentUser.displayName?.split(' ')[0] || 
                    this.currentUser.nombre || '';
      if (nombre) controls['nombre']?.setValue(nombre);
    }
    
    // Apellido (del displayName o apellido directo)
    if (!controls['apellido']?.value) {
      const apellido = this.currentUser.displayName?.split(' ').slice(1).join(' ') || 
                      this.currentUser.apellido || '';
      if (apellido) controls['apellido']?.setValue(apellido);
    }
    
    // Email
    if (!controls['correo']?.value && this.currentUser.email) {
      controls['correo']?.setValue(this.currentUser.email);
    }
    
    // Teléfono
    if (!controls['telefono']?.value && this.currentUser.telefono) {
      controls['telefono']?.setValue(this.currentUser.telefono);
    }
    
    this.snackBar.open('Datos disponibles rellenados. Completa los campos faltantes.', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top'
    });
    
    console.log('✅ Datos disponibles rellenados en el formulario');
  }

  getUserDisplayData() {
    const nombreCompleto = this.clienteInfo?.ClienteNombre || 
                          this.currentUser?.displayName?.split(' ')[0] || 
                          this.currentUser?.nombre || 
                          'Usuario';
    
    const apellidos = this.clienteInfo?.ClienteApellidos || 
                     this.currentUser?.displayName?.split(' ').slice(1).join(' ') || 
                     this.currentUser?.apellido || 
                     '';
    
    // Combinar datos del cliente BD con datos de Firebase como fallback
    return {
      nombre: `${nombreCompleto} ${apellidos}`.trim(),
      
      dni: this.clienteInfo?.ClienteDni && this.clienteInfo.ClienteDni !== '00000000' ? 
           this.clienteInfo.ClienteDni : 
           'Pendiente de actualizar',
      
      email: this.clienteInfo?.ClienteEmail || 
             this.currentUser?.email || 
             'Sin especificar',
      
      telefono: this.clienteInfo?.ClienteTelefono || 
                this.currentUser?.telefono || 
                'Pendiente de actualizar',
      
      direccion: this.clienteInfo?.ClienteDireccion && this.clienteInfo.ClienteDireccion !== 'Sin especificar' ? 
                 this.clienteInfo.ClienteDireccion : 
                 'Pendiente de actualizar'
    };
  }

  procesarPago(): void {
    this.showPaymentError = false;
    
    // Verificar que se haya seleccionado un método de pago
    if (!this.selectedPaymentMethod) {
      this.showPaymentError = true;
      this.snackBar.open('Por favor, selecciona un método de pago', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Verificar que hay productos en el carrito
    console.log('📦 Productos en carrito:', this.productosCarrito);
    if (this.productosCarrito.length === 0) {
      this.snackBar.open('El carrito está vacío', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Verificar que todos los productos tienen cantidad válida
    const productosInvalidos = this.productosCarrito.filter(p => !p.quantity || p.quantity <= 0);
    if (productosInvalidos.length > 0) {
      console.log('⚠️ Productos con cantidad inválida:', productosInvalidos);
      this.snackBar.open('Algunos productos tienen cantidad inválida', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Obtener datos del usuario para el pedido
    const userData = this.getUserDisplayData();
    
    // Verificar que los datos esenciales estén completos
    if (userData.dni === 'Pendiente de actualizar' || userData.direccion === 'Pendiente de actualizar') {
      const confirmProceed = confirm(
        'Algunos de tus datos están incompletos:\n\n' +
        `DNI: ${userData.dni}\n` +
        `Dirección: ${userData.direccion}\n\n` +
        '¿Deseas completar tu perfil primero o continuar con el pedido?'
      );
      
      if (!confirmProceed) {
        this.snackBar.open('Ve a Mi Perfil para completar tus datos', 'Ir a Mi Perfil', {
          duration: 5000,
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          this._routes.navigate(['/customer-profile']);
        });
        return;
      }
    }

    // Crear el pedido
    this.crearPedidoConDatosUsuario(userData);
  }

  private crearPedidoConDatosUsuario(userData: any): void {
    // Obtener los productos del carrito
    const productosCarrito = this.carritoService.obtenerProductosCarrito();
    const totalPedido = this.calcularTotalPedido(productosCarrito);
    const detallesPedido = this.generarDetallesPedido(productosCarrito);

    // Separar nombre completo en nombre y apellidos
    const nombreCompleto = userData.nombre.split(' ');
    const nombre = nombreCompleto[0] || '';
    const apellidos = nombreCompleto.slice(1).join(' ') || '';

    // El selectedPaymentMethod ya contiene el ID de la forma de pago de la base de datos
    const codigoFormaPago = parseInt(this.selectedPaymentMethod, 10);
    
    if (!codigoFormaPago || isNaN(codigoFormaPago)) {
      console.error('❌ Forma de pago no reconocida:', this.selectedPaymentMethod);
      this.snackBar.open('Forma de pago no válida', 'Cerrar', { duration: 3000, verticalPosition: 'top' });
      return;
    }
    
    console.log('💳 Forma de pago seleccionada:', this.selectedPaymentMethod, '-> Código:', codigoFormaPago);

    const pedidoRequest: PedidoRequest = {
      cliente: {
        ClienteNombre: nombre,
        ClienteDni: String(userData.dni === 'Pendiente de actualizar' ? '00000000' : userData.dni),
        ClienteApellidos: apellidos,
        ClienteDireccion: userData.direccion === 'Pendiente de actualizar' ? 'Sin especificar' : userData.direccion,
        ClienteTelefono: String(userData.telefono === 'Pendiente de actualizar' ? '000000000' : userData.telefono),
        ClienteEmail: userData.email,
      },
      pedido: {
        Pedidototal: totalPedido,
      },
      detalles: detallesPedido,
      pago: {
        PagosFormas_PagoCodigo: codigoFormaPago,
        Pagosmonto_pagado: totalPedido,
      },
    };

    console.log('🛒 Creando pedido simplificado:', {
      cliente: pedidoRequest.cliente,
      pedido: pedidoRequest.pedido,
      detalles: pedidoRequest.detalles,
      pago: pedidoRequest.pago,
      productosCarrito: productosCarrito
    });

    this.pedidosService.crearPedido(pedidoRequest).subscribe(
      (response) => {
        console.log('✅ Pedido creado exitosamente:', response);
        
        // Limpiar carrito y mostrar éxito
        this.carritoService.vaciarCarrito();
        this.snackBar.open('¡Pedido realizado con éxito! 🎉', 'Ver Mis Pedidos', {
          duration: 5000,
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          this._routes.navigate(['/dashboard/envios']);
        });
        
        // Redirigir automáticamente después de 3 segundos
        setTimeout(() => {
          this._routes.navigate(['/dashboard/envios']);
        }, 3000);
      },
      (error) => {
        console.error('❌ Error al crear pedido:', error);
        
        // Manejo específico para error de forma de pago
        if (error.status === 500 && error.error && typeof error.error === 'string' && error.error.includes('Forma de pago no válida')) {
          this.snackBar.open('Forma de pago no válida. Por favor, contacta al administrador para configurar las formas de pago.', 'Cerrar', {
            duration: 8000,
            verticalPosition: 'top'
          });
        } else {
          this.snackBar.open('Error al procesar el pedido. Inténtalo nuevamente.', 'Cerrar', {
            duration: 5000,
            verticalPosition: 'top'
          });
        }
      }
    );
  }  registrarPedidoAutenticado() {
    if (!this.clienteInfo) {
      this.snackBar.open('Error: No se encontraron los datos del cliente.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Verificar que se haya seleccionado un método de pago
    const metodoPagoElement = document.querySelector('input[name="metodoPago"]:checked') as HTMLInputElement;
    if (!metodoPagoElement) {
      this.snackBar.open('Por favor, seleccione un método de pago.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Obtener los productos del carrito desde el servicio
    const productosCarrito = this.carritoService.obtenerProductosCarrito();

    if (productosCarrito.length === 0) {
      this.snackBar.open('El carrito está vacío.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    // Calcular el total del pedido y detalles del pedido
    const totalPedido = this.calcularTotalPedido(productosCarrito);
    const detallesPedido = this.generarDetallesPedido(productosCarrito);

    const pedidoRequest: PedidoRequest = {
      cliente: {
        ClienteNombre: this.clienteInfo.ClienteNombre,
        ClienteDni: this.clienteInfo.ClienteDni,
        ClienteApellidos: this.clienteInfo.ClienteApellidos,
        ClienteDireccion: this.clienteInfo.ClienteDireccion,
        ClienteTelefono: this.clienteInfo.ClienteTelefono,
        ClienteEmail: this.clienteInfo.ClienteEmail,
      },
      pedido: {
        Pedidototal: totalPedido,
      },
      detalles: detallesPedido,
      pago: {
        PagosFormas_PagoCodigo: parseInt(metodoPagoElement.value, 10),
        Pagosmonto_pagado: totalPedido,
      },
    };

    console.log('🛒 Creando pedido para usuario autenticado:', pedidoRequest);

    this.pedidosService.crearPedido(pedidoRequest).subscribe(
      (response) => {
        console.log('✅ Pedido creado exitosamente:', response);
        
        this.carritoService.vaciarCarrito();
        this.snackBar.open('¡El pedido ha sido registrado exitosamente!', 'Cerrar', {
          duration: 2000,
          verticalPosition: 'top'
        });
        
        this._routes.navigate(['/dashboard/envios']);
      },
      (error) => {
        console.error('❌ Error al crear pedido:', error);
        this.snackBar.open('Error al crear el pedido. Por favor, inténtelo de nuevo.', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    );
  }

  registrarPedido(pedidoForm: NgForm) {
    if (pedidoForm.valid) {
      const formValues = pedidoForm.value;

      // Obtener los productos del carrito desde el servicio
      const productosCarrito = this.carritoService.obtenerProductosCarrito();

      // Calcular el total del pedido y detalles del pedido
      const totalPedido = this.calcularTotalPedido(productosCarrito);
      const detallesPedido = this.generarDetallesPedido(productosCarrito);

      const pedidoRequest: PedidoRequest = {
        cliente: {
          ClienteNombre: formValues.nombre,
          ClienteDni: formValues.dni,
          ClienteApellidos: formValues.apellido,
          ClienteDireccion: formValues.direccion,
          ClienteTelefono: formValues.telefono,
          ClienteEmail: formValues.correo,
        },
        pedido: {
          Pedidototal: totalPedido,
        },
        detalles: detallesPedido,
        pago: {
          PagosFormas_PagoCodigo: parseInt(formValues.metodoPago, 10),
          Pagosmonto_pagado: totalPedido, // Calcular el monto pagado basado en el total del pedido
        },
      };

      this.pedidosService.crearPedido(pedidoRequest).subscribe(
        (response) => {
          // console.log('Pedido creado:', response);

          pedidoForm.resetForm();

          this.carritoService.vaciarCarrito();
          this.snackBar.open('¡El pedido ha sido registrado exitosamente!', 'Cerrar', {
            duration: 2000,
            verticalPosition: 'top'
          });
          // alert('¡El pedido ha sido registrado exitosamente!');
          this._routes.navigate(['/dashboard/envios']);
        },
        (error) => {
          // console.error('Error al crear pedido:', error);
          this.snackBar.open('Error al crear el pedido. Por favor, inténtelo de nuevo.', 'Cerrar', {
            duration: 3000,
            verticalPosition: 'top'

          });
        }
      );
    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos correctamente.', 'Cerrar', {
        duration: 3000,
        // horizontalPosition: 'start,'
        verticalPosition: 'top'
      });
    }
  }

  calcularTotal(): string {
    let total = 0;
    for (const producto of this.productosCarrito) {
      total += producto.ProductoPrecio * producto.quantity!;
    }
    return total.toFixed(2);
  }

  // Método para calcular el total del pedido basado en los productos del carrito
  calcularTotalPedido(productosCarrito: Productos[]): number {
    let total = 0;
    for (const producto of productosCarrito) {
      if (producto.quantity) {
        total += producto.ProductoPrecio * producto.quantity;
      }
    }
    return total;
  }

  // Método para generar los detalles del pedido basados en los productos del carrito
  generarDetallesPedido(productosCarrito: Productos[]) {
    return productosCarrito.map((producto) => ({
      DetallePedidoProductoCodigo: producto.ProductoCodigo,
      DetallePedidoCantidad: producto.quantity!,
      DetallePedidoSubtotal: producto.ProductoPrecio * producto.quantity!,
    }));
  }

  buscarCliente(form: NgForm) {
    const dni = form.value.dni;
    if (!dni || dni.length !== 8) {
      this.snackBar.open('Por favor, ingrese un DNI válido de 8 dígitos.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }
    
    console.log('🔍 Buscando cliente por DNI:', dni);
    
    this.clienteInfoService.buscarClienteInfo({ ClienteDni: dni }).subscribe(
      (response: ClienteInfo) => {
        console.log('✅ Cliente encontrado por DNI:', response);
        
        // Preguntar al usuario si quiere usar los datos encontrados
        if (confirm(`Se encontraron datos para el DNI ${dni}:\n\nNombre: ${response.ClienteNombre} ${response.ClienteApellidos}\nEmail: ${response.ClienteEmail}\n\n¿Desea usar estos datos?`)) {
          form.controls['nombre'].setValue(response.ClienteNombre);
          form.controls['apellido'].setValue(response.ClienteApellidos);
          form.controls['direccion'].setValue(response.ClienteDireccion);
          form.controls['telefono'].setValue(response.ClienteTelefono);
          form.controls['correo'].setValue(response.ClienteEmail);
          
          this.snackBar.open('Datos cargados correctamente', 'Cerrar', {
            duration: 2000,
            verticalPosition: 'top'
          });
        }
      },
      (error) => {
        console.log('ℹ️ DNI no encontrado en BD:', error);
        this.snackBar.open('DNI no encontrado. Puede continuar ingresando los datos manualmente.', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    );
  }

  goToLogin(): void {
    // Guardar que viene del checkout
    localStorage.setItem('redirectUrl', '/pedido');
    localStorage.setItem('requiresCheckout', 'true');
    this._routes.navigate(['/customer-login']);
  }

  goToRegister(): void {
    // Guardar que viene del checkout
    localStorage.setItem('redirectUrl', '/pedido');
    localStorage.setItem('requiresCheckout', 'true');
    this._routes.navigate(['/customer-register']);
  }
}
