// Variables para almacenar la selección
let selectedTableType = null;
let selectedCapacity = null;

// Restricciones de capacidad por tipo de mesa
const tableCapacityLimits = {
    round: { min: 2, max: 8 },
    square: { min: 1, max: 4 },
    rectangular: { min: 4, max: 12 }
};

// Función para seleccionar el tipo de mesa
function selectTableType(type) {
    // Deseleccionar la mesa anterior
    const previousSelected = document.querySelector('.table-option.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Seleccionar la nueva mesa
    const tableOption = document.querySelector(`.table-option[data-table-type="${type}"]`);
    tableOption.classList.add('selected');
    
    // Actualizar la variable
    selectedTableType = type;
    
    // Mostrar el selector de capacidad
    const capacitySelector = document.getElementById('capacitySelector');
    capacitySelector.style.display = 'block';
    
    // Actualizar las opciones de capacidad disponibles
    updateCapacityOptions(type);
    
    // Resetear la capacidad seleccionada
    selectedCapacity = null;
    const selectedCapacityOption = document.querySelector('.capacity-option.selected');
    if (selectedCapacityOption) {
        selectedCapacityOption.classList.remove('selected');
    }
    
    // Ocultar el resumen
    document.getElementById('tableSummary').classList.remove('show');
    
    // Actualizar el tipo de mesa en el resumen
    let tableTypeName = '';
    switch(type) {
        case 'round':
            tableTypeName = 'Mesa Redonda';
            break;
        case 'square':
            tableTypeName = 'Mesa Cuadrada';
            break;
        case 'rectangular':
            tableTypeName = 'Mesa Rectangular';
            break;
    }
    document.getElementById('selectedTableType').textContent = tableTypeName;
}

// Función para actualizar las opciones de capacidad según el tipo de mesa
function updateCapacityOptions(tableType) {
    const capacityOptions = document.querySelectorAll('.capacity-option');
    const limits = tableCapacityLimits[tableType];
    
    capacityOptions.forEach(option => {
        const capacity = option.dataset.capacity;
        
        // Manejar la opción "9+"
        if (capacity === "9+") {
            if (limits.max >= 9) {
                option.classList.remove('disabled');
            } else {
                option.classList.add('disabled');
            }
            return;
        }
        
        // Manejar opciones numéricas
        const capacityNum = parseInt(capacity);
        if (capacityNum < limits.min || capacityNum > limits.max) {
            option.classList.add('disabled');
        } else {
            option.classList.remove('disabled');
        }
    });
}

// Función para seleccionar la capacidad
function selectCapacity(capacity) {
    // Verificar si la opción está deshabilitada
    const capacityOption = document.querySelector(`.capacity-option[data-capacity="${capacity}"]`);
    if (capacityOption.classList.contains('disabled')) {
        return;
    }
    
    // Deseleccionar la capacidad anterior
    const previousSelected = document.querySelector('.capacity-option.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Seleccionar la nueva capacidad
    capacityOption.classList.add('selected');
    
    // Actualizar la variable
    selectedCapacity = capacity;
    
    // Actualizar el resumen y mostrarlo
    document.getElementById('selectedCapacity').textContent = capacity;
    document.getElementById('tableSummary').classList.add('show');
}

// Función para manejar el envío del formulario
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Verificar que se haya seleccionado una mesa y capacidad
    if (!selectedTableType || !selectedCapacity) {
        alert('Por favor, selecciona el tipo de mesa y la cantidad de personas antes de confirmar la reserva.');
        return;
    }
    
    // Recoger los datos del formulario
    const formData = new FormData(event.target);
    const reservationData = {
        tableType: selectedTableType,
        capacity: selectedCapacity,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        date: formData.get('date'),
        time: formData.get('time'),
        occasion: formData.get('occasion'),
        notes: formData.get('notes')
    };
    
    // Aquí normalmente enviarías los datos al servidor
    console.log('Datos de la reserva:', reservationData);
    
    // Convertir el tipo de mesa a texto legible
    let tableTypeName = '';
    switch(selectedTableType) {
        case 'round':
            tableTypeName = 'Mesa Redonda';
            break;
        case 'square':
            tableTypeName = 'Mesa Cuadrada';
            break;
        case 'rectangular':
            tableTypeName = 'Mesa Rectangular';
            break;
    }
    
    // Simulación de éxito
    alert(`¡Reserva confirmada!\n\nTipo de mesa: ${tableTypeName}\nPersonas: ${selectedCapacity}\nFecha: ${reservationData.date}\nHora: ${reservationData.time}\n\nGracias por tu reserva, ${reservationData.name}.`);
    
    // Resetear el formulario y la selección
    event.target.reset();
    
    // Resetear la selección de mesa
    const selectedTableOption = document.querySelector('.table-option.selected');
    if (selectedTableOption) {
        selectedTableOption.classList.remove('selected');
    }
    
    // Resetear la selección de capacidad
    const selectedCapacityOption = document.querySelector('.capacity-option.selected');
    if (selectedCapacityOption) {
        selectedCapacityOption.classList.remove('selected');
    }
    
    // Ocultar el selector de capacidad y el resumen
    document.getElementById('capacitySelector').style.display = 'none';
    document.getElementById('tableSummary').classList.remove('show');
    
    // Resetear las variables
    selectedTableType = null;
    selectedCapacity = null;
}

// Inicializar la página cuando se carga
document.addEventListener('DOMContentLoaded', () => {
    // Agregar eventos a las opciones de mesa
    const tableOptions = document.querySelectorAll('.table-option');
    tableOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectTableType(option.dataset.tableType);
        });
    });
    
    // Agregar eventos a las opciones de capacidad
    const capacityOptions = document.querySelectorAll('.capacity-option');
    capacityOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectCapacity(option.dataset.capacity);
        });
    });
    
    // Agregar el manejador de eventos al formulario
    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Establecer la fecha mínima como hoy
    const dateInput = document.getElementById('date');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
});