<?php

declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

if (isset($_SESSION['autenticado']) && $_SESSION['autenticado'] === true) {

    echo json_encode([
        'autenticado' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'] ?? null,
            'nombre' => $_SESSION['nombre'] ?? '',
            'usuario' => $_SESSION['usuario'] ?? '',
            'correo' => $_SESSION['correo'] ?? ''
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}

echo json_encode([
    'autenticado' => false
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

exit;