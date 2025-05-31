// Variables globales
let userPoints = 2450;
const rewards = [
    { id: 1, title: "Postre a elegir", points: 1500, category: "food" },
    { id: 2, title: "Botella de vino selecto", points: 2000, category: "drinks" },
    { id: 3, title: "Cena para dos", points: 5000, category: "experiences" },
    { id: 4, title: "Entrante a elegir", points: 1200, category: "food" },
    { id: 5, title: "Clase de cocina con nuestro chef", points: 3500, category: "experiences" }
];
let redeemedRewards = [];

// Función para inicializar la página
function initPage() {
    // Actualizar los puntos mostrados
    updatePointsDisplay();
    
    // Configurar los botones de filtro de recompensas
    setupFilterButtons();
    
    // Configurar los botones de canje
    setupRedeemButtons();
    
    // Configurar los modales
    setupModals();
}

// Función para actualizar la visualización de puntos
function updatePointsDisplay() {
    // Actualizar el círculo de puntos
    document.querySelector('.points-value').textContent = userPoints.toLocaleString();
    
    // Actualizar la barra de progreso
    const progressFill = document.querySelector('.progress-fill');
    const progressInfo = document.querySelector('.progress-info span');
    
    // Calcular el porcentaje para el siguiente nivel (Platino a 3500 puntos)
    const percentage = Math.min(userPoints / 3500 * 100, 100);
    progressFill.style.width = `${percentage}%`;
    progressInfo.textContent = `${userPoints.toLocaleString()} / 3,500 puntos para el siguiente nivel`;
    
    // Actualizar los botones de canje según los puntos disponibles
    updateRedeemButtons();
}

// Función para configurar los botones de filtro
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Quitar la clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir la clase active al botón clickeado
            button.classList.add('active');
            
            // Filtrar las recompensas
            const filter = button.dataset.filter;
            filterRewards(filter);
        });
    });
}

// Función para filtrar las recompensas
function filterRewards(filter) {
    const rewardItems = document.querySelectorAll('.reward-item');
    
    rewardItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Función para configurar los botones de canje
function setupRedeemButtons() {
    const redeemButtons = document.querySelectorAll('.redeem-btn');
    
    redeemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const rewardId = parseInt(button.dataset.rewardId);
            const rewardPoints = parseInt(button.dataset.rewardPoints);
            
            // Buscar la recompensa
            const reward = rewards.find(r => r.id === rewardId);
            
            // Mostrar el modal de confirmación
            showRedeemConfirmation(reward);
        });
    });
    
    // Actualizar el estado de los botones según los puntos disponibles
    updateRedeemButtons();
}

// Función para actualizar el estado de los botones de canje
function updateRedeemButtons() {
    const redeemButtons = document.querySelectorAll('.redeem-btn');
    
    redeemButtons.forEach(button => {
        const rewardPoints = parseInt(button.dataset.rewardPoints);
        
        if (rewardPoints > userPoints) {
            button.disabled = true;
            button.textContent = 'Puntos insuficientes';
        } else {
            button.disabled = false;
            button.textContent = 'Canjear';
        }
    });
}

// Función para mostrar el modal de confirmación de canje
function showRedeemConfirmation(reward) {
    const modal = document.getElementById('redeemModal');
    const confirmTitle = document.getElementById('confirmRewardTitle');
    const confirmPoints = document.getElementById('confirmRewardPoints');
    
    // Actualizar la información del modal
    confirmTitle.textContent = reward.title;
    confirmPoints.textContent = `${reward.points.toLocaleString()} puntos`;
    
    // Mostrar el modal
    modal.style.display = 'flex';
    
    // Configurar el botón de confirmación
    const confirmButton = document.getElementById('confirmRedeem');
    confirmButton.onclick = () => {
        redeemReward(reward);
        modal.style.display = 'none';
    };
}

// Función para canjear una recompensa
function redeemReward(reward) {
    // Restar los puntos
    userPoints -= reward.points;
    
    // Generar un código de canje aleatorio
    const redeemCode = generateRedeemCode();
    
    // Crear un objeto de recompensa canjeada
    const redeemedReward = {
        id: reward.id,
        title: reward.title,
        points: reward.points,
        code: redeemCode,
        date: new Date(),
        status: 'active'
    };
    
    // Añadir a la lista de recompensas canjeadas
    redeemedRewards.push(redeemedReward);
    
    // Actualizar la visualización de puntos
    updatePointsDisplay();
    
    // Actualizar la lista de recompensas canjeadas
    updateRedeemedList();
    
    // Mostrar el modal de éxito
    showSuccessModal(redeemedReward);
}

// Función para generar un código de canje aleatorio
function generateRedeemCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    
    return code;
}

// Función para actualizar la lista de recompensas canjeadas
function updateRedeemedList() {
    const redeemedList = document.getElementById('redeemedList');
    
    // Limpiar la lista
    redeemedList.innerHTML = '';
    
    // Si no hay recompensas canjeadas, mostrar mensaje
    if (redeemedRewards.length === 0) {
        redeemedList.innerHTML = `
            <div class="empty-redeemed">
                <p>Aún no has canjeado ninguna recompensa.</p>
                <p>¡Explora nuestro catálogo y canjea tus puntos!</p>
            </div>
        `;
        return;
    }
    
    // Ordenar las recompensas por fecha (más recientes primero)
    const sortedRewards = [...redeemedRewards].sort((a, b) => b.date - a.date);
    
    // Añadir cada recompensa a la lista
    sortedRewards.forEach(reward => {
        const date = reward.date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        const statusClass = reward.status === 'active' ? 'status-active' : 'status-used';
        const statusText = reward.status === 'active' ? 'Activo' : 'Utilizado';
        
        const rewardElement = document.createElement('div');
        rewardElement.className = 'redeemed-item';
        rewardElement.innerHTML = `
            <div class="redeemed-date">${date}</div>
            <div class="redeemed-title">${reward.title}</div>
            <div class="redeemed-code">${reward.code}</div>
            <div class="redeemed-status ${statusClass}">${statusText}</div>
        `;
        
        redeemedList.appendChild(rewardElement);
    });
}

// Función para mostrar el modal de éxito
function showSuccessModal(reward) {
    const modal = document.getElementById('successModal');
    const rewardTitle = document.getElementById('successRewardTitle');
    const redeemCode = document.getElementById('redeemCode');
    
    // Actualizar la información del modal
    rewardTitle.textContent = reward.title;
    redeemCode.textContent = reward.code;
    
    // Mostrar el modal
    modal.style.display = 'flex';
}

// Función para configurar los modales
function setupModals() {
    // Configurar los botones de cierre
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Configurar el botón de cancelar
    const cancelButton = document.getElementById('cancelRedeem');
    cancelButton.addEventListener('click', () => {
        const modal = document.getElementById('redeemModal');
        modal.style.display = 'none';
    });
    
    // Configurar el botón de aceptar en el modal de éxito
    const closeSuccessButton = document.getElementById('closeSuccess');
    closeSuccessButton.addEventListener('click', () => {
        const modal = document.getElementById('successModal');
        modal.style.display = 'none';
    });
    
    // Cerrar el modal al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        const redeemModal = document.getElementById('redeemModal');
        const successModal = document.getElementById('successModal');
        
        if (event.target === redeemModal) {
            redeemModal.style.display = 'none';
        }
        
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}

// Inicializar la página cuando se carga el DOM
document.addEventListener('DOMContentLoaded', initPage);