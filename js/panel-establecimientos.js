/**
 * =====================================================================
 * LÓGICA DE "MIS ESTABLECIMIENTOS" (Conectado a BD real)
 * =====================================================================
 */

// Diccionario para asignar el ícono de FontAwesome según el tipo
const ICONOS_TIPO = {
    hotel:       'fa-hotel',
    restaurante: 'fa-utensils',
    atraccion:   'fa-ticket'
};

// Diccionario para mostrar el nombre legible del tipo
const LABEL_TIPO = {
    hotel:       'Hotel',
    restaurante: 'Restaurante',
    atraccion:   'Atracción'
};

/**
 * Renderiza las tarjetas de establecimientos en el HTML.
 * 
 * @param {string} filtro - 'todos', 'hotel', 'restaurante' o 'atraccion'
 */
async function renderEstablecimientos(filtro = 'todos') {
    const grid = document.getElementById('grid-establecimientos');
    if (!grid) return;

    // Mostramos mensaje de carga mientras llega la respuesta
    grid.innerHTML = `<p class="vacio">Cargando establecimientos...</p>`;

    // Llamamos a la API
    const datos = await obtenerEstablecimientos();
    
    // Validación por si no hay datos o hay error
    if (!datos || !datos.establecimientos || datos.establecimientos.length === 0) {
        grid.innerHTML = `<p class="vacio">No tienes establecimientos registrados.</p>`;
        return;
    }

    // Aplicamos el filtro (si es diferente a 'todos')
    const lista = filtro === 'todos'
        ? datos.establecimientos
        : datos.establecimientos.filter(e => e.tipo === filtro);

    if (lista.length === 0) {
        grid.innerHTML = `<p class="vacio">No hay establecimientos en esta categoría.</p>`;
        return;
    }

    // Generamos el HTML de cada tarjeta
    grid.innerHTML = lista.map(e => `
        <div class="card-establecimiento">
            <!-- Cabecera: Ícono y estado -->
            <div class="estab-header">
                <div class="estab-icono ${e.tipo}">
                    <i class="fa-solid ${ICONOS_TIPO[e.tipo] || 'fa-map-marker-alt'}"></i>
                </div>
                <span class="estab-estado ${e.activo == 1 ? 'activo' : 'inactivo'}">
                    ${e.activo == 1 ? '● Activo' : '● Inactivo'}
                </span>
            </div>

            <!-- Datos principales -->
            <h3 class="estab-nombre">${e.nombre}</h3>
            <p class="estab-tipo">${LABEL_TIPO[e.tipo] || e.tipo}</p>

            <p class="estab-ubicacion">
                <i class="fa-solid fa-location-dot"></i>
                ${e.municipio ? e.municipio + ', ' : ''}${e.estado || 'Sin ubicación'}
            </p>

            <!-- Datos numéricos -->
            <div class="estab-datos">
                <div>
                    <p class="dato-label">Comisión</p>
                    <p class="dato-valor">${parseFloat(e.comision_porcentaje)}%</p>
                </div>
                <div>
                    <p class="dato-label">Calificación</p>
                    <p class="dato-valor">⭐ ${parseFloat(e.calificacion_promedio)}</p>
                </div>
                <div>
                    <p class="dato-label">Reservaciones</p>
                    <p class="dato-valor">${e.total_reservaciones}</p>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="estab-acciones">
                <button class="btn-secundario"><i class="fa-solid fa-eye"></i> Ver</button>
                <button class="btn-secundario"><i class="fa-solid fa-pen"></i> Editar</button>
            </div>
        </div>
    `).join('');
}

/**
 * Configura los botones de filtro (chips) para que al hacer clic
 * se filtre la lista de establecimientos.
 */
function initFiltros() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Quitamos la clase 'active' de todos los chips
            chips.forEach(c => c.classList.remove('active'));
            // Se la ponemos al que se hizo clic
            chip.classList.add('active');
            // Volvemos a renderizar con el filtro seleccionado
            renderEstablecimientos(chip.dataset.filtro);
        });
    });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderEstablecimientos();
    initFiltros();
});