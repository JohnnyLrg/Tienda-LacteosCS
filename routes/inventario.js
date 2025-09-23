const express = require('express');
const router = express.Router({ mergeParams: true });
const { executeQuery, sql } = require('../config/database');

// Estas son rutas básicas para completar la estructura
// Puedes expandirlas según tus necesidades

// GET /api/company/:empresaCodigo/inventario - Obtener inventario
router.get('/', async (req, res) => {
    try {
        const { empresaCodigo } = req.params;
        
        const query = `
            SELECT 
                p.ProductoCodigo,
                p.ProductoNombre,
                p.ProductoStock,
                p.ProductoPrecio
            FROM Producto p
            WHERE p.ProductoEmpresaCodigo = @empresaCodigo
            ORDER BY p.ProductoNombre
        `;
        
        const result = await executeQuery(query, { empresaCodigo });
        
        res.json({
            success: true,
            inventario: result.recordset
        });
        
    } catch (error) {
        console.error('Error obteniendo inventario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener inventario',
            message: error.message
        });
    }
});

module.exports = router;