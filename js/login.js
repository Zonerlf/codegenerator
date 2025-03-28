// login.js - Manejo del formulario de login

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

      // Autenticar usuario
    const user = authenticate(username, password);

    if (user) {
        // Guardar sesión y redirigir
        setSession(user);
        window.location.href = 'content.html';
    } else {
        errorMessage.textContent = 'Usuario o contraseña incorrectos';
    }
    });
});