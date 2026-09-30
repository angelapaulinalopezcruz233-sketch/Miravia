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

function leerDatosAutenticacion(): array
{
    $raw = trim((string) file_get_contents('php://input'));
    if ($raw !== '') {
        $json = json_decode($raw, true);
        if (is_array($json)) {
            return $json;
        }
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    return $_GET;
}

$accion = $_GET['accion'] ?? $_POST['accion'] ?? $_REQUEST['accion'] ?? 'sesion';

try {
    $datos = leerDatosAutenticacion();

    if ($accion === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $parametros = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $parametros['path'], $parametros['domain'], $parametros['secure'], $parametros['httponly']);
        }
        session_destroy();
        responder(['autenticado' => false]);
    }

    if ($accion === 'login') {
        $correo = strtolower(trim((string) ($datos['correo'] ?? $datos['email'] ?? $datos['identificador'] ?? $datos['usuario'] ?? '')));
        $contrasena = (string) ($datos['contrasena'] ?? $datos['password'] ?? '');

        if ($correo === '' || $contrasena === '') {
            responder(['error' => 'Escribe un correo y una contraseña válidos.'], 422);
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            responder(['error' => 'El correo no tiene un formato válido.'], 422);
        }

        $pdo = conectarBaseDatos();
        $columnas = array_map(static fn ($columna) => $columna['Field'], $pdo->query('SHOW COLUMNS FROM usuarios')->fetchAll());
        $usaCamposNuevos = in_array('correo', $columnas, true) && in_array('contrasena', $columnas, true);

        if (in_array('correo', $columnas, true)) {
            $consulta = $pdo->prepare(
                'SELECT u.id, u.nombre, COALESCE(u.correo, u.email) AS correo, COALESCE(u.contrasena, u.password_hash) AS contrasena, COALESCE(r.nombre, CASE u.rol WHEN "admin" THEN "admin" ELSE "usuario" END) AS rol
                 FROM usuarios u
                 LEFT JOIN roles r ON r.id = u.rol_id
                 WHERE COALESCE(u.correo, u.email) = :correo AND u.activo = 1 LIMIT 1'
            );
        } else {
            $consulta = $pdo->prepare(
                'SELECT u.id, u.nombre, COALESCE(u.correo, u.email) AS correo, COALESCE(u.contrasena, u.password_hash) AS contrasena, COALESCE(r.nombre, CASE u.rol WHEN "admin" THEN "admin" ELSE "usuario" END) AS rol
                 FROM usuarios u
                 LEFT JOIN roles r ON r.id = u.rol_id
                 WHERE COALESCE(u.correo, u.email) = :correo AND u.activo = 1 LIMIT 1'
            );
        }

        $consulta->execute(['correo' => $correo]);
        $usuario = $consulta->fetch();

        if (!$usuario || !password_verify($contrasena, (string) $usuario['contrasena'])) {
            responder(['error' => 'El correo o la contraseña no son correctos.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['usuario'] = [
            'id' => (int) $usuario['id'],
            'nombre' => $usuario['nombre'],
            'correo' => $usuario['correo'],
            'rol' => $usuario['rol'],
        ];

        responder(['autenticado' => true, 'usuario' => $_SESSION['usuario']]);
    }

    if ($accion === 'sesion') {
        responder(isset($_SESSION['usuario'])
            ? ['autenticado' => true, 'usuario' => $_SESSION['usuario']]
            : ['autenticado' => false]);
    }

    responder(['error' => 'Acción no válida.'], 400);
} catch (Throwable $error) {
    responder(['error' => 'No se pudo completar la operación.'], 500);
}
