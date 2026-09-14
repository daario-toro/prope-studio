// ==========================================
// IMPLEMENTAR PROGRAMACIÓN DEL LADO DEL SERVIDOR (Node.js)
// ==========================================
const express = require('express');
const path = require('path');
const fs = require('fs').promises;  
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'mensajes.json'); // Ruta de nuestra BD simple

// Middleware para procesar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// ESTABLECER UNA BASE DE DATOS SIMPLE (NoSQL - JSON)

// Función para inicializar la BD si no existe
async function initDB() {
  try {
    await fs.access(DB_PATH);
    console.log('✅ Base de datos NoSQL local (mensajes.json) detectada y lista.');
  } catch {
    // Si no existe, la creamos con un array vacío (formato JSON)
    await fs.writeFile(DB_PATH, '[]');
    console.log('✅ Base de datos NoSQL local (mensajes.json) creada exitosamente.');
  }
}

// Función para guardar un mensaje (Operación CREATE en NoSQL)
async function guardarMensaje(datos) {
  const contenido = await fs.readFile(DB_PATH, 'utf8');
  const mensajes = JSON.parse(contenido); // Tipo de dato: Array de Objetos (NoSQL)
  
  const nuevoDocumento = {
    id: Date.now(), // Operador: Generación de ID único con timestamp
    nombre: String(datos.nombre).trim(), // Tipo de dato: String
    email: String(datos.email).trim().toLowerCase(), // Tipo de dato: String
    telefono: datos.telefono ? String(datos.telefono).trim() : 'No especificado', // Tipo de dato: String
    mensaje: String(datos.mensaje).trim(), // Tipo de dato: String
    fecha: new Date().toLocaleString('es-CL') // Tipo de dato: String (Fecha formateada)
  };
  
  mensajes.push(nuevoDocumento); // Operador: Agregar elemento al array
  await fs.writeFile(DB_PATH, JSON.stringify(mensajes, null, 2));
  return nuevoDocumento;
}

// Inicializar la BD al arrancar el servidor
initDB();

// Ruta principal: sirve el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta POST para recibir datos del formulario
app.post('/api/contacto', async (req, res) => {
  try {
    // 2. APLICAR JAVASCRIPT: Variables, tipos de datos y operadores
    const { nombre, email, telefono, mensaje } = req.body; // Tipo: Object destructuring

    // Operador lógico OR (||) para validación
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ 
        success: false, 
        message: 'Los campos nombre, email y mensaje son obligatorios.' 
      });
    }
    // Guardar en nuestra base de datos NoSQL (JSON)
    const resultado = await guardarMensaje({ nombre, email, telefono, mensaje });

    console.log(`✅ Mensaje guardado en BD NoSQL de: ${resultado.nombre}`);

    // Responder al cliente (frontend)
    res.status(200).json({ 
      success: true, 
      message: 'Mensaje enviado exitosamente a Prope Studio.' 
    });

  } catch (error) {
    console.error('❌ Error al guardar en la base de datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al procesar la solicitud.' 
    });
  }
});
// Ruta GET para verificar los datos en la BD (¡Perfecto para tu captura de pantalla!)
app.get('/api/mensajes', async (req, res) => {
  try {
    const contenido = await fs.readFile(DB_PATH, 'utf8');
    const mensajes = JSON.parse(contenido);
    // Operador: invertir el array para ver los más recientes primero
    res.status(200).json(mensajes.reverse()); 
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
});

// INICIAR EL SERVIDOR

app.listen(PORT, () => {
  console.log(`🚀 Servidor web básico corriendo en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, 'public')}`);
});