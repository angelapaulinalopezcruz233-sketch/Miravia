<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth-comun.php';

prepararRespuestaAuth();
$datos = recibirDatosAuth();

$nombre = trim(is_string($datos['nombre'] ?? null) ? $datos['nombre'] : '');
$longitudNombre = preg_match_all('/./us', $nombre);
$usuario = trim(is_string($datos['usuario'] ?? null) ? $datos['usuario'] : '');
$correo = strtolower(trim(is_string($datos['correo'] ?? null) ? $datos['correo'] : ''));
$contrasena = '';

if (isset($datos['contrasena']) && is_string($datos['contrasena'])) {
    $contrasena = $datos['contrasena'];
} elseif (isset($datos['password']) && is_string($datos['password'])) {
    $contrasena = $datos['password'];
}

if ($nombre === '' || $longitudNombre === false || $longitudNombre > 100) {
    responderAuth(['error' => 'Escribe tu nombre.'], 400);
}

if (!preg_match('/^[\p{L}\p{N}._-]{3,30}$/u', $usuario)) {
    responderAuth(['error' => 'El usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo.'], 400);
}

if (strlen($correo) > 254 || filter_var($correo, FILTER_VALIDATE_EMAIL) === false) {
    responderAuth(['error' => 'Escribe un correo electrónico válido.'], 400);
}

if (strlen($contrasena) < 8 || strlen($contrasena) > 72) {
    responderAuth(['error' => 'La contraseña debe tener entre 8 y 72 caracteres.'], 400);
}

try {
    $pdo = conectarBaseDatos();
    $buscar = $pdo->prepare(
        'SELECT id FROM usuarios WHERE usuario = :usuario OR correo = :correo LIMIT 1'
    );
    $buscar->execute(['usuario' => $usuario, 'correo' => $correo]);

    if ($buscar->fetch()) {
        responderAuth(['error' => 'Ese usuario o correo ya está registrado.'], 409);
    }

    $insertar = $pdo->prepare(
        'INSERT INTO usuarios (nombre, usuario, correo, password_hash)
         VALUES (:nombre, :usuario, :correo, :password_hash)'
    );
    $insertar->execute([
        'nombre' => $nombre,
        'usuario' => $usuario,
        'correo' => $correo,
        'password_hash' => password_hash($contrasena, PASSWORD_DEFAULT),
    ]);

    $usuarioCreado = [
        'id' => (int) $pdo->lastInsertId(),
        'nombre' => $nombre,
        'usuario' => $usuario,
        'correo' => $correo,
    ];

    iniciarSesionAuth();
    guardarSesionUsuario($usuarioCreado);
    responderAuth(['mensaje' => 'Cuenta creada.', 'usuario' => $usuarioCreado], 201);
} catch (PDOException $error) {

    if ($error->getCode() === '23000') {
        responderAuth([
            'error' => 'Ese usuario o correo ya está registrado.'
        ], 409);
    }

    responderAuth([
        'error' => 'ERROR MYSQL: ' . $error->getMessage()
    ], 500);

} catch (Throwable $error) {

    responderAuth([
        'error' => 'ERROR PHP: ' . $error->getMessage()
    ], 500);
}
