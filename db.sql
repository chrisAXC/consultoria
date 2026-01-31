


CREATE DATABASE consultoria_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE consultoria_db;

-- =====================================================
-- ADMINS 
-- =====================================================
CREATE TABLE admin_users (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =====================================================
-- USERS (clientes)
-- =====================================================
CREATE TABLE users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80),
  apellido VARCHAR(80),
  email VARCHAR(160) NOT NULL UNIQUE,
  telefono VARCHAR(30),
  origen ENUM('registro','contacto','chatbot') NOT NULL DEFAULT 'contacto',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =====================================================
-- SERVICES (catálogo)
-- =====================================================
CREATE TABLE services (
  id_service INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;


-- =====================================================
-- PROJECTS (portafolio)
-- =====================================================
CREATE TABLE projects (
  id_project INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo ENUM('pagina_web','instalacion_programas','consultoria','app') NOT NULL DEFAULT 'consultoria',
  url_demo VARCHAR(255),
  imagen_url VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =====================================================
-- TEAM MEMBERS
-- =====================================================
CREATE TABLE team_members (
  id_member INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  rol VARCHAR(120) NOT NULL,
  bio TEXT NOT NULL,
  imagen_url VARCHAR(255),
  activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;


-- =====================================================
-- CONTACT MESSAGES (🔥 TABLA PRINCIPAL)
-- Aquí se guardan las solicitudes
-- =====================================================
CREATE TABLE contact_messages (
  id_message BIGINT AUTO_INCREMENT PRIMARY KEY,

  -- 🔥 NUEVO: FOLIO para seguimiento
  folio VARCHAR(20) NOT NULL UNIQUE,

  id_user INT NOT NULL,

  asunto VARCHAR(160) NOT NULL,
  mensaje TEXT NOT NULL,

  canal ENUM('correo','formulario','chatbot') NOT NULL DEFAULT 'formulario',

  status ENUM('nuevo','en_proceso','respondido','cerrado') NOT NULL DEFAULT 'nuevo',

  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_folio (folio),
  INDEX idx_status (status),

  FOREIGN KEY (id_user) REFERENCES users(id_user)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;


-- =====================================================
-- ADMIN REPLIES (respuestas internas)
-- =====================================================
CREATE TABLE admin_replies (
  id_reply BIGINT AUTO_INCREMENT PRIMARY KEY,

  id_message BIGINT NOT NULL,
  id_admin INT NOT NULL,

  asunto VARCHAR(160) NOT NULL,
  respuesta TEXT NOT NULL,

 
  enviado_a_correo TINYINT(1) DEFAULT 0,

  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_message (id_message),

  FOREIGN KEY (id_message) REFERENCES contact_messages(id_message)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  FOREIGN KEY (id_admin) REFERENCES admin_users(id_admin)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;


-- =====================================================
-- CHATBOT LOGS
-- =====================================================
CREATE TABLE chatbot_logs (
  id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NULL,
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_user) REFERENCES users(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;



-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO services (titulo, descripcion) VALUES
('Servicio de consultoría', 'Asesoría técnica y estratégica para impulsar tus proyectos con soluciones claras y medibles.'),
('Instalación de programas', 'Instalamos, configuramos y dejamos listo tu entorno.'),
('Páginas web', 'Diseño y desarrollo web moderno, responsivo y optimizado.'),
('Portafolio de proyectos', 'Implementación y mejora continua con soporte.');

INSERT INTO team_members (nombre, rol, bio, imagen_url) VALUES
('Chris', 'Desarrollador / Consultor', 'Especialista en backend, rendimiento y arquitectura.', 'assets/chris.jpg'),
('Choco', 'Diseño / Implementación', 'UX/UI, diseño visual y experiencia de usuario.', 'assets/choco.jpg');



INSERT INTO admin_users (nombre, email, password_hash) VALUES
('Admin', 'admin@consultoria.com', '$2y$10$8uF1H2U3G3V3jvP7P8A2kOx3jJqk8x1vSx3V0y3sZK7w6V7H1Xy1S');

select * from contact_messages;