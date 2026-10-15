//MODIFICADO AGTH
document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    // ==========================================
    // 1. ELEMENTOS DEL HTML
    // ==========================================

    const formulario = document.getElementById("formLogin");
    const formularioRegistro = document.getElementById("formRegistro");

    const correo = document.getElementById("correo");
    const password = document.getElementById("password");
    const mostrarPassword = document.getElementById("mostrarPassword");

    const mensaje = document.getElementById("mensajeLogin");
    const mensajeRegistro = document.getElementById("mensajeRegistro");

    const boton = document.getElementById("btnLogin");
    const botonRegistro = document.getElementById("btnRegistro");

    const titulo = document.getElementById("tituloAcceso");
    const descripcion = document.getElementById("descripcionAcceso");

    const enlaceRegistro =
        document.getElementById("mostrarRegistro") ||
        document.getElementById("enlaceRegistro");

    const enlaceLogin =
        document.getElementById("mostrarLogin") ||
        document.getElementById("enlaceLogin");

    // Comprobar que existen los elementos principales.
    if (!formulario || !formularioRegistro || !correo || !password ||
        !boton || !botonRegistro) {
        console.error(
            "Miravia: faltan elementos del formulario. " +
            "Comprueba los IDs de login.html."
        );
        return;
    }

    // ==========================================
    // 2. COMUNICACIÓN CON PHP
    // ==========================================

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
                cache: "no-store",
                body: JSON.stringify(datos)
            });
        } catch (error) {
            throw new Error(
                "No se pudo conectar con el servidor. " +
                "Comprueba que Apache esté funcionando."
            );
        }

        const textoRespuesta = await respuesta.text();

        let resultado;

        try {
            // PHP debe devolver JSON, nunca código Markdown.
            // Este bloque también tolera envolturas accidentales
            // de Markdown durante la depuración.
            const textoLimpio = textoRespuesta
                .trim()
                .replace(/^```(?:php|json)?\s*/i, "")
                .replace(/\s*```$/, "")
                .trim();

            resultado = JSON.parse(textoLimpio);
        } catch (error) {
            console.error(
                "Respuesta no válida del servidor:",
                textoRespuesta
            );

            throw new Error(
                "El servidor devolvió una respuesta incorrecta. " +
                "Revisa api/auth.php o api/registrar.php."
            );
        }

        if (!respuesta.ok || resultado.ok !== true) {
            throw new Error(
                resultado.mensaje ||
                "No se pudo completar la solicitud."
            );
        }

        return resultado;
    }

    // ==========================================
    // 3. CAMBIAR ENTRE LOGIN Y REGISTRO
    // ==========================================

    function cambiarModoRegistro(mostrarRegistro) {
        formulario.hidden = mostrarRegistro;
        formularioRegistro.hidden = !mostrarRegistro;

        if (enlaceRegistro) {
            enlaceRegistro.hidden = mostrarRegistro;
        }

        if (enlaceLogin) {
            enlaceLogin.hidden = !mostrarRegistro;
        }

        if (mensaje) {
            mensaje.textContent = "";
        }

        if (mensajeRegistro) {
            mensajeRegistro.textContent = "";
        }

        if (titulo) {
            titulo.textContent = mostrarRegistro
                ? "Crear cuenta"
                : "Iniciar sesión";
        }

        if (descripcion) {
            descripcion.textContent = mostrarRegistro
                ? "Regístrate para comenzar tu viaje."
                : "Entra a MIRAVIA para continuar tu viaje.";
        }

        const campoInicial = mostrarRegistro
            ? document.getElementById("nombreRegistro")
            : correo;

        if (campoInicial) {
            campoInicial.focus();
        }
    }

    if (enlaceRegistro) {
        enlaceRegistro.addEventListener("click", (evento) => {
            evento.preventDefault();
            cambiarModoRegistro(true);
        });
    }

    if (enlaceLogin) {
        enlaceLogin.addEventListener("click", (evento) => {
            evento.preventDefault();
            cambiarModoRegistro(false);
        });
    }

    // ==========================================
    // 4. MOSTRAR / OCULTAR CONTRASEÑA
    // ==========================================

    if (mostrarPassword) {
        mostrarPassword.addEventListener("click", () => {
            const mostrar = password.type === "password";

            password.type = mostrar ? "text" : "password";
            mostrarPassword.textContent = mostrar ? "🙈" : "👁";
        });
    }

    // ==========================================
    // 5. COMPROBAR SESIÓN EXISTENTE
    // ==========================================

    try {
        const respuestaSesion = await fetch("api/sesion.php", {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        if (respuestaSesion.ok) {
            const sesion = await respuestaSesion.json();

            if (sesion.autenticado === true) {
                window.location.replace("inicio.html");
                return;
            }
        }
    } catch (error) {
        // Si no se puede consultar la sesión,
        // permitimos que el usuario vea el formulario.
        console.warn("No se pudo comprobar la sesión.", error);
    }

    // ==========================================
    // 6. INICIAR SESIÓN
    // ==========================================

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (!formulario.reportValidity()) {
            return;
        }

        mensaje.textContent = "";
        boton.disabled = true;
        boton.textContent = "Iniciando sesión...";

        try {
            const correoValor = correo.value.trim();
            const passwordValor = password.value;

            const resultado = await enviarAuth(
                "api/auth.php?accion=login",
                {
                    correo: correoValor,
                    contrasena: passwordValor
                }
            );

            // El servidor confirmó que las credenciales son correctas.
            if (resultado.ok === true) {
                boton.textContent = "Acceso correcto...";

                window.location.replace("inicio.html");
            }
        } catch (error) {
            mensaje.textContent = error.message;
            boton.disabled = false;
            boton.textContent = "Iniciar sesión";
        }
    });

    // ==========================================
    // 7. REGISTRAR CUENTA
    // ==========================================

    formularioRegistro.addEventListener(
        "submit",
        async (evento) => {
            evento.preventDefault();

            if (!formularioRegistro.reportValidity()) {
                return;
            }

            mensajeRegistro.textContent = "";

            const nombreElemento =
                document.getElementById("nombreRegistro");

            const correoElemento =
                document.getElementById("correoRegistro");

            const passwordRegistro =
                document.getElementById("contrasenaRegistro");

            const confirmarRegistro =
                document.getElementById("confirmarRegistro");

            if (
                !nombreElemento ||
                !correoElemento ||
                !passwordRegistro ||
                !confirmarRegistro
            ) {
                mensajeRegistro.textContent =
                    "Faltan campos del formulario de registro.";

                return;
            }

            const nombre = nombreElemento.value.trim();
            const correoNuevo = correoElemento.value.trim();
            const contrasena = passwordRegistro.value;
            const confirmar = confirmarRegistro.value;

            if (contrasena !== confirmar) {
                mensajeRegistro.textContent =
                    "Las contraseñas no coinciden.";
                confirmarRegistro.focus();
                return;
            }

            botonRegistro.disabled = true;
            botonRegistro.textContent = "Creando cuenta...";

            try {
                await enviarAuth("api/registrar.php", {
                    nombre: nombre,
                    correo: correoNuevo,
                    contrasena: contrasena
                });

                // Limpiar los datos del formulario de registro.
                formularioRegistro.reset();

                // Mostrar el formulario de inicio de sesión.
                cambiarModoRegistro(false);

                mensaje.textContent =
                    "¡Cuenta creada correctamente! " +
                    "Ahora inicia sesión con tu correo y contraseña.";

                correo.value = correoNuevo;
                password.value = "";
                correo.focus();

            } catch (error) {
                mensajeRegistro.textContent = error.message;
            } finally {
                botonRegistro.disabled = false;
                botonRegistro.textContent = "Crear cuenta";
            }
        }
    );

    // ==========================================
    // 8. ANIMACIÓN 3D DE LA TIERRA
    // ==========================================

    const contenedorGlobo = document.getElementById("loginGlobo");

    if (contenedorGlobo && window.THREE) {
        try {
            const escena = new THREE.Scene();

            const camara = new THREE.PerspectiveCamera(
                42,
                1,
                0.1,
                100
            );

            camara.position.z = 5.8;

            const renderizador = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });

            renderizador.setPixelRatio(
                Math.min(window.devicePixelRatio || 1, 1.5)
            );

            renderizador.setClearColor(0x000000, 0);
            contenedorGlobo.appendChild(renderizador.domElement);

            escena.add(new THREE.AmbientLight(0xffffff, 1.35));

            const luzPrincipal = new THREE.DirectionalLight(
                0xffffff,
                2.1
            );

            luzPrincipal.position.set(-3, 2, 5);
            escena.add(luzPrincipal);

            const planeta = new THREE.Group();
            escena.add(planeta);

            const textura = new THREE.TextureLoader().load(
                "lib/tierra.jpg",
                undefined,
                () => {
                    console.warn(
                        "No se pudo cargar lib/tierra.jpg. " +
                        "Comprueba la ruta de la textura."
                    );
                }
            );

            if (THREE.SRGBColorSpace) {
                textura.colorSpace = THREE.SRGBColorSpace;
            }

            const tierra = new THREE.Mesh(
                new THREE.SphereGeometry(1.42, 64, 64),
                new THREE.MeshPhongMaterial({
                    map: textura,
                    shininess: 18
                })
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
                new THREE.MeshBasicMaterial({
                    color: 0xff705c
                })
            );

            marcador.position
                .set(0.66, 0.78, 0.96)
                .normalize()
                .multiplyScalar(1.47);

            planeta.add(marcador);

            const posicionesEstrellas = new Float32Array(240 * 3);

            for (
                let indice = 0;
                indice < posicionesEstrellas.length;
                indice += 3
            ) {
                posicionesEstrellas[indice] =
                    (Math.random() - 0.5) * 9;

                posicionesEstrellas[indice + 1] =
                    (Math.random() - 0.5) * 5;

                posicionesEstrellas[indice + 2] =
                    -2.5 - Math.random() * 2;
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

            const movimientoReducido = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

            let cuadroAnimacion = 0;
            let anchoAnterior = 0;
            let altoAnterior = 0;

            function ajustarTamano() {
                const ancho = contenedorGlobo.clientWidth;
                const alto = contenedorGlobo.clientHeight;

                if (!ancho || !alto) {
                    return;
                }

                if (
                    ancho === anchoAnterior &&
                    alto === altoAnterior
                ) {
                    return;
                }

                anchoAnterior = ancho;
                altoAnterior = alto;

                camara.aspect = ancho / alto;
                camara.updateProjectionMatrix();

                renderizador.setSize(ancho, alto, false);
                renderizador.render(escena, camara);
            }

            function dibujar() {
                if (!movimientoReducido.matches) {
                    planeta.rotation.y += 0.0018;
                    orbita.rotation.z += 0.0012;
                    estrellas.rotation.z += 0.00008;
                }

                renderizador.render(escena, camara);

                if (!movimientoReducido.matches) {
                    cuadroAnimacion =
                        window.requestAnimationFrame(dibujar);
                }
            }

            function actualizarAnimacion() {
                window.cancelAnimationFrame(cuadroAnimacion);
                ajustarTamano();
                dibujar();
            }

            const observer = new ResizeObserver(() => {
                ajustarTamano();
            });

            observer.observe(contenedorGlobo);

            if (movimientoReducido.addEventListener) {
                movimientoReducido.addEventListener(
                    "change",
                    actualizarAnimacion
                );
            } else if (movimientoReducido.addListener) {
                movimientoReducido.addListener(actualizarAnimacion);
            }

            actualizarAnimacion();

        } catch (error) {
            console.error(
                "No se pudo iniciar la animación de la Tierra:",
                error
            );
        }
    }
});
