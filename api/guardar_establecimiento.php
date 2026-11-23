<?php
/**
 * =====================================================================
 * ENDPOINT: /api/guardar_establecimiento.php
 * =====================================================================
 * Recibe los datos del formulario (POST) y guarda un nuevo establecimiento.
 * Soporta subida de imágenes.
 * =====================================================================
 */

declare(strict_types=1);
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

// Solo aceptamos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

// Recibimos los datos
$propietario_id = isset($_POST['propietario_id']) ? (int)$_POST['propietario_id'] : 0;
$nombre = trim($_POST['nombre'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');
$ubicacion = trim($_POST['ubicacion'] ?? ''); // Recibimos la ciudad como texto
$descripcion = trim($_POST['descripcion'] ?? '');
$comision = 8.00; // Comisión por defecto

// Validaciones básicas
if ($propietario_id <= 0 || empty($nombre) || empty($tipo) || empty($ubicacion)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos obligatorios.']);
    exit;
}

// Generar un slug único a partir del nombre
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $nombre)));
$slug = $slug . '-' . time(); // Le agregamos el tiempo para que nunca se repita

$imagen_ruta = null;

// Manejo de la subida de imagen (si el usuario subió una)
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['imagen']['tmp_name'];
    $fileName = $_FILES['imagen']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Validar que sea imagen
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (in_array($fileExtension, $allowedExtensions)) {
        // Crear un nombre único para la imagen
        $newFileName = $slug . '.' . $fileExtension;
        $uploadFileDir = __DIR__ . '/../uploads/';
        $dest_path = $uploadFileDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $imagen_ruta = 'uploads/' . $newFileName; // Ruta relativa para la BD
        }
    }
}

try {
    $pdo = conectarBaseDatos();

    // Como no tenemos un ID exacto del municipio, usamos el 1 por defecto para la prueba
    // (En un sistema real, buscaríamos el municipio o crearíamos uno nuevo)
    $estado_id = 1; 
    $municipio_id = 1;

    $sql = "INSERT INTO establecimientos 
            (propietario_id, estado_id, municipio_id, tipo, nombre, slug, descripcion, direccion, imagen_principal, comision_porcentaje, activo) 
            VALUES 
            (:propietario_id, :estado_id, :municipio_id, :tipo, :nombre, :slug, :descripcion, :direccion, :imagen, :comision, 1)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'propietario_id' => $propietario_id,
        'estado_id' => $estado_id,
        'municipio_id' => $municipio_id,
        'tipo' => $tipo,
        'nombre' => $nombre,
        'slug' => $slug,
        'descripcion' => $descripcion,
        'direccion' => $ubicacion,
        'imagen' => $imagen_ruta,
        'comision' => $comision
    ]);

    echo json_encode([
        'ok' => true,
        'mensaje' => 'Establecimiento creado exitosamente.',
        'id' => $pdo->lastInsertId()
    ]);

} catch (Throwable $error) {
    http_response_code(500);
   echo json_encode(['error' => 'Error al guardar: ' . $error->getMessage()]);
}