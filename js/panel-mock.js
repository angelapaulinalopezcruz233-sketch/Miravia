// ============================================
// DATOS FALSOS PARA EL PANEL DEL PROPIETARIO
// (se reemplazarán por datos reales de la BD)
// ============================================

const MOCK_RESERVACIONES = [
    { id: 1024, cliente: 'Ana López',     establecimiento: 'Hotel Vista Sol',    fecha: '2026-10-12', total: 3200, comision: 256, estado: 'confirmada' },
    { id: 1023, cliente: 'Luis Martínez', establecimiento: 'Restaurante El Faro', fecha: '2026-10-11', total: 850,  comision: 42,  estado: 'completada' },
    { id: 1022, cliente: 'Sofía Herrera', establecimiento: 'Hotel Vista Sol',    fecha: '2026-10-10', total: 4800, comision: 384, estado: 'pendiente' },
    { id: 1021, cliente: 'Diego Ramírez', establecimiento: 'Tour Cañón Azul',   fecha: '2026-10-09', total: 1200, comision: 84,  estado: 'completada' },
    { id: 1020, cliente: 'María Torres',  establecimiento: 'Restaurante El Faro', fecha: '2026-10-08', total: 640,  comision: 32,  estado: 'cancelada' }
];

const MOCK_COMISIONES_MES = [
    { mes: 'May', valor: 2800 },
    { mes: 'Jun', valor: 3200 },
    { mes: 'Jul', valor: 3900 },
    { mes: 'Ago', valor: 4500 },
    { mes: 'Sep', valor: 4100 },
    { mes: 'Oct', valor: 4320 }
];

// ============================================
// ESTABLECIMIENTOS DEL PROPIETARIO
// ============================================

const MOCK_ESTABLECIMIENTOS = [
    {
        id: 1,
        nombre: 'Hotel Vista Sol',
        tipo: 'hotel',
        estado: 'Oaxaca',
        municipio: 'Puerto Escondido',
        comision: 8.00,
        calificacion: 4.8,
        activo: true,
        reservaciones: 42
    },
    {
        id: 2,
        nombre: 'Restaurante El Faro',
        tipo: 'restaurante',
        estado: 'Veracruz',
        municipio: 'Veracruz',
        comision: 5.00,
        calificacion: 4.5,
        activo: true,
        reservaciones: 87
    },
    {
        id: 3,
        nombre: 'Tour Cañón Azul',
        tipo: 'atraccion',
        estado: 'Chiapas',
        municipio: 'San Cristóbal',
        comision: 7.00,
        calificacion: 4.9,
        activo: true,
        reservaciones: 31
    }
];
// ============================================
// COMISIONES DEL PROPIETARIO
// ============================================

const MOCK_COMISIONES = [
    { id: 1, reservacion_id: 1024, establecimiento: 'Hotel Vista Sol',    fecha: '2026-10-12', monto_base: 3200, porcentaje: 8.00, comision: 256, neto: 2944, estado: 'pendiente' },
    { id: 2, reservacion_id: 1023, establecimiento: 'Restaurante El Faro', fecha: '2026-10-11', monto_base: 850,  porcentaje: 5.00, comision: 42,  neto: 808,  estado: 'cobrada' },
    { id: 3, reservacion_id: 1022, establecimiento: 'Hotel Vista Sol',    fecha: '2026-10-10', monto_base: 4800, porcentaje: 8.00, comision: 384, neto: 4416, estado: 'pendiente' },
    { id: 4, reservacion_id: 1021, establecimiento: 'Tour Cañón Azul',   fecha: '2026-10-09', monto_base: 1200, porcentaje: 7.00, comision: 84,  neto: 1116, estado: 'cobrada' },
    { id: 5, reservacion_id: 1020, establecimiento: 'Restaurante El Faro', fecha: '2026-10-08', monto_base: 640,  porcentaje: 5.00, comision: 32,  neto: 608,  estado: 'cobrada' },
    { id: 6, reservacion_id: 1019, establecimiento: 'Hotel Vista Sol',    fecha: '2026-10-07', monto_base: 3600, porcentaje: 8.00, comision: 288, neto: 3312, estado: 'pendiente' },
    { id: 7, reservacion_id: 1018, establecimiento: 'Tour Cañón Azul',   fecha: '2026-10-06', monto_base: 2400, porcentaje: 7.00, comision: 168, neto: 2232, estado: 'cobrada' }
];
// ============================================
// HISTORIAL DE PAGOS DEL PROPIETARIO
// ============================================

