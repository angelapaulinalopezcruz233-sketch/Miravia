
<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

if (isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'ok' => true,
        'autenticado' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nombre' => $_SESSION['nombre'] ?? '',
            'correo' => $_SESSION['correo'] ?? '',
            'rol_id' => (int) ($_SESSION['rol_id'] ?? 0),
            'es_admin' => (int) ($_SESSION['rol_id'] ?? 0) === 1
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'ok' => true,
    'autenticado' => false,
    'mensaje' => 'No hay una sesión iniciada.'
], JSON_UNESCAPED_UNICODE);
