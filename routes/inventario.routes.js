const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');


router.get('/', (req, res) => {
    db.all(`SELECT * FROM inventario`, [], (err, filas) => {
        if (err) return res.status(500).json({ error: 'Error al consultar el inventario.' });
        res.json(filas);
    });
});


router.post('/', verificarToken, verificarRol(['jefe', 'personal']), (req, res) => {
    const { nombre, descripcion, cantidad, precio } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const sql = `INSERT INTO inventario (nombre, descripcion, cantidad, precio) VALUES (?, ?, ?, ?)`;
    const values = [nombre, descripcion || null, cantidad || 0, precio];

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: 'Error al guardar en el inventario.' });
        
        res.status(201).json({
            mensaje: 'Producto agregado al inventario',
            productoId: this.lastID
        });
    });
});


router.put('/:id', verificarToken, verificarRol(['jefe', 'personal']), (req, res) => {
    const { nombre, descripcion, cantidad, precio } = req.body;
    
    
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const sql = `UPDATE inventario SET nombre = ?, descripcion = ?, cantidad = ?, precio = ? WHERE id = ?`;
    const values = [nombre, descripcion, cantidad, precio, req.params.id];

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: 'Error al actualizar el inventario.' });
        
        if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
        
        res.json({ mensaje: 'Producto actualizado exitosamente' });
    });
});


router.delete('/:id', verificarToken, verificarRol(['jefe']), (req, res) => {
    const sql = `DELETE FROM inventario WHERE id = ?`;

    db.run(sql, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar el producto.' });
        
        if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
        
        res.json({ mensaje: 'Producto eliminado del inventario' });
    });
});

module.exports = router;
