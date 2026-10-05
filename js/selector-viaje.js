// ==========================================
// MIRAVIA · UN MARCADOR POR ESTADO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------------------------
       LOS 32 ESTADOS DE MÉXICO
    ------------------------------------------ */

    const ESTADOS = [
        { valor: "aguascalientes",     nombre: "Aguascalientes",     coords: [21.89, -102.29], color: "#e53935" },
        { valor: "baja-california",    nombre: "Baja California",    coords: [30.84, -115.28], color: "#1e88e5" },
        { valor: "baja-california-sur",nombre: "Baja California Sur",coords: [25.04, -111.66], color: "#43a047" },
        { valor: "campeche",           nombre: "Campeche",           coords: [19.83, -90.53],  color: "#fb8c00" },
        { valor: "chiapas",            nombre: "Chiapas",            coords: [16.75, -93.12],  color: "#8e24aa" },
        { valor: "chihuahua",          nombre: "Chihuahua",          coords: [28.63, -106.07], color: "#00acc1" },
        { valor: "ciudad-de-mexico",   nombre: "Ciudad de México",   coords: [19.43, -99.13],  color: "#fdd835" },
        { valor: "coahuila",           nombre: "Coahuila",           coords: [25.43, -100.99], color: "#e91e63" },
        { valor: "colima",             nombre: "Colima",             coords: [19.24, -103.72], color: "#7cb342" },
        { valor: "durango",            nombre: "Durango",            coords: [24.02, -104.65], color: "#5e35b1" },
        { valor: "guanajuato",         nombre: "Guanajuato",         coords: [21.02, -101.26], color: "#ff7043" },
        { valor: "guerrero",           nombre: "Guerrero",           coords: [17.55, -99.50],  color: "#26a69a" },
        { valor: "hidalgo",            nombre: "Hidalgo",            coords: [20.10, -98.76],  color: "#c026d3" },
        { valor: "jalisco",            nombre: "Jalisco",            coords: [20.66, -103.35], color: "#0288d1" },
        { valor: "estado-de-mexico",   nombre: "Estado de México",   coords: [19.29, -99.65],  color: "#ffb300" },
        { valor: "michoacan",          nombre: "Michoacán",          coords: [19.70, -101.19], color: "#3949ab" },
        { valor: "morelos",            nombre: "Morelos",            coords: [18.68, -99.10],  color: "#d81b60" },
        { valor: "nayarit",            nombre: "Nayarit",            coords: [21.75, -104.85], color: "#00897b" },
        { valor: "nuevo-leon",         nombre: "Nuevo León",         coords: [25.68, -100.32], color: "#6d4c41" },
        { valor: "oaxaca",             nombre: "Oaxaca",             coords: [17.07, -96.72],  color: "#f4511e" },
        { valor: "puebla",             nombre: "Puebla",             coords: [19.04, -98.20],  color: "#546e7a" },
        { valor: "queretaro",          nombre: "Querétaro",          coords: [20.59, -100.39], color: "#c62828" },
        { valor: "quintana-roo",       nombre: "Quintana Roo",       coords: [18.50, -88.30],  color: "#7b1fa2" },
        { valor: "san-luis-potosi",    nombre: "San Luis Potosí",    coords: [22.16, -100.99], color: "#2e7d32" },
        { valor: "sinaloa",            nombre: "Sinaloa",            coords: [24.81, -107.39], color: "#0277bd" },
        { valor: "sonora",             nombre: "Sonora",             coords: [29.07, -110.96], color: "#689f38" },
        { valor: "tabasco",            nombre: "Tabasco",            coords: [17.99, -92.93],  color: "#ad1457" },
        { valor: "tamaulipas",         nombre: "Tamaulipas",         coords: [23.74, -99.14],  color: "#0097a7" },
        { valor: "tlaxcala",           nombre: "Tlaxcala",           coords: [19.32, -98.24],  color: "#9e9d24" },
        { valor: "veracruz",           nombre: "Veracruz",           coords: [19.17, -96.13],  color: "#ef6c00" },
        { valor: "yucatan",            nombre: "Yucatán",            coords: [20.97, -89.62],  color: "#6a1b9a" },
        { valor: "zacatecas",          nombre: "Zacatecas",          coords: [22.77, -102.58], color: "#d32f2f" }
    ];

    /* ------------------------------------------
       ESTADO MÁS CERCANO AL PUNTO TOCADO
    ------------------------------------------ */

    function estadoCercano(lat, lng) {
        const correccion = Math.cos(lat * Math.PI / 180);
        let mejor = null;
        let menorDistancia = Infinity;

        ESTADOS.forEach((estado) => {
            const dLat = (estado.coords[0] - lat) * 111;
            const dLng = (estado.coords[1] - lng) * 111 * correccion;
            const distancia = Math.sqrt(dLat * dLat + dLng * dLng);
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                mejor = estado;
            }
        });

        return mejor;
    }

    /* ------------------------------------------
       SELECCIONAR UN ESTADO
    ------------------------------------------ */

    let marcadorActivo = null;

    function seleccionarEstado(estado, marcador = null) {
        if (marcadorActivo) {
            marcadorActivo.getElement()?.querySelector(".marcador-estado")?.classList.remove("marcador-estado--seleccionado");
            marcadorActivo.closeTooltip();
        }
        if (!estado) return;

        if (marcador) {
            marcadorActivo = marcador;
            marcadorActivo.getElement()?.querySelector(".marcador-estado")?.classList.add("marcador-estado--seleccionado");
            marcadorActivo.openTooltip();
        }

        document.dispatchEvent(new CustomEvent("miravia:estado-elegido", {
            detail: {
                valor: estado.valor,
                nombre: estado.nombre,
                coords: estado.coords,
                color: estado.color
            }
        }));
    }

    function crearIconoEstado(estado) {
        return L.divIcon({
            className: "marcador-estado-contenedor",
            html: `<span class="marcador-estado"><img src="imagenes/estados/iconos/${estado.valor}.jpg" alt="" draggable="false"></span>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            tooltipAnchor: [0, -19]
        });
    }

    function crearMarcadoresEstados(mapa) {
        ESTADOS.forEach((estado) => {
            const marcador = L.marker(estado.coords, {
                icon: crearIconoEstado(estado),
                keyboard: true,
                title: estado.nombre,
                riseOnHover: true
            }).addTo(mapa);

            marcador.bindTooltip(estado.nombre, {
                direction: "top",
                className: "tooltip-estado",
                offset: [0, -22]
            });
            marcador.on("click", (evento) => {
                L.DomEvent.stopPropagation(evento);
                seleccionarEstado(estado, marcador);
            });
        });
    }

    /* ------------------------------------------
    CREAR UN MARCADOR POR ESTADO
    ------------------------------------------ */

    document.addEventListener("miravia:mapa-inicio", (evento) => {
        const mapa = evento.detail.mapa || window.__miraviaMapa;
        if (!mapa) return;

        crearMarcadoresEstados(mapa);

        // Tocar cualquier otro punto del mapa:
        // selecciona el estado más cercano.
        mapa.on("click", (clic) => {
            if (modoElegirPendiente && !estadoElegidoBloqueado) {
                const estado = estadoCercano(clic.latlng.lat, clic.latlng.lng);
                if (estado) seleccionarEstado(estado);
            }
        });
    });

    /* Banderas compartidas con la pantalla de inicio.
       El mapa solo permite elegir cuando ya terminó
       la bienvenida ("Comenzar a explorar"). */

    let modoElegirPendiente = false;
    let estadoElegidoBloqueado = false;

    document.addEventListener("miravia:modo-elegir", () => {
        modoElegirPendiente = true;
    });

    // Un estado ya elegido con "Comenzar viaje":
    // bloquea más selecciones mientras navega.
    document.addEventListener("miravia:comenzar-viaje", () => {
        estadoElegidoBloqueado = true;
    });

});