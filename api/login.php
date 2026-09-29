<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth-comun.php';

prepararRespuestaAuth();
$datos = recibirDatosAuth();

$identificador = trim(is_string($datos['identificador'] ?? null) ? $datos['identificador'] : '');
$contrasena = is_string($datos['contrasena'] ?? null) ? $datos['contrasena'] : '';
$recordar = filter_var($datos['recordarme'] ?? false, FILTER_VALIDATE_BOOLEAN);

if ($identificador === '' || $contrasena === '') {
    responderAuth(['error' => 'Escribe tu usuario o correo y contraseña.'], 400);
}

if (strlen($contrasena) > 72) {
    responderAuth(['error' => 'La contraseña no puede superar los 72 caracteres.'], 400);
}

try {
    $pdo = conectarBaseDatos();
    $consulta = $pdo->prepare(
        'SELECT id, nombre, usuario, correo, password_hash
         FROM usuarios
         WHERE (usuario = :usuario OR correo = :correo) AND activo = 1
         LIMIT 1'
    );
    $consulta->execute([
        'usuario' => $identificador,
        'correo' => $identificador,
    ]);
    $usuario = $consulta->fetch();

    if (!$usuario || !password_verify($contrasena, $usuario['password_hash'])) {
        responderAuth(['error' => 'Usuario o contraseña incorrectos.'], 401);
    }

    if (password_needs_rehash($usuario['password_hash'], PASSWORD_DEFAULT)) {
        $actualizar = $pdo->prepare('UPDATE usuarios SET password_hash = :hash WHERE id = :id');
        $actualizar->execute([
            'hash' => password_hash($contrasena, PASSWORD_DEFAULT),
            'id' => $usuario['id'],
        ]);
    }

    iniciarSesionAuth($recordar);
    guardarSesionUsuario($usuario);
    unset($usuario['password_hash']);

    responderAuth(['mensaje' => 'Sesión iniciada.', 'usuario' => $usuario]);
} catch (Throwable $error) {
    responderAuth(['error' => 'No se pudo iniciar sesión. Inténtalo de nuevo.'], 500);
}
