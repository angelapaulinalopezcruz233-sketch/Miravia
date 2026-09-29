<?php
declare(strict_types=1);

function prepararRespuestaAuth(): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
}

function responderAuth(array $datos, int $estado = 200): void
{
    http_response_code($estado);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function recibirDatosAuth(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        responderAuth(['error' => 'Método no permitido.'], 405);
    }

    $contenido = file_get_contents('php://input');
    $datos = json_decode($contenido ?: '', true);

    if (!is_array($datos)) {
        responderAuth(['error' => 'La solicitud no tiene un formato válido.'], 400);
    }

    return $datos;
}

function iniciarSesionAuth(bool $recordar = false): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $duracion = $recordar ? 60 * 60 * 24 * 30 : 0;
    if ($recordar) {
        ini_set('session.gc_maxlifetime', (string) $duracion);
    }

    session_set_cookie_params([
        'lifetime' => $duracion,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function guardarSesionUsuario(array $usuario): void
{
    session_regenerate_id(true);
    $_SESSION['usuario'] = [
        'id' => (int) $usuario['id'],
        'nombre' => $usuario['nombre'],
        'usuario' => $usuario['usuario'],
        'correo' => $usuario['correo'],
    ];
}
