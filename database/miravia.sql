CREATE DATABASE IF NOT EXISTS miravia_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE miravia_db;

CREATE TABLE IF NOT EXISTS roles (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id TINYINT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(190) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id),
    INDEX idx_usuarios_rol (rol_id)
) ENGINE=InnoDB;

-- Compatibilidad con la tabla usuarios de versiones anteriores de Miravia.
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS email VARCHAR(150) NULL,
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS rol ENUM('admin', 'cliente') NULL;
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS rol_id TINYINT UNSIGNED NULL,
    ADD COLUMN IF NOT EXISTS correo VARCHAR(190) NULL,
    ADD COLUMN IF NOT EXISTS contrasena VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
UPDATE usuarios
SET correo = COALESCE(correo, email),
    contrasena = COALESCE(contrasena, password_hash),
    rol_id = COALESCE(rol_id, IF(rol = 'admin', 1, 3))
WHERE correo IS NULL OR contrasena IS NULL OR rol_id IS NULL;
ALTER TABLE usuarios ADD UNIQUE INDEX IF NOT EXISTS uq_usuarios_correo (correo);

CREATE TABLE IF NOT EXISTS estados (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    capital VARCHAR(100) NULL,
    descripcion TEXT NULL,
    lat DECIMAL(9,6) NULL,
    lng DECIMAL(9,6) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS municipios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_municipios_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE CASCADE,
    UNIQUE KEY uq_municipio_estado (estado_id, nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS atracciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(80) NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_atracciones_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hoteles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NULL,
    precio DECIMAL(10,2) NULL,
    calificacion DECIMAL(2,1) NULL,
    ubicacion VARCHAR(180) NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_hoteles_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS restaurantes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(80) NULL,
    precio DECIMAL(10,2) NULL,
    calificacion DECIMAL(2,1) NULL,
    ubicacion VARCHAR(180) NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_restaurantes_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO roles (id, nombre, descripcion) VALUES
    (1, 'admin', 'Administración completa del proyecto'),
    (2, 'editor', 'Gestión de destinos y contenidos'),
    (3, 'usuario', 'Consulta y planificación de viajes')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Contraseña inicial de ambos usuarios: password
INSERT INTO usuarios (rol_id, nombre, correo, contrasena) VALUES
    (1, 'Administrador Miravia', 'admin@miravia.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro7pY2gNw2cJ8D5c7xQ0cK7W'),
    (3, 'Usuario de prueba', 'usuario@miravia.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro7pY2gNw2cJ8D5c7xQ0cK7W')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), rol_id = VALUES(rol_id);