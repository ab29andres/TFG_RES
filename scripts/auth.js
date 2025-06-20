function actualizarEstadoUsuario() {
    const loginButton = document.querySelector('.login-button');
    const usuarioGuardado = localStorage.getItem('usuario'); // ← singular

    if (usuarioGuardado && loginButton) {
        const usuario = JSON.parse(usuarioGuardado);
        loginButton.textContent = usuario.username; // ← perfecto
        loginButton.href = 'perfil.html';
        loginButton.classList.add('user-logged-in');
    }
}

function obtenerUsuarioActual() {
    const usuario = localStorage.getItem('usuario'); // o como manejes el login
    return usuario ? JSON.parse(usuario).email || usuario : null;
}
