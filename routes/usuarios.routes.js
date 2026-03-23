const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const bcrypt = require('bcryptjs');



router.get('/clientes', verificarToken, verificarRol(['jefe', 'personal']), (req, res) => {
    db.all(`SELECT id, nombre, email, creado_en FROM usuarios WHERE rol = 'cliente'`, [], (err, filas) => {
        if (err) return res.status(500).json({ error: 'Error al consultar clientes.' });
        res.json(filas);
    });
});


router.get('/clientes/:id/ventas', verificarToken, verificarRol(['jefe', 'personal']), (req, res) => {
    const sql = `
        SELECT v.id, v.producto_id, i.nombre as producto_nombre, v.cantidad, v.total, v.fecha_venta 
        FROM ventas v
        LEFT JOIN inventario i ON v.producto_id = i.id
        WHERE v.cliente_id = ?
        ORDER BY v.fecha_venta DESC
    `;
    db.all(sql, [req.params.id], (err, filas) => {
        if (err) return res.status(500).json({ error: 'Error al consultar historial de ventas del cliente.' });
        res.json(filas);
    });
});


router.get('/', verificarToken, verificarRol(['jefe']), (req, res) => {
    db.all(`SELECT id, nombre, email, rol, creado_en FROM usuarios`, [], (err, filas) => {
        if (err) return res.status(500).json({ error: 'Error al consultar usuarios.' });
        res.json(filas);
    });
});


router.get('/:id', verificarToken, verificarRol(['jefe']), (req, res) => {
    db.get(`SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = ?`, [req.params.id], (err, fila) => {
        if (err) return res.status(500).json({ error: 'Error al obtener usuario.' });
        if (!fila) return res.status(404).json({ error: 'Usuario no encontrado.' });
        res.json(fila);
    });
});


router.put('/:id', verificarToken, verificarRol(['jefe']), async (req, res) => {
    const userIdToEdit = req.params.id;
    const { nombre, email, password, rol } = req.body;

    let salt, hashedPassword;
    if (password) {
        salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    const camposParaActualizar = [];
    const valores = [];

    if (nombre) { camposParaActualizar.push('nombre = ?'); valores.push(nombre); }
    if (email) { camposParaActualizar.push('email = ?'); valores.push(email); }
    if (rol) { camposParaActualizar.push('rol = ?'); valores.push(rol); }
    if (password) { camposParaActualizar.push('password = ?'); valores.push(hashedPassword); }

    if (camposParaActualizar.length === 0) {
        return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
    }

    valores.push(userIdToEdit);

    const sql = `UPDATE usuarios SET ${camposParaActualizar.join(', ')} WHERE id = ?`;

    db.run(sql, valores, function(err) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El email ya está en uso por otro usuario.' });
            }
            return res.status(500).json({ error: 'Error al actualizar.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        
        res.json({ mensaje: 'Usuario actualizado exitosamente' });
    });
});


router.delete('/:id', verificarToken, verificarRol(['jefe']), (req, res) => {
    db.run(`DELETE FROM usuarios WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar usuario.' });
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json({ mensaje: 'Usuario eliminado exitosamente' });
    });
});

module.exports = router;
