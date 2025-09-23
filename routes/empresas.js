const express = require('express');
const router = express.Router();
const { executeQuery, sql } = require('../config/database');

// GET /api/empresas - Obtener todas las empresas (solo super admin)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                EmpresaCodigo,
                EmpresaNombre,
                EmpresaRUC,
                EmpresaDireccion,
                EmpresaTelefono,
                EmpresaEmail,
                EmpresaLogo,
                EmpresaFechaRegistro
            FROM Empresa
            ORDER BY EmpresaFechaRegistro DESC
        `;
        
        const result = await executeQuery(query);
        
        res.json({
            success: true,
            empresas: result.recordset,
            total: result.recordset.length
        });
        
    } catch (error) {
        console.error('Error obteniendo empresas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener empresas',
            message: error.message
        });
    }
});

// GET /api/empresas/:codigo - Obtener empresa por código
router.get('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        const query = `
            SELECT 
                EmpresaCodigo,
                EmpresaNombre,
                EmpresaRUC,
                EmpresaDireccion,
                EmpresaTelefono,
                EmpresaEmail,
                EmpresaLogo,
                EmpresaFechaRegistro
            FROM Empresa
            WHERE EmpresaCodigo = @codigo
        `;
        
        const result = await executeQuery(query, { codigo });
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Empresa no encontrada'
            });
        }
        
        res.json({
            success: true,
            empresa: result.recordset[0]
        });
        
    } catch (error) {
        console.error('Error obteniendo empresa:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener empresa',
            message: error.message
        });
    }
});

// POST /api/empresas - Crear nueva empresa
router.post('/', async (req, res) => {
    try {
        const {
            EmpresaNombre,
            EmpresaRUC,
            EmpresaDireccion,
            EmpresaTelefono,
            EmpresaEmail,
            EmpresaLogo
        } = req.body;
        
        if (!EmpresaNombre) {
            return res.status(400).json({
                success: false,
                error: 'El nombre de la empresa es requerido'
            });
        }
        
        const query = `
            INSERT INTO Empresa (
                EmpresaNombre,
                EmpresaRUC,
                EmpresaDireccion,
                EmpresaTelefono,
                EmpresaEmail,
                EmpresaLogo,
                EmpresaFechaRegistro
            ) 
            OUTPUT INSERTED.*
            VALUES (
                @EmpresaNombre,
                @EmpresaRUC,
                @EmpresaDireccion,
                @EmpresaTelefono,
                @EmpresaEmail,
                @EmpresaLogo,
                GETDATE()
            )
        `;
        
        const result = await executeQuery(query, {
            EmpresaNombre,
            EmpresaRUC: EmpresaRUC || null,
            EmpresaDireccion: EmpresaDireccion || null,
            EmpresaTelefono: EmpresaTelefono || null,
            EmpresaEmail: EmpresaEmail || null,
            EmpresaLogo: EmpresaLogo || null
        });
        
        res.status(201).json({
            success: true,
            mensaje: 'Empresa creada exitosamente',
            empresa: result.recordset[0]
        });
        
    } catch (error) {
        console.error('Error creando empresa:', error);
        
        if (error.number === 2627) { // Violación de clave única
            return res.status(409).json({
                success: false,
                error: 'Ya existe una empresa con ese RUC'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error al crear empresa',
            message: error.message
        });
    }
});

// PUT /api/empresas/:codigo - Actualizar empresa
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const {
            EmpresaNombre,
            EmpresaRUC,
            EmpresaDireccion,
            EmpresaTelefono,
            EmpresaEmail,
            EmpresaLogo
        } = req.body;
        
        const query = `
            UPDATE Empresa SET
                EmpresaNombre = @EmpresaNombre,
                EmpresaRUC = @EmpresaRUC,
                EmpresaDireccion = @EmpresaDireccion,
                EmpresaTelefono = @EmpresaTelefono,
                EmpresaEmail = @EmpresaEmail,
                EmpresaLogo = @EmpresaLogo
            OUTPUT INSERTED.*
            WHERE EmpresaCodigo = @codigo
        `;
        
        const result = await executeQuery(query, {
            codigo,
            EmpresaNombre,
            EmpresaRUC: EmpresaRUC || null,
            EmpresaDireccion: EmpresaDireccion || null,
            EmpresaTelefono: EmpresaTelefono || null,
            EmpresaEmail: EmpresaEmail || null,
            EmpresaLogo: EmpresaLogo || null
        });
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Empresa no encontrada'
            });
        }
        
        res.json({
            success: true,
            mensaje: 'Empresa actualizada exitosamente',
            empresa: result.recordset[0]
        });
        
    } catch (error) {
        console.error('Error actualizando empresa:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar empresa',
            message: error.message
        });
    }
});

// DELETE /api/empresas/:codigo - Eliminar empresa
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        // Verificar si hay datos relacionados
        const checkQuery = `
            SELECT COUNT(*) as count FROM (
                SELECT 1 FROM Producto WHERE ProductoEmpresaCodigo = @codigo
                UNION ALL
                SELECT 1 FROM Empleado WHERE EmpleadoEmpresaCodigo = @codigo
                UNION ALL
                SELECT 1 FROM Usuario WHERE UsuarioEmpresaCodigo = @codigo
            ) as related_data
        `;
        
        const checkResult = await executeQuery(checkQuery, { codigo });
        
        if (checkResult.recordset[0].count > 0) {
            return res.status(409).json({
                success: false,
                error: 'No se puede eliminar la empresa porque tiene datos relacionados'
            });
        }
        
        const deleteQuery = `
            DELETE FROM Empresa WHERE EmpresaCodigo = @codigo
        `;
        
        const result = await executeQuery(deleteQuery, { codigo });
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Empresa no encontrada'
            });
        }
        
        res.json({
            success: true,
            mensaje: 'Empresa eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando empresa:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar empresa',
            message: error.message
        });
    }
});

// GET /api/empresas/validar-ruc/:ruc - Validar si existe RUC
router.get('/validar-ruc/:ruc', async (req, res) => {
    try {
        const { ruc } = req.params;
        
        const query = `
            SELECT COUNT(*) as count
            FROM Empresa
            WHERE EmpresaRUC = @ruc
        `;
        
        const result = await executeQuery(query, { ruc });
        
        res.json({
            success: true,
            existe: result.recordset[0].count > 0
        });
        
    } catch (error) {
        console.error('Error validando RUC:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar RUC',
            message: error.message
        });
    }
});

// GET /api/empresas/estadisticas - Obtener estadísticas
router.get('/estadisticas', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as totalEmpresas,
                COUNT(CASE WHEN EmpresaFechaRegistro >= DATEADD(MONTH, -1, GETDATE()) THEN 1 END) as nuevasUltimoMes,
                COUNT(CASE WHEN EmpresaFechaRegistro >= CAST(GETDATE() AS DATE) THEN 1 END) as nuevasHoy
            FROM Empresa
        `;
        
        const result = await executeQuery(query);
        
        res.json({
            success: true,
            estadisticas: result.recordset[0]
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas',
            message: error.message
        });
    }
});

module.exports = router;