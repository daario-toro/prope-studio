// ==========================================
// SERVIDOR FULL STACK (Node.js + MongoDB Atlas)
// ==========================================
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// CONEXIÓN A MONGODB ATLAS
// ==========================================
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('prope-studio');
    console.log('✅ Conectado exitosamente a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
  }
}
connectDB();

// ==========================================
// RUTAS
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/contacto', async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    // Validación básica (seguridad)
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ 
        success: false, 
        message: 'Los campos nombre, email y mensaje son obligatorios.' 
      });
    }

    // Sanitización de datos
    const datosLimpios = {
      nombre: String(nombre).trim(),
      email: String(email).trim().toLowerCase(),
      telefono: telefono ? String(telefono).trim() : 'No especificado',
      mensaje: String(mensaje).trim(),
      fecha: new Date().toISOString()
    };

    // Guardar en MongoDB Atlas
    await db.collection('mensajes').insertOne(datosLimpios);
    console.log(`✅ Mensaje guardado en BD de: ${datosLimpios.nombre}`);

    res.status(200).json({ 
      success: true, 
      message: 'Mensaje guardado exitosamente en la base de datos.' 
    });

  } catch (error) {
    console.error('❌ Error en /api/contacto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al procesar la solicitud.' 
    });
  }
});

// Ruta de salud para verificar que el servidor y la BD están activos
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    server: 'running',
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`📁 Archivos estáticos: ${path.join(__dirname, 'public')}`);
  console.log('========================================');
});