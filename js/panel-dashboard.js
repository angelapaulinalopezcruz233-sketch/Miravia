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

    // Si no hay datos, mostramos el mensaje amigable
    if (porMes.length === 0) {
        chart.innerHTML = `
            <div style="text-align: center; padding: 40px; width: 100%;">
                <i class="fa-solid fa-chart-line" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <h4 style="color: var(--texto); font-size: 1.1rem; margin-bottom: 5px;">Aún no hay comisiones registradas</h4>
                <p style="color: var(--gris-texto); font-size: 0.9rem; margin-bottom: 15px;">
                    Cuando tus establecimientos generen reservas, verás aquí el resumen mensual.
                </p>
                <a href="comisiones.html" class="btn-accion btn-primario" style="display: inline-flex;">
                    Ver comisiones
                </a>
            </div>
        `;
        return;
    }

    // Si hay datos, dibujamos las barras
    const valores = porMes.map(m => parseFloat(m.total_comision) || 0);
    const max = Math.max(...valores);

    chart.innerHTML = porMes.map(m => {
        const valor = parseFloat(m.total_comision) || 0;
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
// ==========================================
// LÓGICA DEL MENÚ DE PERFIL
// ==========================================
function initMenuPerfil() {
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdown = document.getElementById('perfil-dropdown');

    if (!avatarBtn || !dropdown) return;

    // Al dar clic en el avatar, abrir/cerrar el menú
    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el clic se propague al documento
        dropdown.classList.toggle('show');
    });

    // Si el usuario da clic en cualquier parte de la pantalla, cerrar el menú
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== avatarBtn) {
            dropdown.classList.remove('show');
        }
    });
}

// ============================================
// Inicializar
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    initMenuPerfil(); // <-- Agrega esta línea
});