<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$estado = trim((string) ($_GET['estado'] ?? ''));
$municipio = trim((string) ($_GET['municipio'] ?? ''));

if ($estado === '' || $municipio === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan los datos de ubicación.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = conectarBaseDatos();
    $consulta = $pdo->prepare(
        'SELECT e.id, e.nombre, e.tipo, e.descripcion, e.direccion,
                e.precio_desde, e.prioridad_manual,
                COALESCE(AVG(r.calificacion), 0) AS calificacion_promedio,
                COUNT(r.id) AS cantidad_resenas,
                m.nombre AS municipio, es.nombre AS estado
         FROM establecimientos e
         INNER JOIN estados es ON es.id = e.estado_id
         INNER JOIN municipios m ON m.id = e.municipio_id
         LEFT JOIN resenas r ON r.establecimiento_id = e.id
         WHERE e.tipo = :tipo
           AND e.activo = 1
           AND es.slug = :estado
           AND m.nombre = :municipio
         GROUP BY e.id, e.nombre, e.tipo, e.descripcion, e.direccion,
                  e.precio_desde, e.prioridad_manual, e.calificacion_promedio,
                  m.nombre, es.nombre
         ORDER BY e.prioridad_manual DESC, calificacion_promedio DESC, e.nombre'
    );
    $consulta->execute([
        'tipo' => 'restaurante',
        'estado' => $estado,
        'municipio' => $municipio,
    ]);

    echo json_encode(
        ['restaurantes' => $consulta->fetchAll()],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
} catch (Throwable $error) {
    error_log('Error en restaurantes.php: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'No se pudieron consultar los restaurantes.'], JSON_UNESCAPED_UNICODE);
}
