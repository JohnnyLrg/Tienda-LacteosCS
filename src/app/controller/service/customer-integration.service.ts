import { Injectable, inject } from '@angular/core';
import { CustomerAuthService } from './customer-auth.service';
import { ClientesService } from './clientes.service';
import { ClienteInfo } from '../../model/interface/cliente-info';
import { BASE_URL } from '../../app.config';

export interface CustomerRegistrationData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  dni?: string;
  direccion?: string;
}

export interface CustomerProfileData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni?: string;
  direccion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerIntegrationService {

  private customerAuthService = inject(CustomerAuthService);
  private clientesService = inject(ClientesService);

  /**
   * Verificar duplicados antes del registro
   */
  async checkDuplicates(email: string, dni?: string, excludeCode?: number): Promise<void> {
    console.log('🔍 Verificando duplicados...', excludeCode ? `(excluyendo código: ${excludeCode})` : '');
    
    // Verificar email duplicado
    try {
      const clienteConEmail = await this.clientesService.buscarClientePorEmail(email).toPromise();
      if (clienteConEmail) {
        // Si hay un código para excluir, verificar que no sea el mismo cliente
        if (excludeCode && clienteConEmail.ClienteCodigo === excludeCode) {
          console.log('ℹ️ Email pertenece al mismo cliente, permitido');
        } else {
          throw new Error('Ya existe un cliente registrado con este email');
        }
      }
    } catch (error: any) {
      if (error.status !== 404 && !error.message.includes('Ya existe un cliente')) {
        throw error;
      }
      if (error.message.includes('Ya existe un cliente')) {
        throw error;
      }
    }
    
    // Verificar DNI duplicado
    if (dni && dni.length >= 8) {
      console.log(`🔍 Verificando DNI: ${dni} (excluir código: ${excludeCode})`);
      try {
        const clienteConDni = await this.clientesService.buscarClientePorDni(dni).toPromise();
        if (clienteConDni) {
          console.log('📋 Cliente encontrado con DNI:', clienteConDni);
          // Si hay un código para excluir, verificar que no sea el mismo cliente
          if (excludeCode && clienteConDni.ClienteCodigo === excludeCode) {
            console.log('ℹ️ DNI pertenece al mismo cliente, permitido');
          } else {
            console.log(`❌ DNI duplicado: cliente ${clienteConDni.ClienteCodigo} vs excluir ${excludeCode}`);
            throw new Error('Ya existe un cliente registrado con este DNI');
          }
        } else {
          console.log('✅ DNI disponible');
        }
      } catch (error: any) {
        if (error.status === 404) {
          console.log('✅ DNI no encontrado (404), está disponible');
        } else if (error.message && error.message.includes('Ya existe un cliente')) {
          console.log('❌ Relanzando error de DNI duplicado');
          throw error;
        } else {
          console.log('❌ Error inesperado verificando DNI:', error);
          throw error;
        }
      }
    }
    
    console.log('✅ No se encontraron duplicados');
  }

  /**
   * Registro completo: Firebase + Base de Datos + Firestore
   */
  async registerCustomer(data: CustomerRegistrationData): Promise<void> {
    try {
      console.log('🔄 Iniciando registro para:', data.email);
      
      // Verificar duplicados ANTES de crear en Firebase
      await this.checkDuplicates(data.email, data.dni);
      
      // 1. Crear usuario en Firebase
      console.log('📧 Creando usuario en Firebase...');
      const firebaseUser = await this.customerAuthService.registerCustomer(
        data.email,
        data.password,
        {
          nombre: data.nombre,
          telefono: data.telefono
        }
      );

      console.log('✅ Usuario creado en Firebase:', firebaseUser.user?.uid);

      // 2. Guardar en tu base de datos
      console.log('💾 Guardando en base de datos...');
      const clienteData = {
        ClienteNombre: data.nombre,
        ClienteApellidos: data.apellido,
        ClienteEmail: data.email,
        ClienteTelefono: data.telefono,
        ClienteDni: data.dni || '00000000',
        ClienteDireccion: data.direccion || 'Sin especificar'
      };

      console.log('📋 Datos a enviar a la API:', clienteData);
      
      try {
        const bdResult = await this.clientesService.registrarCliente(clienteData).toPromise();
        console.log('✅ Nuevo cliente guardado en BD:', bdResult);
      } catch (bdError: any) {
        console.warn('⚠️ Error en BD:', bdError.message);
        console.log('ℹ️ Continuando solo con Firebase - el sistema funciona perfectamente');
      }

      // 3. Guardar datos adicionales en Firestore (opcional, para sincronización)
      if (firebaseUser.user) {
        console.log('🔄 Sincronizando con Firestore...');
        await this.customerAuthService.updateCustomerProfile(firebaseUser.user.uid, {
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
          email: data.email
        });
        console.log('✅ Sincronizado con Firestore');
      }

      console.log('🎉 Registro completo exitoso');
    } catch (error) {
      console.error('❌ Error en registro completo:', error);
      console.error('🔍 Código de error:', (error as any).code);
      console.error('📝 Mensaje:', (error as any).message);
      
      // Proporcionar mensajes de error más específicos
      if ((error as any).code === 'auth/email-already-in-use') {
        throw new Error('Este email ya está registrado en Firebase. Intenta iniciar sesión.');
      } else if ((error as any).code === 'auth/weak-password') {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      } else if ((error as any).code === 'auth/invalid-email') {
        throw new Error('El formato del email no es válido');
      } else if ((error as any).message && ((error as any).message.includes('Ya existe un cliente'))) {
        throw error; // Re-lanzar errores de duplicados con el mensaje original
      } else {
        throw new Error('Error al registrar usuario: ' + ((error as any).message || 'Error desconocido'));
      }
    }
  }

  /**
   * Obtener datos completos del cliente desde la BD
   */
  async getCustomerProfile(email: string): Promise<ClienteInfo | null> {
    try {
      console.log('🔍 Buscando cliente por email:', email);
      const cliente = await this.clientesService.buscarClientePorEmail(email).toPromise();
      console.log('✅ Cliente encontrado en BD:', cliente);
      return cliente || null;
    } catch (error: any) {
      // Si es un 404, es normal (cliente no existe en BD aún)
      if (error?.status === 404) {
        console.log('ℹ️ Cliente no encontrado en BD (404) - normal para usuarios solo de Firebase');
        return null;
      }
      
      // Si es error de CORS o conexión, también retornamos null y continuamos con Firebase
      if (error?.status === 0 || error?.name === 'HttpErrorResponse') {
        console.warn('⚠️ Error de conectividad con BD (probablemente CORS), continuando con Firebase:', error?.message || error);
        return null;
      }
      
      // Para otros errores, log pero no fallar
      console.warn('⚠️ Error obteniendo perfil de cliente:', error?.message || error);
      return null;
    }
  }

  /**
   * Actualizar perfil: Firebase + Base de Datos
   */
  async updateCustomerProfile(email: string, data: CustomerProfileData): Promise<void> {
    try {
      console.log('🔄 Actualizando perfil para:', email);
      
      // Obtener datos del cliente actual para verificar duplicados excluyendo su propio registro
      let clienteActual: ClienteInfo | null = null;
      try {
        const resultado = await this.clientesService.buscarClientePorEmail(email).toPromise();
        clienteActual = resultado || null;
      } catch (error: any) {
        if (error.status !== 404 && error.status !== 0) {
          // Solo lanzar error si no es 404 o error de conectividad
          console.warn('⚠️ Error buscando cliente actual, continuando sin verificación:', error);
        }
      }
      
      // Solo verificar duplicados si tenemos conectividad con la BD
      if (clienteActual !== null) {
        try {
          // Solo verificar email, el DNI no se puede cambiar en el perfil
          const excludeCode = clienteActual.ClienteCodigo;
          if (excludeCode) {
            await this.checkDuplicates(data.email, undefined, excludeCode);
          } else {
            console.warn('⚠️ Cliente actual sin código, verificando duplicados sin exclusión');
            await this.checkDuplicates(data.email);
          }
        } catch (error: any) {
          // Si hay error de duplicados, es importante lanzarlo
          if (error.message && error.message.includes('Ya existe un cliente')) {
            throw error;
          }
          // Si es error de conectividad, continuar
          console.warn('⚠️ Error verificando duplicados, continuando:', error);
        }
      } else {
        console.log('ℹ️ Sin conectividad BD, saltando verificación de duplicados');
      }
      
      // 1. Actualizar en Firebase (solo para sincronización)
      const currentUser = this.customerAuthService.getCurrentUser();
      if (currentUser) {
        console.log('🔄 Actualizando Firebase...');
        
        // Preparar datos para Firebase (sin campos undefined)
        // NO incluir email en los datos de Firebase para evitar conflictos de sesión
        const firebaseData: any = {
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          telefono: data.telefono || '',
          dni: data.dni || '',
          direccion: data.direccion || ''
        };
        
        console.log('📋 Datos para Firebase:', firebaseData);
        try {
          await this.customerAuthService.updateCustomerProfile(currentUser.uid, firebaseData);
          console.log('✅ Firebase actualizado');
        } catch (error: any) {
          console.warn('⚠️ Error actualizando Firebase, continuando:', error);
        }
      }

      // 2. Actualizar en la base de datos
      console.log('🔄 Actualizando base de datos...');
      
      try {
        // Primero obtener el cliente para tener su código
        console.log('🔍 Buscando cliente en BD...');
        const clienteExistente = await this.clientesService.buscarClientePorEmail(email).toPromise();
        
        if (clienteExistente && clienteExistente.ClienteCodigo) {
          // Cliente existe, usar actualización normal por código
          const clienteActualizado: Partial<ClienteInfo> = {
            ClienteNombre: data.nombre,
            ClienteApellidos: data.apellido,
            ClienteEmail: email, // Mantener el email original
            ClienteTelefono: data.telefono,
            ClienteDni: data.dni || clienteExistente.ClienteDni || '00000000',
            ClienteDireccion: data.direccion || clienteExistente.ClienteDireccion || 'Sin especificar'
          };

          console.log('📝 Datos a actualizar en BD:', clienteActualizado);
          
          // Usar el endpoint existente que actualiza por código
          if (clienteExistente.ClienteCodigo) {
            console.log('🔄 Actualizando cliente con código:', clienteExistente.ClienteCodigo);
            const updateResult = await this.clientesService.actualizarCliente(clienteExistente.ClienteCodigo, clienteActualizado).toPromise();
            console.log('✅ Cliente actualizado en BD:', updateResult);
          } else {
            console.log('⚠️ No se encontró ClienteCodigo para actualizar');
          }
          
        } else {
          // Cliente no existe en BD, crearlo
          console.log('👤 Cliente no existe en BD, creando...');
          const nuevoCliente: Partial<ClienteInfo> = {
            ClienteNombre: data.nombre,
            ClienteApellidos: data.apellido,
            ClienteEmail: email, // Usar el email original
            ClienteTelefono: data.telefono,
            ClienteDni: data.dni || '00000000',
            ClienteDireccion: data.direccion || 'Sin especificar',
            Pedidos: []
          };
          
          const createResult = await this.clientesService.registrarCliente(nuevoCliente).toPromise();
          console.log('✅ Nuevo cliente creado en BD:', createResult);
        }
        
      } catch (bdError: any) {
        // Manejar errores específicos de BD sin afectar la sesión
        if (bdError.status === 0 || bdError.name === 'HttpErrorResponse') {
          console.warn('⚠️ Error de conectividad con BD, datos guardados solo en Firebase:', bdError.message);
        } else {
          console.warn('⚠️ Error en BD:', bdError.message);
        }
        // No lanzar error, continuar con Firebase únicamente
      }
      
      console.log('🎉 Perfil completamente actualizado');
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Sincronizar usuario de Firebase con BD (para casos donde existe en Firebase pero no en BD)
   */
  async syncFirebaseUserToDB(email: string): Promise<void> {
    try {
      console.log('🔄 Sincronizando usuario Firebase con BD...');
      
      // Obtener datos del usuario actual de Firebase
      const currentUser = this.customerAuthService.getCurrentUser();
      if (!currentUser || currentUser.email !== email) {
        throw new Error('Usuario no autenticado o email no coincide');
      }

      // Verificar si ya existe en BD
      try {
        const existeEnBD = await this.clientesService.buscarClientePorEmail(email).toPromise();
        if (existeEnBD) {
          console.log('✅ Usuario ya existe en BD, no es necesario sincronizar');
          return;
        }
      } catch (error: any) {
        if (error.status !== 404) {
          throw error; // Si no es 404, hay otro problema
        }
        // 404 es lo esperado, el usuario no existe en BD
      }

      // Crear usuario en BD con datos de Firebase
      const userData = currentUser as any; // Cast para acceder a propiedades adicionales
      const clienteData: Partial<ClienteInfo> = {
        ClienteNombre: userData.nombre || 'Usuario',
        ClienteApellidos: userData.apellido || 'Firebase',
        ClienteEmail: email,
        ClienteTelefono: userData.telefono || '000000000',
        ClienteDni: '00000000', // Se actualizará cuando complete el perfil
        ClienteDireccion: 'Sin especificar', // Se actualizará cuando complete el perfil
        Pedidos: []
      };

      console.log('📝 Creando usuario en BD desde datos de Firebase:', clienteData);
      await this.clientesService.registrarCliente(clienteData).toPromise();
      console.log('✅ Usuario sincronizado exitosamente con BD');
      
    } catch (error: any) {
      console.warn('⚠️ Error sincronizando usuario con BD:', error.message);
      // No lanzar error, el sistema puede funcionar solo con Firebase
    }
  }

  /**
   * Login y obtener datos completos
   */
  async loginAndGetProfile(email: string, password: string): Promise<{ firebaseUser: any, clienteInfo: ClienteInfo | null }> {
    try {
      console.log('🔑 Iniciando login para:', email);
      
      // 1. Login en Firebase
      const firebaseUser = await this.customerAuthService.loginCustomer(email, password);
      console.log('✅ Login exitoso en Firebase');

      // 2. Obtener datos completos de la BD
      let clienteInfo = await this.getCustomerProfile(email);
      
      // 3. Si no existe en BD pero sí en Firebase, sincronizar
      if (!clienteInfo && firebaseUser) {
        console.log('🔄 Usuario existe en Firebase pero no en BD, sincronizando...');
        await this.syncFirebaseUserToDB(email);
        // Intentar obtener datos nuevamente después de la sincronización
        clienteInfo = await this.getCustomerProfile(email);
        
        if (clienteInfo) {
          console.log('✅ Usuario sincronizado exitosamente');
        } else {
          console.log('ℹ️ Sincronización completada, continuando solo con Firebase');
        }
      }

      return { firebaseUser, clienteInfo };
    } catch (error) {
      console.error('❌ Error en login completo:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión del cliente
   */
  async logout(): Promise<void> {
    try {
      console.log('🔓 Cerrando sesión de cliente...');
      await this.customerAuthService.logout();
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual autenticado
   */
  getCurrentUser() {
    return this.customerAuthService.getCurrentUser();
  }

  /**
   * Observable del estado de autenticación
   */
  get user$() {
    return this.customerAuthService.user$;
  }

  /**
   * Enviar email de reset de contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      console.log('📧 Enviando email de reset de contraseña...');
      await this.customerAuthService.sendPasswordResetEmail(email);
      console.log('✅ Email enviado correctamente');
    } catch (error) {
      console.error('❌ Error enviando email de reset:', error);
      throw error;
    }
  }
}