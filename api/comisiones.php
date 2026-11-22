<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

// =====================================================
// ENDPOINT: /api/comisiones.php
// =====================================================
// Acciones disponibles:
//   ?accion=listar         → lista todas las comisiones del propietario
//   ?accion=resumen        → totales agrupados por establecimiento
//   ?accion=estado_cuenta  → saldo total del propietario
//   ?accion=por_mes        → comisiones agrupadas por mes (para gráfica)
//   ?accion=cobrar         → marca una comisión como cobrada (POST)
// =====================================================

$accion = trim((string) ($_GET['accion'] ?? 'listar'));
$propietarioId = isset($_GET['propietario_id']) ? (int) $_GET['propietario_id'] : 0;

if ($propietarioId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro propietario_id.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = conectarBaseDatos();

    switch ($accion) {

        // ---------------------------------------------
        // LISTAR: comisiones del propietario
        // ---------------------------------------------
        case 'listar':
            $sql = 'SELECT
                        c.id,
                        c.reservacion_id,
                        c.establecimiento_id,
                        c.monto_base,
                        c.porcentaje,
                        c.monto_comision,
                        c.monto_propietario,
                        c.estado,
                        c.creado_en,
                        c.cobrada_en,
                        e.nombre AS establecimiento,
                        e.tipo,
                        r.fecha_inicio,
                        r.fecha_fin,
                        u.nombre AS cliente
                    FROM comisiones c
                    JOIN establecimientos e ON e.id = c.establecimiento_id
                    JOIN reservaciones r ON r.id = c.reservacion_id
                    JOIN usuarios u ON u.id = r.usuario_id
                    WHERE c.propietario_id = :propietario_id
                    ORDER BY c.creado_en DESC';

            $stmt = $pdo->prepare($sql);
            $stmt->execute(['propietario_id' => $propietarioId]);
            $comisiones = $stmt->fetchAll();

            echo json_encode([
                'ok' => true,
                'total' => count($comisiones),
                'comisiones' => $comisiones
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        // ---------------------------------------------
        // RESUMEN: totales por establecimiento
        // ---------------------------------------------
        case 'resumen':
            $sql = 'SELECT *
                    FROM vw_comisiones_propietario
                    WHERE propietario_id = :propietario_id';

            $stmt = $pdo->prepare($sql);
            $stmt->execute(['propietario_id' => $propietarioId]);
            $resumen = $stmt->fetchAll();

            echo json_encode([
                'ok' => true,
                'resumen' => $resumen
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        // ---------------------------------------------
        // ESTADO DE CUENTA
        // ---------------------------------------------
        case 'estado_cuenta':
            $sql = 'SELECT *
                    FROM vw_estado_cuenta_propietario
                    WHERE propietario_id = :propietario_id
                    LIMIT 1';

            $stmt = $pdo->prepare($sql);
            $stmt->execute(['propietario_id' => $propietarioId]);
            $estado = $stmt->fetch();

            if (!$estado) {
                // Si no hay comisiones, devolvemos ceros
                $estado = [
                    'propietario_id' => $propietarioId,
                    'propietario' => null,
                    'total_comisiones' => 0,
                    'total_a_cobrar' => 0,
                    'total_cobrado' => 0,
                    'saldo_pendiente' => 0
                ];
            }

            echo json_encode([
                'ok' => true,
                'estado_cuenta' => $estado
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        // ---------------------------------------------
        // POR MES: para la gráfica
        // ---------------------------------------------
        case 'por_mes':
            $sql = 'SELECT
                        DATE_FORMAT(creado_en, "%Y-%m") AS periodo,
                        DATE_FORMAT(creado_en, "%b") AS mes,
                        COUNT(*) AS total_comisiones,
                        SUM(monto_base) AS total_facturado,
                        SUM(monto_comision) AS total_comision,
                        SUM(monto_propietario) AS total_neto
                    FROM comisiones
                    WHERE propietario_id = :propietario_id
                    GROUP BY DATE_FORMAT(creado_en, "%Y-%m"), DATE_FORMAT(creado_en, "%b")
                    ORDER BY periodo ASC
                    LIMIT 12';

            $stmt = $pdo->prepare($sql);
            $stmt->execute(['propietario_id' => $propietarioId]);
            $porMes = $stmt->fetchAll();

            echo json_encode([
                'ok' => true,
                'por_mes' => $porMes
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        // ---------------------------------------------
        // COBRAR: marcar comisión como cobrada
        // ---------------------------------------------
        case 'cobrar':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido. Usa POST.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $comisionId = isset($_POST['comision_id']) ? (int) $_POST['comision_id'] : 0;

            if ($comisionId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Falta el parámetro comision_id.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Verificamos que la comisión pertenezca al propietario
            $verificar = $pdo->prepare(
                'SELECT id, monto_comision
                 FROM comisiones
                 WHERE id = :id AND propietario_id = :propietario_id
                 LIMIT 1'
            );
            $verificar->execute([
                'id' => $comisionId,
                'propietario_id' => $propietarioId
            ]);
            $comision = $verificar->fetch();

            if (!$comision) {
                http_response_code(404);
                echo json_encode(['error' => 'Comisión no encontrada.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Marcamos la comisión como cobrada
            $actualizar = $pdo->prepare(
                'UPDATE comisiones
                 SET estado = "cobrada", cobrada_en = NOW()
                 WHERE id = :id'
            );
            $actualizar->execute(['id' => $comisionId]);

            // Registramos el pago
            $insertarPago = $pdo->prepare(
                'INSERT INTO pagos_comision
                    (propietario_id, comision_id, monto, metodo_pago, referencia, estado, pagado_en)
                 VALUES
                    (:propietario_id, :comision_id, :monto, "manual", :referencia, "pagado", NOW())'
            );
            $insertarPago->execute([
                'propietario_id' => $propietarioId,
                'comision_id' => $comisionId,
                'monto' => $comision['monto_comision'],
                'referencia' => 'PAGO-' . strtoupper(uniqid())
            ]);

            echo json_encode([
                'ok' => true,
                'mensaje' => 'Comisión marcada como cobrada.',
                'comision_id' => $comisionId
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        // ---------------------------------------------
        // Acción no reconocida
        // ---------------------------------------------
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida.'], JSON_UNESCAPED_UNICODE);
            break;
    }

} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo consultar la base de datos.',
        'detalle' => $error->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}