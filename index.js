

const express = require('express');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const ventasRoutes = require('./routes/ventas.routes');

// Conectar las rutas con prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventasRoutes);


const PORT = 3000;

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));



app.listen(PORT, () => {
    
    console.log(`Servidor iniciado correctamente en http://localhost:${PORT}`);
});
