import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MostrarClientes } from '../../../../model/interface/cliente-info';
import { ClientesService } from '../../../../controller/service/clientes.service';
import { ClienteInfo } from '../../../../model/interface/cliente-info';
import { ClienteInfoService } from '../../../../controller/service/pedidos/clienteInfo.service';
import { ProductosService } from '../../../../controller/service/productos.service';
import EnviosComponent from '../../../pages/envios/envios.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClientesComponent {

  public clientes: MostrarClientes[] = [];
  public selectedCliente: MostrarClientes | null = null;
  private originalIndex: number | null = null;

  mostrarBuscarCliente : boolean = false;
  dniBusqueda: string = '';
  clienteBuscado: ClienteInfo | null = null;
  mensajeBusqueda: string = '';
  cargandoEstadisticas: boolean = false;

  activarBuscarClienteDni(){
    this.mostrarBuscarCliente = !this.mostrarBuscarCliente;
  }

  private clienteInfoService = inject (ClienteInfoService);
  private clientesService = inject(ClientesService);
  private productosService = inject(ProductosService);
  cdr = inject(ChangeDetectorRef);
  
  ngOnInit(): void {
    this.listarClientes();
  }

  listarClientes() {
    this.clienteInfoService.mostrarClientes().subscribe(
      (data) => {
        this.clientes = data;
        console.log('📋 Clientes cargados:', this.clientes);
        
        // Debug: verificar si las estadísticas ya vienen cargadas
        if (this.clientes.length > 0) {
          const primerCliente = this.clientes[0];
          console.log('🔍 Primer cliente - estadísticas:', {
            CantidadPedidos: primerCliente.CantidadPedidos,
            TotalCompras: primerCliente.TotalCompras,
            ProductosComprados: primerCliente.ProductosComprados,
            CategoriasMasCompradas: primerCliente.CategoriasMasCompradas
          });
        }
        
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error al cargar los clientes:', error);
        this.cdr.markForCheck();
      }
    );
  }

  seleccionarCliente(cliente: MostrarClientes) {
    console.log('=== CLIENTE SELECCIONADO ===');
    console.log('Cliente completo:', cliente);
    
    this.originalIndex = this.clientes.indexOf(cliente);
    this.clientes = this.clientes.filter(c => c !== cliente);
    this.clientes.unshift(cliente);
    this.selectedCliente = cliente;

    // Verificar si ya tiene estadísticas cargadas
    const tieneEstadisticas = (
      cliente.CantidadPedidos !== null && 
      cliente.CantidadPedidos !== undefined &&
      cliente.CategoriasMasCompradas && 
      cliente.CategoriasMasCompradas !== 'Sin datos'
    );

    console.log('🔍 ¿Cliente tiene estadísticas cargadas?', tieneEstadisticas);
    console.log('📊 Estadísticas actuales:', {
      CantidadPedidos: cliente.CantidadPedidos,
      TotalCompras: cliente.TotalCompras,
      ProductosComprados: cliente.ProductosComprados,
      CategoriasMasCompradas: cliente.CategoriasMasCompradas
    });

    // Solo cargar estadísticas adicionales si no están disponibles
    if (!tieneEstadisticas) {
      console.log('⚡ Cargando estadísticas adicionales...');
      this.cargarEstadisticasCliente(cliente);
    } else {
      console.log('✅ Usando estadísticas ya cargadas del backend');
    }

    this.scrollToTop();
    this.cdr.markForCheck();
  }

  deseleccionarCliente() {
    if (this.selectedCliente && this.originalIndex !== null) {
      this.clientes = this.clientes.filter(c => c !== this.selectedCliente);
      this.clientes.splice(this.originalIndex, 0, this.selectedCliente);
    }
    this.selectedCliente = null;
    this.originalIndex = null;
    this.cdr.markForCheck();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  buscarClientePorDni(): void {
    if (!this.dniBusqueda || this.dniBusqueda.length < 8) {
      this.mensajeBusqueda = 'Por favor ingrese un DNI válido (mínimo 8 dígitos)';
      this.clienteBuscado = null;
      return;
    }

    this.mensajeBusqueda = 'Buscando cliente...';
    this.clienteBuscado = null;

    this.clientesService.buscarClientePorDni(this.dniBusqueda).subscribe({
      next: (cliente: ClienteInfo) => {
        this.clienteBuscado = cliente;
        this.mensajeBusqueda = '';
        console.log('Cliente encontrado:', cliente);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al buscar cliente:', error);
        this.clienteBuscado = null;
        this.mensajeBusqueda = 'No se encontró ningún cliente con el DNI proporcionado.';
        this.cdr.markForCheck();
      }
    });
  }

  limpiarBusqueda(): void {
    this.dniBusqueda = '';
    this.clienteBuscado = null;
    this.mensajeBusqueda = '';
    this.cdr.markForCheck();
  }

  // Método para cargar estadísticas completas del cliente seleccionado
  cargarEstadisticasCliente(cliente: MostrarClientes): void {
    console.log('Cargando estadísticas para el cliente:', cliente.ClienteDni);
    
    this.cargandoEstadisticas = true;
    this.cdr.markForCheck();
    
    // Usar el servicio de búsqueda por DNI para obtener información completa
    this.clientesService.buscarClientePorDni(cliente.ClienteDni).subscribe({
      next: (clienteCompleto: ClienteInfo) => {
        console.log('=== INFORMACIÓN COMPLETA DEL CLIENTE ===');
        console.log('Cliente:', clienteCompleto);
        console.log('Pedidos:', clienteCompleto.Pedidos);
        
        // Actualizar las estadísticas basándose en los pedidos
        if (clienteCompleto.Pedidos && clienteCompleto.Pedidos.length > 0) {
          cliente.CantidadPedidos = clienteCompleto.Pedidos.length;
          cliente.TotalCompras = clienteCompleto.Pedidos.reduce((total, pedido) => total + pedido.Pedidototal, 0);
          
          // Cargar productos con sus categorías reales desde la base de datos
          this.productosService.cargarProductos().subscribe({
            next: (productos) => {
              console.log('📦 Productos cargados para análisis de categorías:', productos);
              
              const productosUnicos = new Set<string>();
              const categoriasUnicas = new Set<string>();
              
              clienteCompleto.Pedidos.forEach(pedido => {
                if (pedido.Detalles) {
                  pedido.Detalles.forEach(detalle => {
                    productosUnicos.add(detalle.ProductoNombre);
                    
                    // Buscar el producto en el catálogo para obtener su categoría real
                    const producto = productos.find(p => 
                      p.ProductoNombre.toLowerCase().trim() === detalle.ProductoNombre.toLowerCase().trim()
                    );
                    
                    if (producto && producto.Producto_TipoProductoCodigo) {
                      // Obtener la categoría real desde TipoProducto
                      const categoriaReal = this.obtenerCategoriaRealDesdeProducto(producto);
                      console.log(`📂 Categoría real para "${detalle.ProductoNombre}": ${categoriaReal}`);
                      categoriasUnicas.add(categoriaReal);
                    } else {
                      console.log(`⚠️ Producto "${detalle.ProductoNombre}" no encontrado en catálogo actual`);
                      // Fallback: usar inferencia por nombre solo si no se encuentra en BD
                      const categoriaInferida = this.inferirCategoriaDelNombre(detalle.ProductoNombre);
                      categoriasUnicas.add(categoriaInferida + ' (Agotado)');
                    }
                  });
                }
              });
              
              cliente.ProductosComprados = Array.from(productosUnicos).join(', ');
              cliente.CategoriasMasCompradas = Array.from(categoriasUnicas).join(', ') || 'Sin categorías registradas';
              
              this.cargandoEstadisticas = false;
              this.cdr.markForCheck();
            },
            error: (errorProductos) => {
              console.error('Error al cargar productos:', errorProductos);
              // Si no se pueden cargar productos, usar solo los datos básicos
              cliente.ProductosComprados = clienteCompleto.Pedidos
                .flatMap(p => p.Detalles?.map(d => d.ProductoNombre) || [])
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(', ');
              cliente.CategoriasMasCompradas = 'Error al cargar categorías';
              
              this.cargandoEstadisticas = false;
              this.cdr.markForCheck();
            }
          });
        } else {
          cliente.CantidadPedidos = 0;
          cliente.TotalCompras = 0;
          cliente.ProductosComprados = 'Sin compras registradas';
          cliente.CategoriasMasCompradas = 'Sin compras registradas';
          this.cargandoEstadisticas = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas del cliente:', error);
        cliente.CantidadPedidos = 0;
        cliente.TotalCompras = 0;
        cliente.ProductosComprados = 'Error al cargar datos';
        cliente.CategoriasMasCompradas = 'Error al cargar datos';
        this.cargandoEstadisticas = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Método para obtener la categoría real desde el producto de la base de datos
  obtenerCategoriaRealDesdeProducto(producto: any): string {
    // El producto debería tener información sobre su tipo/categoría
    // Necesitamos verificar qué campo contiene la información de categoría
    
    console.log('🔍 Analizando estructura del producto:', producto);
    
    // Posibles campos donde puede estar la categoría:
    if (producto.TipoProductoNombre) {
      return producto.TipoProductoNombre; // Campo directo de categoría
    }
    
    if (producto.Producto_TipoProductoCodigo) {
      // Si solo tenemos el código, necesitaremos mapearlo
      return this.mapearCodigoCategoria(producto.Producto_TipoProductoCodigo);
    }
    
    // Si no encontramos la categoría en el producto, usar inferencia como fallback
    return this.inferirCategoriaDelNombre(producto.ProductoNombre);
  }

  // Método para mapear códigos de categoría a nombres (necesario si solo tenemos el código)
  mapearCodigoCategoria(codigo: number | string): string {
    // Este mapeo debería basarse en los datos reales de tu tabla TipoProducto
    const mapeo: { [key: string]: string } = {
      '1': 'Lácteos',
      '2': 'Bebidas',
      '3': 'Snacks',
      '4': 'Cuidado Personal',
      '5': 'Cereales y Pastas',
      // Agregar más mapeos según tu base de datos
    };
    
    const codigoStr = String(codigo);
    return mapeo[codigoStr] || `Categoría ${codigo}`;
  }

  // Método simple para inferir categoría del producto por nombre (solo fallback)
  inferirCategoriaDelNombre(nombreProducto: string): string {
    const nombre = nombreProducto.toLowerCase().trim();
    
    if (nombre.includes('leche') || nombre.includes('milk')) return 'Leches';
    if (nombre.includes('queso') || nombre.includes('cheese')) return 'Quesos';
    if (nombre.includes('yogur') || nombre.includes('yogurt')) return 'Yogures';
    if (nombre.includes('galleta') || nombre.includes('oreo')) return 'Galletas y Snacks';
    if (nombre.includes('bebida') || nombre.includes('inka') || nombre.includes('coca')) return 'Bebidas';
    if (nombre.includes('shampoo') || nombre.includes('sedal')) return 'Cuidado Personal';
    if (nombre.includes('pasta') || nombre.includes('espag') || nombre.includes('fideo')) return 'Pastas y Cereales';
    
    return 'Otros Productos';
  }
}
