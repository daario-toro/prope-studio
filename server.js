// ==========================================
// SERVIDOR FULL STACK (Node.js + MongoDB + Web3Forms)
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
// FUNCIÓN PARA ENVIAR CORREO VÍA WEB3FORMS
// ==========================================
async function enviarCorreoWeb3Forms(datos) {
  try {
    // Crear FormData en lugar de JSON
    const formData = new FormData();
    formData.append('access_key', '327fa647-8a2a-43ac-9f06-507f952c1848');
    formData.append('from_name', 'Prope Studio - Formulario Web');
    formData.append('subject', `Nuevo mensaje de ${datos.nombre}`);
    formData.append('name', datos.nombre);
    formData.append('email', datos.email);
    formData.append('phone', datos.telefono || 'No especificado');
    formData.append('message', datos.mensaje);
    formData.append('replyto', datos.email);

    const respuesta = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
      // NO especificar Content-Type - el navegador lo hará automáticamente con FormData
    });
    
    const resultado = await respuesta.json();
    
    if (respuesta.ok && resultado.success) {
      console.log(`📧 Correo enviado exitosamente a contacto@propestudio.cl`);
      console.log(` Datos: De ${datos.nombre} (${datos.email})`);
      return true;
    } else {
      console.error('⚠️ Web3Forms respondió con error:', resultado);
      return false;
    }
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    return false;
  }
}

// ==========================================
// RUTAS
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/contacto', async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    // Validación básica (seguridad - Unidad 3)
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ 
        success: false, 
        message: 'Los campos nombre, email y mensaje son obligatorios.' 
      });
    }

    // Sanitización de datos (seguridad - Unidad 3)
    const datosLimpios = {
      nombre: String(nombre).trim(),
      email: String(email).trim().toLowerCase(),
      telefono: telefono ? String(telefono).trim() : 'No especificado',
      mensaje: String(mensaje).trim(),
      fecha: new Date().toISOString()
    };

    // 1. Guardar en MongoDB Atlas
    await db.collection('mensajes').insertOne(datosLimpios);
    console.log(`✅ Mensaje guardado en BD de: ${datosLimpios.nombre}`);

    // 2. Enviar correo vía Web3Forms
    const correoEnviado = await enviarCorreoWeb3Forms(datosLimpios);

    if (correoEnviado) {
      res.status(200).json({ 
        success: true, 
        message: 'Mensaje enviado exitosamente. Te contactaremos pronto.' 
      });
    } else {
      // Si falló el correo pero se guardó en BD, avisamos
      res.status(200).json({ 
        success: true, 
        message: 'Mensaje guardado correctamente.',
        warning: 'No pudimos enviar el correo de confirmación, pero tu mensaje fue recibido.'
      });
    }

  } catch (error) {
    console.error('❌ Error en /api/contacto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al procesar la solicitud.' 
    });
  }
});

// Ruta de salud para verificar que todo funciona
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
  console.log(` Servidor corriendo en puerto ${PORT}`);
  console.log(`📁 Archivos estáticos: ${path.join(__dirname, 'public')}`);
  console.log('========================================');
});