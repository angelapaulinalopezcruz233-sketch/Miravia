<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder(array $datos, int $codigo = 200): never
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function leerDatosRegistro(): array
{
    $raw = trim((string) file_get_contents('php://input'));

    if ($raw !== '') {
        $json = json_decode($raw, true);
        if (is_array($json) && !empty($json)) {
            return $json;
        }

        parse_str($raw, $datosFormulario);
        if (!empty($datosFormulario)) {
            return $datosFormulario;
        }
    }

    foreach ([$_POST, $_GET, $_REQUEST] as $fuente) {
        if (is_array($fuente) && !empty($fuente)) {
            return $fuente;
        }
    }

    return [];
}

try {
    $datos = leerDatosRegistro();
    if (empty($datos)) {
        responder(['error' => 'No se recibieron datos del registro.'], 400);
    }

    $nombre = trim((string) ($datos['nombre'] ?? $datos['nombreCompleto'] ?? $datos['usuario'] ?? ''));
    $correo = strtolower(trim((string) ($datos['correo'] ?? $datos['email'] ?? '')));
    $contrasena = (string) ($datos['contrasena'] ?? $datos['password'] ?? '');

    if ($nombre === '' || strlen($nombre) > 100) {
        responder(['error' => 'Escribe tu nombre completo.'], 400);
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        responder(['error' => 'Escribe un correo electrónico válido.'], 400);
    }

    if (strlen($contrasena) < 8 || strlen($contrasena) > 72) {
        responder(['error' => 'La contraseña debe tener entre 8 y 72 caracteres.'], 400);
    }

    $pdo = conectarBaseDatos();
    $columnas = array_map(static fn ($col) => $col['Field'], $pdo->query('SHOW COLUMNS FROM usuarios')->fetchAll());

    $rolUsuario = $pdo->query("SELECT id FROM roles WHERE nombre = 'usuario' LIMIT 1")->fetchColumn();
    if ($rolUsuario === false) {
        responder(['error' => 'No existe el rol usuario en la base de datos.'], 500);
    }

    $consultaExiste = $pdo->prepare(
        'SELECT id FROM usuarios WHERE COALESCE(correo, email) = :correo LIMIT 1'
    );
    $consultaExiste->execute(['correo' => $correo]);
    if ($consultaExiste->fetch()) {
        responder(['error' => 'Ese correo ya está registrado.'], 409);
    }

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);

    if (in_array('correo', $columnas, true) && in_array('contrasena', $columnas, true)) {
        $campos = ['nombre', 'correo', 'contrasena', 'rol_id', 'activo'];
        $datosInsert = [
            'nombre' => $nombre,
            'correo' => $correo,
            'contrasena' => $hash,
            'rol_id' => (int) $rolUsuario,
            'activo' => 1,
        ];

        if (in_array('email', $columnas, true)) {
            $campos[] = 'email';
            $datosInsert['email'] = $correo;
        }

        if (in_array('password_hash', $columnas, true)) {
            $campos[] = 'password_hash';
            $datosInsert['password_hash'] = $hash;
        }

        $placeholders = implode(', ', array_map(static fn ($campo) => ':' . $campo, $campos));
        $consultaInsert = 'INSERT INTO usuarios (' . implode(', ', $campos) . ') VALUES (' . $placeholders . ')';
        $insertar = $pdo->prepare($consultaInsert);
        $insertar->execute($datosInsert);
    } elseif (in_array('email', $columnas, true) && in_array('password_hash', $columnas, true)) {
        $insertar = $pdo->prepare(
            'INSERT INTO usuarios (nombre, email, password_hash, rol, created_at)
             VALUES (:nombre, :correo, :password_hash, :rol, NOW())'
        );
        $insertar->execute([
            'nombre' => $nombre,
            'correo' => $correo,
            'password_hash' => $hash,
            'rol' => 'cliente',
        ]);
    } else {
        responder(['error' => 'La estructura de usuarios no es compatible con el registro.'], 500);
    }

    $usuarioCreado = [
        'id' => (int) $pdo->lastInsertId(),
        'nombre' => $nombre,
        'correo' => $correo,
        'rol' => 'usuario',
    ];

    session_regenerate_id(true);
    $_SESSION['usuario'] = $usuarioCreado;
    responder(['autenticado' => true, 'usuario' => $usuarioCreado], 201);
} catch (Throwable $error) {
    responder(['error' => 'No se pudo crear la cuenta.'], 500);
}
