// Variables para validación
let isFormValid = false;
const validationRules = {
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    terms: false
};

// Función para mostrar/ocultar contraseña
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling;

    if (field.type === 'password') {
        field.type = 'text';
        icon.textContent = '🙈';
    } else {
        field.type = 'password';
        icon.textContent = '👁️';
    }
}

// Validación de nombre y apellido
function validateName(fieldId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + 'Error');
    const value = field.value.trim();

    if (value.length < 2) {
        showError(field, error, 'Debe tener al menos 2 caracteres');
        validationRules[fieldId] = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        showError(field, error, 'Solo se permiten letras');
        validationRules[fieldId] = false;
    } else {
        showSuccess(field, error);
        validationRules[fieldId] = true;
    }
}

// Validación de nombre de usuario
function validateUsername() {
    const field = document.getElementById('username');
    const error = document.getElementById('usernameError');
    const success = document.getElementById('usernameSuccess');
    const value = field.value.trim();

    if (value.length < 3) {
        showError(field, error, 'Debe tener al menos 3 caracteres');
        hideSuccess(success);
        validationRules.username = false;
    } else if (value.length > 20) {
        showError(field, error, 'No puede tener más de 20 caracteres');
        hideSuccess(success);
        validationRules.username = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        showError(field, error, 'Solo letras, números y guiones bajos');
        hideSuccess(success);
        validationRules.username = false;
    } else {
        hideError(field, error);
        showSuccessMessage(success, 'Nombre de usuario disponible');
        validationRules.username = true;
    }
}

// Validación de email
function validateEmail() {
    const field = document.getElementById('email');
    const error = document.getElementById('emailError');
    const success = document.getElementById('emailSuccess');
    const value = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
        showError(field, error, 'Ingrese un email válido');
        hideSuccess(success);
        validationRules.email = false;
    } else {
        hideError(field, error);
        showSuccessMessage(success, 'Email válido');
        validationRules.email = true;
    }
}

// Validación de teléfono
function validatePhone() {
    const field = document.getElementById('phone');
    const error = document.getElementById('phoneError');
    const success = document.getElementById('phoneSuccess');
    const value = field.value.trim();
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

    if (value.length < 10) {
        showError(field, error, 'Debe tener al menos 10 dígitos');
        hideSuccess(success);
        validationRules.phone = false;
    } else if (!phoneRegex.test(value.replace(/[\s\-$$$$]/g, ''))) {
        showError(field, error, 'Formato de teléfono inválido');
        hideSuccess(success);
        validationRules.phone = false;
    } else {
        hideError(field, error);
        showSuccessMessage(success, 'Teléfono válido');
        validationRules.phone = true;
    }
}

// Validación de contraseña
function validatePassword() {
    const field = document.getElementById('password');
    const error = document.getElementById('passwordError');
    const value = field.value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    let strength = 0;
    let strengthLabel = '';

    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^A-Za-z0-9]/.test(value)) strength++;

    // Actualizar barra de fuerza
    strengthFill.className = 'strength-fill';
    if (strength < 3) {
        strengthFill.classList.add('strength-weak');
        strengthLabel = 'Débil';
    } else if (strength < 5) {
        strengthFill.classList.add('strength-medium');
        strengthLabel = 'Media';
    } else {
        strengthFill.classList.add('strength-strong');
        strengthLabel = 'Fuerte';
    }

    strengthText.textContent = value.length > 0 ? `Fuerza: ${strengthLabel}` : 'Ingrese una contraseña';

    if (value.length < 8) {
        showError(field, error, 'Debe tener al menos 8 caracteres');
        validationRules.password = false;
    } else if (strength < 3) {
        showError(field, error, 'La contraseña es muy débil');
        validationRules.password = false;
    } else {
        hideError(field, error);
        validationRules.password = true;
    }

    // Revalidar confirmación de contraseña
    if (document.getElementById('confirmPassword').value) {
        validateConfirmPassword();
    }
}

// Validación de confirmación de contraseña
function validateConfirmPassword() {
    const field = document.getElementById('confirmPassword');
    const error = document.getElementById('confirmPasswordError');
    const success = document.getElementById('confirmPasswordSuccess');
    const password = document.getElementById('password').value;
    const confirmPassword = field.value;

    if (confirmPassword !== password) {
        showError(field, error, 'Las contraseñas no coinciden');
        hideSuccess(success);
        validationRules.confirmPassword = false;
    } else if (confirmPassword.length > 0) {
        hideError(field, error);
        showSuccessMessage(success, 'Las contraseñas coinciden');
        validationRules.confirmPassword = true;
    }
}

