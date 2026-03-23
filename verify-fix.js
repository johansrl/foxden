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

async function verify() {
    const conn = await pool.promise().getConnection();
    
    console.log("--- INICIANDO VERIFICACIÓN DE MIGRACIÓN ---");
    
   
    try {
        await conn.query(`ALTER TABLE usuarios MODIFY COLUMN rol ENUM('cliente', 'personal', 'jefe') NOT NULL`);
        console.log("✅ Alter table (ENUM) exitoso.");
        
        await conn.query(`UPDATE usuarios SET rol = 'personal' WHERE rol = 'empleado'`);
        console.log("✅ Migración de 'empleado' a 'personal' exitosa.");
        
        
        const [columns] = await conn.query("DESCRIBE usuarios");
        const rolCol = columns.find(c => c.Field === 'rol');
        console.log("Estructura final del rol:", rolCol.Type);
        
        
        const [counts] = await conn.query("SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol");
        console.log("Conteo de roles actual:");
        console.table(counts);
        
    } catch (err) {
        console.error("❌ ERROR DURANTE VERIFICACIÓN:", err.message);
    } finally {
        conn.release();
        process.exit();
    }
}

verify();
