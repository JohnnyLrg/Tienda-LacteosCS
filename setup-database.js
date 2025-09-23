// Script para crear tablas adicionales necesarias para el sistema
const { executeQuery } = require('./config/database');

async function createAdditionalTables() {
    try {
        console.log('🔧 Creando tablas adicionales...');
        
        // Agregar campo Firebase UID a Usuario si no existe
        const addFirebaseUidQuery = `
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Usuario') AND name = 'UsuarioFirebaseUid')
            BEGIN
                ALTER TABLE Usuario ADD UsuarioFirebaseUid NVARCHAR(255) NULL;
                CREATE INDEX IX_Usuario_FirebaseUid ON Usuario(UsuarioFirebaseUid);
            END
        `;
        
        await executeQuery(addFirebaseUidQuery);
        console.log('✅ Campo UsuarioFirebaseUid agregado');
        
        // Crear tabla de sesiones si no existe
        const createSessionsTable = `
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('UserSession') AND type = 'U')
            BEGIN
                CREATE TABLE UserSession (
                    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    UsuarioCodigo INT NOT NULL,
                    EmpresaCodigo INT NOT NULL,
                    SessionToken NVARCHAR(500) NOT NULL,
                    CreatedAt DATETIME2 DEFAULT GETDATE(),
                    ExpiresAt DATETIME2 NOT NULL,
                    IsActive BIT DEFAULT 1,
                    FOREIGN KEY (UsuarioCodigo) REFERENCES Usuario(UsuarioCodigo),
                    FOREIGN KEY (EmpresaCodigo) REFERENCES Empresa(EmpresaCodigo)
                );
                
                CREATE INDEX IX_UserSession_Token ON UserSession(SessionToken);
                CREATE INDEX IX_UserSession_User ON UserSession(UsuarioCodigo);
            END
        `;
        
        await executeQuery(createSessionsTable);
        console.log('✅ Tabla UserSession creada');
        
        console.log('🎉 Tablas adicionales creadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error creando tablas:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createAdditionalTables()
        .then(() => {
            console.log('✅ Script completado');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { createAdditionalTables };