document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('contactForm');
    let intentosEnvio = 0;
    let formularioValido = false;

    if (formulario) {
        formulario.addEventListener('submit', async function(evento) {
            evento.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

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
                console.log("Enviando datos al servidor...");
                
                const respuesta = await fetch('/api/contacto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, telefono, mensaje })
                });

                const datos = await respuesta.json();

                if (datos.success) {
                    formularioValido = true;
                    console.log("✅ Éxito. Intento número: " + intentosEnvio);
                    alert("🎬 ¡Mensaje enviado con éxito! En Prope Studio nos pondremos en contacto contigo pronto.");
                    formulario.reset();
                    formularioValido = false;
                } else {
                    alert("⚠️ Error del servidor: " + datos.message);
                }
            } catch (error) {
                console.error("❌ Error de red:", error);
                alert("❌ Error de conexión. Asegúrate de que el servidor Node.js esté corriendo.");
            }
        });
    }
});