const express = require('express');
const router = express.Router({ mergeParams: true });
const { executeQuery, sql } = require('../config/database');

// GET /api/company/:empresaCodigo/clientes - Obtener clientes
router.get('/', async (req, res) => {
    try {
        const { empresaCodigo } = req.params;
        
        const query = `
            SELECT 
                c.ClienteCodigo,
                c.ClienteNombre,
                c.ClienteApellidos,
                c.ClienteEmail,
                c.ClienteTelefono,
                c.ClienteDireccion
            FROM Cliente c
            WHERE c.ClienteEmpresaCodigo = @empresaCodigo
            ORDER BY c.ClienteNombre, c.ClienteApellidos
        `;
        
        const result = await executeQuery(query, { empresaCodigo });
        
        res.json({
            success: true,
            clientes: result.recordset
        });
        
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener clientes',
            message: error.message
        });
    }
});

module.exports = router;