// ==========================================
// MIRAVIA · ARMAR VIAJE PASO A PASO
// Hospedaje → Comida → Lugares → Resumen
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------------------------
       ESTADO ELEGIDO (de la URL)
    ------------------------------------------ */

    const parametros = new URLSearchParams(window.location.search);
    const valorEstado = parametros.get("estado") || localStorage.getItem("miravia_estado") || "oaxaca";
    const valorMunicipio = parametros.get("municipio") || "";

    const datos = DATOS_ESTADOS.obtener(valorEstado);

    const destinoElegido = document.getElementById("destinoElegido");

    if (!datos) {
        destinoElegido.textContent = "No encontramos ese estado";
        return;
    }

    /* ------------------------------------------
       DATOS POR MUNICIPIO
       (cuando el viaje se arma en un municipio
        elegido en el mapa del estado)
    ------------------------------------------ */

    let fuente = datos;

    if (valorMunicipio) {
        const corto = valorMunicipio.trim().split(" ").pop();
        fuente = {
            hoteles: [
                {
                    nombre: "Hotel Central " + corto,
                    tipo: "Hotel",
                    ubicacion: "Centro, " + valorMunicipio,
                    descripcion: "Hospedaje cómodo y seguro en el corazón de " + valorMunicipio + ", " + datos.nombre + ".",
                    calificacion: "4.6",
                    precio: "$890"
                },
                {
                    nombre: "Cabañas y Suites " + corto,
                    tipo: "Cabañas",
                    ubicacion: "Zona tranquila, " + valorMunicipio,
                    descripcion: "Cabañas tradicionales con comida casera cerca del centro de " + valorMunicipio + ".",
                    calificacion: "4.4",
                    precio: "$640"
                }
            ],
            restaurantes: [
                {
                    nombre: "Fonda Doña " + corto,
                    tipo: "Fonda",
                    ubicacion: "Mercado, " + valorMunicipio,
                    descripcion: "Fonda tradicional con mole, tlayudas y comida casera de " + datos.nombre + ".",
                    calificacion: "4.7",
                    precio: "$180"
                },
                {
                    nombre: "Comedor " + corto,
                    tipo: "Restaurante",
                    ubicacion: "Plaza principal, " + valorMunicipio,
                    descripcion: "Restaurante familiar con los platillos típicos de " + datos.nombre + ".",
                    calificacion: "4.5",
                    precio: "$220"
                }
            ],
            lugares: datos.lugares
        };
    }

    destinoElegido.textContent = valorMunicipio
        ? `📍 ${valorMunicipio} · ${datos.nombre} · Capital: ${datos.capital}`
        : `📍 ${datos.nombre} · Capital: ${datos.capital}`;

    // Títulos de los pasos guiados.
    const donde = valorMunicipio || datos.nombre;
    const h2Paso1 = document.querySelector("#paso1 h2");
    const h2Paso2 = document.querySelector("#paso2 h2");
    if (valorMunicipio) {
        h2Paso1.textContent = `Paso 1 · ¿En dónde te hospedas en ${valorMunicipio}?`;
        h2Paso2.textContent = `Paso 2 · ¿Qué quieres comer en ${valorMunicipio}?`;
    }

    /* ------------------------------------------
       SELECCIÓN DEL USUARIO
    ------------------------------------------ */

    const plan = {
        estado: valorEstado,
        nombre: datos.nombre,
        municipio: valorMunicipio,
        hotel: null,
        noches: 1,
        habitaciones: 1,
        restaurante: null,
        viajeros: 1,
        comidas: 1,
        lugares: []
    };

    /* ------------------------------------------
       PASOS
    ------------------------------------------ */

    const TOTAL_PASOS = 4;
    let pasoActual = 1;

    const indicadores = Array.from(document.querySelectorAll(".paso-ind"));
    const pasos = Array.from(document.querySelectorAll(".paso"));
    const btnAtras = document.getElementById("btnAtras");
    const btnSiguiente = document.getElementById("btnSiguiente");
    const avisoSeleccion = document.getElementById("avisoSeleccion");

    /* ------------------------------------------
       PINTAR TARJETAS
    ------------------------------------------ */

    const tarjetasHoteles = document.getElementById("tarjetasHoteles");
    const tarjetasRestaurantes = document.getElementById("tarjetasRestaurantes");
    const tarjetasLugares = document.getElementById("tarjetasLugares");
    const nochesHospedaje = document.getElementById("nochesHospedaje");
    const calculoHospedaje = document.getElementById("calculoHospedaje");

    function pintarHoteles() {
        fuente.hoteles.forEach((hotel) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta";
            tarjeta.innerHTML =
                `<span class="tipo-etiqueta">${hotel.tipo}</span>` +
                `<h3>${hotel.nombre}</h3>` +
                `<p class="ubicacion">📍 ${hotel.ubicacion}</p>` +
                `<p class="descripcion">${hotel.descripcion}</p>` +
                `<p class="pie"><span class="calificacion">★ <strong>${hotel.calificacion}</strong></span>` +
                `<span class="precio">desde <strong>${hotel.precio}</strong>/noche</span></p>`;
            tarjeta.addEventListener("click", () => {
                tarjetasHoteles.querySelectorAll(".tarjeta").forEach((item) =>
                    item.classList.remove("elegida")
                );
                tarjeta.classList.add("elegida");
                plan.hotel = hotel;
                avisoSeleccion.textContent = "";
                actualizarTotal();
            });
            tarjetasHoteles.appendChild(tarjeta);
        });
    }

    function pintarRestaurantes() {
        fuente.restaurantes.forEach((restaurante) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta";
            tarjeta.innerHTML =
                `<span class="tipo-etiqueta">${restaurante.tipo}</span>` +
                `<h3>${restaurante.nombre}</h3>` +
                `<p class="ubicacion">📍 ${restaurante.ubicacion}</p>` +
                `<p class="descripcion">${restaurante.descripcion}</p>` +
                `<p class="pie"><span class="calificacion">★ <strong>${restaurante.calificacion}</strong></span>` +
                `<span class="precio">desde <strong>${restaurante.precio}</strong>/persona</span></p>`;
            tarjeta.addEventListener("click", () => {
                tarjetasRestaurantes.querySelectorAll(".tarjeta").forEach((item) =>
                    item.classList.remove("elegida")
                );
                tarjeta.classList.add("elegida");
                plan.restaurante = restaurante;
                avisoSeleccion.textContent = "";
                actualizarTotal();
            });
            tarjetasRestaurantes.appendChild(tarjeta);
        });
    }

    function pintarLugares() {
        fuente.lugares.forEach((lugar) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta lugar";
            tarjeta.innerHTML =
                `<h3>${lugar.nombre}</h3>` +
                `<p class="descripcion">${lugar.descripcion}</p>`;
            tarjeta.addEventListener("click", () => {
                const indice = plan.lugares.indexOf(lugar);
                if (indice >= 0) {
                    plan.lugares.splice(indice, 1);
                    tarjeta.classList.remove("elegida");
                } else {
                    // Sin límite: elige todos los lugares que quieras.
                    plan.lugares.push(lugar);
                    tarjeta.classList.add("elegida");
                }
                avisoSeleccion.textContent = "";
                actualizarTotal();
            });
            tarjetasLugares.appendChild(tarjeta);
        });
    }

    pintarHoteles();
    pintarRestaurantes();
    pintarLugares();

    /* ------------------------------------------
       CÁLCULO DEL PRESUPUESTO EN VIVO
       (se actualiza mientras eliges)
    ------------------------------------------ */

    const totalBarra = document.getElementById("totalBarra");
    const calculadoraViaje = document.getElementById("calculadoraViaje");
    const cantidadViajeros = document.getElementById("cantidadViajeros");
    const cantidadHabitaciones = document.getElementById("cantidadHabitaciones");
    const cantidadComidas = document.getElementById("cantidadComidas");

    const numero = (precio) =>
        parseFloat(String(precio || "").replace(/[^\d.]/g, "")) || 0;

    const dinero = (valor) =>
        "$" + Math.round(valor).toLocaleString("es-MX");

    function actualizarTotal() {
        if (!totalBarra) {
            return;
        }
        let total = 0;
        if (plan.hotel) {
            const precioNoche = numero(plan.hotel.precio);
            const costoHospedaje = precioNoche * plan.noches * plan.habitaciones;
            total += costoHospedaje;
            calculoHospedaje.textContent =
                `${dinero(precioNoche)} por noche × ${plan.noches} ${plan.noches === 1 ? "noche" : "noches"} × ${plan.habitaciones} ${plan.habitaciones === 1 ? "habitación" : "habitaciones"} = ${dinero(costoHospedaje)} de hospedaje`;
        } else {
            calculoHospedaje.textContent = "Elige un hotel para calcular el costo de tu estancia.";
        }
        if (plan.restaurante) {
            total += numero(plan.restaurante.precio) * plan.viajeros * plan.comidas;
        }
        totalBarra.textContent =
            "💰 Total hasta ahora: " + dinero(total) +
            (plan.lugares.length ? ` · ${plan.lugares.length} lugar${plan.lugares.length > 1 ? "es" : ""}` : "");

        const costoHospedaje = plan.hotel
            ? numero(plan.hotel.precio) * plan.noches * plan.habitaciones
            : 0;
        const costoComidas = plan.restaurante
            ? numero(plan.restaurante.precio) * plan.viajeros * plan.comidas
            : 0;
        document.getElementById("costoCalculadoHotel").textContent = dinero(costoHospedaje);
        document.getElementById("costoCalculadoComidas").textContent = dinero(costoComidas);
        document.getElementById("costoCalculadoTotal").textContent = dinero(costoHospedaje + costoComidas);

        const costoHotelResumen = document.getElementById("resumenCostoHotel");
        if (costoHotelResumen && plan.hotel) {
            costoHotelResumen.textContent =
                `${dinero(numero(plan.hotel.precio))} × ${plan.noches} noches × ${plan.habitaciones} hab. = ${dinero(costoHospedaje)}`;
        }
        const costoComidasResumen = document.getElementById("resumenCostoComidas");
        if (costoComidasResumen && plan.restaurante) {
            costoComidasResumen.textContent =
                `${dinero(numero(plan.restaurante.precio))} × ${plan.viajeros} viajeros × ${plan.comidas} comidas = ${dinero(costoComidas)}`;
        }
        const costoTotalResumen = document.getElementById("resumenCostoTotal");
        if (costoTotalResumen) {
            costoTotalResumen.textContent = dinero(costoHospedaje + costoComidas);
        }
        const descripcionTotalResumen = document.getElementById("descripcionCostoTotal");
        if (descripcionTotalResumen) {
            descripcionTotalResumen.textContent =
                `${plan.noches} ${plan.noches === 1 ? "noche" : "noches"} · ${plan.viajeros} ${plan.viajeros === 1 ? "viajero" : "viajeros"} · ${plan.comidas} ${plan.comidas === 1 ? "comida" : "comidas"} por persona`;
        }

        if (pasoActual === TOTAL_PASOS) {
            localStorage.setItem("miravia_plan", JSON.stringify(plan));
            guardarViajeEnLista();
        }
    }

    nochesHospedaje.addEventListener("input", () => {
        const cantidad = Number(nochesHospedaje.value);
        if (nochesHospedaje.value === "" || !Number.isFinite(cantidad)) {
            return;
        }

        plan.noches = Math.max(1, Math.min(30, Math.trunc(cantidad)));
        nochesHospedaje.value = String(plan.noches);
        actualizarTotal();
    });

    [
        [cantidadViajeros, "viajeros", 20],
        [cantidadHabitaciones, "habitaciones", 10],
        [cantidadComidas, "comidas", 90]
    ].forEach(([control, propiedad, maximo]) => {
        control.addEventListener("input", () => {
            const cantidad = Number(control.value);
            if (control.value === "" || !Number.isFinite(cantidad)) {
                return;
            }

            plan[propiedad] = Math.max(1, Math.min(maximo, Math.trunc(cantidad)));
            control.value = String(plan[propiedad]);
            actualizarTotal();
        });
    });

    /* ------------------------------------------
       RESUMEN
    ------------------------------------------ */

    const resumenEstado = document.getElementById("resumenEstado");
    const itinerario = document.getElementById("itinerario");

    function pintarResumen() {
        resumenEstado.textContent = valorMunicipio || datos.nombre;

        cantidadViajeros.value = String(plan.viajeros);
        cantidadHabitaciones.value = String(plan.habitaciones);
        cantidadComidas.value = String(plan.comidas);

        const costoHotel = numero(plan.hotel.precio) * plan.noches * plan.habitaciones;
        const costoComida = numero(plan.restaurante.precio) * plan.viajeros * plan.comidas;

        itinerario.innerHTML =
            `<div class="bloque itinerario-hospedaje">` +
            `  <span class="icono">🏨</span>` +
            `  <div><h3>Hospedaje</h3>` +
            `  <p>${plan.hotel.nombre} — ${plan.hotel.ubicacion}</p></div>` +
            `  <span class="costo" id="resumenCostoHotel">${dinero(numero(plan.hotel.precio))} × ${plan.noches} noches × ${plan.habitaciones} hab. = ${dinero(costoHotel)}</span>` +
            `</div>` +
            `<div class="bloque itinerario-comida">` +
            `  <span class="icono">🍴</span>` +
            `  <div><h3>Comida</h3>` +
            `  <p>${plan.restaurante.nombre} — ${plan.restaurante.ubicacion}</p></div>` +
            `  <span class="costo" id="resumenCostoComidas">${dinero(numero(plan.restaurante.precio))} × ${plan.viajeros} viajeros × ${plan.comidas} comidas = ${dinero(costoComida)}</span>` +
            `</div>` +
            `<div class="bloque itinerario-lugares">` +
            `  <span class="icono">✨</span>` +
            `  <div><h3>Lugares a conocer</h3>` +
            `  <p>${plan.lugares.map((lugar) => lugar.nombre).join(" · ")}</p></div>` +
            `  <span class="costo">${plan.lugares.length} lugares</span>` +
            `</div>` +
            `<div class="bloque itinerario-total">` +
            `  <span class="icono">💰</span>` +
            `  <div><h3>Presupuesto estimado</h3>` +
            `  <p id="descripcionCostoTotal">${plan.noches} ${plan.noches === 1 ? "noche" : "noches"} · ${plan.viajeros} ${plan.viajeros === 1 ? "viajero" : "viajeros"} · ${plan.comidas} ${plan.comidas === 1 ? "comida" : "comidas"} por persona</p></div>` +
            `  <span class="costo total" id="resumenCostoTotal">${dinero(costoHotel + costoComida)}</span>` +
            `</div>`;

        actualizarTotal();

        // Mini mapa del estado en el resumen.
        const miniMapa = document.getElementById("miniMapa");
        if (miniMapa && !window.__miniMapaListo) {
            window.__miniMapaListo = true;
            const mapa = L.map("miniMapa", {
                attributionControl: false,
                scrollWheelZoom: false,
                dragging: true,
                zoomControl: false
            }).setView(datos.coords, 7);

            L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                maxZoom: 12,
                subdomains: "abc"
            }).addTo(mapa);

            L.circle(datos.coords, {
                radius: 45000,
                color: "#2f9a90",
                fillColor: "#7ef0c8",
                fillOpacity: 0.2,
                weight: 2
            }).addTo(mapa).bindPopup(`📍 ${datos.nombre}`);
        }
        window.setTimeout(() => {
            if (window.__miniMapaListo) {
                window.dispatchEvent(new Event("resize"));
            }
        }, 400);
    }

    /* ------------------------------------------
       CAMBIO DE PASO
    ------------------------------------------ */

    const ETIQUETA_SIGUIENTE = {
        1: "Siguiente · Elegir comida",
        2: "Siguiente · Elegir lugares",
        3: "Siguiente · Ver mi resumen",
        4: "¡Viaje armado!"
    };

    function pintarPaso() {
        pasos.forEach((paso, indice) => {
            paso.hidden = indice !== pasoActual - 1;
        });
        indicadores.forEach((ind, indice) => {
            ind.classList.toggle("activo", indice < pasoActual);
            ind.classList.toggle("actual", indice === pasoActual - 1);
        });
        btnAtras.disabled = pasoActual === 1;
        btnSiguiente.textContent = ETIQUETA_SIGUIENTE[pasoActual];
        if (pasoActual === 4) {
            btnSiguiente.disabled = false;
            pintarResumen();
            localStorage.setItem("miravia_plan", JSON.stringify(plan));
            guardarViajeEnLista();
        } else {
            btnSiguiente.disabled = false;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* Guarda el viaje terminado en la lista
       "Mis viajes" (sin duplicar el último). */
    function guardarViajeEnLista() {
        const costoHotel = numero(plan.hotel.precio) * plan.noches * plan.habitaciones;
        const costoComida = numero(plan.restaurante.precio) * plan.viajeros * plan.comidas;
        const viaje = {
            estado: valorEstado,
            nombre: datos.nombre,
            municipio: valorMunicipio,
            hotel: plan.hotel ? plan.hotel.nombre : "",
            noches: plan.noches,
            habitaciones: plan.habitaciones,
            precioPorNoche: plan.hotel ? dinero(numero(plan.hotel.precio)) : "",
            costoHospedaje: dinero(costoHotel),
            restaurante: plan.restaurante ? plan.restaurante.nombre : "",
            viajeros: plan.viajeros,
            comidas: plan.comidas,
            lugares: plan.lugares.map((lugar) => lugar.nombre),
            total: dinero(costoHotel + costoComida),
            fecha: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
        };
        let viajes = [];
        try {
            viajes = JSON.parse(localStorage.getItem("miravia_viajes")) || [];
        } catch (error) {
            viajes = [];
        }
        const firma = JSON.stringify(viaje);
        if (viajes.length && JSON.stringify(viajes[viajes.length - 1]) === firma) {
            return;
        }
        viajes.push(viaje);
        localStorage.setItem("miravia_viajes", JSON.stringify(viajes));
    }

    function validarPaso() {
        if (pasoActual === 1 && !plan.hotel) {
            avisoSeleccion.textContent = "Elige un hospedaje para continuar";
            return false;
        }
        if (pasoActual === 2 && !plan.restaurante) {
            avisoSeleccion.textContent = "Elige un restaurante para continuar";
            return false;
        }
        if (pasoActual === 3 && plan.lugares.length === 0) {
            avisoSeleccion.textContent = "Elige al menos un lugar para continuar";
            return false;
        }
        return true;
    }

    btnSiguiente.addEventListener("click", () => {
        if (pasoActual === TOTAL_PASOS) {
            calculadoraViaje.hidden = false;
            btnSiguiente.setAttribute("aria-expanded", "true");
            calculadoraViaje.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        if (!validarPaso()) {
            return;
        }
        pasoActual += 1;
        pintarPaso();
    });

    btnAtras.addEventListener("click", () => {
        if (pasoActual > 1) {
            pasoActual -= 1;
            pintarPaso();
        }
    });

    /* ------------------------------------------
       BOTONES FINALES
    ------------------------------------------ */

    document.getElementById("btnVerEstado").addEventListener("click", () => {
        localStorage.setItem("miravia_plan", JSON.stringify(plan));
        localStorage.setItem("miravia_estado", valorEstado);
        window.location.href =
            `../estados/estado.html?estado=${encodeURIComponent(valorEstado)}`;
    });

    document.getElementById("btnOtroViaje").addEventListener("click", () => {
        localStorage.removeItem("miravia_plan");
        // Viene de otra página pulsando destinos:
        // solo el mapa de México, sin la Tierra.
        window.location.href = "../../inicio.html?destinos=1";
    });

    /* ------------------------------------------
       LOGO → INICIO
    ------------------------------------------ */

    document.getElementById("logoMiravia").addEventListener("click", () => {
        window.location.href = "../../inicio.html";
    });

    pintarPaso();

});