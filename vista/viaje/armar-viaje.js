// ==========================================
// MIRAVIA · ARMAR VIAJE PASO A PASO
// Lugares → Hospedaje → Comida → Ruta → Resumen
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------------------------
       ESTADO ELEGIDO (de la URL)
    ------------------------------------------ */

    const parametros = new URLSearchParams(window.location.search);
    const valorEstado = parametros.get("estado") || localStorage.getItem("miravia_estado") || "oaxaca";
    const valorMunicipio = parametros.get("municipio") || "";
    const lugarInicial = parametros.get("lugar") || "";
    const regionInicial = parametros.get("region") || "";
    const hotelInicial = parametros.get("hotel") || "";
    const restauranteInicial = parametros.get("restaurante") || "";
    const latitudInicial = Number(parametros.get("lat"));
    const longitudInicial = Number(parametros.get("lon"));

    const datos = DATOS_ESTADOS.obtener(valorEstado);

    const destinoElegido = document.getElementById("destinoElegido");

    if (!datos) {
        destinoElegido.textContent = "No encontramos ese estado";
        return;
    }

    const fuente = datos;
    const hotelesCatalogo = Array.isArray(fuente.hoteles) ? fuente.hoteles : [];
    const restaurantesCatalogo = Array.isArray(fuente.restaurantes) ? fuente.restaurantes : [];
    let lugaresDisponibles = Array.isArray(fuente.lugares) ? fuente.lugares.slice() : [];

    try {
        const catalogoGuardado = JSON.parse(localStorage.getItem(`miravia_destinos_${valorEstado}`) || "null");
        if (catalogoGuardado && catalogoGuardado.estado === valorEstado && Array.isArray(catalogoGuardado.lugares)) {
            const lugaresUnicos = new Map();
            catalogoGuardado.lugares.concat(lugaresDisponibles).forEach((lugar) => {
                if (lugar && lugar.nombre) {
                    const clave = lugar.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    lugaresUnicos.set(clave, { ...(lugaresUnicos.get(clave) || {}), ...lugar });
                }
            });
            lugaresDisponibles = Array.from(lugaresUnicos.values());
        }
    } catch (error) {
        console.error("No se pudo cargar el catálogo de destinos guardado.", error);
    }

    const lugarEncontrado = lugaresDisponibles.find((lugar) =>
        lugar.nombre.toLocaleLowerCase("es").trim() === lugarInicial.toLocaleLowerCase("es").trim()
    ) || null;
    const lugarSeleccionado = lugarEncontrado
        ? {
            ...lugarEncontrado,
            region: lugarEncontrado.region || regionInicial,
            lat: parametros.has("lat") ? latitudInicial : lugarEncontrado.lat,
            lon: parametros.has("lon") ? longitudInicial : lugarEncontrado.lon
        }
        : null;
    const nombreDestino = lugarInicial || valorMunicipio || datos.nombre;
    const donde = lugarInicial || valorMunicipio || datos.nombre;
    destinoElegido.textContent = `📍 ${donde} · ${datos.nombre}`;

    function coincideConZona(opcion, lugar, municipio = "") {
        const zonaSeleccionada = lugar && lugar.region ? lugar.region : municipio;
        if (zonaSeleccionada && opcion.region &&
            opcion.region.toLocaleLowerCase("es").trim() === zonaSeleccionada.toLocaleLowerCase("es").trim()) {
            return true;
        }
        const ubicacion = String(opcion.ubicacion || "").toLocaleLowerCase("es");
        const nombreOpcion = String(opcion.nombre || "").toLocaleLowerCase("es");
        const destino = String(lugar && lugar.nombre || municipio || datos.nombre).toLocaleLowerCase("es").trim();
        const partesUbicacion = ubicacion.split(/[,·]/).map((parte) => parte.trim()).filter((parte) => parte.length > 2);
        return destino.length > 2 && (
            ubicacion.includes(destino) ||
            nombreOpcion.includes(destino) ||
            partesUbicacion.some((parte) => destino.includes(parte))
        );
    }

    const hotelesDisponibles = hotelesCatalogo.filter((opcion) =>
        coincideConZona(opcion, lugarSeleccionado, valorMunicipio)
    );
    const restaurantesDisponibles = restaurantesCatalogo.filter((opcion) =>
        coincideConZona(opcion, lugarSeleccionado, valorMunicipio)
    );
    document.querySelector("#paso2 h2").textContent = `Paso 2 · Hospedaje para tu viaje por ${donde}`;
    document.querySelector("#paso3 h2").textContent = `Paso 3 · Comida para tu viaje por ${donde}`;
    const lugaresPrecargados = lugarInicial
        ? lugaresDisponibles.filter((lugar) => lugar.nombre.toLocaleLowerCase("es").trim() === lugarInicial.toLocaleLowerCase("es").trim())
        : [];
    if (lugarInicial && !lugaresPrecargados.length) {
        lugaresPrecargados.push({
            nombre: lugarInicial,
            region: regionInicial,
            lat: parametros.has("lat") ? latitudInicial : undefined,
            lon: parametros.has("lon") ? longitudInicial : undefined
        });
    }
    const hotelPrecargado = hotelInicial
        ? hotelesDisponibles.find((hotel) => hotel.nombre.toLocaleLowerCase("es").trim() === hotelInicial.toLocaleLowerCase("es").trim()) || null
        : null;
    const restaurantePrecargado = restauranteInicial
        ? restaurantesDisponibles.find((restaurante) => restaurante.nombre.toLocaleLowerCase("es").trim() === restauranteInicial.toLocaleLowerCase("es").trim()) || null
        : null;

    /* ------------------------------------------
       SELECCIÓN DEL USUARIO
    ------------------------------------------ */

    const plan = {
        estado: valorEstado,
        nombre: datos.nombre,
        municipio: valorMunicipio,
        hotel: hotelPrecargado,
        noches: 1,
        habitaciones: 1,
        restaurante: restaurantePrecargado,
        viajeros: 1,
        comidas: 1,
        lugares: lugaresPrecargados
    };

    function actualizarOpcionesPorZona() {
        const zonas = plan.lugares.length
            ? plan.lugares
            : [{ nombre: valorMunicipio || datos.nombre }];
        const hotelesZona = hotelesCatalogo.filter((opcion) =>
            zonas.some((lugar) => coincideConZona(opcion, lugar, valorMunicipio))
        );
        const restaurantesZona = restaurantesCatalogo.filter((opcion) =>
            zonas.some((lugar) => coincideConZona(opcion, lugar, valorMunicipio))
        );
        if (plan.hotel && !hotelesZona.includes(plan.hotel)) plan.hotel = null;
        if (plan.restaurante && !restaurantesZona.includes(plan.restaurante)) plan.restaurante = null;
        hotelesDisponibles.splice(0, hotelesDisponibles.length, ...hotelesZona);
        restaurantesDisponibles.splice(0, restaurantesDisponibles.length, ...restaurantesZona);
        tarjetasHoteles.replaceChildren();
        tarjetasRestaurantes.replaceChildren();
        pintarHoteles();
        pintarRestaurantes();
        const destinos = zonas.map((lugar) => lugar.nombre).join(", ");
        document.querySelector("#paso2 h2").textContent = `Paso 2 · Hospedaje cerca de ${destinos}`;
        document.querySelector("#paso3 h2").textContent = `Paso 3 · Comida cerca de ${destinos}`;
        actualizarTotal();
    }

    /* ------------------------------------------
       PASOS
    ------------------------------------------ */

    const TOTAL_PASOS = 5;
    let pasoActual = lugarInicial ? 2 : 1;

    const indicadores = Array.from(document.querySelectorAll(".paso-ind"));
    const pasos = indicadores.map((indicador) =>
        document.getElementById(`paso${indicador.dataset.paso}`)
    );
    const btnAtras = document.getElementById("btnAtras");
    const btnSiguiente = document.getElementById("btnSiguiente");
    const avisoSeleccion = document.getElementById("avisoSeleccion");

    /* ------------------------------------------
       PINTAR TARJETAS
    ------------------------------------------ */

    const tarjetasHoteles = document.getElementById("tarjetasHoteles");
    const tarjetasRestaurantes = document.getElementById("tarjetasRestaurantes");
    const tarjetasLugares = document.getElementById("tarjetasLugares");
    const contadorLugares = document.getElementById("contadorLugares");
    const nochesHospedaje = document.getElementById("nochesHospedaje");
    const calculoHospedaje = document.getElementById("calculoHospedaje");

    function pintarHoteles() {
        if (!hotelesDisponibles.length) {
            tarjetasHoteles.textContent = `Todavía no hay hospedajes dados de alta cerca de ${nombreDestino}. Puedes continuar sin seleccionar uno.`;
            return;
        }
        hotelesDisponibles.forEach((hotel) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta hospedaje-card";
            tarjeta.setAttribute("role", "button");
            tarjeta.setAttribute("tabindex", "0");
            tarjeta.setAttribute("aria-pressed", String(plan.hotel === hotel));
            if (plan.hotel === hotel) tarjeta.classList.add("elegida");
            tarjeta.innerHTML =
                `<div class="hospedaje-foto"><img src="../../img/lugares/hotel.png" alt="" loading="lazy"><span class="tipo-etiqueta">${hotel.tipo}</span></div>` +
                `<div class="hospedaje-cuerpo"><h3>${hotel.nombre}</h3>` +
                `<p class="ubicacion">${hotel.ubicacion}</p>` +
                `<p class="descripcion">${hotel.descripcion}</p>` +
                `<div class="hospedaje-pie"><span class="calificacion">★ <strong>${hotel.calificacion}</strong><small> calificación</small></span>` +
                `<span class="precio"><small>Desde / noche</small><strong>${hotel.precio}</strong></span></div></div>`;

            const seleccionarHospedaje = () => {
                tarjetasHoteles.querySelectorAll(".tarjeta").forEach((item) =>
                    {
                        item.classList.remove("elegida");
                        item.setAttribute("aria-pressed", "false");
                    }
                );
                tarjeta.classList.add("elegida");
                tarjeta.setAttribute("aria-pressed", "true");
                plan.hotel = hotel;
                avisoSeleccion.textContent = "";
                actualizarTotal();
            };

            tarjeta.addEventListener("click", seleccionarHospedaje);
            tarjeta.addEventListener("keydown", (evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    seleccionarHospedaje();
                }
            });
            tarjetasHoteles.appendChild(tarjeta);
        });
    }

    function pintarRestaurantes() {
        if (!restaurantesDisponibles.length) {
            tarjetasRestaurantes.textContent = `Todavía no hay lugares de comida dados de alta cerca de ${nombreDestino}. Puedes continuar sin seleccionar uno.`;
            return;
        }
        restaurantesDisponibles.forEach((restaurante) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta";
            if (plan.restaurante === restaurante) tarjeta.classList.add("elegida");
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
        if (!lugaresDisponibles.length) {
            tarjetasLugares.textContent = `Aún no hay destinos cargados para ${datos.nombre}.`;
            return;
        }
        lugaresDisponibles.forEach((lugar) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta lugar";
            tarjeta.tabIndex = 0;
            tarjeta.setAttribute("role", "button");
            tarjeta.setAttribute("aria-pressed", String(plan.lugares.includes(lugar)));
            if (plan.lugares.includes(lugar)) tarjeta.classList.add("elegida");
            tarjeta.innerHTML =
                `<h3>${lugar.nombre}</h3>` +
                `<p class="descripcion">${lugar.descripcion || ""}</p>` +
                `${lugar.region ? `<p class="ubicacion">Región ${lugar.region}</p>` : ""}`;
            const alternarLugar = () => {
                const indice = plan.lugares.indexOf(lugar);
                if (indice >= 0) {
                    plan.lugares.splice(indice, 1);
                    tarjeta.classList.remove("elegida");
                    tarjeta.setAttribute("aria-pressed", "false");
                } else {
                    plan.lugares.push(lugar);
                    tarjeta.classList.add("elegida");
                    tarjeta.setAttribute("aria-pressed", "true");
                }
                contadorLugares.textContent = `Lugares seleccionados: ${plan.lugares.length}`;
                avisoSeleccion.textContent = "";
                actualizarOpcionesPorZona();
            };
            tarjeta.addEventListener("click", alternarLugar);
            tarjeta.addEventListener("keydown", (evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarLugar();
                }
            });
            tarjetasLugares.appendChild(tarjeta);
        });
        contadorLugares.textContent = `Lugares seleccionados: ${plan.lugares.length}`;
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
        const costoGasolina = calcularCostoGasolina();
        total += costoGasolina;
        totalBarra.textContent =
            "💰 Total hasta ahora: " + dinero(total) +
            (plan.lugares.length ? ` · ${plan.lugares.length} lugar${plan.lugares.length > 1 ? "es" : ""}` : "");

        const costoHospedaje = plan.hotel
            ? numero(plan.hotel.precio) * plan.noches * plan.habitaciones
            : 0;
        const costoComidas = plan.restaurante
            ? numero(plan.restaurante.precio) * plan.viajeros * plan.comidas
            : 0;
        const costoTraslado = costoGasolina;
        document.getElementById("filaGasolina").hidden =
            planRuta.modo !== "carro" || !planRuta.origen;
        document.getElementById("costoCalculadoHotel").textContent = dinero(costoHospedaje);
        document.getElementById("costoCalculadoComidas").textContent = dinero(costoComidas);
        document.getElementById("costoCalculadoGasolina").textContent = dinero(costoTraslado);
        document.getElementById("costoCalculadoTotal").textContent =
            dinero(costoHospedaje + costoComidas + costoTraslado);

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
            costoTotalResumen.textContent = dinero(costoHospedaje + costoComidas + costoTraslado);
        }
        const descripcionTotalResumen = document.getElementById("descripcionCostoTotal");
        if (descripcionTotalResumen) {
            descripcionTotalResumen.textContent =
                `${plan.noches} ${plan.noches === 1 ? "noche" : "noches"} · ${plan.viajeros} ${plan.viajeros === 1 ? "viajero" : "viajeros"} · ${plan.comidas} ${plan.comidas === 1 ? "comida" : "comidas"} por persona`;
        }

    }

    const aeropuertos = {
        aicm: { nombre: "Ciudad de México · AICM", coords: [19.4361, -99.0719] },
        gdl: { nombre: "Guadalajara · Aeropuerto Miguel Hidalgo", coords: [20.5218, -103.3112] },
        cun: { nombre: "Cancún · Aeropuerto Internacional", coords: [21.0365, -86.8771] },
        oax: { nombre: "Oaxaca · Aeropuerto Xoxocotlán", coords: [16.9999, -96.7266] },
        pxm: { nombre: "Puerto Escondido · Aeropuerto Internacional", coords: [15.8769, -97.0891] },
        hux: { nombre: "Huatulco · Aeropuerto Internacional", coords: [15.7753, -96.2626] },
        mty: { nombre: "Monterrey · Aeropuerto Mariano Escobedo", coords: [25.7785, -100.107] },
        tij: { nombre: "Tijuana · Aeropuerto Internacional", coords: [32.5411, -116.970] },
        pvr: { nombre: "Puerto Vallarta · Aeropuerto Internacional", coords: [20.6801, -105.2544] }
    };
    const destinoCoordenadas = parametros.has("lat") && parametros.has("lon") &&
        Number.isFinite(latitudInicial) && Number.isFinite(longitudInicial)
        ? [latitudInicial, longitudInicial]
        : lugarSeleccionado && Number.isFinite(Number(lugarSeleccionado.lat)) &&
            Number.isFinite(Number(lugarSeleccionado.lon || lugarSeleccionado.lng))
            ? [Number(lugarSeleccionado.lat), Number(lugarSeleccionado.lon || lugarSeleccionado.lng)]
            : datos.coords;
    const planRuta = { origen: null, modo: "urbano", distanciaKm: 0, duracionHoras: 0, calculada: false };
    const botonUbicacion = document.getElementById("btnUsarUbicacion");
    const aeropuertoLlegada = document.getElementById("aeropuertoLlegada");
    const modoTransporte = document.getElementById("modoTransporte");
    const recomendacionTransporte = document.getElementById("recomendacionTransporte");
    const textoOrigen = document.getElementById("rutaOrigen");
    const resultadoRuta = document.getElementById("rutaResultado");
    const panelGasolina = document.getElementById("panelGasolina");
    const rendimientoVehiculo = document.getElementById("rendimientoVehiculo");
    const resultadoGasolina = document.getElementById("costoGasolina");
    const PRECIO_GASOLINA_POR_LITRO = 24.5;
    let mapaRuta = null;
    let lineaRuta = null;
    let marcadoresRuta = [];

    function limpiarTrazoRuta() {
        if (!mapaRuta) return;
        if (lineaRuta) mapaRuta.removeLayer(lineaRuta);
        marcadoresRuta.forEach((marcador) => mapaRuta.removeLayer(marcador));
        lineaRuta = null;
        marcadoresRuta = [];
        document.getElementById("miniMapa").hidden = true;
    }

    function distanciaEnKm(origen, destino) {
        const radianes = (grados) => grados * Math.PI / 180;
        const latitud = radianes(destino[0] - origen[0]);
        const longitud = radianes(destino[1] - origen[1]);
        const a = Math.sin(latitud / 2) ** 2 +
            Math.cos(radianes(origen[0])) * Math.cos(radianes(destino[0])) *
            Math.sin(longitud / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function calcularCostoGasolina() {
        if (planRuta.modo !== "carro" || !planRuta.origen) {
            panelGasolina.hidden = true;
            resultadoGasolina.textContent = "";
            return 0;
        }
        panelGasolina.hidden = false;
        const rendimiento = Number(rendimientoVehiculo.value);
        if (!Number.isFinite(rendimiento) || rendimiento < 4 || rendimiento > 40) {
            resultadoGasolina.textContent = "Escribe un rendimiento entre 4 y 40 km por litro.";
            return 0;
        }
        const distanciaKm = planRuta.calculada && planRuta.modo === "carro"
            ? planRuta.distanciaKm
            : distanciaEnKm(planRuta.origen.coords, destinoCoordenadas) * 1.3;
        planRuta.distanciaKm = distanciaKm;
        const litros = distanciaKm / rendimiento;
        const costo = litros * PRECIO_GASOLINA_POR_LITRO;
        resultadoGasolina.textContent =
            `${Math.round(distanciaKm)} km aproximados · ${litros.toFixed(1)} litros · ${dinero(costo)} de gasolina`;
        return costo;
    }

    function dibujarRuta(origen, destino, coordenadasRuta, esAerea = false) {
        document.getElementById("miniMapa").hidden = false;
        if (!mapaRuta) {
            mapaRuta = L.map("miniMapa", {
                scrollWheelZoom: false,
                dragging: true,
                zoomControl: true
            });
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(mapaRuta);
        }
        if (lineaRuta) mapaRuta.removeLayer(lineaRuta);
        marcadoresRuta.forEach((marcador) => mapaRuta.removeLayer(marcador));
        lineaRuta = L.polyline(coordenadasRuta, {
            color: esAerea ? "#3986c7" : "#0e8e77",
            weight: 5,
            dashArray: esAerea ? "8 8" : null
        }).addTo(mapaRuta);
        const iconoMarcador = (clase, etiqueta) => L.divIcon({
            className: `marcador-ruta ${clase}`,
            html: `<span>${etiqueta}</span>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        marcadoresRuta = [
            L.marker(origen.coords, { icon: iconoMarcador("marcador-salida", "A") })
                .addTo(mapaRuta).bindPopup(`Salida: ${origen.nombre}`),
            L.marker(destino, { icon: iconoMarcador("marcador-destino", "B") })
                .addTo(mapaRuta).bindPopup(`Destino: ${nombreDestino}`)
        ];
        mapaRuta.fitBounds(lineaRuta.getBounds(), { padding: [24, 24] });
        window.setTimeout(() => mapaRuta.invalidateSize(), 200);
    }

    async function obtenerRutaVial(origen, destino) {
        const coordenadas = [
            `${origen.coords[1].toFixed(6)},${origen.coords[0].toFixed(6)}`,
            `${destino[1].toFixed(6)},${destino[0].toFixed(6)}`
        ].join(";");
        const respuesta = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`,
            { signal: AbortSignal.timeout(15000) }
        );
        if (!respuesta.ok) {
            throw new Error(`El servicio de rutas respondió con ${respuesta.status}.`);
        }
        const datosRuta = await respuesta.json();
        const ruta = datosRuta.routes && datosRuta.routes[0];
        if (datosRuta.code !== "Ok" || !ruta || !Array.isArray(ruta.geometry?.coordinates) ||
            ruta.geometry.coordinates.length < 2 || !Number.isFinite(ruta.distance) ||
            !Number.isFinite(ruta.duration)) {
            throw new Error("El servicio no devolvió una ruta vial válida.");
        }
        return {
            coordenadas: ruta.geometry.coordinates.map(([longitud, latitud]) => [latitud, longitud]),
            distanciaKm: ruta.distance / 1000,
            duracionHoras: ruta.duration / 3600
        };
    }

    async function presentarRuta() {
        const origen = planRuta.origen;
        if (!origen) {
            resultadoRuta.textContent = "Usa tu ubicación o elige un aeropuerto para continuar.";
            return;
        }

        planRuta.modo = modoTransporte.value;
        if (origen.esUbicacionActual && planRuta.modo === "carro") {
            planRuta.distanciaKm = distanciaEnKm(origen.coords, destinoCoordenadas) * 1.3;
            planRuta.calculada = true;
            resultadoRuta.textContent =
                "Calculamos la gasolina con una distancia aproximada en este dispositivo, sin enviar tu ubicación ni trazar el mapa.";
            limpiarTrazoRuta();
            calcularCostoGasolina();
            actualizarTotal();
            return;
        }
        if (origen.esUbicacionActual && planRuta.modo !== "carro" && planRuta.modo !== "avion") {
            resultadoRuta.textContent =
                "Para proteger tu privacidad, no enviaremos tu ubicación exacta a un servicio externo. " +
                "Elige un aeropuerto de la lista para trazar la ruta por carretera.";
            planRuta.calculada = false;
            limpiarTrazoRuta();
            return;
        }

        let distancia;
        let horas;
        let coordenadasRuta;
        const esAerea = planRuta.modo === "avion";
        if (esAerea) {
            distancia = distanciaEnKm(origen.coords, destinoCoordenadas);
            horas = 2 + distancia / 700;
            coordenadasRuta = [origen.coords, destinoCoordenadas];
        } else {
            const rutaVial = await obtenerRutaVial(origen, destinoCoordenadas);
            distancia = rutaVial.distanciaKm;
            horas = planRuta.modo === "camion"
                ? distancia * 1.35 / 55
                : planRuta.modo === "urbano"
                    ? distancia / 25
                    : rutaVial.duracionHoras;
            coordenadasRuta = rutaVial.coordenadas;
        }
        planRuta.distanciaKm = distancia;
        planRuta.duracionHoras = horas;
        planRuta.calculada = true;
        const duracion = horas < 1
            ? "menos de 1 hora"
            : `${Math.floor(horas)} h ${Math.round((horas % 1) * 60)} min`;
        const precisionDestino = parametros.has("lat") || lugarSeleccionado
            ? ""
            : " (ubicación aproximada al centro del estado)";
        const detalleRuta = esAerea
            ? `cerca de ${Math.round(distancia)} km en línea aérea`
            : `cerca de ${Math.round(distancia)} km por carretera`;
        const notaTransporte = planRuta.modo === "camion" || planRuta.modo === "urbano" || planRuta.modo === "taxi"
            ? " El tiempo y el trayecto son orientativos; no representan horarios ni tarifas del servicio."
            : "";
        resultadoRuta.textContent =
            `${origen.nombre} → ${nombreDestino}${precisionDestino}: ${detalleRuta}. ` +
            `En ${modoTransporte.options[modoTransporte.selectedIndex].text}: alrededor de ${duracion}.${notaTransporte}`;
        if (origen.esUbicacionActual) {
            limpiarTrazoRuta();
        } else {
            dibujarRuta(origen, destinoCoordenadas, coordenadasRuta, esAerea);
        }
        calcularCostoGasolina();
        actualizarTotal();
    }

    function recomendarTransporte() {
        if (!planRuta.origen) {
            recomendacionTransporte.textContent = "";
            return;
        }
        const distancia = distanciaEnKm(planRuta.origen.coords, destinoCoordenadas);
        const recomendado = distancia > 500
            ? "avion"
            : distancia > 80
                ? "camion"
                : "urbano";
        modoTransporte.value = recomendado;
        planRuta.modo = recomendado;
        planRuta.calculada = false;
        calcularCostoGasolina();
        const nombreModo = modoTransporte.options[modoTransporte.selectedIndex].text;
        recomendacionTransporte.textContent = `Por la distancia, te recomendamos: ${nombreModo}. Puedes elegir otra opción.`;
        actualizarTotal();
    }

    botonUbicacion.addEventListener("click", () => {
        if (!navigator.geolocation) {
            textoOrigen.textContent = "Este dispositivo no puede detectar la ubicación. Elige un aeropuerto de la lista.";
            return;
        }
        botonUbicacion.disabled = true;
        textoOrigen.textContent = "Buscando tu ubicación...";
        navigator.geolocation.getCurrentPosition((posicion) => {
            const coords = [posicion.coords.latitude, posicion.coords.longitude];
            const estaEnMexico = coords[0] >= 14 && coords[0] <= 33 &&
                coords[1] >= -119 && coords[1] <= -86;
            botonUbicacion.disabled = false;
            if (!estaEnMexico) {
                textoOrigen.textContent = "Parece que estás fuera de México. Elige el aeropuerto al que llegarás.";
                aeropuertoLlegada.focus();
                return;
            }
            aeropuertoLlegada.value = "";
            planRuta.origen = { nombre: "Tu ubicación actual", coords, esUbicacionActual: true };
            planRuta.calculada = false;
            textoOrigen.textContent = "Usaremos tu ubicación solo para calcular esta ruta en este dispositivo.";
            resultadoRuta.textContent = "";
            limpiarTrazoRuta();
            recomendarTransporte();
        }, (error) => {
            botonUbicacion.disabled = false;
            console.warn("No se pudo obtener la ubicación del dispositivo.", error);
            textoOrigen.textContent = error.code === error.PERMISSION_DENIED
                ? "No se autorizó la ubicación. Elige un aeropuerto de la lista."
                : "No se pudo detectar la ubicación. Elige un aeropuerto de la lista.";
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
    });

    aeropuertoLlegada.addEventListener("change", () => {
        const aeropuerto = aeropuertos[aeropuertoLlegada.value];
        planRuta.origen = aeropuerto
            ? { nombre: aeropuerto.nombre, coords: aeropuerto.coords }
            : null;
        planRuta.calculada = false;
        limpiarTrazoRuta();
        textoOrigen.textContent = aeropuerto
            ? `Punto de salida seleccionado: ${aeropuerto.nombre}.`
            : "También puedes elegir un aeropuerto de llegada.";
        resultadoRuta.textContent = "";
        recomendarTransporte();
    });

    modoTransporte.addEventListener("change", () => {
        resultadoRuta.textContent = "";
        planRuta.modo = modoTransporte.value;
        planRuta.calculada = false;
        limpiarTrazoRuta();
        document.getElementById("btnCalcularRuta").textContent =
            planRuta.modo === "carro" ? "Ver ruta por carretera (opcional)" : "Calcular ruta aproximada";
        if (planRuta.modo === "carro" && planRuta.origen) {
            resultadoRuta.textContent =
                "Puedes continuar sin trazar el mapa; te mostramos una estimación de gasolina.";
        }
        calcularCostoGasolina();
        actualizarTotal();
    });

    rendimientoVehiculo.addEventListener("input", actualizarTotal);

    const botonCalcularRuta = document.getElementById("btnCalcularRuta");
    botonCalcularRuta.addEventListener("click", async () => {
        if (!planRuta.origen) {
            resultadoRuta.textContent = "Primero usa tu ubicación o elige un aeropuerto.";
            return;
        }
        botonCalcularRuta.disabled = true;
        botonCalcularRuta.textContent = "Trazando la ruta...";
        try {
            await presentarRuta();
        } catch (error) {
            planRuta.calculada = false;
            console.error("No se pudo calcular la ruta por carretera.", error);
            resultadoRuta.textContent =
                "No se pudo trazar la ruta por carretera. Revisa tu conexión e inténtalo de nuevo.";
        } finally {
            botonCalcularRuta.disabled = false;
            botonCalcularRuta.textContent =
                planRuta.modo === "carro" ? "Ver ruta por carretera (opcional)" : "Calcular ruta aproximada";
        }
    });

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
        resumenEstado.textContent = nombreDestino;

        cantidadViajeros.value = String(plan.viajeros);
        cantidadHabitaciones.value = String(plan.habitaciones);
        cantidadComidas.value = String(plan.comidas);

        const costoHotel = plan.hotel
            ? numero(plan.hotel.precio) * plan.noches * plan.habitaciones
            : 0;
        const costoComida = plan.restaurante
            ? numero(plan.restaurante.precio) * plan.viajeros * plan.comidas
            : 0;

        itinerario.innerHTML =
            `<div class="bloque itinerario-hospedaje">` +
            `  <span class="icono">🏨</span>` +
            `  <div><h3>Hospedaje</h3>` +
            `  <p>${plan.hotel ? `${plan.hotel.nombre} — ${plan.hotel.ubicacion}` : "Sin hospedaje seleccionado"}</p></div>` +
            `  <span class="costo" id="resumenCostoHotel">${plan.hotel ? `${dinero(numero(plan.hotel.precio))} × ${plan.noches} noches × ${plan.habitaciones} hab. = ` : ""}${dinero(costoHotel)}</span>` +
            `</div>` +
            `<div class="bloque itinerario-comida">` +
            `  <span class="icono">🍴</span>` +
            `  <div><h3>Comida</h3>` +
            `  <p>${plan.restaurante ? `${plan.restaurante.nombre} — ${plan.restaurante.ubicacion}` : "Sin lugar de comida seleccionado"}</p></div>` +
            `  <span class="costo" id="resumenCostoComidas">${plan.restaurante ? `${dinero(numero(plan.restaurante.precio))} × ${plan.viajeros} viajeros × ${plan.comidas} comidas = ` : ""}${dinero(costoComida)}</span>` +
            `</div>` +
            `<div class="bloque itinerario-lugares">` +
            `  <span class="icono">✨</span>` +
            `  <div><h3>Lugares a conocer</h3>` +
            `  <p>${plan.lugares.map((lugar) => lugar.nombre).join(" · ")}</p></div>` +
            `  <span class="costo">${plan.lugares.length} lugares</span>` +
            `</div>` +
            `<div class="bloque itinerario-ruta">` +
            `  <span class="icono">🧭</span>` +
            `  <div><h3>Ruta de llegada</h3>` +
            `  <p>${planRuta.origen ? `${planRuta.origen.nombre} · ${modoTransporte.options[modoTransporte.selectedIndex].text} · ${Math.round(planRuta.distanciaKm)} km aproximados${planRuta.modo === "carro" ? ` · gasolina: ${dinero(calcularCostoGasolina())}` : ""}` : "Sin ruta calculada"}</p></div>` +
            `</div>` +
            `<div class="bloque itinerario-total">` +
            `  <span class="icono">💰</span>` +
            `  <div><h3>Presupuesto estimado</h3>` +
            `  <p id="descripcionCostoTotal">${plan.noches} ${plan.noches === 1 ? "noche" : "noches"} · ${plan.viajeros} ${plan.viajeros === 1 ? "viajero" : "viajeros"} · ${plan.comidas} ${plan.comidas === 1 ? "comida" : "comidas"} por persona</p></div>` +
            `  <span class="costo total" id="resumenCostoTotal">${dinero(costoHotel + costoComida + calcularCostoGasolina())}</span>` +
            `</div>`;

        actualizarTotal();

    }

    /* ------------------------------------------
       CAMBIO DE PASO
    ------------------------------------------ */

    const ETIQUETA_SIGUIENTE = {
        1: "Siguiente · Elegir hospedaje",
        2: "Siguiente · Elegir comida",
        3: "Siguiente · Calcular ruta",
        4: "Siguiente · Ver mi resumen"
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
        btnSiguiente.hidden = pasoActual === TOTAL_PASOS;
        if (pasoActual === 5) {
            pintarResumen();
        }
        if (pasoActual === 4 && mapaRuta) window.setTimeout(() => mapaRuta.invalidateSize(), 200);
        btnSiguiente.disabled = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function guardarViajeEnLista() {
        const costoHotel = plan.hotel ? numero(plan.hotel.precio) * plan.noches * plan.habitaciones : 0;
        const costoComida = plan.restaurante ? numero(plan.restaurante.precio) * plan.viajeros * plan.comidas : 0;
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
            origen: planRuta.origen ? planRuta.origen.nombre : "",
            transporte: planRuta.origen ? modoTransporte.value : "",
            distanciaAproximadaKm: planRuta.origen ? Math.round(planRuta.distanciaKm) : 0,
            costoGasolina: planRuta.modo === "carro" ? calcularCostoGasolina() : 0,
            lugares: plan.lugares.map((lugar) => lugar.nombre),
            total: dinero(costoHotel + costoComida + calcularCostoGasolina()),
            fecha: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
        };
        const contenido = localStorage.getItem("miravia_viajes");
        const viajes = contenido ? JSON.parse(contenido) : [];
        if (!Array.isArray(viajes)) {
            throw new Error("La lista de viajes guardados tiene un formato inválido.");
        }
        viajes.push(viaje);
        localStorage.setItem("miravia_viajes", JSON.stringify(viajes));
    }

    function validarPaso() {
        if (pasoActual === 1 && plan.lugares.length === 0) {
            avisoSeleccion.textContent = "Elige al menos un destino para continuar";
            return false;
        }
        if (pasoActual === 2 && !plan.hotel) {
            if (hotelesDisponibles.length) {
                avisoSeleccion.textContent = "Elige un hospedaje para continuar";
                return false;
            }
        }
        if (pasoActual === 3 && !plan.restaurante) {
            if (restaurantesDisponibles.length) {
                avisoSeleccion.textContent = "Elige un lugar para comer o continúa sin seleccionar uno";
                return false;
            }
        }
        if (pasoActual === 4 && planRuta.modo === "carro" && !planRuta.origen) {
            avisoSeleccion.textContent = "Elige un aeropuerto o usa tu ubicación para estimar la gasolina.";
            return false;
        }
        if (pasoActual === 4 && planRuta.modo === "carro" &&
            (!Number.isFinite(Number(rendimientoVehiculo.value)) ||
                Number(rendimientoVehiculo.value) < 4 || Number(rendimientoVehiculo.value) > 40)) {
            avisoSeleccion.textContent = "Escribe un rendimiento válido entre 4 y 40 km por litro.";
            return false;
        }
        if (pasoActual === 4 && planRuta.modo !== "carro" && !planRuta.calculada) {
            avisoSeleccion.textContent = "Calcula la ruta antes de continuar";
            return false;
        }
        return true;
    }

    btnSiguiente.addEventListener("click", () => {
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

    let viajeGuardado = false;
    const btnGuardarViaje = document.getElementById("btnGuardarViaje");
    btnGuardarViaje.addEventListener("click", () => {
        if (viajeGuardado) return;
        try {
            guardarViajeEnLista();
            viajeGuardado = true;
            btnGuardarViaje.textContent = "Viaje guardado ✓";
            btnGuardarViaje.disabled = true;
            document.getElementById("mensajeGuardarViaje").textContent =
                "Tu viaje quedó guardado en Mis viajes. El total es un estimado de hospedaje y comidas.";
        } catch (error) {
            console.error("No se pudo guardar el viaje.", error);
            document.getElementById("mensajeGuardarViaje").textContent =
                "No se pudo guardar el viaje. Revisa el almacenamiento del navegador e inténtalo de nuevo.";
        }
    });

    document.getElementById("btnVerEstado").addEventListener("click", () => {
        localStorage.setItem("miravia_estado", valorEstado);
        window.location.href =
            `../estados/estado.html?estado=${encodeURIComponent(valorEstado)}`;
    });

    pintarPaso();

});