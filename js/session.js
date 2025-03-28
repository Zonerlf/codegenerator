// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = checkSession();
    
    if (!currentUser) {
      // Redirigir a login si no hay sesión
      window.location.href = 'index.html';
    }
    
    // Opcional: Mostrar información del usuario
    if (currentUser) {
      console.log(`Usuario actual: ${currentUser.username}`);
      // Puedes mostrar el nombre de usuario en la interfaz si lo deseas
    }
  });