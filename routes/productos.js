const express = require('express');
const router = express.Router({ mergeParams: true });
const { executeQuery, sql } = require('../config/database');

// GET /api/company/:empresaCodigo/productos - Obtener productos de la empresa
router.get('/', async (req, res) => {
    try {
        const { empresaCodigo } = req.params;
        
        const query = `
            SELECT 
                p.ProductoCodigo,
                p.ProductoNombre,
                p.ProductoDescripcion,
                p.ProductoPrecio,
                p.ProductoStock,
                p.ProductoImagen,
                p.ProductoEmpresaCodigo,
                tp.TipoProductoNombre as CategoriaNombre
            FROM Producto p
            LEFT JOIN TipoProducto tp ON p.ProductoTipoProductoCodigo = tp.TipoProductoCodigo
            WHERE p.ProductoEmpresaCodigo = @empresaCodigo
            ORDER BY p.ProductoNombre
        `;
        
        const result = await executeQuery(query, { empresaCodigo });
        
        res.json({
            success: true,
            productos: result.recordset
        });
        
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos',
            message: error.message
        });
    }
});

// GET /api/company/:empresaCodigo/productos/:productoCodigo - Obtener producto específico
router.get('/:productoCodigo', async (req, res) => {
    try {
        const { empresaCodigo, productoCodigo } = req.params;
        
        const query = `
            SELECT 
                p.ProductoCodigo,
                p.ProductoNombre,
                p.ProductoDescripcion,
                p.ProductoPrecio,
                p.ProductoStock,
                p.ProductoImagen,
                p.ProductoEmpresaCodigo,
                p.ProductoTipoProductoCodigo,
                tp.TipoProductoNombre as CategoriaNombre
            FROM Producto p
            LEFT JOIN TipoProducto tp ON p.ProductoTipoProductoCodigo = tp.TipoProductoCodigo
            WHERE p.ProductoCodigo = @productoCodigo 
            AND p.ProductoEmpresaCodigo = @empresaCodigo
        `;
        
        const result = await executeQuery(query, { empresaCodigo, productoCodigo });
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            producto: result.recordset[0]
        });
        
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener producto',
            message: error.message
        });
    }
});

// POST /api/company/:empresaCodigo/productos - Crear nuevo producto
router.post('/', async (req, res) => {
    try {
        const { empresaCodigo } = req.params;
        const {
            ProductoNombre,
            ProductoDescripcion,
            ProductoPrecio,
            ProductoStock,
            ProductoImagen,
            ProductoTipoProductoCodigo
        } = req.body;
        
        if (!ProductoNombre || !ProductoPrecio) {
            return res.status(400).json({
                success: false,
                error: 'Nombre y precio del producto son requeridos'
            });
        }
        
        const query = `
            INSERT INTO Producto (
                ProductoNombre,
                ProductoDescripcion,
                ProductoPrecio,
                ProductoStock,
                ProductoImagen,
                ProductoTipoProductoCodigo,
                ProductoEmpresaCodigo
            )
            OUTPUT INSERTED.*
            VALUES (
                @ProductoNombre,
                @ProductoDescripcion,
                @ProductoPrecio,
                @ProductoStock,
                @ProductoImagen,
                @ProductoTipoProductoCodigo,
                @empresaCodigo
            )
        `;
        
        const result = await executeQuery(query, {
            ProductoNombre,
            ProductoDescripcion: ProductoDescripcion || null,
            ProductoPrecio,
            ProductoStock: ProductoStock || 0,
            ProductoImagen: ProductoImagen || null,
            ProductoTipoProductoCodigo: ProductoTipoProductoCodigo || null,
            empresaCodigo
        });
        
        res.status(201).json({
            success: true,
            mensaje: 'Producto creado exitosamente',
            producto: result.recordset[0]
        });
        
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear producto',
            message: error.message
        });
    }
});

// PUT /api/company/:empresaCodigo/productos/:productoCodigo - Actualizar producto
router.put('/:productoCodigo', async (req, res) => {
    try {
        const { empresaCodigo, productoCodigo } = req.params;
        const {
            ProductoNombre,
            ProductoDescripcion,
            ProductoPrecio,
            ProductoStock,
            ProductoImagen,
            ProductoTipoProductoCodigo
        } = req.body;
        
        const query = `
            UPDATE Producto SET
                ProductoNombre = @ProductoNombre,
                ProductoDescripcion = @ProductoDescripcion,
                ProductoPrecio = @ProductoPrecio,
                ProductoStock = @ProductoStock,
                ProductoImagen = @ProductoImagen,
                ProductoTipoProductoCodigo = @ProductoTipoProductoCodigo
            OUTPUT INSERTED.*
            WHERE ProductoCodigo = @productoCodigo 
            AND ProductoEmpresaCodigo = @empresaCodigo
        `;
        
        const result = await executeQuery(query, {
            ProductoNombre,
            ProductoDescripcion,
            ProductoPrecio,
            ProductoStock,
            ProductoImagen,
            ProductoTipoProductoCodigo,
            productoCodigo,
            empresaCodigo
        });
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            mensaje: 'Producto actualizado exitosamente',
            producto: result.recordset[0]
        });
        
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar producto',
            message: error.message
        });
    }
});

// DELETE /api/company/:empresaCodigo/productos/:productoCodigo - Eliminar producto
router.delete('/:productoCodigo', async (req, res) => {
    try {
        const { empresaCodigo, productoCodigo } = req.params;
        
        const query = `
            DELETE FROM Producto 
            WHERE ProductoCodigo = @productoCodigo 
            AND ProductoEmpresaCodigo = @empresaCodigo
        `;
        
        const result = await executeQuery(query, { productoCodigo, empresaCodigo });
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            mensaje: 'Producto eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar producto',
            message: error.message
        });
    }
});

module.exports = router;