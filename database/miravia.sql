-- =====================================================
-- BASE DE DATOS MIRAVIA (versión limpia)
-- =====================================================

CREATE DATABASE IF NOT EXISTS miraviaDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE miraviaDB;

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'super_admin', 'Administrador de la plataforma Miravia'),
(2, 'propietario', 'Dueño de hotel, restaurante o atracción'),
(3, 'usuario', 'Usuario final que reserva y explora')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- 2. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id TINYINT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(190) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- Usuarios de prueba (contraseña: password)
INSERT INTO usuarios (rol_id, nombre, nombre_usuario, correo, contrasena) VALUES
(1, 'Admin Miravia', 'admin', 'admin@miravia.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(3, 'Usuario Prueba', 'usuario', 'usuario@miravia.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- 3. ESTADOS
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

-- 4. MUNICIPIOS
CREATE TABLE IF NOT EXISTS municipios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_municipios_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE CASCADE,
    UNIQUE KEY uq_municipio_estado (estado_id, nombre)
) ENGINE=InnoDB;

-- 5. ESTABLECIMIENTOS
CREATE TABLE IF NOT EXISTS establecimientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propietario_id INT UNSIGNED NOT NULL,
    estado_id INT UNSIGNED NOT NULL,
    municipio_id INT UNSIGNED NULL,
    tipo ENUM('hotel', 'restaurante', 'atraccion') NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL,
    descripcion TEXT NULL,
    direccion VARCHAR(255) NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(150) NULL,
    sitio_web VARCHAR(255) NULL,
    lat DECIMAL(9,6) NULL,
    lng DECIMAL(9,6) NULL,
    precio_desde DECIMAL(10,2) NULL,
    calificacion_promedio DECIMAL(2,1) DEFAULT 0,
    comision_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_establecimientos_propietario FOREIGN KEY (propietario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_establecimientos_estado FOREIGN KEY (estado_id) REFERENCES estados(id),
    CONSTRAINT fk_establecimientos_municipio FOREIGN KEY (municipio_id) REFERENCES municipios(id),
    UNIQUE KEY uq_slug (slug)
) ENGINE=InnoDB;

-- 6. HABITACIONES
CREATE TABLE IF NOT EXISTS habitaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    capacidad TINYINT UNSIGNED NOT NULL DEFAULT 2,
    precio_noche DECIMAL(10,2) NOT NULL,
    cantidad_total INT UNSIGNED NOT NULL DEFAULT 1,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_habitaciones_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. SERVICIOS
CREATE TABLE IF NOT EXISTS servicios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    CONSTRAINT fk_servicios_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. RESERVACIONES
CREATE TABLE IF NOT EXISTS reservaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    habitacion_id INT UNSIGNED NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    cantidad_personas TINYINT UNSIGNED NOT NULL DEFAULT 1,
    precio_total DECIMAL(10,2) NOT NULL,
    comision DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
    notas TEXT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_reservaciones_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id),
    CONSTRAINT fk_reservaciones_habitacion FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
) ENGINE=InnoDB;

-- 9. FAVORITOS
CREATE TABLE IF NOT EXISTS favoritos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favoritos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_favoritos_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE,
    UNIQUE KEY uq_favorito (usuario_id, establecimiento_id)
) ENGINE=InnoDB;

-- 10. RESEÑAS
CREATE TABLE IF NOT EXISTS resenas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resenas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_resenas_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. VIAJES
CREATE TABLE IF NOT EXISTS viajes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    fecha_inicio DATE NULL,
    fecha_fin DATE NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_viajes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. VIAJE_DETALLES
CREATE TABLE IF NOT EXISTS viaje_detalles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    orden TINYINT UNSIGNED NOT NULL DEFAULT 1,
    notas TEXT NULL,
    CONSTRAINT fk_viaje_detalles_viaje FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE,
    CONSTRAINT fk_viaje_detalles_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id)
) ENGINE=InnoDB;