const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'foxden',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

const db = {
    serialize: function(callback) {
        callback();
    },

    run: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        pool.query(sql, params || [], function(err, results) {
            if (err) {
                if (callback) return callback.call(null, err);
                return;
            }
            const dbContext = {
                lastID: results.insertId,
                changes: results.affectedRows
            };
            if (callback) {
                callback.call(dbContext, null);
            }
        });
    },

    get: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        pool.query(sql, params || [], function(err, results) {
            if (err) {
                if (callback) return callback(err, null);
                return;
            }
            const row = results.length > 0 ? results[0] : null;
            if (callback) {
                callback(null, row);
            }
        });
    },

    all: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        pool.query(sql, params || [], function(err, results) {
            if (err) {
                if (callback) return callback(err, null);
                return;
            }
            if (callback) {
                callback(null, results);
            }
        });
    }
};


pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERROR AL CONECTAR CON XAMPP / MySQL:', err.message);
        console.error('Asegúrate de que XAMPP esté encendido y la BD "foxden" exista en phpMyAdmin.');
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL (foxden) en XAMPP.');
    
   
    const tablas = [
        `CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            rol ENUM('cliente', 'personal', 'jefe') NOT NULL,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
       
        `ALTER TABLE usuarios MODIFY COLUMN rol ENUM('cliente', 'personal', 'jefe') NOT NULL`,
        
        `UPDATE usuarios SET rol = 'personal' WHERE rol = 'empleado'`,
        `CREATE TABLE IF NOT EXISTS inventario (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            imagen_url VARCHAR(255),
            cantidad INT DEFAULT 0,
            precio DECIMAL(10,2) NOT NULL,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS ventas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT,
            producto_id INT,
            cantidad INT DEFAULT 1,
            total DECIMAL(10,2) NOT NULL,
            fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
            FOREIGN KEY (producto_id) REFERENCES inventario(id) ON DELETE SET NULL
        )`,
        
        `INSERT IGNORE INTO inventario (id, nombre, descripcion, imagen_url, cantidad, precio) VALUES 
         (1, 'Hamburguesa Clásica', 'Deliciosa hamburguesa de doble carne con queso fundido, lechuga y tomate frescos.', '/img/burger.png', 50, 15.50),
         (2, 'Papas Fritas', 'Porción grande de papas fritas doradas y crujientes, saladas al punto exacto.', '/img/fries.png', 100, 5.00),
         (3, 'Refresco Cola', 'Refrescante bebida gaseosa de cola con mucho hielo, 500ml.', '/img/soda.png', 100, 2.50)`
    ];

    let tablasCreadas = 0;
    tablas.forEach(query => {
        connection.query(query, (error) => {
            if (error) console.error("Error ejecutando query MySQL:", error.message);
            else {
                tablasCreadas++;
                if(tablasCreadas === tablas.length) console.log("Tablas MySQL verificadas/inicializadas correctamente.");
            }
        });
    });

    connection.release();
});

module.exports = db;
