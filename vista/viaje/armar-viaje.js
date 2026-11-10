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
    const normalizarZona = (valor) => String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/-/g, " ")
        .toLocaleLowerCase("es")
        .trim();
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
    const municipioEncontrado = lugaresDisponibles.find((lugar) =>
        lugar.nombre.toLocaleLowerCase("es").trim() === valorMunicipio.toLocaleLowerCase("es").trim()
    ) || null;
    const regionesConocidas = {
        "valles centrales": "Valles Centrales",
        "sierra norte": "Sierra Norte",
        "sierra sur": "Sierra Sur",
        "costa": "Costa",
        "istmo": "Istmo",
        "mixteca": "Mixteca",
        "canada": "Cañada"
    };
    const claveRegion = normalizarZona(regionInicial);
    const regionSeleccionada = regionesConocidas[claveRegion] ||
        (lugarEncontrado ? lugarEncontrado.region : "") ||
        (municipioEncontrado ? municipioEncontrado.region : "");
    if (regionSeleccionada) {
        lugaresDisponibles = lugaresDisponibles.filter((lugar) =>
            (lugar.region || "").toLocaleLowerCase("es").trim() === regionSeleccionada.toLocaleLowerCase("es").trim()
        );
    }
    const latitudReferencia = parametros.has("lat")
        ? latitudInicial
        : (lugarEncontrado || municipioEncontrado || {}).lat;
    const longitudReferencia = parametros.has("lon")
        ? longitudInicial
        : (lugarEncontrado || municipioEncontrado || {}).lon;
    const tieneCentroReferencia = Number.isFinite(latitudReferencia) &&
        Number.isFinite(Number(longitudReferencia));
    const distanciaEntreCoordenadas = (lat1, lon1, lat2, lon2) => {
        const radianes = (grados) => grados * Math.PI / 180;
        const deltaLatitud = radianes(lat2 - lat1);
        const deltaLongitud = radianes(lon2 - lon1);
        const a = Math.sin(deltaLatitud / 2) ** 2 +
            Math.cos(radianes(lat1)) * Math.cos(radianes(lat2)) *
            Math.sin(deltaLongitud / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    if (tieneCentroReferencia && (regionSeleccionada || valorMunicipio || lugarInicial)) {
        lugaresDisponibles = lugaresDisponibles.filter((lugar) => {
            const lat = Number(lugar.lat);
            const lon = Number(lugar.lon);
            return Number.isFinite(lat) && Number.isFinite(lon) &&
                distanciaEntreCoordenadas(Number(latitudReferencia), Number(longitudReferencia), lat, lon) <= 75;
        });
    }
    const lugarSeleccionado = lugarEncontrado
        ? {
            ...lugarEncontrado,
            region: lugarEncontrado.region || regionSeleccionada,
            lat: parametros.has("lat") ? latitudInicial : lugarEncontrado.lat,
            lon: parametros.has("lon") ? longitudInicial : lugarEncontrado.lon
        }
        : null;
    const zonaInicial = valorMunicipio || regionSeleccionada;
    let nombreDestino = lugarInicial || valorMunicipio || regionSeleccionada || datos.nombre;
    const donde = lugarInicial || valorMunicipio || datos.nombre;
    destinoElegido.textContent = `📍 ${donde} · ${datos.nombre}`;

    function coincideConZona(opcion, lugar, municipio = "") {
        const zonaSeleccionada = (lugar && lugar.region) || regionSeleccionada;
        if (zonaSeleccionada && opcion.region) {
            return normalizarZona(opcion.region) === normalizarZona(zonaSeleccionada);
        }
        const ubicacion = String(opcion.ubicacion || "").toLocaleLowerCase("es");
        const nombreOpcion = String(opcion.nombre || "").toLocaleLowerCase("es");
        const destino = String(lugar && lugar.nombre || municipio || zonaInicial || datos.nombre).toLocaleLowerCase("es").trim();
        const partesUbicacion = ubicacion.split(/[,·]/).map((parte) => parte.trim()).filter((parte) => parte.length > 2);
        return destino.length > 2 && (
            ubicacion.includes(destino) ||
            nombreOpcion.includes(destino) ||
            partesUbicacion.some((parte) => destino.includes(parte))
        );
    }

    const hotelesDisponibles = hotelesCatalogo.filter((opcion) =>
        coincideConZona(opcion, lugarSeleccionado || { nombre: zonaInicial, region: regionSeleccionada }, valorMunicipio)
    );
    const restaurantesDisponibles = restaurantesCatalogo.filter((opcion) =>
        coincideConZona(opcion, lugarSeleccionado || { nombre: zonaInicial, region: regionSeleccionada }, valorMunicipio)
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
            : [{ nombre: zonaInicial || datos.nombre, region: regionSeleccionada }];
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
    let pasoActual = 1;

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
            tarjetasLugares.textContent = `Aún no hay destinos cargados cerca de ${nombreDestino}.`;
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
                actualizarDestinoRuta();
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

    if (regionSeleccionada) {
        const descripcionPasoLugares = document.querySelector("#paso1 .paso-descripcion");
        if (descripcionPasoLugares) {
            descripcionPasoLugares.textContent = `Lugares cercanos a ${donde} en la región ${regionSeleccionada}.`;
        }
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
            planRuta.modo !== "carro" || !obtenerOrigenRecorrido();
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
        nlu: { nombre: "Santa Lucía · AIFA", coords: [19.7553, -99.0164] },
        pbc: { nombre: "Puebla · Hermanos Serdán", coords: [19.1581, -98.3714] },
        gdl: { nombre: "Guadalajara · Aeropuerto Miguel Hidalgo", coords: [20.5218, -103.3112] },
        bjx: { nombre: "León · Aeropuerto del Bajío", coords: [20.9935, -101.4808] },
        qro: { nombre: "Querétaro · Aeropuerto Intercontinental", coords: [20.6173, -100.1857] },
        cun: { nombre: "Cancún · Aeropuerto Internacional", coords: [21.0365, -86.8771] },
        oax: { nombre: "Oaxaca · Aeropuerto Xoxocotlán", coords: [16.9999, -96.7266] },
        pxm: { nombre: "Puerto Escondido · Aeropuerto Internacional", coords: [15.8769, -97.0891] },
        hux: { nombre: "Huatulco · Aeropuerto Internacional", coords: [15.7753, -96.2626] },
        mty: { nombre: "Monterrey · Aeropuerto Mariano Escobedo", coords: [25.7785, -100.107] },
        tij: { nombre: "Tijuana · Aeropuerto Internacional", coords: [32.5411, -116.970] },
        pvr: { nombre: "Puerto Vallarta · Aeropuerto Internacional", coords: [20.6801, -105.2544] },
        mid: { nombre: "Mérida · Aeropuerto Internacional", coords: [20.9369, -89.6577] },
        ver: { nombre: "Veracruz · Aeropuerto Internacional", coords: [19.1459, -96.1873] },
        tgz: { nombre: "Tuxtla Gutiérrez · Aeropuerto Ángel Albino Corzo", coords: [16.5636, -93.0225] },
        aca: { nombre: "Acapulco · Aeropuerto Internacional", coords: [16.7571, -99.7537] },
        sjd: { nombre: "Los Cabos · Aeropuerto Internacional", coords: [23.1518, -109.721] }
    };
    const terminalesAutobus = [
        { nombre: "Terminal TAPO", coords: [19.4259, -99.1131] },
        { nombre: "Central del Norte", coords: [19.4780, -99.1400] },
        { nombre: "Terminal CAPU · Puebla", coords: [19.0760, -98.2067] },
        { nombre: "Central Nueva · Guadalajara", coords: [20.6408, -103.3100] },
        { nombre: "Central de Autobuses · León", coords: [21.1220, -101.6820] },
        { nombre: "Central de Autobuses · Querétaro", coords: [20.5930, -100.3920] },
        { nombre: "Central de Autobuses · Monterrey", coords: [25.6790, -100.3160] },
        { nombre: "Central de Autobuses · Tijuana", coords: [32.5020, -116.9730] },
        { nombre: "Central de Autobuses · Puerto Vallarta", coords: [20.6520, -105.2360] },
        { nombre: "Terminal ADO · Cancún", coords: [21.1619, -86.8515] },
        { nombre: "Central de Autobuses · Oaxaca", coords: [17.0666, -96.7267] },
        { nombre: "Terminal de Autobuses · Puerto Escondido", coords: [15.8615, -97.0730] },
        { nombre: "Terminal de Autobuses · Huatulco", coords: [15.7696, -96.1280] },
        { nombre: "Central de Autobuses · Mérida", coords: [20.9750, -89.6260] },
        { nombre: "Central de Autobuses · Veracruz", coords: [19.2030, -96.1380] },
        { nombre: "Central de Autobuses · Tuxtla Gutiérrez", coords: [16.7520, -93.1170] },
        { nombre: "Central de Autobuses · Acapulco", coords: [16.8630, -99.8960] },
        { nombre: "Central de Autobuses · San José del Cabo", coords: [23.0620, -109.6970] }
    ];
    let destinoCoordenadas = parametros.has("lat") && parametros.has("lon") &&
        Number.isFinite(latitudInicial) && Number.isFinite(longitudInicial)
        ? [latitudInicial, longitudInicial]
        : lugarSeleccionado && Number.isFinite(Number(lugarSeleccionado.lat)) &&
            Number.isFinite(Number(lugarSeleccionado.lon || lugarSeleccionado.lng))
            ? [Number(lugarSeleccionado.lat), Number(lugarSeleccionado.lon || lugarSeleccionado.lng)]
            : datos.coords;
    const planRuta = {
        origen: null,
        puntoInicio: null,
        modo: "urbano",
        distanciaKm: 0,
        duracionHoras: 0,
        calculada: false,
        descripcionTransporte: "",
        tramos: [],
        paradas: []
    };
    const botonUbicacion = document.getElementById("btnUsarUbicacion");
    const aeropuertoLlegada = document.getElementById("aeropuertoLlegada");
    const inicioRecorrido = document.getElementById("inicioRecorrido");
    const modoTransporte = document.getElementById("modoTransporte");
    const recomendacionTransporte = document.getElementById("recomendacionTransporte");
    const opcionesRuta = document.getElementById("opcionesRuta");
    const textoOrigen = document.getElementById("rutaOrigen");
    const resultadoRuta = document.getElementById("rutaResultado");
    const panelGasolina = document.getElementById("panelGasolina");
    const rendimientoVehiculo = document.getElementById("rendimientoVehiculo");
    const resultadoGasolina = document.getElementById("costoGasolina");
    const PRECIO_GASOLINA_POR_LITRO = 24.5;
    let mapaRuta = null;
    let lineaRuta = null;
    let lineaProgresoRuta = null;
    let marcadorVehiculoRuta = null;
    let animacionRutaId = null;
    let marcadoresRuta = [];

    function limpiarTrazoRuta() {
        if (!mapaRuta) return;
        if (animacionRutaId !== null) {
            window.cancelAnimationFrame(animacionRutaId);
            animacionRutaId = null;
        }
        if (lineaRuta) mapaRuta.removeLayer(lineaRuta);
        if (lineaProgresoRuta) mapaRuta.removeLayer(lineaProgresoRuta);
        if (marcadorVehiculoRuta) mapaRuta.removeLayer(marcadorVehiculoRuta);
        marcadoresRuta.forEach((marcador) => mapaRuta.removeLayer(marcador));
        lineaRuta = null;
        lineaProgresoRuta = null;
        marcadorVehiculoRuta = null;
        marcadoresRuta = [];
        document.getElementById("miniMapa").hidden = true;
        document.getElementById("animacionRuta").textContent = "";
    }

    function actualizarDestinoRuta() {
        const lugarPrincipal = plan.lugares[0] || null;
        nombreDestino = lugarPrincipal ? lugarPrincipal.nombre : valorMunicipio || datos.nombre;
        const latitud = Number(lugarPrincipal && lugarPrincipal.lat);
        const longitud = Number(lugarPrincipal && (lugarPrincipal.lon || lugarPrincipal.lng));
        if (lugarPrincipal && Number.isFinite(latitud) && Number.isFinite(longitud)) {
            destinoCoordenadas = [latitud, longitud];
        } else if (!lugarPrincipal && !lugarInicial && parametros.has("lat") && parametros.has("lon") &&
            Number.isFinite(latitudInicial) && Number.isFinite(longitudInicial)) {
            destinoCoordenadas = [latitudInicial, longitudInicial];
        } else {
            destinoCoordenadas = datos.coords;
        }
        destinoElegido.textContent = `📍 ${nombreDestino} · ${datos.nombre}`;
        planRuta.calculada = false;
        planRuta.puntoInicio = null;
        planRuta.descripcionTransporte = "";
        planRuta.tramos = [];
        planRuta.paradas = [];
        resultadoRuta.textContent = "";
        recomendacionTransporte.textContent = "";
        opcionesRuta.textContent = "";
        actualizarOpcionesInicio();
        limpiarTrazoRuta();
    }

    function actualizarOpcionesInicio() {
        const lugarActual = inicioRecorrido.value.startsWith("lugar:")
            ? inicioRecorrido.value.slice(6)
            : "";
        const opciones = [new Option(
            `Desde donde llegué${planRuta.origen ? ` · ${planRuta.origen.nombre}` : ""}`,
            "llegada"
        )];
        plan.lugares.forEach((lugar) => {
            opciones.push(new Option(`Desde ${lugar.nombre}`, `lugar:${lugar.nombre}`));
        });
        inicioRecorrido.replaceChildren(...opciones);
        inicioRecorrido.value = lugarActual && plan.lugares.some((lugar) => lugar.nombre === lugarActual)
            ? `lugar:${lugarActual}`
            : "llegada";
    }

    function coordenadasDeLugar(lugar) {
        const latitud = Number(lugar && lugar.lat);
        const longitud = Number(lugar && (lugar.lon || lugar.lng));
        return Number.isFinite(latitud) && Number.isFinite(longitud)
            ? [latitud, longitud]
            : datos.coords;
    }

    function obtenerOrigenRecorrido() {
        if (inicioRecorrido.value.startsWith("lugar:")) {
            const nombre = inicioRecorrido.value.slice(6);
            const lugar = plan.lugares.find((opcion) => opcion.nombre === nombre);
            if (lugar) {
                return {
                    nombre: lugar.nombre,
                    coords: coordenadasDeLugar(lugar),
                    esPuntoDeVisita: true
                };
            }
        }
        return planRuta.origen;
    }

    function ordenarParadasDesde(origen) {
        const pendientes = plan.lugares
            .filter((lugar) => !origen.esPuntoDeVisita || lugar.nombre !== origen.nombre)
            .map((lugar) => ({ ...lugar, coords: coordenadasDeLugar(lugar) }));
        const ordenadas = [];
        let coordenadasActuales = origen.coords;
        while (pendientes.length) {
            let indiceCercano = 0;
            for (let indice = 1; indice < pendientes.length; indice += 1) {
                if (distanciaEnKm(coordenadasActuales, pendientes[indice].coords) <
                    distanciaEnKm(coordenadasActuales, pendientes[indiceCercano].coords)) {
                    indiceCercano = indice;
                }
            }
            const siguiente = pendientes.splice(indiceCercano, 1)[0];
            ordenadas.push(siguiente);
            coordenadasActuales = siguiente.coords;
        }
        return ordenadas;
    }

    actualizarOpcionesInicio();

    function distanciaEnKm(origen, destino) {
        const radianes = (grados) => grados * Math.PI / 180;
        const latitud = radianes(destino[0] - origen[0]);
        const longitud = radianes(destino[1] - origen[1]);
        const a = Math.sin(latitud / 2) ** 2 +
            Math.cos(radianes(origen[0])) * Math.cos(radianes(destino[0])) *
            Math.sin(longitud / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function formatearDuracion(horas) {
        const minutosTotales = Math.max(0, Math.round(horas * 60));
        const horasCompletas = Math.floor(minutosTotales / 60);
        const minutosRestantes = minutosTotales % 60;
        if (horasCompletas === 0) return `${minutosRestantes} min`;
        return minutosRestantes
            ? `${horasCompletas} h ${minutosRestantes} min`
            : `${horasCompletas} h`;
    }

    function calcularCostoGasolina() {
        const origen = obtenerOrigenRecorrido();
        if (planRuta.modo !== "carro" || !origen) {
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
        const destinos = ordenarParadasDesde(origen);
        const puntos = [origen.coords, ...destinos.map((lugar) => lugar.coords)];
        const distanciaEstimacion = puntos.slice(1).reduce((total, punto, indice) =>
            total + distanciaEnKm(puntos[indice], punto) * 1.3, 0);
        const distanciaKm = planRuta.calculada && planRuta.modo === "carro"
            ? planRuta.distanciaKm
            : distanciaEstimacion;
        planRuta.distanciaKm = distanciaKm;
        const litros = distanciaKm / rendimiento;
        const costo = litros * PRECIO_GASOLINA_POR_LITRO;
        resultadoGasolina.textContent =
            `${Math.round(distanciaKm)} km aproximados · ${litros.toFixed(1)} litros · ${dinero(costo)} de gasolina`;
        return costo;
    }

    function ilustracionVehiculo(modo) {
        const color = {
            urbano: "#ffb347",
            camion: "#e47735",
            taxi: "#f4c542",
            carro: "#3986c7"
        }[modo] || "#3986c7";
        if (modo === "avion") {
            return `<svg viewBox="0 0 72 56" aria-hidden="true">
                <path d="M34 4c2-3 6-3 8 0l5 20 19 10c3 2 2 6-2 6H48l-4 12-5-1-3-11H22l-5 7-4-1 2-10-9-3c-3-1-3-5 0-6l24-3z" fill="${color}" stroke="#174c66" stroke-width="2" stroke-linejoin="round"/>
                <path d="M34 18c2-4 8-4 10 0l1 7H33z" fill="#bdefff" stroke="#174c66" stroke-width="1.5"/>
                <circle cx="39" cy="18" r="3.5" fill="#f3ba8c"/><path d="M35 17c1-5 8-5 9 0z" fill="#fff"/>
            </svg>`;
        }
        const esAutobus = modo === "camion" || modo === "urbano";
        const carroceria = esAutobus
            ? `<path d="M9 24h48l-3-11a5 5 0 0 0-5-4H18a5 5 0 0 0-5 4z" fill="${color}" stroke="#174c66" stroke-width="2"/>
                <path d="M17 13h13v9H15zm17 0h13l3 9H34z" fill="#d8f4fb" stroke="#174c66" stroke-width="1.5"/>
                <path d="M15 27h42v9H15z" fill="${color}" stroke="#174c66" stroke-width="2"/>`
            : `<path d="M8 29l4-10a6 6 0 0 1 6-4h23l11 9 8 2 4 7v5H8z" fill="${color}" stroke="#174c66" stroke-width="2" stroke-linejoin="round"/>
                <path d="M19 18h20l9 8H16z" fill="#d8f4fb" stroke="#174c66" stroke-width="1.5"/>
                <path d="M47 27h8l5 5H47z" fill="#d8f4fb" stroke="#174c66" stroke-width="1.5"/>`;
        return `<svg viewBox="0 0 72 56" aria-hidden="true">
            <ellipse cx="37" cy="45" rx="28" ry="4" fill="#123b36" opacity=".16"/>
            ${carroceria}
            <circle cx="29" cy="19" r="4" fill="#f3ba8c" stroke="#174c66" stroke-width="1"/>
            <path d="M25 18c1-5 8-5 9 0z" fill="#34495e"/>
            <path d="M28 24l7 4" stroke="#174c66" stroke-width="2" stroke-linecap="round"/>
            <circle cx="20" cy="39" r="6" fill="#23323a" stroke="#fff" stroke-width="2"/>
            <circle cx="51" cy="39" r="6" fill="#23323a" stroke="#fff" stroke-width="2"/>
            <circle cx="20" cy="39" r="2" fill="#cbd5d8"/><circle cx="51" cy="39" r="2" fill="#cbd5d8"/>
            <path d="M59 30h5v5h-5" fill="#fff1a6"/>
            ${modo === "taxi" ? `<rect x="29" y="8" width="14" height="5" rx="2" fill="#fff" stroke="#174c66"/><text x="36" y="12" text-anchor="middle" font-size="4" font-weight="bold" fill="#174c66">TAXI</text>` : ""}
        </svg>`;
    }

    function animarVehiculo(coordenadas, modo, nombreLlegada = nombreDestino) {
        const textoAnimacion = document.getElementById("animacionRuta");
        const iconoVehiculo = L.divIcon({
            className: "vehiculo-ruta",
            html: `<span class="vehiculo-arte" role="img" aria-label="${modoTransporte.options[modoTransporte.selectedIndex].text}">${ilustracionVehiculo(modo)}</span>`,
            iconSize: [60, 52],
            iconAnchor: [30, 26]
        });
        marcadorVehiculoRuta = L.marker(coordenadas[0], {
            icon: iconoVehiculo,
            interactive: false,
            zIndexOffset: 1000
        }).addTo(mapaRuta);

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            marcadorVehiculoRuta.setLatLng(coordenadas[coordenadas.length - 1]);
            lineaProgresoRuta.setLatLngs(coordenadas);
            textoAnimacion.textContent = "Ruta trazada. La animación está desactivada por la preferencia de movimiento reducido.";
            return;
        }

        const distanciasAcumuladas = [0];
        for (let indice = 1; indice < coordenadas.length; indice += 1) {
            distanciasAcumuladas.push(
                distanciasAcumuladas[indice - 1] +
                distanciaEnKm(coordenadas[indice - 1], coordenadas[indice])
            );
        }
        const distanciaTotal = distanciasAcumuladas[distanciasAcumuladas.length - 1];
        const duracionAnimacion = 8000;
        let instanteInicio = null;
        textoAnimacion.textContent = `Tu transporte va recorriendo la ruta hacia ${nombreLlegada}.`;

        if (distanciaTotal === 0) {
            marcadorVehiculoRuta.setLatLng(coordenadas[coordenadas.length - 1]);
            lineaProgresoRuta.setLatLngs(coordenadas);
            textoAnimacion.textContent = `Tu transporte llegó a ${nombreLlegada}.`;
            return;
        }

        const avanzar = (instante) => {
            if (instanteInicio === null) instanteInicio = instante;
            const avance = Math.min((instante - instanteInicio) / duracionAnimacion, 1);
            const distanciaActual = distanciaTotal * avance;
            let bajo = 0;
            let alto = distanciasAcumuladas.length - 1;
            while (bajo < alto) {
                const medio = Math.ceil((bajo + alto) / 2);
                if (distanciasAcumuladas[medio] < distanciaActual) bajo = medio;
                else alto = medio - 1;
            }
            const indiceSiguiente = Math.min(bajo + 1, coordenadas.length - 1);
            const tramo = distanciasAcumuladas[indiceSiguiente] - distanciasAcumuladas[bajo];
            const proporcion = tramo > 0
                ? Math.min((distanciaActual - distanciasAcumuladas[bajo]) / tramo, 1)
                : 0;
            const posicion = [
                coordenadas[bajo][0] + (coordenadas[indiceSiguiente][0] - coordenadas[bajo][0]) * proporcion,
                coordenadas[bajo][1] + (coordenadas[indiceSiguiente][1] - coordenadas[bajo][1]) * proporcion
            ];
            marcadorVehiculoRuta.setLatLng(posicion);
            const puntoActual = mapaRuta.latLngToLayerPoint(coordenadas[bajo]);
            const puntoSiguiente = mapaRuta.latLngToLayerPoint(coordenadas[indiceSiguiente]);
            const rotacion = Math.atan2(
                puntoSiguiente.y - puntoActual.y,
                puntoSiguiente.x - puntoActual.x
            ) * 180 / Math.PI;
            const elementoVehiculo = marcadorVehiculoRuta.getElement();
            if (elementoVehiculo) {
                const arte = elementoVehiculo.querySelector(".vehiculo-arte");
                if (arte) arte.style.transform = `rotate(${rotacion}deg)`;
            }
            lineaProgresoRuta.setLatLngs(coordenadas.slice(0, bajo + 1).concat([posicion]));

            if (avance < 1) {
                animacionRutaId = window.requestAnimationFrame(avanzar);
            } else {
                animacionRutaId = null;
                textoAnimacion.textContent = `Tu transporte llegó a ${nombreLlegada}.`;
            }
        };
        animacionRutaId = window.requestAnimationFrame(avanzar);
    }

    function dibujarRuta(origen, destino, coordenadasRuta, esAerea = false, nombreDestinoRuta = nombreDestino, paradasRuta = []) {
        document.getElementById("miniMapa").hidden = false;
        const rutaSuavizada = coordenadasRuta.filter((_, indice) =>
            indice === 0 || indice === coordenadasRuta.length - 1 ||
            indice % Math.max(1, Math.ceil(coordenadasRuta.length / 300)) === 0
        );
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
        if (lineaProgresoRuta) mapaRuta.removeLayer(lineaProgresoRuta);
        if (marcadorVehiculoRuta) mapaRuta.removeLayer(marcadorVehiculoRuta);
        if (animacionRutaId !== null) {
            window.cancelAnimationFrame(animacionRutaId);
            animacionRutaId = null;
        }
        marcadoresRuta.forEach((marcador) => mapaRuta.removeLayer(marcador));
        const colorRuta = esAerea ? "#3986c7" : "#0e8e77";
        lineaRuta = L.polyline(rutaSuavizada, {
            color: colorRuta,
            opacity: 0.25,
            weight: 5,
            dashArray: esAerea ? "8 8" : null
        }).addTo(mapaRuta);
        lineaProgresoRuta = L.polyline([rutaSuavizada[0]], {
            color: colorRuta,
            weight: 6,
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
                .addTo(mapaRuta).bindPopup(`Destino: ${nombreDestinoRuta}`),
            ...paradasRuta.map((parada, indice) =>
                L.marker(parada.coords, {
                    icon: iconoMarcador(parada.tipo === "visita" ? "marcador-visita" : "marcador-transbordo", String(indice + 1))
                }).addTo(mapaRuta).bindPopup(`${parada.tipo === "visita" ? "Parada" : "Transbordo"}: ${parada.nombre}`)
            )
        ];
        mapaRuta.fitBounds(lineaRuta.getBounds(), { padding: [32, 32] });
        window.setTimeout(() => mapaRuta.invalidateSize(), 200);
        animarVehiculo(rutaSuavizada, planRuta.modo, nombreDestinoRuta);
    }

    async function obtenerRutaVialPuntos(puntos) {
        if (puntos.length < 2) {
            return { coordenadas: puntos, distanciaKm: 0, duracionHoras: 0 };
        }
        const coordenadas = puntos
            .map((punto) => `${punto[1].toFixed(6)},${punto[0].toFixed(6)}`)
            .join(";");
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

    async function obtenerRutaVial(origen, destino) {
        return obtenerRutaVialPuntos([origen.coords, destino]);
    }

    function puntoCercano(opciones, coordenadas) {
        return opciones
            .map((opcion) => ({
                ...opcion,
                distancia: distanciaEnKm(opcion.coords, coordenadas)
            }))
            .sort((primero, segundo) => primero.distancia - segundo.distancia)[0];
    }

    async function obtenerTramoDeConexion(origen, destino) {
        if (distanciaEnKm(origen.coords, destino) < 0.5) {
            return { coordenadas: [origen.coords, destino], distanciaKm: 0, duracionHoras: 0 };
        }
        try {
            return await obtenerRutaVial(origen, destino);
        } catch (error) {
            const distanciaKm = distanciaEnKm(origen.coords, destino) * 1.3;
            return {
                coordenadas: [origen.coords, destino],
                distanciaKm,
                duracionHoras: distanciaKm / 45,
                aproximada: true
            };
        }
    }

    async function calcularRutaConTerminales(origen, destino, modoLocal, nombrePuntoDestino) {
        const terminalSalida = puntoCercano(terminalesAutobus, origen.coords);
        let terminalLlegada = puntoCercano(terminalesAutobus, destino);
        if (distanciaEnKm(terminalSalida.coords, terminalLlegada.coords) < 3 &&
            distanciaEnKm(origen.coords, destino) > 15) {
            terminalLlegada = {
                nombre: `Punto de descenso cercano a ${nombrePuntoDestino} (aproximado)`,
                coords: destino
            };
        }
        const origenTerminal = { nombre: terminalSalida.nombre, coords: terminalSalida.coords };
        const llegadaTerminal = { nombre: terminalLlegada.nombre, coords: terminalLlegada.coords };
        const tramos = await Promise.all([
            obtenerTramoDeConexion(origen, terminalSalida.coords),
            obtenerTramoDeConexion(origenTerminal, terminalLlegada.coords),
            obtenerTramoDeConexion(llegadaTerminal, destino)
        ]);
        const coordenadas = tramos.flatMap((tramo, indice) =>
            indice === 0 ? tramo.coordenadas : tramo.coordenadas.slice(1)
        );
        const distanciaKm = tramos.reduce((total, tramo) => total + tramo.distanciaKm, 0);
        const duracionHoras = tramos.reduce((total, tramo) => total + tramo.duracionHoras, 0) + 0.5;
        const nombreLocal = modoLocal === "taxi" ? "taxi" : "combi";
        const aeropuertoLlegada = puntoCercano(Object.values(aeropuertos), destino);
        const descripcion = `${nombreLocal} + autobús + ${nombreLocal}`;
        const resumenTramos = [
            `${nombreLocal} a ${terminalSalida.nombre} (~${Math.round(tramos[0].distanciaKm)} km, ~${formatearDuracion(tramos[0].duracionHoras)})`,
            `autobús a ${terminalLlegada.nombre} (~${Math.round(tramos[1].distanciaKm)} km, ~${formatearDuracion(tramos[1].duracionHoras)})`,
            `${nombreLocal} hasta ${nombrePuntoDestino} (~${Math.round(tramos[2].distanciaKm)} km, ~${formatearDuracion(tramos[2].duracionHoras)})`
        ];
        const aeropuertoAlternativo = `${aeropuertoLlegada.nombre}, a unos ${Math.round(aeropuertoLlegada.distancia)} km del destino`;
        return {
            coordenadas,
            distanciaKm,
            duracionHoras,
            descripcion,
            resumenTramos,
            paradas: [origenTerminal, llegadaTerminal],
            mensaje: `Conexión sugerida: ${resumenTramos.join(" → ")}. Si prefieres volar, el aeropuerto cercano es ${aeropuertoAlternativo}. Los puntos son aproximados; líneas de combi y horarios por confirmar.`
        };
    }

    async function calcularRutaCompleta(origen, destinos, modo) {
        const limiteLocal = { urbano: 35, taxi: 60 }[modo];
        const nombreLocal = modo === "taxi" ? "taxi" : "combi";
        const velocidadLocal = modo === "taxi" ? 35 : 25;
        const tramos = [];
        let puntoActual = origen;

        for (const destino of destinos) {
            const origenTramo = { nombre: puntoActual.nombre, coords: puntoActual.coords };
            let tramo;
            let conexion = false;
            const distanciaDirecta = distanciaEnKm(origenTramo.coords, destino.coords);
            const requiereConexion = (limiteLocal && distanciaDirecta > limiteLocal) ||
                (modo === "camion" && distanciaDirecta > 100);
            if (requiereConexion) {
                tramo = await calcularRutaConTerminales(
                    origenTramo,
                    destino.coords,
                    modo === "camion" ? "urbano" : modo,
                    destino.nombre
                );
                conexion = true;
            } else {
                const rutaVial = await obtenerRutaVial(origenTramo, destino.coords);
                const requiereConexionPorCarretera = (limiteLocal && rutaVial.distanciaKm > limiteLocal) ||
                    (modo === "camion" && rutaVial.distanciaKm > 100);
                if (requiereConexionPorCarretera) {
                    tramo = await calcularRutaConTerminales(
                        origenTramo,
                        destino.coords,
                        modo === "camion" ? "urbano" : modo,
                        destino.nombre
                    );
                    conexion = true;
                } else {
                    const esTramoLocal = Boolean(limiteLocal) ||
                        (modo === "camion" && distanciaDirecta <= 35);
                    const duracionTramo = esTramoLocal
                        ? rutaVial.distanciaKm / velocidadLocal
                        : rutaVial.duracionHoras;
                    const transporteTramo = modo === "camion" && distanciaDirecta <= 35
                        ? "combi"
                        : modo === "camion"
                            ? "autobús"
                            : modo === "carro"
                                ? "carro"
                                : nombreLocal;
                    tramo = {
                        coordenadas: rutaVial.coordenadas,
                        distanciaKm: rutaVial.distanciaKm,
                        duracionHoras: duracionTramo,
                        resumenTramos: [
                            `${transporteTramo} hasta ${destino.nombre} (~${Math.round(rutaVial.distanciaKm)} km, ~${formatearDuracion(duracionTramo)})`
                        ],
                        paradas: []
                    };
                }
            }
            tramos.push({ ...tramo, conexion });
            puntoActual = destino;
        }

        const distanciaKm = tramos.reduce((total, tramo) => total + tramo.distanciaKm, 0);
        const duracionHoras = tramos.reduce((total, tramo) => total + tramo.duracionHoras, 0);
        const coordenadas = tramos.flatMap((tramo, indice) =>
            indice === 0 ? tramo.coordenadas : tramo.coordenadas.slice(1)
        );
        const resumenTramos = tramos.flatMap((tramo) => tramo.resumenTramos);
        const paradas = tramos.flatMap((tramo) => tramo.paradas);
        const hayConexiones = tramos.some((tramo) => tramo.conexion);
        const visitasIntermedias = destinos.slice(0, -1).map((lugar, indice) => ({
            nombre: lugar.nombre,
            coords: lugar.coords,
            tipo: "visita",
            indice: indice + 1
        }));

        return {
            coordenadas: coordenadas.length ? coordenadas : [origen.coords],
            distanciaKm,
            duracionHoras,
            resumenTramos,
            paradas: paradas.concat(visitasIntermedias),
            descripcion: hayConexiones
                ? `${nombreLocal} + autobús + ${nombreLocal} entre paradas`
                : limiteLocal
                    ? `${nombreLocal} entre paradas`
                    : modoTransporte.options[modoTransporte.selectedIndex].text,
            mensaje: hayConexiones
                ? `Recorrido completo desde ${origen.nombre}: ${resumenTramos.join(" → ")}. Los puntos son aproximados; líneas y horarios por confirmar.`
                : `Recorrido completo desde ${origen.nombre}: ${resumenTramos.join(" → ")}. ${modo === "camion"
                    ? "Los tiempos son estimaciones viales; no incluyen esperas ni horarios de autobús."
                    : "El tiempo es aproximado y puede variar por tráfico y condiciones de carretera."}`
        };
    }

    async function presentarRuta() {
        const origen = obtenerOrigenRecorrido();
        if (!origen) {
            resultadoRuta.textContent = "Elige dónde iniciar el recorrido o selecciona una llegada.";
            return;
        }

        planRuta.modo = modoTransporte.value;
        planRuta.tramos = [];
        planRuta.paradas = [];
        planRuta.descripcionTransporte = "";
        planRuta.puntoInicio = origen;
        const destinosRuta = ordenarParadasDesde(origen);
        const destinoFinal = destinosRuta[destinosRuta.length - 1] || {
            nombre: origen.nombre,
            coords: origen.coords
        };
        opcionesRuta.textContent = "";
        if (origen.esPuntoDeVisita && !destinosRuta.length) {
            planRuta.calculada = false;
            resultadoRuta.textContent = `Agrega otra parada para calcular el recorrido desde ${origen.nombre}.`;
            limpiarTrazoRuta();
            return;
        }
        if (origen.esUbicacionActual && planRuta.modo === "carro") {
            const puntos = [origen.coords, ...destinosRuta.map((lugar) => lugar.coords)];
            planRuta.distanciaKm = puntos.slice(1).reduce((total, punto, indice) =>
                total + distanciaEnKm(puntos[indice], punto) * 1.3, 0);
            planRuta.duracionHoras = planRuta.distanciaKm / 45;
            planRuta.calculada = true;
            planRuta.descripcionTransporte = "Mi carro · ruta aproximada en este dispositivo";
            planRuta.tramos = destinosRuta.map((lugar) => lugar.nombre);
            resultadoRuta.textContent = `Calculamos ${Math.round(planRuta.distanciaKm)} km aproximados por tus paradas, sin enviar tu ubicación ni trazar el mapa.`;
            limpiarTrazoRuta();
            calcularCostoGasolina();
            actualizarTotal();
            return;
        }
        if (origen.esUbicacionActual && planRuta.modo !== "carro") {
            resultadoRuta.textContent =
                "Para proteger tu privacidad, no enviaremos tu ubicación exacta a un servicio externo. " +
                "Elige un aeropuerto o punto de llegada de la lista para calcular todas las paradas.";
            planRuta.calculada = false;
            limpiarTrazoRuta();
            return;
        }

        let distancia = 0;
        let horas = 0;
        let coordenadasRuta = [origen.coords];
        let puntoLlegada = destinoFinal.coords;
        let etiquetaLlegada = destinoFinal.nombre;
        let esAerea = false;
        let modoDescripcion = modoTransporte.options[modoTransporte.selectedIndex].text;
        let detalleTramos = "";
        if (planRuta.modo === "avion" && !origen.esPuntoDeVisita && destinosRuta.length) {
            const aeropuertoCercano = Object.values(aeropuertos)
                .map((aeropuerto) => ({
                    ...aeropuerto,
                    distancia: distanciaEnKm(aeropuerto.coords, destinosRuta[0].coords)
                }))
                .sort((primero, segundo) => primero.distancia - segundo.distancia)[0];
            const distanciaVuelo = distanciaEnKm(origen.coords, aeropuertoCercano.coords);
            if (distanciaVuelo < 25) {
                const rutaLocal = await calcularRutaCompleta(origen, destinosRuta, "urbano");
                distancia = rutaLocal.distanciaKm;
                horas = rutaLocal.duracionHoras;
                coordenadasRuta = rutaLocal.coordenadas;
                planRuta.tramos = rutaLocal.resumenTramos;
                planRuta.paradas = rutaLocal.paradas;
                opcionesRuta.textContent = rutaLocal.mensaje;
                modoDescripcion = "traslado local por carretera";
                detalleTramos = ` No hace falta otro vuelo: ya estás en ${aeropuertoCercano.nombre}.`;
            } else {
                const origenAterrizaje = { nombre: aeropuertoCercano.nombre, coords: aeropuertoCercano.coords };
                const rutaTerrestre = await calcularRutaCompleta(origenAterrizaje, destinosRuta, "urbano");
                distancia = distanciaVuelo + rutaTerrestre.distanciaKm;
                horas = 2 + distanciaVuelo / 700 + rutaTerrestre.duracionHoras;
                coordenadasRuta = [origen.coords, aeropuertoCercano.coords, ...rutaTerrestre.coordenadas.slice(1)];
                esAerea = true;
                planRuta.tramos = [
                    `Vuelo aproximado a ${aeropuertoCercano.nombre} (~${Math.round(distanciaVuelo)} km)`,
                    ...rutaTerrestre.resumenTramos
                ];
                planRuta.paradas = [origenAterrizaje, ...rutaTerrestre.paradas];
                opcionesRuta.textContent = `Vuelo aproximado al aeropuerto más cercano a ${destinosRuta[0].nombre}; después, traslados por carretera entre las paradas. Vuelos y horarios por confirmar.`;
            }
        } else {
            const modoCalculo = planRuta.modo === "avion" ? "urbano" : planRuta.modo;
            const rutaCompleta = await calcularRutaCompleta(origen, destinosRuta, modoCalculo);
            distancia = rutaCompleta.distanciaKm;
            horas = rutaCompleta.duracionHoras;
            coordenadasRuta = rutaCompleta.coordenadas;
            modoDescripcion = planRuta.modo === "avion" ? `recorrido terrestre desde ${origen.nombre}` : rutaCompleta.descripcion;
            planRuta.tramos = rutaCompleta.resumenTramos;
            planRuta.paradas = rutaCompleta.paradas;
            opcionesRuta.textContent = rutaCompleta.mensaje;
        }
        planRuta.distanciaKm = distancia;
        planRuta.duracionHoras = horas;
        planRuta.calculada = true;
        planRuta.descripcionTransporte = modoDescripcion;
        const duracion = formatearDuracion(horas);
        const precisionDestino = plan.lugares.length || parametros.has("lat") || lugarSeleccionado
            ? ""
            : " (ubicación aproximada al centro del estado)";
        const detalleRuta = esAerea
            ? `recorrido total aproximado de ${Math.round(distancia)} km (vuelo + carretera)`
            : `recorrido total aproximado de ${Math.round(distancia)} km por carretera`;
        const notaTransporte = planRuta.modo === "camion"
            ? " El tiempo es una estimación del trayecto vial; no incluye espera ni confirma horarios del autobús."
            : planRuta.modo === "urbano" || planRuta.modo === "taxi"
                ? " El tiempo y el trayecto son orientativos; no representan horarios ni tarifas del servicio."
                : "";
        resultadoRuta.textContent =
            `${origen.nombre} → ${destinosRuta.map((lugar) => lugar.nombre).join(" → ") || etiquetaLlegada}${precisionDestino}: ${detalleRuta}. ` +
            `En ${modoDescripcion}: alrededor de ${duracion}.${notaTransporte}${detalleTramos}`;
        if (origen.esUbicacionActual) {
            limpiarTrazoRuta();
        } else {
            dibujarRuta(origen, puntoLlegada, coordenadasRuta, esAerea, etiquetaLlegada, planRuta.paradas);
        }
        calcularCostoGasolina();
        actualizarTotal();
    }

    function recomendarTransporte() {
        const origen = obtenerOrigenRecorrido();
        if (!origen) {
            recomendacionTransporte.textContent = "";
            return;
        }
        const destinos = ordenarParadasDesde(origen);
        const puntos = [origen.coords, ...destinos.map((lugar) => lugar.coords)];
        const distancia = puntos.slice(1).reduce((total, punto, indice) =>
            total + distanciaEnKm(puntos[indice], punto), 0) * 1.5;
        const recomendado = distancia > 650
            ? "avion"
            : distancia > 45
                ? "camion"
                : "taxi";
        modoTransporte.value = recomendado;
        planRuta.modo = recomendado;
        planRuta.calculada = false;
        calcularCostoGasolina();
        const nombreModo = modoTransporte.options[modoTransporte.selectedIndex].text;
        recomendacionTransporte.textContent = `Por la distancia, te recomendamos: ${nombreModo}. Puedes elegir otra opción.`;
        opcionesRuta.textContent = distancia > 60
            ? "Para recorridos largos: autobús entre ciudades o avión entre aeropuertos; al llegar, combi o taxi local hasta tu lugar."
            : "Parece un trayecto local. Compara combi y taxi para el último tramo.";
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
            planRuta.puntoInicio = null;
            actualizarOpcionesInicio();
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
        planRuta.puntoInicio = null;
        actualizarOpcionesInicio();
        limpiarTrazoRuta();
        textoOrigen.textContent = aeropuerto
            ? `Punto de salida seleccionado: ${aeropuerto.nombre}.`
            : "También puedes elegir un aeropuerto de llegada.";
        resultadoRuta.textContent = "";
        recomendarTransporte();
    });

    inicioRecorrido.addEventListener("change", () => {
        planRuta.calculada = false;
        planRuta.puntoInicio = null;
        planRuta.descripcionTransporte = "";
        planRuta.tramos = [];
        planRuta.paradas = [];
        resultadoRuta.textContent = "";
        limpiarTrazoRuta();
        recomendarTransporte();
    });

    modoTransporte.addEventListener("change", () => {
        resultadoRuta.textContent = "";
        planRuta.modo = modoTransporte.value;
        planRuta.calculada = false;
        limpiarTrazoRuta();
        document.getElementById("btnCalcularRuta").textContent =
            planRuta.modo === "carro" ? "Ver ruta por carretera (opcional)" : "Calcular ruta aproximada";
        if (planRuta.modo === "carro" && obtenerOrigenRecorrido()) {
            resultadoRuta.textContent =
                "Puedes continuar sin trazar el mapa; te mostramos una estimación de gasolina.";
        }
        calcularCostoGasolina();
        actualizarTotal();
    });

    rendimientoVehiculo.addEventListener("input", actualizarTotal);

    const botonCalcularRuta = document.getElementById("btnCalcularRuta");
    botonCalcularRuta.addEventListener("click", async () => {
        if (!obtenerOrigenRecorrido()) {
            resultadoRuta.textContent = "Elige donde llegaste o una parada seleccionada para iniciar.";
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
        const origenResumen = planRuta.puntoInicio || planRuta.origen;

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
            `  <div><h3>Recorrido planeado</h3>` +
            `  <p>${origenResumen ? `${origenResumen.nombre} · ${planRuta.descripcionTransporte || modoTransporte.options[modoTransporte.selectedIndex].text} · ${Math.round(planRuta.distanciaKm)} km aproximados${planRuta.tramos.length ? ` · ${planRuta.tramos.join(" · ")}` : ""}${planRuta.modo === "carro" ? ` · gasolina: ${dinero(calcularCostoGasolina())}` : ""}` : "Sin ruta calculada"}</p></div>` +
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
        const origenRecorrido = planRuta.puntoInicio || planRuta.origen;
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
            origen: origenRecorrido ? origenRecorrido.nombre : "",
            puntoLlegada: planRuta.origen ? planRuta.origen.nombre : "",
            transporte: origenRecorrido ? planRuta.descripcionTransporte || modoTransporte.value : "",
            tramos: planRuta.tramos,
            distanciaAproximadaKm: origenRecorrido ? Math.round(planRuta.distanciaKm) : 0,
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
        if (pasoActual === 4 && planRuta.modo === "carro" && !obtenerOrigenRecorrido()) {
            avisoSeleccion.textContent = "Elige donde llegaste o una parada para iniciar el recorrido.";
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