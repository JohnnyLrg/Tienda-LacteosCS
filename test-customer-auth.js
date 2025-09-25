/**
 * Script de prueba para verificar la autenticación de clientes
 * Ejecutar con: node test-customer-auth.js
 */

const BASE_URL = 'http://localhost:8080';

// Test de creación de cliente
async function testCreateCustomer() {
  console.log('🧪 Testing customer creation...');
  
  const testCustomer = {
    ClienteNombre: 'Test',
    ClienteApellidos: 'Usuario',
    ClienteEmail: 'test@ejemplo.com',
    ClienteTelefono: '987654321',
    ClienteDni: '12345678',
    ClienteDireccion: 'Calle Test 123, Lima'
  };

  try {
    const response = await fetch(`${BASE_URL}/cliente/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCustomer)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cliente creado exitosamente:', result);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Error creando cliente:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error de red:', error.message);
    return false;
  }
}

// Test de búsqueda por email
async function testFindCustomerByEmail(email) {
  console.log(`🔍 Testing find customer by email: ${email}`);
  
  try {
    const response = await fetch(`${BASE_URL}/cliente/email/${email}`);
    
    if (response.ok) {
      const customer = await response.json();
      console.log('✅ Cliente encontrado:', customer);
      return customer;
    } else if (response.status === 404) {
      console.log('ℹ️ Cliente no encontrado (404)');
      return null;
    } else {
      console.log('❌ Error buscando cliente:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error de red:', error.message);
    return null;
  }
}

// Verificar que el backend esté funcionando
async function testBackendConnection() {
  console.log('🔗 Testing backend connection...');
  
  try {
    const response = await fetch(`${BASE_URL}/cliente`);
    
    if (response.ok) {
      console.log('✅ Backend está funcionando');
      return true;
    } else {
      console.log('❌ Backend responde pero con error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ No se puede conectar al backend:', error.message);
    console.log('ℹ️ Asegúrate de que el servidor Java esté ejecutándose en el puerto 8080');
    return false;
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de autenticación de clientes...\n');
  
  // Test 1: Verificar conexión backend
  const backendOk = await testBackendConnection();
  if (!backendOk) {
    console.log('\n❌ Las pruebas no pueden continuar sin el backend');
    return;
  }
  
  console.log('');
  
  // Test 2: Buscar cliente de prueba (debería no existir inicialmente)
  const existingCustomer = await testFindCustomerByEmail('test@ejemplo.com');
  
  console.log('');
  
  // Test 3: Crear cliente solo si no existe
  if (!existingCustomer) {
    const created = await testCreateCustomer();
    if (created) {
      console.log('');
      // Test 4: Verificar que ahora sí existe
      await testFindCustomerByEmail('test@ejemplo.com');
    }
  } else {
    console.log('ℹ️ Cliente de prueba ya existe, saltando creación');
  }
  
  console.log('\n✨ Pruebas completadas');
  console.log('\n📋 Siguiente paso: Probar el registro desde la UI');
  console.log('   1. Abre http://localhost:4201/customer-register');
  console.log('   2. Registra un nuevo cliente');
  console.log('   3. Verifica que funcione el login en http://localhost:4201/customer-login');
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  // Estamos en Node.js
  const fetch = require('node-fetch');
  runTests().catch(console.error);
} else {
  // Estamos en el navegador
  console.log('✅ Script cargado - ejecuta runTests() en la consola');
}