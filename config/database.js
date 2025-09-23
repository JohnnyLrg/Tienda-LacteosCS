const sql = require('mssql');

// Configuración de la conexión a SQL Server
const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'SistemaComercialDB',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Si no hay usuario/contraseña, usar autenticación Windows
// Comentamos esto porque ahora usamos usuario sa
// if (!process.env.DB_USER) {
//     dbConfig.options.trustedConnection = true;
//     delete dbConfig.user;
//     delete dbConfig.password;
// }

let pool;

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
            console.log('✅ Conectado a SQL Server exitosamente');
            console.log(`📊 Base de datos: ${dbConfig.database}`);
            console.log(`🖥️  Servidor: ${dbConfig.server}`);
        }
        return pool;
    } catch (error) {
        console.error('❌ Error conectando a SQL Server:', error);
        throw error;
    }
};

// Función para obtener una conexión
const getConnection = async () => {
    if (!pool) {
        await connectDB();
    }
    return pool;
};

// Función para cerrar la conexión
const closeConnection = async () => {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('🔌 Conexión a SQL Server cerrada');
    }
};

// Función helper para ejecutar queries con manejo de errores
const executeQuery = async (query, params = {}) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        
        // Agregar parámetros si existen
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        const result = await request.query(query);
        return result;
    } catch (error) {
        console.error('Error ejecutando query:', error);
        throw error;
    }
};

// Función helper para ejecutar stored procedures
const executeStoredProcedure = async (procedureName, params = {}) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        
        // Agregar parámetros si existen
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        const result = await request.execute(procedureName);
        return result;
    } catch (error) {
        console.error('Error ejecutando stored procedure:', error);
        throw error;
    }
};

// Manejar cierre de aplicación
process.on('SIGINT', async () => {
    console.log('🛑 Recibida señal SIGINT, cerrando aplicación...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Recibida señal SIGTERM, terminando aplicación...');
    await closeConnection();
    process.exit(0);
});

// Manejar errores no capturados sin cerrar la aplicación
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    // No cerrar la aplicación, solo loggear el error
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
    // No cerrar la aplicación, solo loggear el error
});

module.exports = {
    connectDB,
    getConnection,
    closeConnection,
    executeQuery,
    executeStoredProcedure,
    sql
};