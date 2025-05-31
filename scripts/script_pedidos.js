document.addEventListener("DOMContentLoaded", () => {
    // Elementos del formulario de pago
    const metodoPago = document.getElementById("metodoPago");
    const tarjetaSection = document.getElementById("tarjetaSection");

    // Elementos de la tarjeta
    const cardNumberInput = document.getElementById("cardNumberInput");
    const cardNameInput = document.getElementById("cardNameInput");
    const cardMonthInput = document.getElementById("cardMonthInput");
    const cardYearInput = document.getElementById("cardYearInput");
    const cardCvvInput = document.getElementById("cardCvvInput");
    
    // Elementos visuales de la tarjeta
    const cardNumber1 = document.getElementById("cardNumber1");
    const cardNumber2 = document.getElementById("cardNumber2");
    const cardNumber3 = document.getElementById("cardNumber3");
    const cardNumber4 = document.getElementById("cardNumber4");
    const cardName = document.getElementById("cardName");
    const cardMonth = document.getElementById("cardMonth");
    const cardYear = document.getElementById("cardYear");
    const cardCvv = document.getElementById("cardCvv");

    // Mostrar/ocultar sección de tarjeta
    metodoPago.addEventListener("change", (e) => {
        tarjetaSection.classList.toggle("hidden", e.target.value !== "tarjeta");
    });

    // Generar opciones de fecha
    function populateDateOptions() {
        // Meses
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement("option");
            option.value = i.toString().padStart(2, "0");
            option.textContent = option.value;
            cardMonthInput.appendChild(option);
        }
        
        // Años (próximos 8 años)
        const currentYear = new Date().getFullYear() - 2000;
        for (let i = currentYear; i <= currentYear + 8; i++) {
            const option = document.createElement("option");
            option.value = i.toString().padStart(2, "0");
            option.textContent = option.value;
            cardYearInput.appendChild(option);
        }
    }
    populateDateOptions();

    // Formatear número de tarjeta
    cardNumberInput.addEventListener("input", (e) => {
        const value = e.target.value.replace(/\D/g, "");
        let formattedValue = "";
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formattedValue += " ";
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
        const groups = formattedValue.split(" ");
        cardNumber1.textContent = groups[0] || "";
        cardNumber2.textContent = groups[1] || "";
        cardNumber3.textContent = groups[2] || "";
        cardNumber4.textContent = groups[3] || "";
    });

    // Actualizar nombre del titular
    cardNameInput.addEventListener("input", (e) => {
        cardName.textContent = e.target.value.toUpperCase() || "NOMBRE DEL TITULAR";
    });

    // Actualizar fecha de expiración
    cardMonthInput.addEventListener("change", (e) => {
        cardMonth.textContent = e.target.value || "MM";
    });

    cardYearInput.addEventListener("change", (e) => {
        cardYear.textContent = e.target.value || "AA";
    });

    // Actualizar CVV
    cardCvvInput.addEventListener("input", (e) => {
        const value = e.target.value.replace(/\D/g, "");
        e.target.value = value;
        cardCvv.textContent = value.padEnd(3, "*");
    });

    // Manejar envío del formulario
    document.getElementById("pedidoForm").addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Pedido enviado correctamente");
        e.target.reset();
        tarjetaSection.classList.add("hidden");
    });
});