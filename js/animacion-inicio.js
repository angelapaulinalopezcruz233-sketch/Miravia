// ==========================================
// INICIO MIRAVIA
// · Al entrar directo: animación de la
//   Tierra (como antes) → luego el mapa.
// · Desde otra página con "?destinos=1":
//   solo el mapa de México, sin Tierra.
// · La frase "Bienvenido a MIRAVIA" se
//   borra cuando aparece el mapa.
// · Pulsar MIRAVIA repite la Tierra.
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const pantalla = document.getElementById("inicio");
    const contenedorTierra = document.getElementById("tierra");
    const contenedorMapa = document.getElementById("mapaInicio");
    const mensaje = document.querySelector(".contenido .mensaje");
    const textoUbicacion = document.getElementById("textoUbicacion");
    const cajaUbicacion = document.getElementById("estadoUbicacion");
    const avisoEstado = document.getElementById("avisoEstado");
    const elegirDestino = document.getElementById("elegirDestino");
    const btnComenzarViaje = document.getElementById("btnComenzarViaje");
    const logo = document.getElementById("logoMiravia");

    const VISTA_MEXICO = { centro: [23.9, -102.5], zoom: 5 };
    const LIMITES_MEXICO = [[13.5, -121.5], [34.5, -84.0]];

    // "?destinos=1" en el link: llega de otra
    // página pulsando destinos → solo el mapa.
    const parametros = new URLSearchParams(window.location.search);
    const soloDestinos = parametros.has("destinos");

    let mapa = null;
    let mapaListo = false;
    let navegando = false;
    let valorElegido = "";
    let tierraReproduciendo = false;

    /* ------------------------------------------
       ESCENA 3D · LA TIERRA
    ------------------------------------------ */

    const escena = new THREE.Scene();

    const camara = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camara.position.z = 110;

    const renderizador = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    contenedorTierra.appendChild(renderizador.domElement);

    escena.add(new THREE.AmbientLight(0xffffff, 0.62));

    const luzMenta = new THREE.DirectionalLight(0x98ffd6, 1.35);
    luzMenta.position.set(5, 3, 6);
    escena.add(luzMenta);

    const luzCalida = new THREE.DirectionalLight(0xffb347, 1.05);
    luzCalida.position.set(-6, -2, 4);
    escena.add(luzCalida);

    const grupoTierra = new THREE.Group();
    escena.add(grupoTierra);

    const texturaTierra = new THREE.TextureLoader().load("lib/tierra.jpg");

    const tierra = new THREE.Mesh(
        new THREE.SphereGeometry(15, 64, 64),
        new THREE.MeshPhongMaterial({
            map: texturaTierra,
            color: 0xffffff,
            emissive: 0x072033,
            emissiveIntensity: 0.18,
            shininess: 12
        })
    );
    grupoTierra.add(tierra);

    const atmosfera = new THREE.Mesh(
        new THREE.SphereGeometry(15.55, 48, 48),
        new THREE.MeshBasicMaterial({
            color: 0x7fd8d4,
            transparent: true,
            opacity: 0.14,
            side: THREE.BackSide
        })
    );
    grupoTierra.add(atmosfera);

    const marcadorTierra = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffb347 })
    );
    marcadorTierra.visible = false;
    grupoTierra.add(marcadorTierra);

    const anilloMarcador = new THREE.Mesh(
        new THREE.RingGeometry(0.42, 0.58, 32),
        new THREE.MeshBasicMaterial({
            color: 0x9ff3e0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        })
    );
    anilloMarcador.visible = false;
    grupoTierra.add(anilloMarcador);

    const geometriaEstrellas = new THREE.BufferGeometry();
    const totalEstrellas = 1800;
    const posiciones = new Float32Array(totalEstrellas * 3);
    for (let i = 0; i < totalEstrellas * 3; i += 1) {
        posiciones[i] = (Math.random() - 0.5) * 420;
    }
    geometriaEstrellas.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
    const estrellas = new THREE.Points(
        geometriaEstrellas,
        new THREE.PointsMaterial({
            color: 0xf7fffb,
            size: 0.12,
            transparent: true,
            opacity: 0.78
        })
    );
    escena.add(estrellas);

    function animar() {
        requestAnimationFrame(animar);
        grupoTierra.rotation.y -= 0.0018;
        anilloMarcador.rotation.z += 0.012;
        estrellas.rotation.y += 0.00035;
        renderizador.render(escena, camara);
    }
    animar();

    function puntoEnTierra(latitud, longitud, radio) {
        const phi   = (longitud + 180) * Math.PI / 180;
        const theta = (90 - latitud)   * Math.PI / 180;
        return new THREE.Vector3(
            -radio * Math.cos(phi) * Math.sin(theta),
             radio * Math.cos(theta),
             radio * Math.sin(phi) * Math.sin(theta)
        );
    }

    function orientarHaciaUsuario() {
        // La Tierra gira para mirar hacia México.
        const lat = 19.43, lng = -99.13;
        const direccion = puntoEnTierra(lat, lng, 1).normalize();
        const frente = new THREE.Vector3(0, 0, 1);
        const destino = new THREE.Quaternion().setFromUnitVectors(direccion, frente);

        const punto = puntoEnTierra(lat, lng, 15.35);
        marcadorTierra.position.copy(punto);
        anilloMarcador.position.copy(punto);
        anilloMarcador.lookAt(0, 0, 0);
        marcadorTierra.visible = true;
        anilloMarcador.visible = true;

        gsap.to(grupoTierra.quaternion, {
            x: destino.x,
            y: destino.y,
            z: destino.z,
            w: destino.w,
            duration: 2.0,
            ease: "power2.inOut"
        });
    }

    /* ------------------------------------------
       TEXTOS DE BIENVENIDA
    ------------------------------------------ */

    const titulo = document.getElementById("titulo");
    const subtitulo = document.getElementById("subtitulo");
    const etiquetaEtapa = document.getElementById("etiquetaEtapa");

    function escribirMensaje(tituloTexto, subtituloTexto, etapaTexto) {
        etiquetaEtapa.textContent = etapaTexto || "MIRAVIA";
        titulo.style.opacity = "0";
        subtitulo.style.opacity = "0";
        window.setTimeout(() => {
            titulo.textContent = tituloTexto;
            subtitulo.textContent = subtituloTexto;
            titulo.style.opacity = "1";
            subtitulo.style.opacity = "1";
        }, 220);
    }

    /* ------------------------------------------
       MAPA DE MÉXICO
    ------------------------------------------ */

    function crearMapa() {
        if (mapaListo) {
            return;
        }

        mapa = L.map("mapaInicio", {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            zoomSnap: 0.5,
            minZoom: 4,
            maxZoom: 12,
            maxBounds: LIMITES_MEXICO,
            maxBoundsViscosity: 1.0
        }).setView(VISTA_MEXICO.centro, VISTA_MEXICO.zoom);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 12,
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(mapa);

        mapaListo = true;

        // Entrega el mapa al selector de estados
        // (js/selector-viaje.js crea los 32 círculos de colores).
        window.__miraviaMapa = mapa;
        window.setTimeout(() => {
            document.dispatchEvent(new CustomEvent("miravia:mapa-inicio", {
                detail: { mapa: mapa }
            }));
        }, 0);

        window.setTimeout(() => mapa.invalidateSize(), 350);
    }

    function mostrarMapa() {
        crearMapa();
        contenedorMapa.classList.add("visible");
        pantalla.classList.add("modo-elegir");
        tierraReproduciendo = false;

        // La frase "Bienvenido a MIRAVIA" se borra
        // cuando aparece el mapa de México.
        if (mensaje) {
            mensaje.style.display = "none";
        }
        if (cajaUbicacion) {
            cajaUbicacion.style.display = "none";
        }

        // La pregunta aparece con el mapa.
        elegirDestino.hidden = false;
        gsap.from(elegirDestino, { opacity: 0, y: 20, duration: 0.7, delay: 0.2 });

        // La selección de estados queda activa.
        document.dispatchEvent(new CustomEvent("miravia:modo-elegir"));

        window.setTimeout(() => mapa.invalidateSize(), 400);
    }

    /* ------------------------------------------
       INICIO
       · Entrada normal: animación de la Tierra.
       · "?destinos=1": solo el mapa directo.
    ------------------------------------------ */

    if (soloDestinos) {
        contenedorTierra.classList.add("ocultar");
        mostrarMapa();
    } else {
        secuencia();
    }

    async function secuencia() {
        tierraReproduciendo = true;

        escribirMensaje(
            "MIRAVIA te lleva más lejos",
            "Cada ruta comienza con una decisión: atrévete a descubrir lo extraordinario."
        );
        textoUbicacion.textContent = "Preparando tu aventura...";

        await gsap.to(camara.position, {
            z: 48,
            duration: 3.2,
            ease: "power2.inOut"
        });
        await new Promise((resolve) => window.setTimeout(resolve, 2000));

        escribirMensaje(
            "Acercándonos a nuevos recuerdos",
            "México está lleno de lugares que te están esperando."
        );
        textoUbicacion.textContent = "Acercándonos a nuevos recuerdos...";

        orientarHaciaUsuario();

        await gsap.to(camara.position, {
            z: 24,
            duration: 2.1,
            ease: "power2.inOut"
        });
        await new Promise((resolve) => window.setTimeout(resolve, 2000));

        escribirMensaje(
            "Bienvenido a MIRAVIA",
            "Tu próxima aventura comienza en México."
        );
        textoUbicacion.textContent = "Listo para comenzar";

        await new Promise((resolve) => window.setTimeout(resolve, 4000));
        mostrarMapa();
    }

    /* ------------------------------------------
       LOGO MIRAVIA → REPITE LA TIERRA
    ------------------------------------------ */

    logo.addEventListener("click", () => {
        if (tierraReproduciendo) {
            return;
        }
        tierraReproduciendo = true;

        // Aparece la Tierra y la frase de bienvenida.
        contenedorTierra.classList.remove("ocultar");
        if (mensaje) {
            mensaje.style.display = "";
        }

        orientarHaciaUsuario();

        gsap.fromTo(camara.position, { z: 110 }, {
            z: 26,
            duration: 3.4,
            ease: "power2.inOut",
            onComplete: () => {
                // Regresa al mapa y borra la frase.
                gsap.to(contenedorTierra, {
                    opacity: 0,
                    duration: 0.6,
                    onComplete: () => {
                        contenedorTierra.classList.add("ocultar");
                        contenedorTierra.style.opacity = "";
                        if (mensaje) {
                            mensaje.style.display = "none";
                        }
                        tierraReproduciendo = false;
                        if (mapaListo) {
                            mapa.invalidateSize();
                        }
                    }
                });
            }
        });
    });

    /* ------------------------------------------
       SELECCIÓN DE ESTADO
       (js/selector-viaje.js emite "miravia:estado-elegido"
        al tocar un círculo de colores)
    ------------------------------------------ */

    document.addEventListener("miravia:estado-elegido", (evento) => {
        const { valor, nombre, coords, color } = evento.detail;

        if (navegando) {
            return;
        }
        valorElegido = valor;
        elegirDestino.hidden = true;

        avisoEstado.hidden = false;
        avisoEstado.innerHTML =
            `Has elegido <em>${nombre}</em><br>` +
            `<small>Ahora oprime "Comenzar viaje" ✈</small>`;
        gsap.from(avisoEstado, { opacity: 0, y: 16, duration: 0.4 });

        document.getElementById("estadoElegidoNombre").textContent = nombre;
        document.getElementById("estadoElegidoChip").hidden = false;
        const chipPunto = document.querySelector("#estadoElegidoChip .chip-punto");
        if (chipPunto && color) {
            chipPunto.style.background = color;
        }

        btnComenzarViaje.hidden = false;
        gsap.from(btnComenzarViaje, { opacity: 0, y: 12, duration: 0.4 });

        if (mapaListo) {
            mapa.flyTo(coords, 7, { duration: 1.0 });
        }

        localStorage.setItem("miravia_estado", valor);
    });

    /* ------------------------------------------
       BOTÓN "COMENZAR VIAJE"
       → lleva a la página del estado con su mapa
    ------------------------------------------ */

    btnComenzarViaje.addEventListener("click", () => {
        if (!valorElegido || navegando) {
            return;
        }
        navegando = true;

        avisoEstado.innerHTML = `¡Preparando tu viaje!...`;
        avisoEstado.hidden = false;

        window.setTimeout(() => {
            window.location.href =
                `vista/estados/estado.html?estado=${encodeURIComponent(valorElegido)}`;
        }, 900);
    });

    window.addEventListener("resize", () => {
        camara.aspect = window.innerWidth / window.innerHeight;
        camara.updateProjectionMatrix();
        renderizador.setSize(window.innerWidth, window.innerHeight);
        if (mapa) {
            mapa.invalidateSize();
        }
    });

});