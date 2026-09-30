document.addEventListener("DOMContentLoaded", async () => {
    const loginLink = document.querySelector(".enlace-login");
    const sesionUsuario = document.getElementById("usuarioSesion");
    const nombreUsuario = document.getElementById("usuarioNombre");
    const rolUsuario = document.getElementById("usuarioRol");
    const botonLogout = document.getElementById("btnLogout");

    try {
        const respuesta = await fetch("api/sesion.php", {
            credentials: "same-origin",
            cache: "no-store"
        });
        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.autenticado || !datos.usuario) {
            window.location.replace("login.html");
            return;
        }

        if (loginLink) {
            loginLink.hidden = true;
        }

        if (sesionUsuario) {
            sesionUsuario.hidden = false;
        }

        if (nombreUsuario) {
            nombreUsuario.textContent = datos.usuario.nombre;
        }

        if (rolUsuario) {
            rolUsuario.textContent = datos.usuario.rol;
        }

        if (botonLogout) {
            botonLogout.addEventListener("click", async () => {
                try {
                    await fetch("api/auth.php?accion=logout", {
                        method: "POST",
                        credentials: "same-origin",
                        cache: "no-store"
                    });
                    window.location.replace("login.html");
                } catch (error) {
                    window.location.replace("login.html");
                }
            });
        }

        document.body.classList.remove("verificando-sesion");
    } catch (error) {
        window.location.replace("login.html");
    }
});
