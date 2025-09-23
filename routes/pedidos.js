const express = require('express');
const router = express.Router({ mergeParams: true });
const { executeQuery, sql } = require('../config/database');

// GET /api/company/:empresaCodigo/pedidos - Obtener pedidos
router.get('/', async (req, res) => {
    try {
        const { empresaCodigo } = req.params;
        
        const query = `
            SELECT 
                p.PedidoCodigo,
                p.PedidoFecha,
                p.PedidoTotal,
                p.PedidoEstado,
                c.ClienteNombre,
                c.ClienteApellidos
            FROM Pedido p
            INNER JOIN Cliente c ON p.PedidoClienteCodigo = c.ClienteCodigo
            WHERE p.PedidoEmpresaCodigo = @empresaCodigo
            ORDER BY p.PedidoFecha DESC
        `;
        
        const result = await executeQuery(query, { empresaCodigo });
        
        res.json({
            success: true,
            pedidos: result.recordset
        });
        
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pedidos',
            message: error.message
        });
    }
});

module.exports = router;