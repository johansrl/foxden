const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'foxden',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
});

pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'jefe'", (err, results) => {
    if (err) {
        console.error("❌ ERROR EN LA QUERY:", err.message);
    } else {
        console.log("✅ USUARIOS JEFE EN DB:", results.length);
        console.log("Filas:", JSON.stringify(results, null, 2));
    }
    process.exit();
});
