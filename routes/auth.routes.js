const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET_KEY } = require('../middleware/auth');


router.post('/register', async (req, res) => {
    const { nombre, email, password, rol, codigoSecreto } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre, email, password, rol' });
    }

    if (!['cliente', 'personal', 'jefe'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido. Roles permitidos: cliente, personal, jefe' });
    }

    
    if ((rol === 'personal' || rol === 'jefe') && codigoSecreto !== '100301') {
        return res.status(403).json({ error: 'Código de autorización de trabajador / jefe incorrecto o ausente.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        db.run(`INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`, 
            [nombre, email, hashedPassword, rol], 
            function(err) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'El email ya está registrado.' });
                    }
                    return res.status(500).json({ error: 'Error interno de la base de datos.' });
                }
                
                res.status(201).json({ 
                    mensaje: 'Usuario registrado exitosamente',
                    usuarioId: this.lastID,
                    rol: rol
                });
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al encriptar la contraseña.' });
    }
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'El email y el password son obligatorios' });
    }

    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, usuario) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno de la base de datos.' });
        }

        if (!usuario) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
        }

        const tokenPayload = {
            id: usuario.id,
            rol: usuario.rol
        };

        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    });
});

module.exports = router;
