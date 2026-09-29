<?php
declare(strict_types=1);

require_once __DIR__ . '/auth-comun.php';
require_once __DIR__ . '/db.php';

prepararRespuestaAuth();
iniciarSesionAuth();

$usuario = $_SESSION['usuario'] ?? null;
if (!is_array($usuario)) {
    responderAuth(['error' => 'Inicia sesión para continuar.'], 401);
}

try {
    $pdo = conectarBaseDatos();
    $consulta = $pdo->prepare(
        'SELECT id, nombre, usuario, correo
         FROM usuarios
         WHERE id = :id AND activo = 1
         LIMIT 1'
    );
    $consulta->execute(['id' => $usuario['id']]);
    $usuarioActual = $consulta->fetch();

    if (!$usuarioActual) {
        $_SESSION = [];
        session_destroy();
        responderAuth(['error' => 'Inicia sesión para continuar.'], 401);
    }

    responderAuth(['usuario' => $usuarioActual]);
} catch (Throwable $error) {
    responderAuth(['error' => 'No se pudo comprobar la sesión.'], 500);
}