// Validación de términos
function validateTerms() {
    const field = document.getElementById('terms');
    const error = document.getElementById('termsError');

    if (!field.checked) {
        error.textContent = 'Debe aceptar los términos y condiciones';
        error.style.display = 'block';
        validationRules.terms = false;
    } else {
        error.style.display = 'none';
        validationRules.terms = true;
    }
}

// Funciones auxiliares para mostrar errores y éxitos
function showError(field, errorElement, message) {
    field.classList.add('error');
    field.classList.remove('success');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(field, errorElement) {
    field.classList.remove('error');
    errorElement.style.display = 'none';
}

function showSuccess(field, errorElement) {
    field.classList.add('success');
    field.classList.remove('error');
    errorElement.style.display = 'none';
}

function showSuccessMessage(successElement, message) {
    successElement.textContent = message;
    successElement.style.display = 'block';
}

function hideSuccess(successElement) {
    successElement.style.display = 'none';
}

// Verificar si el formulario es válido
function checkFormValidity() {
    const isValid = Object.values(validationRules).every(rule => rule === true);
    const submitButton = document.getElementById('submitButton');

    if (isValid) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    // Event listeners para validación en tiempo real
    document.getElementById('firstName').addEventListener('input', () => {
        validateName('firstName');
        checkFormValidity();
    });

    document.getElementById('lastName').addEventListener('input', () => {
        validateName('lastName');
        checkFormValidity();
    });

    document.getElementById('username').addEventListener('input', () => {
        validateUsername();
        checkFormValidity();
    });

    document.getElementById('email').addEventListener('input', () => {
        validateEmail();
        checkFormValidity();
    });

    document.getElementById('phone').addEventListener('input', () => {
        validatePhone();
        checkFormValidity();
    });

    document.getElementById('password').addEventListener('input', () => {
        validatePassword();
        checkFormValidity();
    });

    document.getElementById('confirmPassword').addEventListener('input', () => {
        validateConfirmPassword();
        checkFormValidity();
    });

    document.getElementById('terms').addEventListener('change', () => {
        validateTerms();
        checkFormValidity();
    });

    // Envío del formulario
    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();

        // Validar todos los campos
        validateName('firstName');
        validateName('lastName');
        validateUsername();
        validateEmail();
        validatePhone();
        validatePassword();
        validateConfirmPassword();
        validateTerms();

        if (Object.values(validationRules).every(rule => rule === true)) {
            // Mostrar estado de carga
            const submitButton = document.getElementById('submitButton');
            const buttonText = document.getElementById('buttonText');
            const buttonLoading = document.getElementById('buttonLoading');

            submitButton.disabled = true;
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'inline-block';

            // Enviar datos a la API Flask
            const formData = {
                username: this.username.value,
                email: this.email.value,
                phone: this.phone.value,
                password: this.password.value,
                firstName: this.firstName.value,
                lastName: this.lastName.value,
            };

            fetch('http://127.0.0.1:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.user_id) {
                        alert('✅ Registro exitoso! ID: ' + data.user_id);
                        this.reset();
                        Object.keys(validationRules).forEach(key => validationRules[key] = false);
                        // Limpiar clases y mensajes igual que antes...
                    } else {
                        alert('❌ Error: ' + (data.error || 'Error desconocido'));
                    }
                    // Resetear botón y carga igual que antes...
                    const submitButton = document.getElementById('submitButton');
                    const buttonText = document.getElementById('buttonText');
                    const buttonLoading = document.getElementById('buttonLoading');
                    buttonText.style.display = 'inline';
                    buttonLoading.style.display = 'none';
                    submitButton.disabled = true;
                })
                .catch(err => {
                    alert('❌ Error al conectar con el servidor');
                    console.error(err);
                    const submitButton = document.getElementById('submitButton');
                    const buttonText = document.getElementById('buttonText');
                    const buttonLoading = document.getElementById('buttonLoading');
                    buttonText.style.display = 'inline';
                    buttonLoading.style.display = 'none';
                    submitButton.disabled = false;
                });


            // Inicializar estado del botón
            checkFormValidity();
        }
    })
})