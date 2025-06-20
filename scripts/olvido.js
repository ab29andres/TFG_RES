document.getElementById('forgot-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const btnText = document.getElementById('btn-text');
    const loading = document.getElementById('loading');
    const submitBtn = document.getElementById('submit-btn');

    // UI: mostrar carga
    btnText.style.display = 'none';
    loading.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:5000/recuperar-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('form-container').classList.add('hidden');
            document.getElementById('success-container').classList.remove('hidden');
        } else {
            alert(result.message || 'Error al enviar el correo');
        }
    } catch (error) {
        alert('Ocurrió un error en el servidor');
        console.error(error);
    }

    // Reset UI
    btnText.style.display = 'inline';
    loading.classList.add('hidden');
    submitBtn.disabled = false;
});
