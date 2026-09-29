document.addEventListener("DOMContentLoaded", async () => {
    try {
        const respuesta = await fetch("api/sesion.php", {
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!respuesta.ok) {
            window.location.replace("login.html");
            return;
        }

        document.body.classList.remove("verificando-sesion");
    } catch (error) {
        window.location.replace("login.html");
    }
});
