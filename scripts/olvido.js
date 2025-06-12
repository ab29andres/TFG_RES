document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgot-form")
    const submitBtn = document.getElementById("submit-btn")
    const btnText = document.getElementById("btn-text")
    const loading = document.getElementById("loading")
    const emailInput = document.getElementById("email")
    const formContainer = document.getElementById("form-container")
    const successContainer = document.getElementById("success-container")
    const resendBtn = document.getElementById("resend-btn")

    // Manejar envío del formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault()

        const email = emailInput.value.trim()
        if (!email) return

        // Mostrar estado de carga
        submitBtn.disabled = true
        btnText.style.display = "none"
        loading.classList.remove("hidden")
        loading.classList.add("show")
        emailInput.disabled = true

        // Simular envío (reemplazar con llamada real a API)
        setTimeout(() => {
            // Ocultar formulario y mostrar confirmación
            formContainer.classList.add("hidden")
            successContainer.classList.remove("hidden")
        }, 2000)
    })

    // Manejar botón de reenvío
    resendBtn.addEventListener("click", () => {
        // Resetear formulario
        submitBtn.disabled = false
        btnText.style.display = "inline"
        loading.classList.add("hidden")
        loading.classList.remove("show")
        emailInput.disabled = false
        emailInput.value = ""

        // Mostrar formulario y ocultar confirmación
        successContainer.classList.add("hidden")
        formContainer.classList.remove("hidden")

        // Enfocar el campo de email
        emailInput.focus()
    })

    // Validación en tiempo real
    emailInput.addEventListener("input", () => {
        const email = emailInput.value.trim()
        submitBtn.disabled = !email || loading.classList.contains("show")
    })
})
