const jwt = require('jsonwebtoken');

const SECRET_KEY = 'fox_den_secret_key_123';

const verificarToken = (req, res, next) => {
    const headerAuth = req.headers['authorization'];
    const token = headerAuth && headerAuth.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Se requiere un token de autenticación para acceder a esta ruta.' });
    }

    try {
        const decodificado = jwt.verify(token, SECRET_KEY);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'Acceso denegado. No tienes permisos suficientes para realizar esta acción.' });
        }
        next();
    };
};

module.exports = {
    SECRET_KEY,
    verificarToken,
    verificarRol
};
