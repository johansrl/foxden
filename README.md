# 🦊 Fox Den API - Manual Técnico y de Usuario

Bienvenido al sistema de gestión de Fox Den, una API REST diseñada para la administración de un restaurante de comidas rápidas, con un estilo visual **Cyberpunk** y una robusta arquitectura basada en **Node.js** y **MySQL**.

---

## 🛠️ Especificaciones Técnicas

### Arquitectura (Stack)
*   **Backend**: [Node.js](https://nodejs.org/) con el framework [Express](https://expressjs.com/).
*   **Base de Datos**: [MySQL](https://www.mysql.com/) alojado mediante **XAMPP**.
*   **Frontend**: HTML5, CSS3 (Vanilla) y JavaScript (ES6+), con diseño *Glassmorphism*.
*   **Seguridad**: Autenticación basada en **JWT** (JSON Web Tokens) y encriptación de datos con **Bcrypt**.

### Estructura del Proyecto
*   `/public`: Contiene la interfaz de usuario (HTML, CSS, JS).
*   `/routes`: Módulos de la API (`auth`, `usuarios`, `inventario`, `ventas`).
*   `/middleware`: Filtros de seguridad para control de sesiones y roles.
*   `index.js`: Punto de entrada del servidor.
*   `db.js`: Configuración y conexión a la base de datos MySQL.

---

## 🚀 Instalación y Despliegue

### Requisitos Previos
1.  **XAMPP**: Tener MySQL encendido y una base de datos llamada `foxden` creada.
2.  **Node.js**: Instalado en el sistema.

### Pasos
1.  Abrir una terminal en la carpeta raíz.
2.  Instalar dependencias (si es necesario):
    ```bash
    npm install
    ```
3.  Ejecutar el servidor:
    ```bash
    npm start
    ```
4.  Acceder a: `http://localhost:3000`

---

## 🔐 Niveles de Acceso (Roles)

| Rol | Descripción | Permisos |
| :--- | :--- | :--- |
| **Cliente** | Usuario final | Ver catálogo y realizar compras. |
| **Personal** | Empleados | Ver transacciones, gestionar inventario y clientes. |
| **Jefe** | Administrador | Control total (eliminar usuarios, productos y anular ventas). |

---

## 📖 Guía de Uso Rápido

### 1. Registro y Autenticación
*   Ve a la sección **Autenticar**.
*   Si vas a registrarte como **Personal** o **Jefe**, usa el código de seguridad secreto (`100301`).

### 2. Gestión de Inventario
*   Accede al **Catálogo** para ver los productos.
*   Si tienes rango administrativo, podrás editar o purgar ítems del stock.

### 3. Registro de Ventas
*   Las ventas se registran automáticamente cuando un cliente elige productos.
*   En la sección **Transacciones**, el staff puede revisar el historial de pedidos.

### 4. Gestión de Usuarios
*   Exclusivo para el **Jefe**. Permite ver la lista de clientes, sus historiales de compra y eliminar registros si es necesario.

---
*Este proyecto ha sido desarrollado como una solución integral para la gestión de servicios gastronómicos bajo estándares modernos de desarrollo web.*
