// Datos de ejemplo de los pedidos
const orders = [
    {
        id: "1",
        tableNumber: 5,
        items: [
            { id: "1", name: "Hamburguesa Clásica", quantity: 2, completed: false, category: "main" },
            { id: "2", name: "Papas Fritas", quantity: 2, completed: false, category: "side" },
            { id: "3", name: "Coca Cola", quantity: 2, completed: true, category: "drink" },
        ],
        orderTime: new Date(Date.now() - 5 * 60000), // 5 minutos atrás
        waiter: "Ana",
    },
    {
        id: "2",
        tableNumber: 3,
        items: [
            { id: "4", name: "Pizza Margherita", quantity: 1, completed: false, category: "main" },
            { id: "5", name: "Ensalada César", quantity: 1, notes: "Sin crutones", completed: false, category: "side" },
            { id: "6", name: "Vino Tinto", quantity: 1, completed: false, category: "drink" },
        ],
        orderTime: new Date(Date.now() - 12 * 60000), // 12 minutos atrás
        waiter: "Carlos",
    },
    {
        id: "3",
        tableNumber: 8,
        items: [
            { id: "7", name: "Pasta Carbonara", quantity: 1, completed: false, category: "main" },
            { id: "8", name: "Pan de Ajo", quantity: 1, completed: false, category: "side" },
        ],
        orderTime: new Date(Date.now() - 2 * 60000), // 2 minutos atrás
        waiter: "María",
    },
    {
        id: "4",
        tableNumber: 12,
        items: [
            { id: "9", name: "Salmón a la Plancha", quantity: 2, completed: true, category: "main" },
            { id: "10", name: "Arroz con Verduras", quantity: 2, completed: true, category: "side" },
            { id: "11", name: "Agua Mineral", quantity: 2, completed: true, category: "drink" },
        ],
        orderTime: new Date(Date.now() - 18 * 60000), // 18 minutos atrás
        waiter: "Luis",
    },
];

/**
 * Calcula el tiempo transcurrido desde que se hizo el pedido
 * @param {Date} orderTime - Hora del pedido
 * @returns {number} Minutos transcurridos
 */
function getElapsedTime(orderTime) {
    const now = new Date();
    return Math.floor((now.getTime() - orderTime.getTime()) / 60000);
}

/**
 * Obtiene la clase CSS según el tiempo transcurrido
 * @param {number} minutes - Minutos transcurridos
 * @returns {string} Clase CSS para el color del tiempo
 */
function getTimeClass(minutes) {
    if (minutes > 15) return 'time-danger';
    if (minutes > 10) return 'time-warning';
    return 'time-normal';
}

/**
 * Obtiene el icono SVG según la categoría del item
 * @param {string} category - Categoría del item (main, side, drink)
 * @returns {string} HTML del icono SVG
 */
function getCategoryIcon(category) {
    const icons = {
        main: `<svg class="category-icon icon-main" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
               </svg>`,
        side: `<svg class="category-icon icon-side" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
               </svg>`,
        drink: `<svg class="category-icon icon-drink" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>`
    };
    return icons[category] || icons.main;
}

/**
 * Cambia el estado de completado de un item específico
 * @param {string} orderId - ID del pedido
 * @param {string} itemId - ID del item
 */
function toggleItemCompletion(orderId, itemId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const item = order.items.find(i => i.id === itemId);
        if (item) {
            item.completed = !item.completed;
            renderOrders();
        }
    }
}

/**
 * Renderiza todos los pedidos en el DOM
 */
function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyState');

    // Si no hay pedidos, mostrar estado vacío
    if (orders.length === 0) {
        ordersGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Mostrar grid de pedidos
    ordersGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Generar HTML para cada pedido
    ordersGrid.innerHTML = orders.map(order => {
        const elapsedTime = getElapsedTime(order.orderTime);
        const timeClass = getTimeClass(elapsedTime);

        return `
            <div class="order-card">
                <div class="card-header">
                    <div class="table-info">
                        <div class="table-title">
                            <div class="table-number">${order.tableNumber}</div>
                            Mesa ${order.tableNumber}
                        </div>
                    </div>
                    <div class="time-info">
                        <div class="time-display">
                            <svg class="clock-icon" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                            </svg>
                            <span class="${timeClass}">${elapsedTime} min</span>
                        </div>
                        <span class="waiter-info">👨‍🍳 ${order.waiter}</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="items-list">
                        ${order.items.map(item => `
                            <div class="item-row ${item.completed ? 'completed' : ''}">
                                <div class="item-content">
                                    <div class="checkbox ${item.completed ? 'checked' : ''}" 
                                         onclick="toggleItemCompletion('${order.id}', '${item.id}')">
                                        ${item.completed ? '✓' : ''}
                                    </div>
                                    <div class="item-details">
                                        ${getCategoryIcon(item.category)}
                                        <span class="quantity">${item.quantity}x</span>
                                    </div>
                                    <div class="item-info">
                                        <span class="item-name ${item.completed ? 'completed' : ''}">${item.name}</span>
                                        ${item.notes ? `<p class="item-notes">📝 ${item.notes}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="separator"></div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Actualiza el tiempo cada minuto para mantener la información actualizada
 */
function updateTimes() {
    renderOrders();
}

// Inicializar la aplicación cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    renderOrders();
    
    // Actualizar tiempos cada minuto
    setInterval(updateTimes, 60000);
});

// Función para agregar un nuevo pedido (para futuras expansiones)
function addNewOrder(orderData) {
    orders.push(orderData);
    renderOrders();
}

// Función para eliminar un pedido completado (para futuras expansiones)
function removeOrder(orderId) {
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
        orders.splice(index, 1);
        renderOrders();
    }
}