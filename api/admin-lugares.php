<?php
declare(strict_types=1);

session_start();
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

function responderAdminLugares(int $codigo, array $datos): never
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (empty($_SESSION['usuario_id']) || (int) ($_SESSION['rol_id'] ?? 0) !== 1) {
    responderAdminLugares(403, ['error' => 'Solo administración puede gestionar lugares destacados.']);
}

try {
    if (empty($_SESSION['csrf_admin_lugares'])) {
        $_SESSION['csrf_admin_lugares'] = bin2hex(random_bytes(32));
    }

    $pdo = conectarBaseDatos();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $consulta = $pdo->query(
            'SELECT e.id, e.nombre, e.tipo, e.activo, e.prioridad_manual,
                    COALESCE(AVG(r.calificacion), 0) AS calificacion_promedio,
                    COUNT(r.id) AS cantidad_resenas,
                    es.nombre AS estado, m.nombre AS municipio
             FROM establecimientos e
             INNER JOIN estados es ON es.id = e.estado_id
             LEFT JOIN municipios m ON m.id = e.municipio_id
             LEFT JOIN resenas r ON r.establecimiento_id = e.id
             GROUP BY e.id, e.nombre, e.tipo, e.activo, e.prioridad_manual,
                      e.calificacion_promedio, es.nombre, m.nombre
             ORDER BY e.prioridad_manual DESC, calificacion_promedio DESC, e.nombre'
        );
        responderAdminLugares(200, [
            'lugares' => $consulta->fetchAll(),
            'csrf_token' => $_SESSION['csrf_admin_lugares'],
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderAdminLugares(405, ['error' => 'Método no permitido.']);
    }

    $csrfRecibido = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if (!hash_equals($_SESSION['csrf_admin_lugares'], $csrfRecibido)) {
        responderAdminLugares(403, ['error' => 'La sesión de administración expiró. Recarga la página.']);
    }

    $datos = json_decode(file_get_contents('php://input'), true);
    if (!is_array($datos)) {
        responderAdminLugares(400, ['error' => 'Los datos enviados no son válidos.']);
    }

    $lugarId = filter_var($datos['id'] ?? null, FILTER_VALIDATE_INT);
    $destacado = filter_var($datos['destacado'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if (!$lugarId || $lugarId < 1 || $destacado === null) {
        responderAdminLugares(400, ['error' => 'El lugar o su prioridad no son válidos.']);
    }

    $verificar = $pdo->prepare('SELECT id FROM establecimientos WHERE id = :id');
    $verificar->execute(['id' => $lugarId]);
    if (!$verificar->fetch()) {
        responderAdminLugares(404, ['error' => 'El lugar no existe.']);
    }

    $pdo->beginTransaction();
    if ($destacado) {
        $pdo->exec('UPDATE establecimientos SET prioridad_manual = 0 WHERE prioridad_manual = 1');
    }
    $actualizar = $pdo->prepare(
        'UPDATE establecimientos SET prioridad_manual = :destacado WHERE id = :id'
    );
    $actualizar->execute([
        'destacado' => $destacado ? 1 : 0,
        'id' => $lugarId,
    ]);
    $pdo->commit();

    responderAdminLugares(200, ['mensaje' => 'La prioridad del lugar se actualizó.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error en admin-lugares.php: ' . $error->getMessage());
    responderAdminLugares(500, ['error' => 'No se pudo gestionar la prioridad de los lugares.']);
}
