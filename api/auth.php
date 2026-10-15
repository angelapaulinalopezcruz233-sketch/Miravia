
<?php
//AGTH

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function responder(int $codigo, array $datos): never
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

try {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (!is_array($datos)) {
        responder(400, [
            'ok' => false,
            'mensaje' => 'Los datos enviados no son válidos.'
        ]);
    }

    $correo = strtolower(trim((string)($datos['correo'] ?? '')));
    $contrasena = (string)($datos['contrasena'] ?? '');

    if ($correo === '' || $contrasena === '') {
        responder(400, [
            'ok' => false,
            'mensaje' => 'Escribe tu correo y contraseña.'
        ]);
    }

    $pdo = conectarBaseDatos();

    // La contraseña se guarda en la columna "contrasena".
    $consulta = $pdo->prepare(
        'SELECT id, rol_id, nombre, correo, contrasena
         FROM usuarios
         WHERE correo = :correo
         LIMIT 1'
    );

    $consulta->execute(['correo' => $correo]);
    $usuario = $consulta->fetch();

    if (
        !$usuario ||
        !password_verify($contrasena, $usuario['contrasena'])
    ) {
        responder(401, [
            'ok' => false,
            'mensaje' => 'Correo o contraseña incorrectos.'
        ]);
    }

    session_regenerate_id(true);

    $_SESSION['usuario_id'] = (int)$usuario['id'];
    $_SESSION['rol_id'] = (int)$usuario['rol_id'];
    $_SESSION['nombre'] = $usuario['nombre'];
    $_SESSION['correo'] = $usuario['correo'];

    responder(200, [
        'ok' => true,
        'mensaje' => 'Inicio de sesión correcto.',
        'usuario' => [
            'id' => (int)$usuario['id'],
            'rol_id' => (int)$usuario['rol_id'],
            'nombre' => $usuario['nombre'],
            'correo' => $usuario['correo']
        ]
    ]);

} catch (Throwable $error) {
    error_log('Error en auth.php: ' . $error->getMessage());

    responder(500, [
        'ok' => false,
        'mensaje' => 'Ocurrió un error al iniciar sesión.'
    ]);
}
