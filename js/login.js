document.addEventListener("DOMContentLoaded", async () => {
    try {
        const sesion = await fetch("api/sesion.php", {
            credentials: "same-origin",
            cache: "no-store"
        });
        const datosSesion = await sesion.json();
        if (datosSesion.autenticado) {
            window.location.replace("inicio.html");
            return;
        }
    } catch (error) {
        // Continuamos con el login si no existe sesión activa.
    }

    const formulario = document.getElementById("formLogin");
    const formularioRegistro = document.getElementById("formRegistro");
    const password = document.getElementById("password");
    const mostrarPassword = document.getElementById("mostrarPassword");
    const mensaje = document.getElementById("mensajeLogin");
    const mensajeRegistro = document.getElementById("mensajeRegistro");
    const boton = document.getElementById("btnLogin");
    const botonRegistro = document.getElementById("btnRegistro");
    const titulo = document.getElementById("tituloAcceso");
    const descripcion = document.getElementById("descripcionAcceso");
    const enlaceRegistro = document.getElementById("enlaceRegistro");
    const enlaceLogin = document.getElementById("enlaceLogin");

    const contenedorGlobo = document.getElementById("loginGlobo");
    if (contenedorGlobo && window.THREE) {
        const escena = new THREE.Scene();
        const camara = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camara.position.z = 5.8;

        const renderizador = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderizador.setClearColor(0x000000, 0);
        contenedorGlobo.appendChild(renderizador.domElement);

        escena.add(new THREE.AmbientLight(0xffffff, 1.35));
        const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.1);
        luzPrincipal.position.set(-3, 2, 5);
        escena.add(luzPrincipal);

        const planeta = new THREE.Group();
        escena.add(planeta);

        const textura = new THREE.TextureLoader().load("lib/tierra.jpg");
        if (THREE.SRGBColorSpace) {
            textura.colorSpace = THREE.SRGBColorSpace;
        }

        const tierra = new THREE.Mesh(
            new THREE.SphereGeometry(1.42, 64, 64),
            new THREE.MeshPhongMaterial({ map: textura, shininess: 18 })
        );
        planeta.add(tierra);

        const atmosfera = new THREE.Mesh(
            new THREE.SphereGeometry(1.49, 48, 48),
            new THREE.MeshBasicMaterial({
                color: 0x40c9ef,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide,
                depthWrite: false
            })
        );
        planeta.add(atmosfera);

        const orbita = new THREE.Mesh(
            new THREE.RingGeometry(1.62, 1.66, 96),
            new THREE.MeshBasicMaterial({
                color: 0x0dbbd1,
                transparent: true,
                opacity: 0.72,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        orbita.rotation.set(1.08, 0.18, -0.22);
        planeta.add(orbita);

        const marcador = new THREE.Mesh(
            new THREE.SphereGeometry(0.065, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff705c })
        );
        marcador.position.set(0.66, 0.78, 0.96).normalize().multiplyScalar(1.47);
        planeta.add(marcador);

        const posicionesEstrellas = new Float32Array(240 * 3);
        for (let indice = 0; indice < posicionesEstrellas.length; indice += 3) {
            posicionesEstrellas[indice] = (Math.random() - 0.5) * 9;
            posicionesEstrellas[indice + 1] = (Math.random() - 0.5) * 5;
            posicionesEstrellas[indice + 2] = -2.5 - Math.random() * 2;
        }
        const geometriaEstrellas = new THREE.BufferGeometry();
        geometriaEstrellas.setAttribute(
            "position",
            new THREE.BufferAttribute(posicionesEstrellas, 3)
        );
        const estrellas = new THREE.Points(
            geometriaEstrellas,
            new THREE.PointsMaterial({
                color: 0xd9f5ff,
                size: 0.025,
                transparent: true,
                opacity: 0.78
            })
        );
        escena.add(estrellas);

        const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
        let cuadroAnimacion = 0;

        function dibujar() {
            if (!movimientoReducido.matches) {
                planeta.rotation.y += 0.0018;
                orbita.rotation.z += 0.0012;
                estrellas.rotation.z += 0.00008;
            }
            renderizador.render(escena, camara);
            if (!movimientoReducido.matches) {
                cuadroAnimacion = window.requestAnimationFrame(dibujar);
            }
        }

        function actualizarAnimacion() {
            window.cancelAnimationFrame(cuadroAnimacion);
            dibujar();
        }

        const observer = new ResizeObserver(([entrada]) => {
            const ancho = entrada.contentRect.width;
            const alto = entrada.contentRect.height;
            if (!ancho || !alto) return;
            camara.aspect = ancho / alto;
            camara.updateProjectionMatrix();
            renderizador.setSize(ancho, alto, false);
            renderizador.render(escena, camara);
        });
        observer.observe(contenedorGlobo);
        movimientoReducido.addEventListener("change", actualizarAnimacion);
        actualizarAnimacion();
    }

    async function enviarAuth(url, datos) {

    let respuesta;

    try {

        respuesta = await fetch(url, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify(datos)
        });

    } catch (error) {

        console.error("ERROR FETCH:", error);

        throw new Error(
            "No se pudo conectar con el servidor."
        );
    }


    // Obtener la respuesta como texto primero
    const textoRespuesta = await respuesta.text();

    console.log(
        "RESPUESTA DEL SERVIDOR:",
        textoRespuesta
    );


    // Intentar convertir a JSON
    let resultado = {};

    try {

        resultado = JSON.parse(textoRespuesta);

    } catch (error) {

        console.error(
            "PHP NO DEVOLVIÓ JSON:",
            textoRespuesta
        );

        throw new Error(
            "El servidor devolvió una respuesta incorrecta."
        );
    }


    console.log(
        "JSON RECIBIDO:",
        resultado
    );


    if (!respuesta.ok) {

        throw new Error(
            resultado.error ||
            resultado.mensaje ||
            "No se pudo completar la solicitud."
        );
    }


    return resultado;
}
    

    function cambiarModoRegistro(mostrarRegistro) {
        formulario.hidden = mostrarRegistro;
        formularioRegistro.hidden = !mostrarRegistro;
        enlaceRegistro.hidden = mostrarRegistro;
        enlaceLogin.hidden = !mostrarRegistro;
        mensaje.textContent = "";
        mensajeRegistro.textContent = "";
        titulo.textContent = mostrarRegistro ? "Crear cuenta" : "Iniciar sesión";
        descripcion.textContent = mostrarRegistro
            ? "Regístrate para comenzar tu viaje."
            : "Entra a MIRAVIA para continuar tu viaje.";

        document.getElementById(mostrarRegistro ? "nombreRegistro" : "correo").focus();
    }

    document.getElementById("mostrarRegistro").addEventListener("click", (evento) => {
        evento.preventDefault();
        cambiarModoRegistro(true);
    });

    document.getElementById("mostrarLogin").addEventListener("click", (evento) => {
        evento.preventDefault();
        cambiarModoRegistro(false);
    });

    mostrarPassword.addEventListener("click", () => {
        const mostrar = password.type === "password";
        password.type = mostrar ? "text" : "password";
        mostrarPassword.textContent = mostrar ? "🙈" : "👁";
    });

   formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    mensaje.textContent = "";
    boton.disabled = true;
    boton.textContent = "✈ Iniciando sesión...";

    try {
        const correoInput = document
            .getElementById("correo")
            .value
            .trim();

        await enviarAuth("api/auth.php?accion=login", {
            correo: correoInput,
            contrasena: password.value,
            recordarme: document
                .getElementById("recordarme")
                .checked
        });

        window.location.href = "inicio.html";

    } catch (error) {

        mensaje.textContent = error.message;

        boton.disabled = false;
        boton.textContent = "Iniciar sesión";
    }
});

    formularioRegistro.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensajeRegistro.textContent = "";

        const contrasena = document.getElementById("contrasenaRegistro").value;
        const confirmar = document.getElementById("confirmarRegistro").value;
        if (contrasena !== confirmar) {
            mensajeRegistro.textContent = "Las contraseñas no coinciden.";
            return;
        }

        botonRegistro.disabled = true;
        botonRegistro.textContent = "Creando cuenta...";

        try {
            await enviarAuth("api/registrar.php", {
                nombre: document.getElementById("nombreRegistro").value.trim(),
                usuario: document.getElementById("usuarioRegistro").value.trim(),
                correo: document.getElementById("correoRegistro").value.trim(),
                contrasena
            });
            window.location.href = "inicio.html";
        } catch (error) {
            mensajeRegistro.textContent = error.message;
            botonRegistro.disabled = false;
            botonRegistro.textContent = "Crear cuenta";
        }
    });
});
    
