<?php
declare(strict_types=1);

session_start();
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

function responderResenas(int $codigo, array $datos): never
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $pdo = conectarBaseDatos();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $establecimientoId = filter_input(INPUT_GET, 'establecimiento_id', FILTER_VALIDATE_INT);
        if (!$establecimientoId || $establecimientoId < 1) {
            responderResenas(400, ['error' => 'El lugar seleccionado no es válido.']);
        }

        $consulta = $pdo->prepare(
            'SELECT r.calificacion, r.comentario, r.creado_en, u.nombre AS autor
             FROM resenas r
             INNER JOIN usuarios u ON u.id = r.usuario_id
             INNER JOIN establecimientos e ON e.id = r.establecimiento_id
             WHERE r.establecimiento_id = :establecimiento_id AND e.activo = 1
             ORDER BY r.creado_en DESC, r.id DESC'
        );
        $consulta->execute(['establecimiento_id' => $establecimientoId]);
        responderResenas(200, ['resenas' => $consulta->fetchAll()]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderResenas(405, ['error' => 'Método no permitido.']);
    }

    if (empty($_SESSION['usuario_id'])) {
        responderResenas(401, ['error' => 'Inicia sesión para dejar una reseña.']);
    }

    $datos = json_decode(file_get_contents('php://input'), true);
    if (!is_array($datos)) {
        responderResenas(400, ['error' => 'Los datos enviados no son válidos.']);
    }

    $establecimientoId = filter_var($datos['establecimiento_id'] ?? null, FILTER_VALIDATE_INT);
    $calificacion = filter_var($datos['calificacion'] ?? null, FILTER_VALIDATE_INT);
    $comentario = trim((string) ($datos['comentario'] ?? ''));

    if (!$establecimientoId || $establecimientoId < 1) {
        responderResenas(400, ['error' => 'El lugar seleccionado no es válido.']);
    }
    if (!$calificacion || $calificacion < 1 || $calificacion > 5) {
        responderResenas(400, ['error' => 'Selecciona una calificación de 1 a 5 estrellas.']);
    }
    if ($comentario === '' || mb_strlen($comentario) > 2000) {
        responderResenas(400, ['error' => 'Escribe un comentario de hasta 2000 caracteres.']);
    }

    $consultaLugar = $pdo->prepare(
        'SELECT id FROM establecimientos WHERE id = :id AND activo = 1 LIMIT 1'
    );
    $consultaLugar->execute(['id' => $establecimientoId]);
    if (!$consultaLugar->fetch()) {
        responderResenas(404, ['error' => 'El lugar ya no está disponible.']);
    }

    $pdo->beginTransaction();
    $insertar = $pdo->prepare(
        'INSERT INTO resenas (usuario_id, establecimiento_id, calificacion, comentario)
         VALUES (:usuario_id, :establecimiento_id, :calificacion, :comentario)'
    );
    $insertar->execute([
        'usuario_id' => (int) $_SESSION['usuario_id'],
        'establecimiento_id' => $establecimientoId,
        'calificacion' => $calificacion,
        'comentario' => $comentario,
    ]);

    $actualizarPromedio = $pdo->prepare(
        'UPDATE establecimientos
         SET calificacion_promedio = (
             SELECT AVG(calificacion)
             FROM resenas
             WHERE establecimiento_id = :establecimiento_id
         )
         WHERE id = :id'
    );
    $actualizarPromedio->execute([
        'establecimiento_id' => $establecimientoId,
        'id' => $establecimientoId,
    ]);

    $consultaPromedio = $pdo->prepare(
        'SELECT AVG(calificacion) AS promedio, COUNT(*) AS cantidad
         FROM resenas
         WHERE establecimiento_id = :establecimiento_id'
    );
    $consultaPromedio->execute(['establecimiento_id' => $establecimientoId]);
    $resumen = $consultaPromedio->fetch();
    $pdo->commit();

    responderResenas(201, [
        'mensaje' => 'Tu reseña se guardó correctamente.',
        'calificacion_promedio' => (float) $resumen['promedio'],
        'cantidad_resenas' => (int) $resumen['cantidad'],
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error en resenas.php: ' . $error->getMessage());
    responderResenas(500, ['error' => 'No se pudo guardar o consultar la reseña.']);
}
