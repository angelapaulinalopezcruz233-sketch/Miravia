// ============================================
// HELPER DE API PARA EL PANEL DEL PROPIETARIO
// ============================================

const PROPIETARIO_ID = 3;
const API_BASE = '../api/comisiones.php';

async function llamarAPI(accion, params = {}) {
    const query = new URLSearchParams({
        accion: accion,
        propietario_id: PROPIETARIO_ID,
        ...params
    });

    try {
        const respuesta = await fetch(`${API_BASE}?${query}`);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
        const datos = await respuesta.json();
        if (datos.error) throw new Error(datos.error);
        return datos;
    } catch (error) {
        console.error(`Error en API [${accion}]:`, error);
        return null;
    }
}

async function obtenerComisiones() {
    return await llamarAPI('listar');
}

async function obtenerResumen() {
    return await llamarAPI('resumen');
}

async function obtenerEstadoCuenta() {
    return await llamarAPI('estado_cuenta');
}

async function obtenerComisionesPorMes() {
    return await llamarAPI('por_mes');
}

async function marcarComisionCobrada(comisionId) {
    const formData = new FormData();
    formData.append('comision_id', comisionId);

    const query = new URLSearchParams({
        accion: 'cobrar',
        propietario_id: PROPIETARIO_ID
    });

    try {
        const respuesta = await fetch(`${API_BASE}?${query}`, {
            method: 'POST',
            body: formData
        });
        return await respuesta.json();
    } catch (error) {
        console.error('Error al cobrar:', error);
        return null;
    }
}
// ============================================
// UTILIDADES COMPARTIDAS
// ============================================
// Parseo manual para evitar el bug de zona horaria.
// ============================================

function formatearFecha(fechaStr) {
    if (!fechaStr) return '—';
    
    // Extraemos solo la parte de fecha: 'YYYY-MM-DD'
    const soloFecha = String(fechaStr).split(' ')[0];
    return soloFecha;
}

function formatearMonto(valor) {
    const num = parseFloat(valor) || 0;
    return num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
/**
 * =====================================================================
 * OBTENER ESTABLECIMIENTOS
 * =====================================================================
 * Hace una petición GET al endpoint 'establecimientos.php' para traer
 * la lista de hoteles, restaurantes o atracciones del propietario.
 * 
 * @returns {Promise<Object|null>} Objeto con los datos o null si falla.
 */
async function obtenerEstablecimientos() {
    // Preparamos los parámetros de la URL
    const query = new URLSearchParams({
        accion: 'listar',
        propietario_id: PROPIETARIO_ID
    });
    
    // Ojo: la ruta base aquí es diferente a comisiones.php
    const endpoint = `../api/establecimientos.php?${query}`;

    try {
        const respuesta = await fetch(endpoint);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        return datos;
        
    } catch (error) {
        console.error('Error obteniendo establecimientos:', error);
        return null;
    }
}