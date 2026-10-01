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

        $usuarioInput = trim(
            (string) (
                $datos['usuario']
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
            $usuarioInput === ''
            ||
            $contrasena === ''
        ) {

            responder([
                'error' =>
                    'Escribe tu nombre de usuario y contraseña.'
            ], 422);
        }


        if (
            !preg_match(
                '/^[\p{L}\p{N}._-]{3,30}$/u',
                $usuarioInput
            )
        ) {

            responder([
                'error' =>
                    'El nombre de usuario no es válido.'
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

        $consulta = $pdo->prepare(
            'SELECT
                u.id,
                u.nombre,
                u.usuario,
                u.correo,
                u.contrasena,
                u.activo,
                u.rol_id,
                r.nombre AS nombre_rol
             FROM usuarios u
             LEFT JOIN roles r
                ON r.id = u.rol_id
             WHERE u.usuario = :usuario
             LIMIT 1'
        );


        $consulta->execute([
            ':usuario' => $usuarioInput
        ]);


        $usuario = $consulta->fetch(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | USUARIO NO ENCONTRADO
        |--------------------------------------------------------------------------
        */

        if (!$usuario) {

            responder([
                'error' =>
                    'El nombre de usuario o la contraseña no son correctos.'
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
                    'El nombre de usuario o la contraseña no son correctos.'
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
            $usuario['usuario'];

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