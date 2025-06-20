document.addEventListener('DOMContentLoaded', () => {
    // --- FILTRAR RECOMPENSAS ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const rewardItems = document.querySelectorAll('.reward-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            rewardItems.forEach(item => {
                const category = item.dataset.category;
                item.style.display = (filter === 'all' || category === filter) ? 'flex' : 'none';
            });
        });
    });

    // --- CARGAR DATOS DEL USUARIO ---
    let usuario = JSON.parse(localStorage.getItem('usuario'));

    if (usuario) {
        document.getElementById('profile-Name').textContent = usuario.username || 'Sin nombre';
        document.getElementById('profileMemberSince').textContent = '';
        document.getElementById('profileEmail').textContent = usuario.email || 'Sin email';
        document.getElementById('pointsvalue').textContent = usuario.points || '0';

        const telefonoElem = document.querySelector('.detail-value-telefono');
        if (telefonoElem) telefonoElem.textContent = usuario.phone || 'Sin teléfono';

        const direccionElem = document.querySelector('.detail-value-direccion');
        if (direccionElem) direccionElem.textContent = usuario.direccion || 'Sin dirección';

        const preferenciasElem = document.querySelector('.detail-value-preferencias');
        if (preferenciasElem) preferenciasElem.textContent = usuario.preferencias || 'No especificado';
    } else {
        alert('Por favor inicia sesión para acceder al perfil.');
        window.location.href = 'login.html';
    }

    // --- FUNCIÓN PARA CERRAR SESIÓN ---
    async function cerrarSesion() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario && usuario.id) {
            try {
                await fetch(`http://127.0.0.1:5000/pedidos/${usuario.id}`, {
                    method: 'DELETE',
                });
            } catch (error) {
                console.error('Error al eliminar pedidos del usuario:', error);
            }
        }

        localStorage.removeItem('usuario');
        localStorage.removeItem('historialPedidos');
        sessionStorage.clear();
        window.location.href = 'index.html';
    }

    const logoutBtn = document.querySelector('.logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Quieres cerrar sesión?')) {
                cerrarSesion();
            }
        });
    }

    // --- BOTONES DE EDITAR Y GUARDAR ---
    const editarBtn = document.querySelector('.editar-button');
    const guardarBtn = document.querySelector('.guardar-button');
    let editando = false;

    if (editarBtn && guardarBtn) {
        editarBtn.addEventListener('click', () => {
            const emailElem = document.getElementById('profileEmail');
            const telefonoElem = document.querySelector('.detail-value-telefono');
            const direccionElem = document.querySelector('.detail-value-direccion');
            const preferenciasElem = document.querySelector('.detail-value-preferencias');

            if (!editando) {
                // Modo edición
                emailElem.innerHTML = `<input type="email" value="${usuario.email || ''}" />`;
                telefonoElem.innerHTML = `<input type="text" value="${usuario.phone || ''}" />`;
                direccionElem.innerHTML = `<input type="text" value="${usuario.direccion || ''}" />`;

                // Campo contraseña con botón mostrar/ocultar
                if (!document.querySelector('#input-password')) {
                    const passwordField = document.createElement('div');
                    passwordField.innerHTML = `
                        <label>Contraseña: </label>
                        <input id="input-password" type="password" value="${usuario.password || ''}" />
                        <button type="button" id="toggle-password" style="margin-left: 5px;">Mostrar</button>
                    `;
                    preferenciasElem.parentElement.appendChild(passwordField);

                    const toggleBtn = passwordField.querySelector('#toggle-password');
                    toggleBtn.addEventListener('click', () => {
                        const pwdInput = document.getElementById('input-password');
                        if (pwdInput.type === 'password') {
                            pwdInput.type = 'text';
                            toggleBtn.textContent = 'Ocultar';
                        } else {
                            pwdInput.type = 'password';
                            toggleBtn.textContent = 'Mostrar';
                        }
                    });
                }

                guardarBtn.style.display = 'inline-block';
                editarBtn.style.display = 'none';
                editando = true;
            }
        });

        guardarBtn.addEventListener('click', async () => {
            const emailElem = document.getElementById('profileEmail');
            const telefonoElem = document.querySelector('.detail-value-telefono');
            const direccionElem = document.querySelector('.detail-value-direccion');

            const nuevoEmail = emailElem.querySelector('input').value;
            const nuevoTelefono = telefonoElem.querySelector('input').value;
            const nuevaDireccion = direccionElem.querySelector('input').value;
            const nuevaContrasena = document.getElementById('input-password')?.value || usuario.password;

            // Actualizamos el objeto usuario local
            usuario.email = nuevoEmail;
            usuario.phone = nuevoTelefono;
            usuario.direccion = nuevaDireccion;
            usuario.password = nuevaContrasena;

            try {
                const response = await fetch(`http://127.0.0.1:5000/usuarios/${usuario.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(usuario),
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar el usuario en el servidor');
                }

                // Actualizamos localStorage sólo si fue exitoso
                localStorage.setItem('usuario', JSON.stringify(usuario));

                // Actualizamos la UI
                emailElem.textContent = nuevoEmail;
                telefonoElem.textContent = nuevoTelefono;
                direccionElem.textContent = nuevaDireccion;

                // Quitamos input de contraseña y el botón mostrar/ocultar
                const passwordInput = document.getElementById('input-password');
                if (passwordInput) passwordInput.parentElement.remove();

                guardarBtn.style.display = 'inline-block';
                editarBtn.style.display = 'inline-block';

                editando = false;
                alert('Perfil actualizado correctamente');
            } catch (error) {
                console.error(error);
                alert('Hubo un error al actualizar el perfil. Intenta de nuevo.');
            }
        });
    }

    // --- CANJEAR RECOMPENSAS ---
    document.querySelectorAll('.canjear-btn').forEach(boton => {
        boton.addEventListener('click', async () => {
            const puntosRequeridos = parseInt(boton.dataset.puntos);
            const usuario = JSON.parse(localStorage.getItem('usuario'));

            if (usuario.points < puntosRequeridos) {
                alert('No tienes suficientes puntos para canjear esta recompensa.');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:5000/usuarios/restar-puntos', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        email: usuario.email,
                        puntosARestar: puntosRequeridos
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'Error al canjear puntos');
                    return;
                }

                // Actualiza localStorage y UI con nuevos puntos
                usuario.points = data.nuevos_puntos;
                localStorage.setItem('usuario', JSON.stringify(usuario));
                document.getElementById('pointsvalue').textContent = usuario.points;

                // Mostrar código aleatorio
                const codigo = generarCodigo();
                document.getElementById('codigoValor').textContent = codigo;
                document.getElementById('codigoModal').style.display = 'block';

            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            }
        });
    });

    // Cerrar el modal
    document.querySelector('.cerrar-modal').addEventListener('click', () => {
        document.getElementById('codigoModal').style.display = 'none';
    });

});

// Función para generar código aleatorio
function generarCodigo() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 10; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}
