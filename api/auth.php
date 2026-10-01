<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');


function responder(array $datos, int $codigo = 200): never
{
    http_response_code($codigo);

    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}


/*
|--------------------------------------------------------------------------
| LEER DATOS
|--------------------------------------------------------------------------
*/

function leerDatos(): array
{
    $raw = trim(
        (string) file_get_contents('php://input')
    );

    if ($raw !== '') {

        $json = json_decode($raw, true);

        if (is_array($json)) {
            return $json;
        }

        parse_str($raw, $formulario);

        if (is_array($formulario) && !empty($formulario)) {
            return $formulario;
        }
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    return $_GET;
}


/*
|--------------------------------------------------------------------------
| ACCIÓN
|--------------------------------------------------------------------------
*/

$accion =
    $_GET['accion']
    ?? $_POST['accion']
    ?? 'sesion';


try {

    /*
    |--------------------------------------------------------------------------
    | CERRAR SESIÓN
    |--------------------------------------------------------------------------
    */

    if ($accion === 'logout') {

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {

            $parametros = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                time() - 42000,
                $parametros['path'],
                $parametros['domain'],
                $parametros['secure'],
                $parametros['httponly']
            );
        }

        session_destroy();

        responder([
            'autenticado' => false
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | INICIAR SESIÓN
    |--------------------------------------------------------------------------
    */

    if ($accion === 'login') {

        $datos = leerDatos();


        /*
        |----------------------------------------------------------------------
        | USUARIO
        |----------------------------------------------------------------------
        */

        $identificadorInput = trim(
            (string) (
                $datos['correo']
                ?? $datos['usuario']
                ?? ''
            )
        );


        /*
        |----------------------------------------------------------------------
        | CONTRASEÑA
        |----------------------------------------------------------------------
        */

        $contrasena = (string) (
            $datos['contrasena']
            ?? $datos['password']
            ?? ''
        );


        /*
        |----------------------------------------------------------------------
        | VALIDAR DATOS
        |----------------------------------------------------------------------
        */

        if (
            $identificadorInput === ''
            ||
            $contrasena === ''
        ) {

            responder([
                'error' =>
                    'Escribe tu correo y contraseña.'
            ], 422);
        }


        $esCorreo = filter_var(
            $identificadorInput,
            FILTER_VALIDATE_EMAIL
        ) !== false;

        $esUsuario = preg_match(
            '/^[\p{L}\p{N}._-]{3,30}$/u',
            $identificadorInput
        ) === 1;

        if (!$esCorreo && !$esUsuario) {

            responder([
                'error' =>
                    'Escribe un correo válido o un nombre de usuario.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | CONECTAR BASE DE DATOS
        |--------------------------------------------------------------------------
        */

        $pdo = conectarBaseDatos();


        /*
        |--------------------------------------------------------------------------
        | BUSCAR USUARIO
        |--------------------------------------------------------------------------
        */

        $columnas = array_column(
            $pdo->query('SHOW COLUMNS FROM usuarios')->fetchAll(PDO::FETCH_ASSOC),
            'Field'
        );
        $columnaCorreo = in_array('correo', $columnas, true)
            ? 'correo'
            : (in_array('email', $columnas, true) ? 'email' : null);
        $columnaContrasena = in_array('contrasena', $columnas, true)
            ? 'contrasena'
            : (in_array('password_hash', $columnas, true) ? 'password_hash' : null);

        if ($columnaCorreo === null || $columnaContrasena === null) {
            responder([
                'error' => 'La estructura de usuarios no es compatible con el inicio de sesión.'
            ], 500);
        }

        $tieneUsuario = in_array('usuario', $columnas, true);
        $tieneActivo = in_array('activo', $columnas, true);
        $tieneRoles = in_array('rol_id', $columnas, true)
            && $pdo->query("SHOW TABLES LIKE 'roles'")->fetchColumn() !== false;

        $campoUsuario = $tieneUsuario ? 'u.usuario' : "''";
        $campoActivo = $tieneActivo ? 'u.activo' : '1';
        $campoRol = $tieneRoles
            ? 'r.nombre'
            : (in_array('rol', $columnas, true) ? 'u.rol' : "'usuario'");
        $joinRoles = $tieneRoles ? 'LEFT JOIN roles r ON r.id = u.rol_id' : '';

        $condiciones = [
            'LOWER(u.`' . $columnaCorreo . '`) = LOWER(:correo)'
        ];
        $parametros = [':correo' => $identificadorInput];

        if ($tieneUsuario) {
            $condiciones[] = 'u.usuario = :usuario';
            $parametros[':usuario'] = $identificadorInput;
        }

        $consulta = $pdo->prepare(
            'SELECT u.id, u.nombre, ' . $campoUsuario . ' AS usuario, '
            . 'u.`' . $columnaCorreo . '` AS correo, '
            . 'u.`' . $columnaContrasena . '` AS contrasena, '
            . $campoActivo . ' AS activo, ' . $campoRol . ' AS nombre_rol '
            . 'FROM usuarios u ' . $joinRoles . ' '
            . 'WHERE (' . implode(' OR ', $condiciones) . ') LIMIT 1'
        );

        $consulta->execute($parametros);


        $usuario = $consulta->fetch(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | USUARIO NO ENCONTRADO
        |--------------------------------------------------------------------------
        */

        if (!$usuario) {

            responder([
                'error' =>
                    'El correo o nombre de usuario o la contraseña no son correctos.'
            ], 401);
        }


        /*
        |--------------------------------------------------------------------------
        | USUARIO INACTIVO
        |--------------------------------------------------------------------------
        */

        if ((int) $usuario['activo'] !== 1) {

            responder([
                'error' =>
                    'Esta cuenta está desactivada.'
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR CONTRASEÑA
        |--------------------------------------------------------------------------
        */

        if (
            empty($usuario['contrasena'])
            ||
            !password_verify(
                $contrasena,
                (string) $usuario['contrasena']
            )
        ) {

            responder([
                'error' =>
                    'El correo o nombre de usuario o la contraseña no son correctos.'
            ], 401);
        }


        /*
        |--------------------------------------------------------------------------
        | CREAR SESIÓN
        |--------------------------------------------------------------------------
        */

        session_regenerate_id(true);


        $_SESSION['autenticado'] = true;

        $_SESSION['usuario_id'] =
            (int) $usuario['id'];

        $_SESSION['usuario'] =
            $usuario['usuario'] !== ''
                ? $usuario['usuario']
                : $usuario['correo'];

        $_SESSION['nombre'] =
            $usuario['nombre'];

        $_SESSION['correo'] =
            $usuario['correo'];

        $_SESSION['rol'] =
            $usuario['nombre_rol'] ?? 'usuario';


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        responder([
            'autenticado' => true,

            'mensaje' =>
                'Inicio de sesión correcto.',

            'usuario' => [
                'id' =>
                    (int) $usuario['id'],

                'nombre' =>
                    $usuario['nombre'],

                'usuario' =>
                    $usuario['usuario'],

                'correo' =>
                    $usuario['correo'],

                'rol' =>
                    $usuario['nombre_rol'] ?? 'usuario'
            ]
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | COMPROBAR SESIÓN
    |--------------------------------------------------------------------------
    */

    if ($accion === 'sesion') {

        if (
            isset($_SESSION['autenticado'])
            &&
            $_SESSION['autenticado'] === true
        ) {

            responder([
                'autenticado' => true,

                'usuario' => [
                    'id' =>
                        $_SESSION['usuario_id'] ?? null,

                    'nombre' =>
                        $_SESSION['nombre'] ?? '',

                    'usuario' =>
                        $_SESSION['usuario'] ?? '',

                    'correo' =>
                        $_SESSION['correo'] ?? '',

                    'rol' =>
                        $_SESSION['rol'] ?? 'usuario'
                ]
            ]);
        }


        responder([
            'autenticado' => false
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ACCIÓN NO VÁLIDA
    |--------------------------------------------------------------------------
    */

    responder([
        'error' => 'Acción no válida.'
    ], 400);


} catch (PDOException $error) {

    error_log(
        'ERROR PDO auth.php: '
        . $error->getMessage()
    );

    responder([
        'error' =>
            'Error de base de datos.'
    ], 500);


} catch (Throwable $error) {

    error_log(
        'ERROR PHP auth.php: '
        . $error->getMessage()
    );

    responder([
        'error' =>
            'No se pudo completar la operación.'
    ], 500);
}