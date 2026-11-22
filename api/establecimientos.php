<?php
/**
 * =====================================================================
 * ENDPOINT: /api/establecimientos.php
 * =====================================================================
 * Descripción: API para obtener la información de los establecimientos
 *              (hoteles, restaurantes, atracciones) de un propietario.
 * 
 * Método: GET
 * 
 * Parámetros esperados (Query String):
 * - accion (string): 'listar' (por defecto)
 * - propietario_id (int): ID del usuario con rol de propietario.
 * 
 * Ejemplo de uso:
 * /api/establecimientos.php?accion=listar&propietario_id=3
 * =====================================================================
 */

declare(strict_types=1);

// Incluimos el archivo de conexión a la base de datos
require_once __DIR__ . '/db.php';

// Indicamos que la respuesta será en formato JSON con codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

// ==========================================
// 1. RECOLECCIÓN DE PARÁMETROS
// ==========================================

// Obtenemos la acción a realizar (por defecto 'listar')
$accion = trim((string) ($_GET['accion'] ?? 'listar'));

// Obtenemos el ID del propietario (convertido a entero)
$propietarioId = isset($_GET['propietario_id']) ? (int) $_GET['propietario_id'] : 0;

// Validamos que el propietario_id sea válido
if ($propietarioId <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Falta el parámetro propietario_id o es inválido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // ==========================================
    // 2. CONEXIÓN A LA BASE DE DATOS
    // ==========================================
    $pdo = conectarBaseDatos();

    // ==========================================
    // 3. LÓGICA DE LA ACCIÓN
    // ==========================================
    if ($accion === 'listar') {
        
        /**
         * Consulta SQL:
         * - Selecciona los datos del establecimiento.
         * - Hace LEFT JOIN con 'estados' y 'municipios' para obtener los nombres en lugar de los IDs.
         * - Usa una subconsulta para contar cuántas reservaciones tiene cada establecimiento.
         * - Filtra por el propietario_id recibido.
         */
        $sql = 'SELECT 
                    e.id, 
                    e.nombre, 
                    e.tipo, 
                    e.comision_porcentaje, 
                    e.calificacion_promedio,
                    e.activo,
                    es.nombre AS estado,
                    m.nombre AS municipio,
                    (SELECT COUNT(*) FROM reservaciones r WHERE r.establecimiento_id = e.id) AS total_reservaciones
                FROM establecimientos e
                LEFT JOIN estados es ON es.id = e.estado_id
                LEFT JOIN municipios m ON m.id = e.municipio_id
                WHERE e.propietario_id = :propietario_id
                ORDER BY e.id ASC';
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['propietario_id' => $propietarioId]);
        $establecimientos = $stmt->fetchAll();

        // Devolvemos la respuesta exitosa en formato JSON
        echo json_encode([
            'ok' => true,
            'total' => count($establecimientos),
            'establecimientos' => $establecimientos
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
    } else {
        // Si la acción no es 'listar', devolvemos error 400
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida.'], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Throwable $error) {
    // ==========================================
    // 4. MANEJO DE ERRORES
    // ==========================================
    // Si algo falla en la BD, devolvemos un error 500 con el detalle
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo consultar la base de datos.',
        'detalle' => $error->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}