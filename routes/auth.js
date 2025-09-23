const express = require('express');
const router = express.Router();
const { executeQuery, sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/verify-user-empresa - Verificar usuario y empresa
router.post('/verify-user-empresa', async (req, res) => {
    try {
        const { firebaseUid, empresaCodigo } = req.body;
        
        if (!firebaseUid || !empresaCodigo) {
            return res.status(400).json({
                success: false,
                error: 'UID de Firebase y código de empresa son requeridos'
            });
        }
        
        // Buscar usuario por Firebase UID
        const userQuery = `
            SELECT 
                u.UsuarioCodigo,
                u.UsuarioNombre,
                u.UsuarioEmpresaCodigo,
                e.EmpleadoCodigo,
                e.EmpleadoNombre,
                e.EmpleadoApellidos,
                c.CargoNombre as Cargo,
                emp.EmpresaCodigo,
                emp.EmpresaNombre,
                emp.EmpresaRUC,
                emp.EmpresaDireccion,
                emp.EmpresaTelefono,
                emp.EmpresaEmail,
                emp.EmpresaLogo,
                emp.EmpresaFechaRegistro
            FROM Usuario u
            LEFT JOIN Empleado e ON u.UsuarioEmpleadoCodigo = e.EmpleadoCodigo
            LEFT JOIN Cargo c ON e.EmpleadoCargoCodigo = c.CargoCodigo
            INNER JOIN Empresa emp ON u.UsuarioEmpresaCodigo = emp.EmpresaCodigo
            WHERE u.UsuarioFirebaseUid = @firebaseUid 
            AND u.UsuarioEmpresaCodigo = @empresaCodigo
        `;
        
        const result = await executeQuery(userQuery, { firebaseUid, empresaCodigo });
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado en esta empresa'
            });
        }
        
        const userData = result.recordset[0];
        
        // Construir respuesta
        const userSession = {
            usuario: {
                UsuarioCodigo: userData.UsuarioCodigo,
                UsuarioNombre: userData.UsuarioNombre,
                UsuarioEmpresaCodigo: userData.UsuarioEmpresaCodigo
            },
            empleado: userData.EmpleadoCodigo ? {
                EmpleadoCodigo: userData.EmpleadoCodigo,
                EmpleadoNombre: userData.EmpleadoNombre,
                EmpleadoApellidos: userData.EmpleadoApellidos,
                Cargo: userData.Cargo || 'Empleado'
            } : null,
            empresa: {
                EmpresaCodigo: userData.EmpresaCodigo,
                EmpresaNombre: userData.EmpresaNombre,
                EmpresaRUC: userData.EmpresaRUC,
                EmpresaDireccion: userData.EmpresaDireccion,
                EmpresaTelefono: userData.EmpresaTelefono,
                EmpresaEmail: userData.EmpresaEmail,
                EmpresaLogo: userData.EmpresaLogo,
                EmpresaFechaRegistro: userData.EmpresaFechaRegistro
            }
        };
        
        res.json({
            success: true,
            userSession
        });
        
    } catch (error) {
        console.error('Error verificando usuario-empresa:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar usuario',
            message: error.message
        });
    }
});

// POST /api/auth/register-user-empresa - Registrar usuario en empresa
router.post('/register-user-empresa', async (req, res) => {
    try {
        const {
            firebaseUid,
            email,
            nombre,
            empresaCodigo,
            empleadoData
        } = req.body;
        
        if (!firebaseUid || !email || !nombre || !empresaCodigo) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }
        
        // Verificar que la empresa existe
        const empresaQuery = `
            SELECT EmpresaCodigo, EmpresaNombre 
            FROM Empresa 
            WHERE EmpresaCodigo = @empresaCodigo
        `;
        
        const empresaResult = await executeQuery(empresaQuery, { empresaCodigo });
        
        if (empresaResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Empresa no encontrada'
            });
        }
        
        // Verificar si ya existe usuario con ese Firebase UID
        const existingUserQuery = `
            SELECT UsuarioCodigo 
            FROM Usuario 
            WHERE UsuarioFirebaseUid = @firebaseUid
        `;
        
        const existingUser = await executeQuery(existingUserQuery, { firebaseUid });
        
        if (existingUser.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'El usuario ya está registrado'
            });
        }
        
        let empleadoCodigo = null;
        
        // Si se proporcionan datos del empleado, crear empleado
        if (empleadoData) {
            const empleadoQuery = `
                INSERT INTO Empleado (
                    EmpleadoNombre,
                    EmpleadoApellidos,
                    EmpleadoDireccion,
                    EmpleadoTelefono,
                    EmpleadoEmail,
                    EmpleadoEstado,
                    EmpleadoEmpresaCodigo
                )
                OUTPUT INSERTED.EmpleadoCodigo
                VALUES (
                    @nombre,
                    @apellidos,
                    @direccion,
                    @telefono,
                    @email,
                    'Activo',
                    @empresaCodigo
                )
            `;
            
            const empleadoResult = await executeQuery(empleadoQuery, {
                nombre: empleadoData.nombre || nombre,
                apellidos: empleadoData.apellidos || '',
                direccion: empleadoData.direccion || null,
                telefono: empleadoData.telefono || null,
                email: email,
                empresaCodigo
            });
            
            empleadoCodigo = empleadoResult.recordset[0].EmpleadoCodigo;
        }
        
        // Crear usuario
        const userQuery = `
            INSERT INTO Usuario (
                UsuarioNombre,
                UsuarioFirebaseUid,
                UsuarioEmpleadoCodigo,
                UsuarioEmpresaCodigo
            )
            OUTPUT INSERTED.*
            VALUES (
                @nombre,
                @firebaseUid,
                @empleadoCodigo,
                @empresaCodigo
            )
        `;
        
        const userResult = await executeQuery(userQuery, {
            nombre,
            firebaseUid,
            empleadoCodigo,
            empresaCodigo
        });
        
        const newUser = userResult.recordset[0];
        
        // Construir respuesta
        const userSession = {
            usuario: {
                UsuarioCodigo: newUser.UsuarioCodigo,
                UsuarioNombre: newUser.UsuarioNombre,
                UsuarioEmpresaCodigo: newUser.UsuarioEmpresaCodigo
            },
            empleado: empleadoCodigo ? {
                EmpleadoCodigo: empleadoCodigo,
                EmpleadoNombre: empleadoData?.nombre || nombre,
                EmpleadoApellidos: empleadoData?.apellidos || '',
                Cargo: 'Empleado'
            } : null,
            empresa: empresaResult.recordset[0]
        };
        
        res.status(201).json({
            success: true,
            mensaje: 'Usuario registrado exitosamente',
            userSession
        });
        
    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario',
            message: error.message
        });
    }
});

// GET /api/auth/empresas-usuario/:firebaseUid - Obtener empresas del usuario
router.get('/empresas-usuario/:firebaseUid', async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        
        const query = `
            SELECT DISTINCT
                e.EmpresaCodigo,
                e.EmpresaNombre,
                e.EmpresaLogo
            FROM Usuario u
            INNER JOIN Empresa e ON u.UsuarioEmpresaCodigo = e.EmpresaCodigo
            WHERE u.UsuarioFirebaseUid = @firebaseUid
        `;
        
        const result = await executeQuery(query, { firebaseUid });
        
        res.json({
            success: true,
            empresas: result.recordset
        });
        
    } catch (error) {
        console.error('Error obteniendo empresas del usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener empresas',
            message: error.message
        });
    }
});

module.exports = router;