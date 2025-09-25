// Script de prueba para crear cliente directamente en la API
const fetch = require('node-fetch');

const testClientData = {
  ClienteNombre: "TestUsuario",
  ClienteApellidos: "Apellido",
  ClienteEmail: "testusuario@gmail.com",
  ClienteTelefono: "987654321",
  ClienteDni: "87654321",
  ClienteDireccion: "Av. Test 123, Lima"
};

async function testCreateClient() {
  try {
    console.log('📋 Enviando datos:', JSON.stringify(testClientData, null, 2));
    
    const response = await fetch('http://localhost:8080/cliente/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testClientData)
    });
    
    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cliente creado:', result);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    console.error('💥 Error de red:', error);
  }
}

testCreateClient();