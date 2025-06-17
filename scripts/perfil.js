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
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log('Usuario cargado desde localStorage:', usuario);

    if (usuario) {
        document.getElementById('profile-Name').textContent = usuario.username || 'Sin nombre';
        document.getElementById('profileMemberSince').textContent = ''; // o algo fijo, p.ej: 'Miembro desde: N/A'
        document.getElementById('profileEmail').textContent = usuario.email || 'Sin email';
        document.getElementById('pointsvalue').textContent = usuario.points
        const telefonoElem = document.querySelector('.detail-value-telefono');
        if (telefonoElem) telefonoElem.textContent = usuario.phone || 'Sin teléfono';
        const direccionElem = document.querySelector('.detail-value-direccion');
        if (direccionElem) direccionElem.textContent = usuario.direccion || 'Sin dirección';
        const preferenciasElem = document.querySelector('.detail-value-preferencias');
        if (preferenciasElem) preferenciasElem.textContent = usuario.preferencias || 'No especificado';
    } else {
        console.warn('No se encontró información del usuario. Por favor, inicia sesión.');
    }
});
