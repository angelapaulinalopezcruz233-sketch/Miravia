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

        if (!empty($formulario)) {
            return $formulario;
        }
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    return [];
}


try {

    /*
    |--------------------------------------------------------------------------
    | ACCIÓN
    |--------------------------------------------------------------------------
    */

    $accion =
        $_GET['accion']
        ?? $_POST['accion']
        ?? 'sesion';


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
    | COMPROBAR SESIÓN
    |--------------------------------------------------------------------------
    */

    if ($accion === 'sesion') {

        if (isset($_SESSION['usuario_id'])) {

            responder([
                'autenticado' => true,
                'usuario' => [
                    'id' => $_SESSION['usuario_id'],
                    'nombre' => $_SESSION['nombre'] ?? '',
                    'usuario' => $_SESSION['usuario'] ?? '',
                    'correo' => $_SESSION['correo'] ?? ''
                ]
            ]);
        }

        responder([
            'autenticado' => false
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    if ($accion === 'login') {

        $datos = leerDatos();

        $usuario = trim(
            (string) (
                $datos['usuario']
                ?? ''
            )
        );

        $contrasena = (string) (
            $datos['contrasena']
            ?? ''
        );


        /*
        |--------------------------------------------------------------------------
        | VALIDAR USUARIO
        |--------------------------------------------------------------------------
        */

        if ($usuario === '') {

            responder([
                'error' => 'Escribe tu nombre de usuario.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDAR CONTRASEÑA
        |--------------------------------------------------------------------------
        */

        if ($contrasena === '') {

            responder([
                'error' => 'Escribe tu contraseña.'
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
                u.rol_id,
                u.nombre,
                u.usuario,
                u.correo,
                u.contrasena,
                u.activo,
                r.nombre AS rol
             FROM usuarios u
             LEFT JOIN roles r
                ON r.id = u.rol_id
             WHERE u.usuario = :usuario
             LIMIT 1'
        );


        $consulta->execute([
            ':usuario' => $usuario
        ]);


        $usuarioDB = $consulta->fetch(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | USUARIO NO ENCONTRADO
        |--------------------------------------------------------------------------
        */

        if (!$usuarioDB) {

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

        if ((int) $usuarioDB['activo'] !== 1) {

            responder([
                'error' =>
                    'El usuario está inactivo.'
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | COMPROBAR CONTRASEÑA
        |--------------------------------------------------------------------------
        */

        if (
            !password_verify(
                $contrasena,
                (string) $usuarioDB['contrasena']
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
            (int) $usuarioDB['id'];

        $_SESSION['usuario'] =
            $usuarioDB['usuario'];

        $_SESSION['nombre'] =
            $usuarioDB['nombre'];

        $_SESSION['correo'] =
            $usuarioDB['correo'];


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        responder([
            'ok' => true,

            'autenticado' => true,

            'mensaje' =>
                'Inicio de sesión correcto.',

            'usuario' => [
                'id' =>
                    (int) $usuarioDB['id'],

                'nombre' =>
                    $usuarioDB['nombre'],

                'usuario' =>
                    $usuarioDB['usuario'],

                'correo' =>
                    $usuarioDB['correo'],

                'rol' =>
                    $usuarioDB['rol']
            ]
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ACCIÓN DESCONOCIDA
    |--------------------------------------------------------------------------
    */

    responder([
        'error' => 'Acción no válida.'
    ], 400);


} catch (PDOException $error) {

    error_log(
        'ERROR PDO auth.php: ' .
        $error->getMessage()
    );

    responder([
        'error' =>
            'Error de base de datos.'
    ], 500);


} catch (Throwable $error) {

    error_log(
        'ERROR PHP auth.php: ' .
        $error->getMessage()
    );

    responder([
        'error' =>
            'No se pudo completar la operación.'
    ], 500);
}