const MOCK_PAGOS = [
    { id: 1, fecha: '2026-10-05', monto: 1250, metodo: 'Transferencia', referencia: 'TRF-88421', estado: 'pagado' },
    { id: 2, fecha: '2026-09-28', monto: 980,  metodo: 'Tarjeta',       referencia: 'TAR-77210', estado: 'pagado' },
    { id: 3, fecha: '2026-09-20', monto: 1420, metodo: 'Transferencia', referencia: 'TRF-86113', estado: 'pagado' },
    { id: 4, fecha: '2026-09-12', monto: 670,  metodo: 'Efectivo',      referencia: 'EFE-55012', estado: 'pagado' },
    { id: 5, fecha: '2026-09-01', monto: 1120, metodo: 'Transferencia', referencia: 'TRF-84009', estado: 'pagado' },
    { id: 6, fecha: '2026-10-08', monto: 1280, metodo: 'Transferencia', referencia: 'TRF-90011', estado: 'pendiente' }
];
// ============================================
// RESERVACIONES COMPLETAS DEL PROPIETARIO
// ============================================

const MOCK_RESERVACIONES_FULL = [
    { id: 1024, cliente: 'Ana López',     establecimiento: 'Hotel Vista Sol',    inicio: '2026-10-12', fin: '2026-10-15', personas: 2, total: 3200, comision: 256, neto: 2944, estado: 'confirmada' },
    { id: 1023, cliente: 'Luis Martínez', establecimiento: 'Restaurante El Faro', inicio: '2026-10-11', fin: '2026-10-11', personas: 4, total: 850,  comision: 42,  neto: 808,  estado: 'completada' },
    { id: 1022, cliente: 'Sofía Herrera', establecimiento: 'Hotel Vista Sol',    inicio: '2026-10-10', fin: '2026-10-13', personas: 3, total: 4800, comision: 384, neto: 4416, estado: 'pendiente' },
    { id: 1021, cliente: 'Diego Ramírez', establecimiento: 'Tour Cañón Azul',   inicio: '2026-10-09', fin: '2026-10-09', personas: 2, total: 1200, comision: 84,  neto: 1116, estado: 'completada' },
    { id: 1020, cliente: 'María Torres',  establecimiento: 'Restaurante El Faro', inicio: '2026-10-08', fin: '2026-10-08', personas: 2, total: 640,  comision: 32,  neto: 608,  estado: 'cancelada' },
    { id: 1019, cliente: 'Jorge Castillo', establecimiento: 'Hotel Vista Sol',   inicio: '2026-10-07', fin: '2026-10-10', personas: 2, total: 3600, comision: 288, neto: 3312, estado: 'confirmada' },
    { id: 1018, cliente: 'Paola Núñez',   establecimiento: 'Tour Cañón Azul',   inicio: '2026-10-06', fin: '2026-10-06', personas: 5, total: 2400, comision: 168, neto: 2232, estado: 'completada' },
    { id: 1017, cliente: 'Ricardo Vega',  establecimiento: 'Restaurante El Faro', inicio: '2026-10-05', fin: '2026-10-05', personas: 3, total: 720,  comision: 36,  neto: 684,  estado: 'confirmada' }
];

// ============================================
// DATOS PARA REPORTES
// ============================================

const MOCK_RESERVAS_POR_MES = [
    { mes: 'May', valor: 18 },
    { mes: 'Jun', valor: 22 },
    { mes: 'Jul', valor: 26 },
    { mes: 'Ago', valor: 31 },
    { mes: 'Sep', valor: 28 },
    { mes: 'Oct', valor: 27 }
];

const MOCK_RESUMEN_ESTABLECIMIENTOS = [
    { nombre: 'Hotel Vista Sol',    tipo: 'Hotel',       reservas: 42, facturado: 32000, comision: 2560, neto: 29440 },
    { nombre: 'Restaurante El Faro', tipo: 'Restaurante', reservas: 87, facturado: 18400, comision: 920,  neto: 17480 },
    { nombre: 'Tour Cañón Azul',    tipo: 'Atracción',   reservas: 31, facturado: 8000,  comision: 560,  neto: 7440 }
];