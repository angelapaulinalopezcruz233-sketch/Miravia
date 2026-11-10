USE miraviaDB;

SET @existe_prioridad_manual = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'establecimientos'
      AND column_name = 'prioridad_manual'
);

SET @agregar_prioridad_manual = IF(
    @existe_prioridad_manual = 0,
    'ALTER TABLE establecimientos ADD COLUMN prioridad_manual TINYINT(1) NOT NULL DEFAULT 0',
    'SELECT 1'
);

PREPARE migracion_prioridad_manual FROM @agregar_prioridad_manual;
EXECUTE migracion_prioridad_manual;
DEALLOCATE PREPARE migracion_prioridad_manual;
