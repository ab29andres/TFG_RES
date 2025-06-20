document.addEventListener('DOMContentLoaded', async () => {
    actualizarEstadoUsuario();
    await cargarPlatosDinamicamente();

    const usuario = obtenerUsuarioActual();
    const historialGuardado = localStorage.getItem('historialPedidos');

    if (usuario) {
        if (historialGuardado) {
            const historialParsed = JSON.parse(historialGuardado);
            mostrarHistorialDesdeLocalStorage(historialParsed);
        }


        // Luego se vuelve a cargar desde el backend para actualizarlo si hay cambios
        cargarHistorialYPuntos(usuario.user_id);
    }

    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.textContent.toLowerCase().replace(/\s+/g, '');
            filterMenuByCategory(category);
        });
    });
});

function mostrarHistorialDesdeLocalStorage(historial) {
    try {
        const contenedor = document.getElementById('order-history'); // 👈 CAMBIO
        if (!contenedor) return;

        contenedor.innerHTML = '<h3 style="color: gray">Historial de Órdenes:</h3>';

        if (!historial || historial.length === 0) {
            contenedor.innerHTML += '<p style="color: gray">Aún no has realizado pedidos.</p>';
            return;
        }

        historial.forEach(pedido => {
            const fecha = new Date(pedido.fecha).toLocaleString();
            contenedor.innerHTML += `
        <div class="order-history-item">
            <p><strong>Pedido del ${fecha}</strong></p>
            <ul>
                ${pedido.platos.map(p => `
                    <li>${p.nombre} x ${p.cantidad}</li>
                `).join('')}
            </ul>
            <hr>
        </div>
    `;
        });

    } catch (error) {
        console.error('Error al cargar historial desde localStorage:', error);
    }
}





function filterMenuByCategory(category) {
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
        const itemCategory = item.dataset.category.toLowerCase().replace(/\s+/g, '');
        if (category === 'todos' || itemCategory === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

async function cargarPlatosDinamicamente() {
    try {
        const res = await fetch('http://127.0.0.1:5000/platos');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const platos = await res.json();

        const menuGrid = document.querySelector('.menu-grid');
        menuGrid.innerHTML = '';

        platos.forEach((plato, index) => {
            const itemHTML = `
                <div class="menu-item" data-category="${plato.categoria}">
                    <div class="menu-item-image">
                    <img src="/images/platos/${plato._id ? plato._id + '.jpg' : 'default.jpg'}" alt="${plato.nombre}">
                    </div>
                    <div class="menu-item-info">
                        <h3>${plato.nombre}</h3>
                        <p class="menu-item-description">${plato.descripcion}</p>
                        <div class="menu-item-bottom">
                            <span class="price">$${plato.precio}</span>
                            <div class="item-actions">
                                <div class="quantity-control">
                                    <button class="quantity-btn" onclick="decreaseQuantity(${index})">-</button>
                                    <span class="quantity-display" id="quantity-${index}">0</span>
                                    <button class="quantity-btn" onclick="increaseQuantity(${index})">+</button>
                                </div>
                                <button class="add-to-order"
                                    onclick="addToOrder(${index}, '${plato.nombre}', ${plato.precio}, '${plato._id}')">Añadir</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            menuGrid.insertAdjacentHTML('beforeend', itemHTML);
        });
    } catch (err) {
        console.error('Error al cargar platos:', err);
    }
}

const cantidades = {};
const orden = [];

function increaseQuantity(index) {
    cantidades[index] = (cantidades[index] || 0) + 1;
    document.getElementById(`quantity-${index}`).textContent = cantidades[index];
}

function decreaseQuantity(index) {
    if (cantidades[index] > 0) {
        cantidades[index]--;
        document.getElementById(`quantity-${index}`).textContent = cantidades[index];
    }
}

function addToOrder(index, nombre, precio, platoId) {
    const cantidad = cantidades[index] || 0;
    if (cantidad === 0) return;

    const existente = orden.find(p => p.index === index);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        orden.push({ index, nombre, precio, cantidad, platoId });
    }

    cantidades[index] = 0;
    document.getElementById(`quantity-${index}`).textContent = 0;

    renderizarOrden();
}

function renderizarOrden() {
    const contenedor = document.getElementById('order-items');
    contenedor.innerHTML = '';

    if (orden.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-order">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p>Su orden está vacía</p>
                <p>Añada platos del menú para comenzar</p>
            </div>`;
        document.getElementById('total-amount').textContent = '$0.00';
        return;
    }

    let total = 0;
    orden.forEach((item) => {
        total += item.precio * item.cantidad;
        contenedor.innerHTML += `
            <div class="order-item">
                <span>${item.nombre} x ${item.cantidad}</span>
                <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
        `;
    });

    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
}

async function submitOrder() {
    const usuario = obtenerUsuarioActual(); // Ahora devuelve objeto completo

    if (!usuario || !usuario.id) {
        alert('Debe iniciar sesión para enviar la orden.');
        return;
    }

    if (orden.length === 0) {
        alert('La orden está vacía.');
        return;
    }

    const platosParaEnviar = orden.map(item => ({
        plato_id: item.platoId,
        cantidad: item.cantidad
    }));

    try {
        const res = await fetch('http://127.0.0.1:5000/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuario.id,
                platos: platosParaEnviar
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Error al enviar la orden');
            return;
        }

        alert(`Orden enviada. Has ganado ${data.puntos_ganados} puntos.`);

        orden.length = 0;
        renderizarOrden();


        cargarHistorialYPuntos(usuario.id);

    } catch (error) {
        console.error(error);
        alert('Error en la conexión al enviar la orden.');
    }
}

async function cargarHistorialYPuntos(usuario_id) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/pedidos/${usuario_id}`);
        const historial = await res.json();
        console.log('Historial recibido del backend:', historial);

        // 🔐 Guardar historial actualizado en localStorage
        localStorage.setItem('historialPedidos', JSON.stringify(historial));

        // 👉 Usar función reutilizable para mostrar el historial
        mostrarHistorialDesdeLocalStorage(historial);


        // Obtener puntos del usuario
        const resUser = await fetch(`http://127.0.0.1:5000/usuarios/${usuario_id}`);
        if (resUser.ok) {
            const userData = await resUser.json();
            const puntosElement = document.getElementById('user-points');
            if (puntosElement) {
                puntosElement.textContent = `Puntos: ${userData.points || 0}`;
            }
        }

    } catch (error) {
        console.error(error);
    }
}

function logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('loginTimestamp'); // si lo sigues usando
    localStorage.removeItem('historialPedidos'); // 👈 elimina historial
    window.location.href = 'login.html'; // o lo que uses para redirigir
}




function actualizarEstadoUsuario() {
    const loginButton = document.querySelector('.login-button');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado && loginButton) {
        const usuario = JSON.parse(usuarioGuardado);
        loginButton.textContent = usuario.username || usuario.email || 'Usuario';
        loginButton.href = 'perfil.html';
        loginButton.classList.add('user-logged-in');
    }
}


function obtenerUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}


