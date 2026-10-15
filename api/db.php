<?php
declare(strict_types=1);

function conectarBaseDatos(): PDO
{
    $host = '127.0.0.1';
    $baseDatos = 'miravia_db';
    $usuario = 'root';
    $contrasena = '';

    $dsn = "mysql:host={$host};dbname={$baseDatos};charset=utf8mb4";
    return new PDO($dsn, $usuario, $contrasena, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
