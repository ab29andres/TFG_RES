// Objeto para almacenar los items de la orden
let orderItems = {};
let total = 0;

// Función para aumentar la cantidad de un plato
function increaseQuantity(itemId) {
    const quantityElement = document.getElementById(`quantity-${itemId}`);
    let quantity = parseInt(quantityElement.textContent);
    quantity++;
    quantityElement.textContent = quantity;
}

// Función para disminuir la cantidad de un plato
function decreaseQuantity(itemId) {
    const quantityElement = document.getElementById(`quantity-${itemId}`);
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 0) {
        quantity--;
        quantityElement.textContent = quantity;
    }
}

// Función para añadir un plato a la orden
function addToOrder(itemId, itemName, price) {
    const quantity = parseInt(document.getElementById(`quantity-${itemId}`).textContent);
    
    if (quantity <= 0) {
        alert("Por favor seleccione una cantidad mayor a 0");
        return;
    }

    // Añadir o actualizar el item en la orden
    if (orderItems[itemId]) {
        orderItems[itemId].quantity += quantity;
    } else {
        orderItems[itemId] = {
            name: itemName,
            price: price,
            quantity: quantity
        };
    }

    // Resetear el contador
    document.getElementById(`quantity-${itemId}`).textContent = "0";
    
    // Actualizar la visualización de la orden
    updateOrderDisplay();
}

// Función para eliminar un plato de la orden
function removeFromOrder(itemId) {
    if (orderItems[itemId]) {
        delete orderItems[itemId];
        updateOrderDisplay();
    }
}

// Función para actualizar la visualización de la orden
function updateOrderDisplay() {
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    total = 0;
    let hasItems = false;

    for (const itemId in orderItems) {
        hasItems = true;
        const item = orderItems[itemId];
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const orderItemElement = document.createElement('div');
        orderItemElement.className = 'order-item';
        orderItemElement.innerHTML = `
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-quantity">x${item.quantity}</span>
            <span class="order-item-price">$${itemTotal}</span>
            <span class="order-item-remove" onclick="removeFromOrder(${itemId})">×</span>
        `;
        
        orderItemsContainer.appendChild(orderItemElement);
    }

    // Mostrar mensaje si no hay items
    if (!hasItems) {
        orderItemsContainer.innerHTML = `
            <div class="empty-order">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p>Su orden está vacía</p>
                <p>Añada platos del menú para comenzar</p>
            </div>
        `;
    }

    // Actualizar el total
    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
}

// Función para enviar la orden
function submitOrder() {
    const tableNumber = document.getElementById('table-number').value;
    
    if (!tableNumber) {
        alert("Por favor seleccione un número de mesa");
        return;
    }

    if (Object.keys(orderItems).length === 0) {
        alert("Su orden está vacía. Por favor añada platos antes de enviar.");
        return;
    }

    // Aquí iría la lógica para enviar la orden al servidor
    // Por ahora solo mostraremos un mensaje de confirmación
    
    const orderSummary = Object.values(orderItems).map(item => 
        `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    alert(`¡Orden enviada con éxito!\n\nMesa: ${tableNumber}\n\n${orderSummary}\n\nTotal: $${total.toFixed(2)}`);
    
    // Limpiar la orden después de enviar
    orderItems = {};
    updateOrderDisplay();
}

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cambiar categorías
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelector('.category-btn.active').classList.remove('active');
            this.classList.add('active');
            // Aquí iría la lógica para filtrar los platos por categoría
        });
    });
});