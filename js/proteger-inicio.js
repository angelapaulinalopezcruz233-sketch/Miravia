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
                botonLogout.disabled = true;
                try {
                    const respuestaLogout = await fetch("api/auth.php?accion=logout", {
                        method: "POST",
                        credentials: "same-origin",
                        cache: "no-store"
                    });

                    const resultadoLogout = await respuestaLogout.json();
                    if (!respuestaLogout.ok || resultadoLogout.autenticado !== false) {
                        throw new Error("No se pudo cerrar la sesión.");
                    }

                    window.location.replace("login.html");
                } catch (error) {
                    botonLogout.disabled = false;
                    window.alert("No se pudo cerrar sesión. Intenta de nuevo.");
                }
            });
        }

        document.body.classList.remove("verificando-sesion");
    } catch (error) {
        window.location.replace("login.html");
    }
});
