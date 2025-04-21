    // auth.js - Manejo de autenticación con usuarios locales

    // Lista de usuarios permitidos (puedes agregar más)
    const users = [
        {
            username: "Abraham",
            password: "SanJuan01*",
            role: "dev"
        },
        {
            username: "Horacio",
            password: "SanJuan01*",
            role: "user"
        },
        {
            username: "Andrea",
            password: "SanJuan#01",
            role: "user"
        }
    ];
    
    // Función para verificar credenciales
    function authenticate(username, password) {
        const user = users.find(u => u.username === username && u.password === password);
        return user ? user : null;
    }
    
    // Función para guardar sesión (podría usar localStorage o sessionStorage)
    function setSession(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    // Función para verificar si hay una sesión activa
    function checkSession() {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    }
    
    // Función para cerrar sesión
    function logout() {
        if(confirm('¿Estás seguro que deseas cerrar sesión?')) {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }