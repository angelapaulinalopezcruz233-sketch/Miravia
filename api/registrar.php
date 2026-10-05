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
    $columnasInfo = $pdo->query('SHOW COLUMNS FROM usuarios')->fetchAll(PDO::FETCH_ASSOC);
    $columnas = array_column($columnasInfo, 'Field');
    $columnasPorNombre = array_column($columnasInfo, null, 'Field');
    $columnasCorreo = array_values(array_intersect(['correo', 'email'], $columnas));
    $columnasContrasena = array_values(array_intersect(['contrasena', 'password_hash'], $columnas));

    if ($columnasCorreo === [] || $columnasContrasena === []) {
        responder(['error' => 'La estructura de usuarios no es compatible con el registro.'], 500);
    }

    $usuario = trim((string) ($datos['usuario'] ?? ''));
    $tieneUsuario = in_array('usuario', $columnas, true);
    if ($tieneUsuario && !preg_match('/^[\p{L}\p{N}._-]{3,30}$/u', $usuario)) {
        responder(['error' => 'Escribe un nombre de usuario válido de 3 a 30 caracteres.'], 422);
    }

    $condicionesCorreo = [];
    $parametrosCorreo = [];
    foreach ($columnasCorreo as $indice => $columna) {
        $parametro = ':correo' . $indice;
        $condicionesCorreo[] = 'LOWER(`' . $columna . '`) = LOWER(' . $parametro . ')';
        $parametrosCorreo[$parametro] = $correo;
    }

    $consultaExiste = $pdo->prepare(
        'SELECT id FROM usuarios WHERE (' . implode(' OR ', $condicionesCorreo) . ') LIMIT 1'
    );
    $consultaExiste->execute($parametrosCorreo);
    if ($consultaExiste->fetch()) {
        responder(['error' => 'Ese correo ya está registrado.'], 409);
    }

    if ($tieneUsuario) {
        $consultaUsuario = $pdo->prepare('SELECT id FROM usuarios WHERE usuario = :usuario LIMIT 1');
        $consultaUsuario->execute(['usuario' => $usuario]);
        if ($consultaUsuario->fetch()) {
            responder(['error' => 'Ese nombre de usuario ya está registrado.'], 409);
        }
    }

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);
    $datosInsert = ['nombre' => $nombre];
    foreach ($columnasCorreo as $columna) {
        $datosInsert[$columna] = $correo;
    }
    foreach ($columnasContrasena as $columna) {
        $datosInsert[$columna] = $hash;
    }
    if ($tieneUsuario) {
        $datosInsert['usuario'] = $usuario;
    }
    if (in_array('activo', $columnas, true)) {
        $datosInsert['activo'] = 1;
    }

    $rolesDisponibles = $pdo->query("SHOW TABLES LIKE 'roles'")->fetchColumn() !== false;
    $rolNombre = 'usuario';
    if (in_array('rol_id', $columnas, true) && $rolesDisponibles) {
        $consultaRol = $pdo->prepare("SELECT id, nombre FROM roles WHERE nombre = 'usuario' LIMIT 1");
        $consultaRol->execute();
        $rol = $consultaRol->fetch(PDO::FETCH_ASSOC);
        if (!$rol) {
            responder(['error' => 'No existe el rol usuario en la base de datos.'], 500);
        }
        $datosInsert['rol_id'] = (int) $rol['id'];
        $rolNombre = (string) $rol['nombre'];
    } elseif (in_array('rol', $columnas, true)) {
        $datosInsert['rol'] = 'cliente';
        $rolNombre = 'cliente';
    } elseif (
        in_array('rol_id', $columnas, true)
        && $columnasPorNombre['rol_id']['Null'] === 'NO'
        && $columnasPorNombre['rol_id']['Default'] === null
    ) {
        responder(['error' => 'La base de datos no tiene configurada la tabla de roles.'], 500);
    }

    foreach (['creado_en', 'created_at', 'actualizado_en'] as $columnaFecha) {
        if (in_array($columnaFecha, $columnas, true)) {
            $datosInsert[$columnaFecha] = date('Y-m-d H:i:s');
        }
    }

    $campos = array_keys($datosInsert);
    $placeholders = array_map(static fn ($campo) => ':' . $campo, $campos);
    $insertar = $pdo->prepare(
        'INSERT INTO usuarios (`' . implode('`, `', $campos) . '`) VALUES (' . implode(', ', $placeholders) . ')'
    );
    $insertar->execute($datosInsert);

    $usuarioCreado = [
        'id' => (int) $pdo->lastInsertId(),
        'nombre' => $nombre,
        'usuario' => $usuario !== '' ? $usuario : $correo,
        'correo' => $correo,
        'rol' => $rolNombre,
    ];

    session_regenerate_id(true);
    $_SESSION['autenticado'] = true;
    $_SESSION['usuario_id'] = $usuarioCreado['id'];
    $_SESSION['usuario'] = $usuarioCreado['usuario'];
    $_SESSION['nombre'] = $nombre;
    $_SESSION['correo'] = $correo;
    $_SESSION['rol'] = $rolNombre;
    responder(['autenticado' => true, 'usuario' => $usuarioCreado], 201);
} catch (Throwable $error) {
    responder(['error' => 'No se pudo crear la cuenta.'], 500);
}
