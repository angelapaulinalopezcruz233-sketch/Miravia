// ============================================
// LÓGICA DE REPORTES (datos reales)
// ============================================

async function renderReportes() {
    await renderTarjetasReportes();
    await renderGraficasReportes();
    await renderTablaResumen();
}

// 1. Tarjetas de resumen
async function renderTarjetasReportes() {
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

    const promedio = totalReservaciones > 0 ? (totalFacturado / totalReservaciones) : 0;

    const cards = document.querySelectorAll('.cards .card-value');
    if (cards.length >= 4) {
        cards[0].textContent = '$' + formatearMonto(totalFacturado);
        cards[1].textContent = '$' + formatearMonto(totalComision);
        cards[2].textContent = '$' + formatearMonto(totalNeto);
        cards[3].textContent = '$' + formatearMonto(promedio);
    }
}

// 2. Gráficas (Comisiones y Reservas por mes)
async function renderGraficasReportes() {
    const chartComisiones = document.getElementById('chart-comisiones');
    const chartReservas = document.getElementById('chart-reservaciones');
    
    const datos = await obtenerComisionesPorMes();
    const porMes = (datos && datos.por_mes) ? datos.por_mes : [];

    if (porMes.length === 0) {
        if (chartComisiones) chartComisiones.innerHTML = '<p style="text-align:center;color:#6b7280;padding:40px;">Sin datos</p>';
        if (chartReservas) chartReservas.innerHTML = '<p style="text-align:center;color:#6b7280;padding:40px;">Sin datos</p>';
        return;
    }

    // Gráfica de Comisiones (turquesa)
    if (chartComisiones) {
        const maxCom = Math.max(...porMes.map(m => parseFloat(m.total_comision) || 0));
        chartComisiones.innerHTML = porMes.map(m => {
            const valor = parseFloat(m.total_comision) || 0;
            const altura = maxCom > 0 ? Math.max((valor / maxCom) * 70, 15) : 15;
            return `<div class="barra" style="height: ${altura}%" data-valor="$${formatearMonto(valor)}"><span>${m.mes}</span></div>`;
        }).join('');
    }

    // Gráfica de Reservas (verde)
    if (chartReservas) {
        const maxRes = Math.max(...porMes.map(m => parseInt(m.total_comisiones) || 0));
        chartReservas.innerHTML = porMes.map(m => {
            const valor = parseInt(m.total_comisiones) || 0;
            const altura = maxRes > 0 ? Math.max((valor / maxRes) * 70, 15) : 15;
            return `<div class="barra verde" style="height: ${altura}%" data-valor="${valor}"><span>${m.mes}</span></div>`;
        }).join('');
    }
}

// 3. Tabla resumen por establecimiento
async function renderTablaResumen() {
    const tbody = document.getElementById('tabla-resumen');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">Cargando...</td></tr>`;

    const datos = await obtenerResumen();
    if (!datos || !datos.resumen || datos.resumen.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">No hay datos de establecimientos.</td></tr>`;
        return;
    }

    tbody.innerHTML = datos.resumen.map(r => `
        <tr>
            <td><strong>${r.establecimiento}</strong></td>
            <td style="text-transform: capitalize;">${r.tipo}</td>
            <td>${r.total_reservaciones}</td>
            <td>$${formatearMonto(r.total_facturado)}</td>
            <td>$${formatearMonto(r.total_comision)}</td>
            <td>$${formatearMonto(r.total_neto)}</td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    renderReportes();
});