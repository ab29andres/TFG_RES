const validationRules = {
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    terms: false,
    direccion: false,
};

function showError(field, message) {
    const error = document.getElementById(field.id + 'Error');
    error.textContent = message;
    error.style.display = 'block';
    field.classList.add('error');
    field.classList.remove('success');
    validationRules[field.id] = false;
}
function validateDireccion() {
    const field = document.getElementById('direccion');
    const val = field.value.trim();
    if (val.length < 5) showError(field, 'Debe ingresar una dirección válida');
    else hideError(field);
}
document.getElementById('direccion').addEventListener('input', () => {
    validateDireccion();
    checkFormValidity();
});
validateDireccion();
const data = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    password: document.getElementById('password').value,
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    direccion: document.getElementById('direccion').value,  // agregado
};

function hideError(field) {
    const error = document.getElementById(field.id + 'Error');
    error.style.display = 'none';
    field.classList.remove('error');
    field.classList.add('success');
    validationRules[field.id] = true;
}

function validateName(field) {
    const val = field.value.trim();
    if (val.length < 2) showError(field, 'Debe tener al menos 2 caracteres');
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) showError(field, 'Solo letras');
    else hideError(field);
}

function validateUsername() {
    const field = document.getElementById('username');
    const val = field.value.trim();
    if (val.length < 3) showError(field, 'Al menos 3 caracteres');
    else if (val.length > 20) showError(field, 'Máximo 20 caracteres');
    else if (!/^[a-zA-Z0-9_]+$/.test(val)) showError(field, 'Solo letras, números y _');
    else hideError(field);
}

function validateEmail() {
    const field = document.getElementById('email');
    const val = field.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) showError(field, 'Email inválido');
    else hideError(field);
}

function validatePhone() {
    const field = document.getElementById('phone');
    const val = field.value.trim().replace(/[\s\-]/g, '');
    if (val.length < 10) showError(field, 'Al menos 10 dígitos');
    else if (!/^\+?[0-9]{10,15}$/.test(val)) showError(field, 'Formato inválido');
    else hideError(field);
}

function validatePassword() {
    const field = document.getElementById('password');
    const val = field.value;
    if (val.length < 8) showError(field, 'Mínimo 8 caracteres');
    else hideError(field);
    validateConfirmPassword();  // revalidar confirm
}

function validateConfirmPassword() {
    const field = document.getElementById('confirmPassword');
    const pass = document.getElementById('password').value;
    if (field.value !== pass) showError(field, 'No coinciden');
    else hideError(field);
}

function validateTerms() {
    const field = document.getElementById('terms');
    const error = document.getElementById('termsError');
    if (!field.checked) {
        error.textContent = 'Debe aceptar términos';
        error.style.display = 'block';
        validationRules.terms = false;
    } else {
        error.style.display = 'none';
        validationRules.terms = true;
    }
}

function checkFormValidity() {
    const submit = document.getElementById('submitButton');
    submit.disabled = !Object.values(validationRules).every(v => v);
}

document.addEventListener('DOMContentLoaded', () => {
    ['firstName', 'lastName'].forEach(id =>
        document.getElementById(id).addEventListener('input', e => {
            validateName(e.target);
            checkFormValidity();
        })
    );

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

    document.getElementById('registerForm').addEventListener('submit', e => {
        e.preventDefault();
        // Validar todo
        ['firstName', 'lastName'].forEach(id => validateName(document.getElementById(id)));
        validateUsername();
        validateEmail();
        validatePhone();
        validatePassword();
        validateConfirmPassword();
        validateTerms();

        if (Object.values(validationRules).every(v => v)) {
            const submit = document.getElementById('submitButton');
            submit.disabled = true;

            const data = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                direccion: document.getElementById('direccion').value,
            };


            fetch('http://127.0.0.1:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user_id) {
                        alert('Registro exitoso! ID: ' + data.user_id);
                        document.getElementById('registerForm').reset();
                        Object.keys(validationRules).forEach(k => validationRules[k] = false);
                        checkFormValidity();
                    } else {
                        alert('Error: ' + (data.error || 'Desconocido'));
                        submit.disabled = false;
                    }
                })
                .catch(() => {
                    alert('Error de conexión');
                    submit.disabled = false;
                });
        }
    });
});
