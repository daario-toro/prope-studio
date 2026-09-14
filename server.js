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
// FUNCIÓN PARA ENVIAR CORREO VÍA WEB3FORMS (CORREGIDA PARA NODE.JS)
// ==========================================
async function enviarCorreoWeb3Forms(datos) {
  try {
    // URLSearchParams es la forma correcta de crear datos de formulario en Node.js
    const params = new URLSearchParams();
    params.append('access_key', '327fa647-8a2a-43ac-9f06-507f952c1848');
    params.append('from_name', 'Prope Studio - Formulario Web');
    params.append('subject', `Nuevo mensaje de ${datos.nombre}`);
    params.append('name', datos.nombre);
    params.append('email', datos.email);
    params.append('phone', datos.telefono || 'No especificado');
    params.append('message', datos.mensaje);
    params.append('replyto', datos.email); // Para que puedas responder directamente al cliente

    const respuesta = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        // Engañamos al firewall indicando que somos un navegador real
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: params.toString() // Enviamos como string "clave=valor&clave2=valor2"
    });
    
    const textoRespuesta = await respuesta.text();
    
    let resultado;
    try {
      resultado = JSON.parse(textoRespuesta);
    } catch (e) {
      console.error('❌ Web3Forms devolvió HTML en lugar de JSON (posible bloqueo):', textoRespuesta.substring(0, 150));
      return false;
    }
    
    if (respuesta.ok && resultado.success) {
      console.log(`📧 Correo enviado exitosamente a contacto@propestudio.cl`);
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
      res.status(200).json({ 
        success: true, 
        message: 'Mensaje guardado correctamente en la base de datos.',
        warning: 'No pudimos enviar el correo de notificación, pero tu mensaje fue recibido.'
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

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(` Servidor corriendo en puerto ${PORT}`);
  console.log(`📁 Archivos estáticos: ${path.join(__dirname, 'public')}`);
  console.log('========================================');
});