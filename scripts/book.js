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
    switch (type) {
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
async function handleFormSubmit(event) {
    event.preventDefault();

    if (!selectedTableType || !selectedCapacity) {
        alert('Por favor, selecciona el tipo de mesa y la cantidad de personas antes de confirmar la reserva.');
        return;
    }

    const formData = new FormData(event.target);

    const fechaISO = `${formData.get('date')}T${formData.get('time')}:00`;

    const reserva = {
        fecha: fechaISO,  // ejemplo: "2025-06-20T19:00:00"
        personas: parseInt(selectedCapacity),
        tipo_mesa: selectedTableType
    };

    const resultado = await enviarReservaAPI(reserva);


    if (resultado) {
        alert(`¡Reserva confirmada!\nID de reserva: ${resultado.reserva_id}`);
        event.target.reset();

        // Resetear selección y UI igual que antes
        const selectedTableOption = document.querySelector('.table-option.selected');
        if (selectedTableOption) selectedTableOption.classList.remove('selected');

        const selectedCapacityOption = document.querySelector('.capacity-option.selected');
        if (selectedCapacityOption) selectedCapacityOption.classList.remove('selected');

        document.getElementById('capacitySelector').style.display = 'none';
        document.getElementById('tableSummary').classList.remove('show');

        selectedTableType = null;
        selectedCapacity = null;
    }
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

async function enviarReservaAPI(reserva) {
    try {
        const response = await fetch('http://127.0.0.1:5000/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Error: ${data.error || 'No se pudo crear la reserva'}`);
            return null;
        }

        return data;
    } catch (error) {
        alert('Error de conexión con el servidor');
        console.error(error);
        return null;
    }
}
