# 🥛 Sistema Multi-Tenant para Tienda de Lácteos - Backend

Backend API desarrollado en Node.js + Express + SQL Server para el sistema multi-tenant de gestión de lácteos.

## 📋 Requisitos Previos

- **Node.js** 16.0.0 o superior
- **SQL Server** (con tu instancia: `LAPTOP-0M7KSHRE\SQL2022JOHNNY`)
- **Base de datos** `SistemaComercialDB` ya creada y configurada

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)
```bash
cd backend
setup.bat
```

### Opción 2: Manual
```bash
cd backend
npm install
npm start
```

## ⚙️ Configuración

### Variables de Entorno (.env)
```env
# Servidor
PORT=8080
NODE_ENV=development

# SQL Server (tu configuración)
DB_SERVER=LAPTOP-0M7KSHRE\SQL2022JOHNNY
DB_NAME=SistemaComercialDB
DB_TRUST_SERVER_CERTIFICATE=true

# Seguridad
JWT_SECRET=tu_jwt_secret_cambiar_en_produccion
CORS_ORIGIN=http://localhost:4200
```

## 🗄️ Configuración de Base de Datos

### Conexión Automática
El sistema se conecta automáticamente usando **autenticación Windows** a tu servidor:
- **Servidor**: `LAPTOP-0M7KSHRE\SQL2022JOHNNY`
- **Base de datos**: `SistemaComercialDB`

### Tablas Adicionales
Ejecuta el script para crear campos adicionales:
```bash
node setup-database.js
```

Esto agrega:
- Campo `UsuarioFirebaseUid` en tabla `Usuario`
- Tabla `UserSession` para gestión de sesiones

## 🛠️ Scripts Disponibles

```bash
# Iniciar servidor de producción
npm start

# Desarrollo con auto-reload
npm run dev

# Verificar conexión a BD
node setup-database.js
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/verify-user-empresa` - Verificar usuario en empresa
- `POST /api/auth/register-user-empresa` - Registrar usuario
- `GET /api/auth/empresas-usuario/:firebaseUid` - Empresas del usuario

### Empresas (Super Admin)
- `GET /api/empresas` - Listar todas las empresas
- `POST /api/empresas` - Crear empresa
- `PUT /api/empresas/:codigo` - Actualizar empresa
- `DELETE /api/empresas/:codigo` - Eliminar empresa

### Multi-Tenant (Por Empresa)
- `GET /api/company/:empresaCodigo/productos` - Productos de la empresa
- `GET /api/company/:empresaCodigo/inventario` - Inventario
- `GET /api/company/:empresaCodigo/pedidos` - Pedidos
- `GET /api/company/:empresaCodigo/clientes` - Clientes

## 🔧 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración SQL Server
├── routes/
│   ├── auth.js             # Rutas de autenticación
│   ├── empresas.js         # CRUD de empresas
│   ├── productos.js        # Gestión de productos
│   ├── inventario.js       # Control de inventario
│   ├── pedidos.js          # Gestión de pedidos
│   └── clientes.js         # Gestión de clientes
├── .env                    # Variables de entorno
├── server.js              # Servidor principal
├── setup.bat              # Script de instalación
└── setup-database.js      # Script de BD
```

## 🚀 Iniciar el Sistema Completo

### 1. Backend (Este proyecto)
```bash
cd backend
npm start
```
**Servidor disponible en**: http://localhost:8080

### 2. Frontend (Angular)
```bash
cd .. # Volver a la carpeta principal
npm start
```
**Aplicación disponible en**: http://localhost:4200

## 🔍 Verificación

### Probar Conexión
Visita: http://localhost:8080/api/health

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Backend funcionando correctamente",
  "timestamp": "2025-09-22T...",
  "environment": "development"
}
```

### Probar Empresas
```bash
GET http://localhost:8080/api/empresas
```

## 🐛 Solución de Problemas

### Error de Conexión SQL Server
1. Verificar que SQL Server esté ejecutándose
2. Confirmar nombre del servidor: `LAPTOP-0M7KSHRE\SQL2022JOHNNY`
3. Verificar que la base de datos `SistemaComercialDB` existe
4. Asegurar que tienes permisos de Windows para la BD

### Error de CORS
- Verificar que `CORS_ORIGIN=http://localhost:4200` en `.env`
- Reiniciar el servidor backend

### Puerto Ocupado
```bash
# Ver qué proceso usa el puerto 8080
netstat -ano | findstr :8080

# Cambiar puerto en .env
PORT=8081
```

## 📝 Notas Importantes

- El sistema usa **autenticación Windows** por defecto
- Todas las rutas están protegidas por empresa (`EmpresaCodigo`)
- Los endpoints multi-tenant filtran automáticamente por empresa
- Firebase se usa solo para autenticación del frontend

## 🔒 Seguridad

- CORS configurado para localhost:4200
- Validación de empresa en cada request
- JWT para sesiones (implementación futura)
- Particionado automático por `EmpresaCodigo`

---

**¡El backend está listo para conectarse con tu base de datos SQL Server!** 🎉