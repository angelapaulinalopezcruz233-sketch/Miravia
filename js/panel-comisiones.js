// ============================================
// LÓGICA DE COMISIONES (datos reales)
// ============================================

async function renderComisiones() {
    const tbody = document.getElementById('tabla-comisiones');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:#6b7280;">Cargando comisiones...</td></tr>`;

    const datos = await obtenerComisiones();

    if (!datos || !datos.comisiones || datos.comisiones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:#6b7280;">No hay comisiones registradas.</td></tr>`;
        return;
    }

    tbody.innerHTML = datos.comisiones.map(c => `
        <tr>
            <td>#${c.reservacion_id}</td>
            <td>${c.establecimiento}</td>
            <td>${formatearFecha(c.creado_en)}</td>
            <td>$${formatearMonto(c.monto_base)}</td>
            <td>${parseFloat(c.porcentaje).toFixed(0)}%</td>
            <td><strong>$${formatearMonto(c.monto_comision)}</strong></td>
            <td>$${formatearMonto(c.monto_propietario)}</td>
            <td><span class="badge ${c.estado}">${c.estado}</span></td>
            <td>
                ${c.estado === 'pendiente'
                    ? `<button class="btn-mini cobrar" onclick="cobrarComision(${c.id})">
                        <i class="fa-solid fa-check"></i> Cobrar
                       </button>`
                    : `<span class="texto-gris">—</span>`
                }
            </td>
        </tr>
    `).join('');
}

async function cobrarComision(id) {
    if (!confirm('¿Marcar esta comisión como cobrada?')) return;

    const resultado = await marcarComisionCobrada(id);

    if (resultado && resultado.ok) {
        alert('✅ Comisión marcada como cobrada.');
        renderComisiones();
        renderTarjetasResumen();
    } else {
        alert('❌ Error al cobrar la comisión.');
    }
}

async function renderTarjetasResumen() {
    // Las primeras 3 tarjetas vienen del resumen (vw_comisiones_propietario)
    const datosResumen = await obtenerResumen();
    if (!datosResumen || !datosResumen.resumen) return;

    // Sumamos los totales de todos los establecimientos
    let totalFacturado = 0;
    let totalComision = 0;
    let totalNeto = 0;

    datosResumen.resumen.forEach(r => {
        totalFacturado += parseFloat(r.total_facturado) || 0;
        totalComision  += parseFloat(r.total_comision) || 0;
        totalNeto      += parseFloat(r.total_neto) || 0;
    });

    // La 4ta tarjeta viene del estado de cuenta
    const datosEstado = await obtenerEstadoCuenta();
    const saldoPendiente = datosEstado && datosEstado.estado_cuenta
        ? parseFloat(datosEstado.estado_cuenta.saldo_pendiente) || 0
        : 0;

    // Actualizamos las 4 tarjetas en orden
    const cards = document.querySelectorAll('.cards .card-value');
    if (cards.length >= 4) {
        cards[0].textContent = '$' + formatearMonto(totalFacturado);
        cards[1].textContent = '$' + formatearMonto(totalComision);
        cards[2].textContent = '$' + formatearMonto(totalNeto);
        cards[3].textContent = '$' + formatearMonto(saldoPendiente);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderComisiones();
    renderTarjetasResumen();
});