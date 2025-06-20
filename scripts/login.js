document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Por favor completa ambos campos.');
        return;
    }

    try {
        const res = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.user_id) {
            const user = {
                id: data.user_id,
                username: data.username,
                email: data.email,
                phone: data.phone,
                direccion: data.direccion,
                points: data.points
            };

            localStorage.setItem('usuario', JSON.stringify(user));
            window.location.href = 'perfil.html';
        } else {
            alert(data.error || 'Error al iniciar sesión');
        }
    } catch (err) {
        console.error('Error en login:', err);
        alert('Error en servidor');
    }
});
