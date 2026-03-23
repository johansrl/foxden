const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');


router.get('/', verificarToken, verificarRol(['jefe', 'personal']), (req, res) => {
    const sql = `
        SELECT v.id, v.cliente_id AS usuario_id, u.nombre AS cliente_nombre, 
               v.producto_id, v.cantidad, v.total, v.fecha_venta AS fecha 
        FROM ventas v
        LEFT JOIN usuarios u ON v.cliente_id = u.id
        ORDER BY v.fecha_venta DESC
    `;
    db.all(sql, [], (err, filas) => {
        if (err) return res.status(500).json({ error: 'Error al consultar las ventas.' });
        res.json(filas);
    });
});


router.get('/mis-compras', verificarToken, verificarRol(['cliente']), (req, res) => {
    const sql = `
        SELECT id, cliente_id AS usuario_id, producto_id, cantidad, total, fecha_venta AS fecha 
        FROM ventas WHERE cliente_id = ? ORDER BY fecha_venta DESC
    `;
    db.all(sql, [req.usuario.id], (err, filas) => {
        if (err) return res.status(500).json({ error: 'Error al consultar tus compras.' });
        res.json(filas);
    });
});


router.post('/', verificarToken, verificarRol(['jefe', 'personal', 'cliente']), (req, res) => {
    const { producto_id, cantidad } = req.body;

    let userIdCompra = req.usuario.id;

    if (!producto_id || !cantidad || isNaN(cantidad)) {
        return res.status(400).json({ error: 'Debe especificar el ID del producto y la cantidad.' });
    }

    
    db.get(`SELECT precio FROM inventario WHERE id = ?`, [producto_id], (err, producto) => {
        if (err) return res.status(500).json({ error: 'Error al buscar el producto.' });
        if (!producto) return res.status(404).json({ error: 'El producto no existe en el inventario.' });

        const total = producto.precio * cantidad;

        const sql = `INSERT INTO ventas (cliente_id, producto_id, cantidad, total) VALUES (?, ?, ?, ?)`;
        db.run(sql, [userIdCompra, producto_id, cantidad, total], function(err) {
            if (err) return res.status(500).json({ error: 'Error al registrar la venta.' });
            
            res.status(201).json({
                mensaje: 'Venta registrada exitosamente',
                ventaId: this.lastID
            });
        });
    });
});


router.get('/reporte', verificarToken, verificarRol(['jefe']), (req, res) => {
    const sql = `
        SELECT 
            COUNT(id) as total_ventas,
            SUM(total) as ingresos_totales
        FROM ventas
    `;
    db.get(sql, [], (err, fila) => {
        if (err) return res.status(500).json({ error: 'Error al generar reporte.' });
        res.json(fila);
    });
});


router.delete('/:id', verificarToken, verificarRol(['jefe']), (req, res) => {
    db.run(`DELETE FROM ventas WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al anular la venta.' });
        
        if (this.changes === 0) return res.status(404).json({ error: 'Venta no encontrada.' });
        
        res.json({ mensaje: 'Venta anulada correctamente' });
    });
});

module.exports = router;
