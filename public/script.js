console.log("🚀 INICIO DE script.js - VERSIÓN A PRUEBA DE FALLOS");

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOMContentLoaded disparado correctamente");
    
    const formulario = document.getElementById('contactForm');
    console.log("🔍 Formulario encontrado:", formulario);

    if (!formulario) {
        console.error("❌ ERROR CRÍTICO: No se encontró el formulario con id='contactForm' en el HTML");
        alert("ERROR: El JavaScript no puede encontrar el formulario. Revisa el index.html");
        return;
    }

    formulario.addEventListener('submit', async function(evento) {
        console.log("🛑 INTERCEPTANDO ENVÍO DEL FORMULARIO");
        
        // ESTA LÍNEA ES LA QUE EVITA QUE LA PÁGINA SE RECARGUE Y SUBA
        evento.preventDefault(); 
        console.log("✅ preventDefault() ejecutado. La página NO se recargará.");

        alert("✅ ¡JAVASCRIPT ESTÁ FUNCIONANDO! El formulario fue interceptado correctamente.");

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        if (nombre === "" || email === "" || mensaje === "") {
            alert("⚠️ Por favor, completa todos los campos obligatorios.");
            return;
        }

        try {
            console.log("1️⃣ Intentando guardar en MongoDB...");
            const respuestaBD = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, telefono, mensaje })
            });

            const datosBD = await respuestaBD.json();
            console.log("Respuesta del servidor:", datosBD);

            if (!datosBD.success) {
                alert("⚠️ Error en el servidor: " + datosBD.message);
                return;
            }

            console.log("2️⃣ Intentando enviar correo con EmailJS...");
            const templateParams = {
                nombre: nombre,
                email: email,
                telefono: telefono || 'No especificado',
                mensaje: mensaje
            };

            await emailjs.send('service_im7jni9', 'template_cj7v56p', templateParams);
            console.log("✅ Correo enviado exitosamente vía EmailJS");

            alert("🎬 ¡Mensaje enviado con éxito! En Prope Studio nos pondremos en contacto contigo pronto.");
            formulario.reset();

        } catch (error) {
            console.error("❌ ERROR DURANTE EL PROCESO:", error);
            alert("❌ Ocurrió un error. Revisa la consola (F12) para más detalles.");
        }
    });
});