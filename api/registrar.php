<?php
//AGTH
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function responder(int $codigo, array $datos): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, [
        'ok' => false,
        'mensaje' => 'Método no permitido.'
    ]);
}

$contenido = file_get_contents('php://input');
$datos = json_decode($contenido, true);

if (!is_array($datos)) {
    responder(400, [
        'ok' => false,
        'mensaje' => 'Los datos enviados no son válidos.'
    ]);
}

$nombre = trim((string)($datos['nombre'] ?? ''));
$correo = strtolower(trim((string)($datos['correo'] ?? '')));
$contrasena = (string)($datos['contrasena'] ?? '');

if ($nombre === '' ||
    $correo === '' || $contrasena === '') {
    responder(400, [
        'ok' => false,
        'mensaje' => 'Completa todos los campos.'
    ]);
}

if (mb_strlen($nombre) > 100) {
    responder(400, [
        'ok' => false,
        'mensaje' => 'El nombre no debe superar 100 caracteres.'
    ]);
}


if (!filter_var($correo, FILTER_VALIDATE_EMAIL) ||
    strlen($correo) > 190) {
    responder(400, [
        'ok' => false,
        'mensaje' => 'Escribe un correo electrónico válido.'
    ]);
}

if (strlen($contrasena) < 8) {
    responder(400, [
        'ok' => false,
        'mensaje' => 'La contraseña debe tener al menos 8 caracteres.'
    ]);
}

if (strlen($contrasena) > 72) {
    responder(400, [
        'ok' => false,
        'mensaje' => 'La contraseña es demasiado larga.'
    ]);
}

try {
    $pdo = conectarBaseDatos();

    // Comprobar si el correo o el usuario ya existen.
    $consulta = $pdo->prepare(
        'SELECT id
         FROM usuarios
         WHERE correo = :correo
         LIMIT 1'
    );

    $consulta->execute([
        'correo' => $correo
    ]);

    if ($consulta->fetch()) {
        responder(409, [
            'ok' => false,
            'mensaje' => 'Ese correo ya está registrado.'
        ]);
    }

    // Nunca guardar la contraseña como texto normal.
    $hash = password_hash($contrasena, PASSWORD_DEFAULT);

    // Los registros públicos tendrán el rol de usuario (rol_id = 3).
    $insertar = $pdo->prepare(
        'INSERT INTO usuarios
            (rol_id, nombre, correo, contrasena)
         VALUES
            (:rol_id, :nombre, :correo, :contrasena)'
    );

    $insertar->execute([
        'rol_id' => 3,
        'nombre' => $nombre,

        'correo' => $correo,
        'contrasena' => $hash
    ]);

    responder(201, [
        'ok' => true,
        'mensaje' => 'Tu cuenta se registró correctamente.',
        'nombre' => [
            'id' => (int)$pdo->lastInsertId(),
            'nombre' => $nombre,

            'correo' => $correo
        ]
    ]);

} catch (PDOException $e) {
    // También protege ante intentos simultáneos de duplicar datos.
    if ($e->getCode() === '23000') {
        responder(409, [
            'ok' => false,
            'mensaje' => 'El correo ya está registrado.'
        ]);
    }

    error_log('Error al registrar usuario: ' . $e->getMessage());

    responder(500, [
        'ok' => false,
        'mensaje' => 'No se pudo guardar el registro. Revisa la conexión con la base de datos.'
    ]);
}
