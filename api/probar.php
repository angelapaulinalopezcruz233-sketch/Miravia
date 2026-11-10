<?php
require_once 'db.php';

try {
    $pdo = conectarBaseDatos();
    echo "✅ Conexión exitosa a la base de datos miraviaDB";
    
    // Prueba extra: contar tablas
    $stmt = $pdo->query("SHOW TABLES");
    $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<br>Tablas encontradas: " . count($tablas);
    echo "<br><pre>";
    print_r($tablas);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "❌ Error de conexión: " . $e->getMessage();
}