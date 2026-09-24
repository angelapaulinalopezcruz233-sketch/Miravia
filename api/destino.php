<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$slug = trim((string) ($_GET['estado'] ?? ''));

if ($slug === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro estado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = conectarBaseDatos();

    $consultaEstado = $pdo->prepare(
        'SELECT id, slug, nombre, capital, descripcion, lat, lng
         FROM estados
         WHERE slug = :slug AND activo = 1
         LIMIT 1'
    );
    $consultaEstado->execute(['slug' => $slug]);
    $estado = $consultaEstado->fetch();

    if (!$estado) {
        http_response_code(404);
        echo json_encode(['error' => 'Estado no encontrado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $consultaMunicipios = $pdo->prepare(
        'SELECT id, nombre, descripcion
         FROM municipios
         WHERE estado_id = :estado_id
         ORDER BY nombre'
    );
    $consultaMunicipios->execute(['estado_id' => $estado['id']]);

    $consultaAtracciones = $pdo->prepare(
        'SELECT id, nombre, tipo, descripcion
         FROM atracciones
         WHERE estado_id = :estado_id
         ORDER BY id'
    );
    $consultaAtracciones->execute(['estado_id' => $estado['id']]);

    $consultaHoteles = $pdo->prepare(
        'SELECT id, nombre, categoria AS tipo, precio, calificacion, ubicacion, descripcion
         FROM hoteles
         WHERE estado_id = :estado_id
         ORDER BY id'
    );
    $consultaHoteles->execute(['estado_id' => $estado['id']]);

    $consultaRestaurantes = $pdo->prepare(
        'SELECT id, nombre, tipo, precio, calificacion, ubicacion, descripcion
         FROM restaurantes
         WHERE estado_id = :estado_id
         ORDER BY id'
    );
    $consultaRestaurantes->execute(['estado_id' => $estado['id']]);

    $estado['coords'] = [(float) $estado['lat'], (float) $estado['lng']];
    unset($estado['id'], $estado['lat'], $estado['lng']);
    $estado['municipios'] = $consultaMunicipios->fetchAll();
    $estado['lugares'] = $consultaAtracciones->fetchAll();
    $estado['hoteles'] = $consultaHoteles->fetchAll();
    $estado['restaurantes'] = $consultaRestaurantes->fetchAll();

    echo json_encode($estado, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo consultar la base de datos.'], JSON_UNESCAPED_UNICODE);
}
