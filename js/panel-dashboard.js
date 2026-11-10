// ============================================
// LÓGICA DEL DASHBOARD (datos reales)
// ============================================

async function renderDashboard() {
    await renderTarjetas();
    await renderChart();
    await renderUltimasReservaciones();
}

// ============================================
// TARJETAS DE RESUMEN
// ============================================
async function renderTarjetas() {
    const datosResumen = await obtenerResumen();
    
    let totalFacturado = 0;
    let totalComision = 0;
    let totalNeto = 0;
    let totalReservaciones = 0;

    if (datosResumen && datosResumen.resumen) {
        datosResumen.resumen.forEach(r => {
            totalFacturado += parseFloat(r.total_facturado) || 0;
            totalComision  += parseFloat(r.total_comision) || 0;
            totalNeto      += parseFloat(r.total_neto) || 0;
            totalReservaciones += parseInt(r.total_reservaciones) || 0;
        });
    }

    const datosEstado = await obtenerEstadoCuenta();
    const saldoPendiente = datosEstado && datosEstado.estado_cuenta
        ? parseFloat(datosEstado.estado_cuenta.saldo_pendiente) || 0
        : 0;

    const cards = document.querySelectorAll('.cards .card-value');
    if (cards.length >= 4) {
        cards[0].textContent = totalReservaciones; // Establecimientos (por ahora)
        cards[1].textContent = totalReservaciones; // Reservaciones (mes)
        cards[2].textContent = '$' + formatearMonto(totalComision);
        cards[3].textContent = '$' + formatearMonto(totalNeto);
    }
}

// ============================================
// GRÁFICA DE COMISIONES POR MES
// ============================================
async function renderChart() {
    const chart = document.getElementById('chart');
    if (!chart) return;

    const datos = await obtenerComisionesPorMes();
    const porMes = (datos && datos.por_mes) ? datos.por_mes : [];

    if (porMes.length === 0) {
        chart.innerHTML = `<p style="text-align:center;color:#6b7280;padding:40px;">No hay datos para mostrar.</p>`;
        return;
    }

    const valores = porMes.map(m => parseFloat(m.total_comision) || 0);
    const max = Math.max(...valores);

    chart.innerHTML = porMes.map(m => {
        const valor = parseFloat(m.total_comision) || 0;
        // Si solo hay una barra o todas iguales, la dejamos al 70% para que se vea bien
        const altura = max > 0 ? Math.max((valor / max) * 70, 15) : 15;
        return `
            <div class="barra" style="height: ${altura}%" data-valor="$${formatearMonto(valor)}">
                <span>${m.mes}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// ÚLTIMAS RESERVACIONES
// ============================================
async function renderUltimasReservaciones() {
    const tbody = document.getElementById('tabla-reservas');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280;">Cargando...</td></tr>`;

    const datos = await obtenerComisiones();
    if (!datos || !datos.comisiones || datos.comisiones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280;">No hay reservaciones recientes.</td></tr>`;
        return;
    }

    const ultimas = datos.comisiones.slice(0, 5);

    tbody.innerHTML = ultimas.map(r => `
        <tr>
            <td>#${r.reservacion_id}</td>
            <td>${r.cliente}</td>
            <td>${r.establecimiento}</td>
            <td>${formatearFecha(r.creado_en)}</td>
            <td>$${formatearMonto(r.monto_base)}</td>
            <td>$${formatearMonto(r.monto_comision)}</td>
            <td><span class="badge ${r.estado}">${r.estado}</span></td>
        </tr>
    `).join('');
}

// ============================================
// Inicializar
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});