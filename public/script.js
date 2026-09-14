document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('contactForm');
    let intentosEnvio = 0;

    if (formulario) {
        formulario.addEventListener('submit', async function(evento) {
            evento.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            // Validaciones
            if (nombre === "" || email === "" || mensaje === "") {
                alert("⚠️ Por favor, completa todos los campos obligatorios.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("⚠️ Por favor, ingresa un correo electrónico válido.");
                return;
            }

            if (mensaje.length < 10) {
                alert("⚠️ El mensaje debe tener al menos 10 caracteres.");
                return;
            }

            try {
                intentosEnvio = intentosEnvio + 1;
                console.log("Enviando datos al servidor y correo...");
                
                // 1. Guardar en MongoDB (Backend)
                const respuestaBD = await fetch('/api/contacto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, telefono, mensaje })
                });

                const datosBD = await respuestaBD.json();

                if (!datosBD.success) {
                    alert("⚠️ Error al guardar en la base de datos: " + datosBD.message);
                    return;
                }

                // 2. Enviar Correo (Frontend con EmailJS)
                const templateParams = {
                    nombre: nombre,
                    email: email,
                    telefono: telefono || 'No especificado',
                    mensaje: mensaje
                };

                // Llamada a EmailJS usando tus IDs reales
                await emailjs.send('service_im7jni9', 'template_cj7v56p', templateParams);
                console.log("✅ Correo enviado exitosamente vía EmailJS");

                // Éxito total
                console.log("✅ Éxito. Intento número: " + intentosEnvio);
                alert("🎬 ¡Mensaje enviado con éxito! En Prope Studio nos pondremos en contacto contigo pronto.");
                formulario.reset();

            } catch (error) {
                console.error("❌ Error:", error);
                alert("❌ Ocurrió un error al enviar el mensaje. Por favor, intenta nuevamente.");
            }
        });
    }
});