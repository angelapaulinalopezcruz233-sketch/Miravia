// ============================================
// LÓGICA DE RESERVACIONES (datos reales)
// ============================================

async function renderReservaciones() {
    const tbody = document.getElementById('tabla-reservaciones');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:30px;color:#6b7280;">Cargando reservaciones...</td></tr>`;

    const datos = await obtenerComisiones();

    if (!datos || !datos.comisiones || datos.comisiones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:30px;color:#6b7280;">No hay reservaciones registradas.</td></tr>`;
        return;
    }

    tbody.innerHTML = datos.comisiones.map(r => `
        <tr>
            <td>#${r.reservacion_id}</td>
            <td>${r.cliente}</td>
            <td>${r.establecimiento}</td>
            <td>${formatearFecha(r.fecha_inicio)}</td>
            <td>${formatearFecha(r.fecha_fin)}</td>
            <td>2</td>
            <td>$${formatearMonto(r.monto_base)}</td>
            <td>$${formatearMonto(r.monto_comision)}</td>
            <td>$${formatearMonto(r.monto_propietario)}</td>
            <td><span class="badge ${r.estado}">${r.estado}</span></td>
        </tr>
    `).join('');

    // Actualizamos las tarjetas de resumen
    renderTarjetasReservaciones(datos.comisiones);
}

function renderTarjetasReservaciones(reservaciones) {
    let total = reservaciones.length;
    let confirmadas = reservaciones.filter(r => r.estado === 'confirmada').length;
    let pendientes = reservaciones.filter(r => r.estado === 'pendiente').length;
    let completadas = reservaciones.filter(r => r.estado === 'completada').length;

    const cards = document.querySelectorAll('.cards .card-value');
    if (cards.length >= 4) {
        cards[0].textContent = total;
        cards[1].textContent = confirmadas;
        cards[2].textContent = pendientes;
        cards[3].textContent = completadas;
    }
} // <-- Esta llave cierra la función renderTarjetasReservaciones

document.addEventListener('DOMContentLoaded', () => {
    renderReservaciones();
});