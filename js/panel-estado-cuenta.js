// ============================================
// LÓGICA DE ESTADO DE CUENTA (datos reales)
// ============================================

async function renderEstadoCuenta() {
    await renderTarjetas();
    await renderPagos();
}

async function renderTarjetas() {
    const datos = await obtenerEstadoCuenta();
    if (!datos || !datos.estado_cuenta) return;

    const e = datos.estado_cuenta;

    const cards = document.querySelectorAll('.cards .card-value');
    if (cards.length >= 4) {
        cards[0].textContent = '$' + formatearMonto(e.total_a_cobrar || 0);
        cards[1].textContent = '$' + formatearMonto(e.total_cobrado || 0);
        cards[2].textContent = '$' + formatearMonto(e.saldo_pendiente || 0);
        // La 4ta (próximo vencimiento) queda estática por ahora
    }
}

async function renderPagos() {
    const tbody = document.getElementById('tabla-pagos');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">Cargando pagos...</td></tr>`;

    // Aún no hay endpoint de pagos, mostramos vacío por ahora
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">No hay pagos registrados aún.</td></tr>`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderEstadoCuenta();
});