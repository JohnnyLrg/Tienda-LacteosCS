const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware de seguridad
app.use(helmet());

// CORS configuración
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Importar rutas
const authRoutes = require('./routes/auth');
const empresaRoutes = require('./routes/empresas');
const productosRoutes = require('./routes/productos');
const inventarioRoutes = require('./routes/inventario');
const pedidosRoutes = require('./routes/pedidos');
const clientesRoutes = require('./routes/clientes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/company/:empresaCodigo/productos', productosRoutes);
app.use('/api/company/:empresaCodigo/inventario', inventarioRoutes);
app.use('/api/company/:empresaCodigo/pedidos', pedidosRoutes);
app.use('/api/company/:empresaCodigo/clientes', clientesRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Sistema Comercial funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.message
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Token inválido o expirado'
        });
    }
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Sistema Comercial iniciado en puerto ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log(`📊 Base de datos: ${process.env.DB_SERVER}/${process.env.DB_NAME}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;