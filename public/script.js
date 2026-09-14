document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('contactForm');

    if (!formulario) {
        return;
    }

    formulario.addEventListener('submit', async function(evento) {
        evento.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        // Validación de campos obligatorios
        if (nombre === "" || email === "" || mensaje === "") {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Por favor, ingresa un correo electrónico válido.");
            return;
        }

        // Validación de longitud mínima del mensaje
        if (mensaje.length < 10) {
            alert("El mensaje debe tener al menos 10 caracteres.");
            return;
        }

        // Deshabilitar el botón para evitar envíos duplicados
        const boton = formulario.querySelector('button[type="submit"]');
        const textoOriginal = boton.textContent;
        boton.textContent = "Enviando...";
        boton.disabled = true;

        try {
            // 1. Guardar en MongoDB (Backend)
            const respuestaBD = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, telefono, mensaje })
            });

            const datosBD = await respuestaBD.json();

            if (!datosBD.success) {
                alert("Ocurrió un error al guardar el mensaje. Por favor, intenta nuevamente.");
                boton.textContent = textoOriginal;
                boton.disabled = false;
                return;
            }

            // 2. Enviar correo vía EmailJS (Frontend)
            const templateParams = {
                nombre: nombre,
                email: email,
                telefono: telefono || 'No especificado',
                mensaje: mensaje
            };

            await emailjs.send('service_im7jni9', 'template_cj7v56p', templateParams);

            // Éxito total
            alert("Mensaje enviado con éxito. Nos pondremos en contacto contigo pronto.");
            formulario.reset();

        } catch (error) {
            alert("Ocurrió un error al enviar el mensaje. Por favor, intenta nuevamente.");
        } finally {
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }
    });
});