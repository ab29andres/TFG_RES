document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Por favor completa ambos campos.');
        return;
    }

    try {
        // Envías las credenciales al backend para validar
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.user) {
            // Guardas el usuario recibido en localStorage
            localStorage.setItem('usuario', JSON.stringify(data.user));

            // Rediriges al perfil
            window.location.href = 'perfil.html';
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (err) {
        console.error('Error en login:', err);
        alert('Error en servidor');
    }
});
