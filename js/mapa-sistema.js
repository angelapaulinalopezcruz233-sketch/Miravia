// ==========================================
// MAPA DEL SISTEMA PRINCIPAL (index.html)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    const mapaContenedor = document.getElementById('mapaSistema');
    const textoCiudad = document.getElementById('textoCiudadGPS');
    const textoEstatus = document.getElementById('textoEstatusGPS');
    const ciudadTarjeta = document.getElementById('locationCity');
    const estadoTarjeta = document.getElementById('locationState');

    if (!mapaContenedor) return;

    let latUsuario = 19.4326;
    let lngUsuario = -99.1332;

    textoEstatus.textContent = "Obteniendo ubicación...";

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latUsuario = position.coords.latitude;
                lngUsuario = position.coords.longitude;
                textoCiudad.textContent = `Lat: ${latUsuario.toFixed(2)}, Lng: ${lngUsuario.toFixed(2)}`;
                textoEstatus.textContent = "Tú estás aquí";
                if (ciudadTarjeta) ciudadTarjeta.textContent = "Ubicación encontrada";
                if (estadoTarjeta) estadoTarjeta.textContent = "Tu posición está lista para explorar";
                inicializarMapa();
            },
            (error) => {
                console.warn("Ubicación denegada o error:", error);
                textoCiudad.textContent = "Ciudad de México (Por defecto)";
                textoEstatus.textContent = "Ubicación no encontrada";
                if (ciudadTarjeta) ciudadTarjeta.textContent = "Explora desde Ciudad de México";
                if (estadoTarjeta) estadoTarjeta.textContent = "Activa la ubicación para personalizar tu ruta";
                inicializarMapa();
            },
            { timeout: 10000 }
        );
    } else {
        textoCiudad.textContent = "Geolocalización no soportada";
        inicializarMapa();
    }

    function inicializarMapa() {
        const mapaLeaflet = L.map('mapaSistema', {
            zoomControl: true
        }).setView([latUsuario, lngUsuario], 14);

        // Capa oscura de CartoDB (Dark Matter) o similar para mantener la estética azul menta/cálido
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(mapaLeaflet);

        // Marcador con color cálido
        const iconoCalido = L.divIcon({
            className: 'marcador-calido',
            html: '<div style="width: 15px; height: 15px; background: #ffb347; border-radius: 50%; box-shadow: 0 0 10px #ffb347; border: 2px solid white;"></div>',
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5]
        });

        L.marker([latUsuario, lngUsuario], { icon: iconoCalido }).addTo(mapaLeaflet);

        document.querySelectorAll('.controles-mapa button').forEach((boton) => {
            boton.addEventListener('click', () => {
                mapaLeaflet.setZoom(mapaLeaflet.getZoom() + (boton.textContent.trim() === '+' ? 1 : -1));
            });
        });
    }

});
