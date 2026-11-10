-- =====================================================
-- MIRAVIA · MÓDULO DE COMISIONES
-- =====================================================
USE miraviaDB;

-- 1. TABLA comisiones
CREATE TABLE IF NOT EXISTS comisiones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reservacion_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    propietario_id INT UNSIGNED NOT NULL,
    monto_base DECIMAL(10,2) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    monto_comision DECIMAL(10,2) NOT NULL,
    monto_propietario DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente','cobrada','cancelada') NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cobrada_en TIMESTAMP NULL,
    CONSTRAINT fk_comisiones_reservacion
        FOREIGN KEY (reservacion_id) REFERENCES reservaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_comisiones_establecimiento
        FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id),
    CONSTRAINT fk_comisiones_propietario
        FOREIGN KEY (propietario_id) REFERENCES usuarios(id),
    UNIQUE KEY uq_comision_reservacion (reservacion_id)
) ENGINE=InnoDB;

-- 2. TABLA pagos_comision
CREATE TABLE IF NOT EXISTS pagos_comision (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propietario_id INT UNSIGNED NOT NULL,
    comision_id INT UNSIGNED NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NULL,
    referencia VARCHAR(100) NULL,
    estado ENUM('pendiente','pagado','vencido','cancelado') NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pagado_en TIMESTAMP NULL,
    CONSTRAINT fk_pagos_propietario
        FOREIGN KEY (propietario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_pagos_comision
        FOREIGN KEY (comision_id) REFERENCES comisiones(id) ON DELETE CASCADE,
    UNIQUE KEY uq_pago_comision (comision_id)
) ENGINE=InnoDB;

-- 3. TABLA historial_comision_establecimiento
CREATE TABLE IF NOT EXISTS historial_comision_establecimiento (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id INT UNSIGNED NOT NULL,
    porcentaje_anterior DECIMAL(5,2) NOT NULL,
    porcentaje_nuevo DECIMAL(5,2) NOT NULL,
    cambiado_por INT UNSIGNED NOT NULL,
    motivo VARCHAR(255) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_establecimiento
        FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (cambiado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =====================================================
-- 4. TRIGGER: generar comisión al completar reservación
-- =====================================================
DROP TRIGGER IF EXISTS trg_reservacion_completada;

DELIMITER $$

CREATE TRIGGER trg_reservacion_completada
AFTER UPDATE ON reservaciones
FOR EACH ROW
BEGIN
    IF NEW.estado = 'completada' AND OLD.estado <> 'completada' THEN
        INSERT INTO comisiones (
            reservacion_id,
            establecimiento_id,
            propietario_id,
            monto_base,
            porcentaje,
            monto_comision,
            monto_propietario,
            estado
        )
        SELECT
            NEW.id,
            NEW.establecimiento_id,
            e.propietario_id,
            NEW.precio_total,
            e.comision_porcentaje,
            ROUND(NEW.precio_total * (e.comision_porcentaje / 100), 2),
            ROUND(NEW.precio_total - (NEW.precio_total * (e.comision_porcentaje / 100)), 2),
            'pendiente'
        FROM establecimientos e
        WHERE e.id = NEW.establecimiento_id
        ON DUPLICATE KEY UPDATE
            monto_base = VALUES(monto_base),
            porcentaje = VALUES(porcentaje),
            monto_comision = VALUES(monto_comision),
            monto_propietario = VALUES(monto_propietario);
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- 5. TRIGGER: auditar cambios de comision_porcentaje
-- =====================================================
DROP TRIGGER IF EXISTS trg_historial_comision;

DELIMITER $$

CREATE TRIGGER trg_historial_comision
AFTER UPDATE ON establecimientos
FOR EACH ROW
BEGIN
    IF NEW.comision_porcentaje <> OLD.comision_porcentaje THEN
        INSERT INTO historial_comision_establecimiento (
            establecimiento_id,
            porcentaje_anterior,
            porcentaje_nuevo,
            cambiado_por,
            motivo
        ) VALUES (
            NEW.id,
            OLD.comision_porcentaje,
            NEW.comision_porcentaje,
            NEW.propietario_id,
            'Cambio de comisión'
        );
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- 6. VISTA: resumen de comisiones por propietario
-- =====================================================
CREATE OR REPLACE VIEW vw_comisiones_propietario AS
SELECT
    u.id AS propietario_id,
    u.nombre AS propietario,
    e.id AS establecimiento_id,
    e.nombre AS establecimiento,
    e.tipo,
    COUNT(c.id) AS total_reservaciones,
    SUM(c.monto_base) AS total_facturado,
    SUM(c.monto_comision) AS total_comision,
    SUM(c.monto_propietario) AS total_neto,
    SUM(CASE WHEN c.estado = 'pendiente' THEN c.monto_comision ELSE 0 END) AS comision_pendiente,
    SUM(CASE WHEN c.estado = 'cobrada' THEN c.monto_comision ELSE 0 END) AS comision_cobrada
FROM comisiones c
JOIN usuarios u ON u.id = c.propietario_id
JOIN establecimientos e ON e.id = c.establecimiento_id
GROUP BY u.id, u.nombre, e.id, e.nombre, e.tipo;

-- =====================================================
-- 7. VISTA: estado de cuenta por propietario
-- =====================================================
CREATE OR REPLACE VIEW vw_estado_cuenta_propietario AS
SELECT
    c.propietario_id,
    u.nombre AS propietario,
    COUNT(c.id) AS total_comisiones,
    SUM(c.monto_comision) AS total_a_cobrar,
    SUM(CASE WHEN c.estado = 'cobrada' THEN c.monto_comision ELSE 0 END) AS total_cobrado,
    SUM(CASE WHEN c.estado = 'pendiente' THEN c.monto_comision ELSE 0 END) AS saldo_pendiente
FROM comisiones c
JOIN usuarios u ON u.id = c.propietario_id
GROUP BY c.propietario_id, u.nombre;