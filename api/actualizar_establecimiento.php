<?php
/**
 * =====================================================================
 * ENDPOINT: /api/actualizar_establecimiento.php
 * =====================================================================
 * Recibe los datos (POST) y actualiza un establecimiento existente.
 * Soporta actualización de imagen principal.
 * =====================================================================
 */

declare(strict_types=1);
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$propietario_id = isset($_POST['propietario_id']) ? (int)$_POST['propietario_id'] : 0;
$nombre = trim($_POST['nombre'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');
$ubicacion = trim($_POST['ubicacion'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');

if ($id <= 0 || $propietario_id <= 0 || empty($nombre)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos obligatorios.']);
    exit;
}

try {
    $pdo = conectarBaseDatos();

    // Lógica para subir la nueva imagen (si se seleccionó una)
    $nuevaImagenRuta = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['imagen']['tmp_name'];
        $fileName = $_FILES['imagen']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        if (in_array($fileExtension, $allowedExtensions)) {
            $newFileName = 'estab_' . $id . '_' . time() . '.' . $fileExtension;
            $uploadFileDir = __DIR__ . '/../uploads/';
            
            if (!is_dir($uploadFileDir)) {
                mkdir($uploadFileDir, 0755, true);
            }
            
            $dest_path = $uploadFileDir . $newFileName;
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                $nuevaImagenRuta = 'uploads/' . $newFileName;
            }
        }
    }

    // Actualizamos la base de datos (con o sin imagen nueva)
    if ($nuevaImagenRuta) {
        $sql = "UPDATE establecimientos 
                SET nombre = :nombre, tipo = :tipo, direccion = :direccion, descripcion = :descripcion, imagen_principal = :imagen
                WHERE id = :id AND propietario_id = :propietario_id";
        $params = [
            'nombre' => $nombre, 'tipo' => $tipo, 'direccion' => $ubicacion, 
            'descripcion' => $descripcion, 'imagen' => $nuevaImagenRuta,
            'id' => $id, 'propietario_id' => $propietario_id
        ];
    } else {
        $sql = "UPDATE establecimientos 
                SET nombre = :nombre, tipo = :tipo, direccion = :direccion, descripcion = :descripcion
                WHERE id = :id AND propietario_id = :propietario_id";
        $params = [
            'nombre' => $nombre, 'tipo' => $tipo, 'direccion' => $ubicacion, 
            'descripcion' => $descripcion,
            'id' => $id, 'propietario_id' => $propietario_id
        ];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['ok' => true, 'mensaje' => 'Actualizado correctamente.']);

} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar: ' . $error->getMessage()]);
}