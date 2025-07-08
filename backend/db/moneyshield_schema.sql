-- Eliminar base de datos si existe
DROP DATABASE IF EXISTS moneyshield;

-- Crear base de datos nueva
CREATE DATABASE moneyshield 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_0900_ai_ci;

USE moneyshield;

-- 1. Tabla de perfiles
CREATE TABLE profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del perfil de usuario (admin/user)'
) ENGINE=InnoDB COMMENT = 'Perfiles de acceso al sistema';

-- 2. Tabla de usuarios
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL COMMENT 'Nombre del usuario',
  last_name VARCHAR(100) NOT NULL COMMENT 'Apellido del usuario',
  email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email único del usuario',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  profile_id INT NOT NULL COMMENT 'ID del perfil asociado',
  base_budget DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT 'Presupuesto mensual base',
  base_saving DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT 'Ahorro mensual base',
  currency CHAR(3) NOT NULL DEFAULT 'EUR' COMMENT 'Divisa según ISO 4217',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del usuario',
  FOREIGN KEY (profile_id) REFERENCES profiles(id),
  INDEX idx_user_email (email),
  INDEX idx_users_profile (profile_id),
  CONSTRAINT chk_email_format CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
) ENGINE=InnoDB COMMENT = 'Usuarios del sistema';

-- 3. Tabla de categorías (con tipo)
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre único de la categoría',
  type ENUM('income', 'expense', 'both') NOT NULL DEFAULT 'expense' COMMENT 'Tipo de categoría: income, expense o both'
) ENGINE=InnoDB COMMENT = 'Categorías para clasificar transacciones';

-- 4. Tabla de tipos de transacción
CREATE TABLE transaction_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tipo de transacción (income/expense)'
) ENGINE=InnoDB COMMENT = 'Tipos de transacción';

-- 5. Tabla de transacciones
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'Usuario relacionado',
  type_id INT NOT NULL COMMENT 'Tipo de transacción',
  category_id INT COMMENT 'Categoría opcional',
  amount DECIMAL(10,2) UNSIGNED NOT NULL COMMENT 'Monto positivo de la transacción' CHECK (amount > 0),
  description VARCHAR(255) COMMENT 'Descripción breve (max 255 caracteres)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última actualización',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES transaction_types(id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_transactions_user_type_date (user_id, type_id, created_at),
  INDEX idx_transactions_category (category_id),
  INDEX idx_transactions_amount (amount)
) ENGINE=InnoDB COMMENT = 'Registro de transacciones financieras';

-- 6. Tabla de presupuestos
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'Usuario asociado',
  category_id INT NOT NULL COMMENT 'Categoría del presupuesto',
  budget_type ENUM('monthly', 'annual') NOT NULL DEFAULT 'monthly' COMMENT 'Tipo de presupuesto',
  year YEAR NOT NULL COMMENT 'Año del presupuesto',
  month TINYINT UNSIGNED COMMENT 'Mes (1-12, solo para tipo mensual)',
  amount DECIMAL(10,2) UNSIGNED NOT NULL COMMENT 'Monto presupuestado',
  notes TEXT COMMENT 'Notas adicionales',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_month_range CHECK (
    (budget_type = 'annual' AND month IS NULL) OR 
    (budget_type = 'monthly' AND month BETWEEN 1 AND 12)
  ),
  UNIQUE INDEX unique_budget (user_id, category_id, year, budget_type, month),
  INDEX idx_budgets_user_year (user_id, year)
) ENGINE=InnoDB COMMENT = 'Presupuestos por usuario y categoría';

-- 7. Tabla de tipos de ahorro
CREATE TABLE saving_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tipo de ahorro (fixed/extra)'
) ENGINE=InnoDB COMMENT = 'Tipos de ahorro';

-- 8. Tabla de ahorros
CREATE TABLE savings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'Usuario asociado',
  type_id INT NOT NULL COMMENT 'Tipo de ahorro',
  name VARCHAR(100) NOT NULL COMMENT 'Nombre del objetivo',
  amount DECIMAL(10,2) UNSIGNED NOT NULL COMMENT 'Monto actual ahorrado',
  target_amount DECIMAL(10,2) UNSIGNED COMMENT 'Monto objetivo (opcional)',
  target_date DATE COMMENT 'Fecha objetivo (opcional)',
  progress TINYINT UNSIGNED GENERATED ALWAYS AS (ROUND((amount / target_amount) * 100)) STORED COMMENT 'Progreso porcentual calculado automáticamente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES saving_types(id),
  CONSTRAINT chk_savings_target CHECK (
    target_amount IS NULL OR target_amount > amount
  ),
  INDEX idx_savings_target (target_date, target_amount)
) ENGINE=InnoDB COMMENT = 'Objetivos de ahorro de los usuarios';

-- ================== DATOS INICIALES ================== --
-- Perfiles
INSERT INTO profiles (name) VALUES 
('admin'), ('user');

-- Usuarios de prueba (password: 3lManduc0.56)
INSERT INTO users 
  (first_name, last_name, email, password_hash, profile_id)
VALUES
  ('Admin', 'User', 'admin@money.com', '$2a$12$8/B/aamlRLtF.s5Tq0yLXOgEjma0z3LWzksX5y9LsudloSOen7iZK', 1),
  ('Normal', 'User', 'user@money.com', '$2a$12$8/B/aamlRLtF.s5Tq0yLXOgEjma0z3LWzksX5y9LsudloSOen7iZK', 2);

-- Categorías iniciales con tipo
INSERT INTO categories (name, type) VALUES
('General', 'both'),
('Food', 'expense'),
('Housing', 'expense'),
('Health', 'expense'),
('Transport', 'expense'),
('Leisure', 'expense'),
('Technology', 'expense'),
('Savings', 'both'),
('Investments', 'both'),
('Education', 'expense'),
('Utilities', 'expense'),
('Insurance', 'expense'),
('Entertainment', 'expense'),
('Childcare', 'expense'),
('Others', 'both'),
('Salary', 'income'),
('Sale', 'income'),
('Refund', 'income'),
('Award', 'income'),
('Other Income', 'income');

-- Tipos de transacción
INSERT INTO transaction_types (name) VALUES 
('income'), ('expense');

-- Tipos de ahorro
INSERT INTO saving_types (name) VALUES 
('fixed'), ('extra');

-- Usuarios de ejemplo
INSERT INTO users (first_name, last_name, email, password_hash, profile_id, base_budget, base_saving)
VALUES
('Juan', 'Pérez', 'juan.perez@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1200.00, 200.00),
('Ana', 'García', 'ana.garcia@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1500.00, 300.00),
('Carlos', 'Sánchez', 'carlos.sanchez@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1000.00, 100.00),
('Lucía', 'Martínez', 'lucia.martinez@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1800.00, 400.00),
('Pedro', 'López', 'pedro.lopez@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 900.00, 150.00),
('María', 'Ruiz', 'maria.ruiz@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1100.00, 250.00),
('Sofía', 'Torres', 'sofia.torres@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1300.00, 350.00),
('Miguel', 'Ramírez', 'miguel.ramirez@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1700.00, 500.00),
('Laura', 'Morales', 'laura.morales@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1400.00, 200.00),
('Diego', 'Fernández', 'diego.fernandez@example.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1600.00, 300.00);

-- Transacciones
INSERT INTO transactions (user_id, type_id, category_id, amount, description)
VALUES
(1, 1, 1, 2000.00, 'Salario mensual'),
(1, 2, 2, 300.00, 'Compra supermercado'),
(2, 1, 1, 2500.00, 'Pago freelance'),
(2, 2, 3, 700.00, 'Renta apartamento'),
(3, 2, 4, 100.00, 'Consulta médica'),
(4, 2, 5, 60.00, 'Transporte público'),
(5, 1, 1, 1800.00, 'Salario'),
(6, 2, 6, 120.00, 'Cine y ocio'),
(7, 2, 7, 400.00, 'Compra de laptop'),
(8, 2, 8, 250.00, 'Despensa mensual');

-- Presupuestos
INSERT INTO budgets (user_id, category_id, budget_type, year, month, amount, notes)
VALUES
(1, 2, 'monthly', 2025, 5, 400.00, 'Supermercado mayo'),
(1, 3, 'monthly', 2025, 5, 800.00, 'Alquiler mayo'),
(2, 4, 'monthly', 2025, 5, 150.00, 'Salud mayo'),
(2, 5, 'monthly', 2025, 5, 100.00, 'Transporte mayo'),
(3, 6, 'monthly', 2025, 5, 100.00, 'Ocio mayo'),
(4, 7, 'monthly', 2025, 5, 500.00, 'Tecnología mayo'),
(5, 8, 'monthly', 2025, 5, 300.00, 'Despensa mayo'),
(6, 2, 'monthly', 2025, 5, 350.00, 'Supermercado'),
(7, 3, 'monthly', 2025, 5, 900.00, 'Alquiler'),
(8, 4, 'monthly', 2025, 5, 200.00, 'Salud');

-- Ahorros
INSERT INTO savings (user_id, type_id, name, amount, target_amount, target_date)
VALUES
(1, 1, 'Fondo de emergencia', 500.00, 1000.00, '2025-12-31'),
(2, 2, 'Vacaciones', 300.00, 1200.00, '2025-08-01'),
(3, 1, 'Reparación coche', 200.00, 800.00, '2025-09-15'),
(4, 2, 'Navidad', 150.00, 600.00, '2025-12-20'),
(5, 1, 'Reforma hogar', 400.00, 2000.00, '2026-04-01'),
(6, 2, 'Cumpleaños hijos', 100.00, 500.00, '2025-10-10'),
(7, 1, 'Fondo salud', 250.00, 1000.00, '2025-11-30'),
(8, 2, 'Tecnología', 350.00, 1500.00, '2025-07-15'),
(9, 1, 'Viaje estudios', 600.00, 3000.00, '2026-06-01'),
(10, 2, 'Inversiones', 700.00, 5000.00, '2027-01-01');

-- Trigger para proteger la categoría "Others"
DELIMITER $$
CREATE TRIGGER prevent_others_modification
BEFORE DELETE ON categories
FOR EACH ROW
BEGIN
  IF OLD.name = 'Others' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La categoría "Others" es protegida y no puede modificarse';
  END IF;
END$$
DELIMITER ;

-- Control de versiones del esquema
CREATE TABLE IF NOT EXISTS _schema_version (
  version VARCHAR(20) PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='Control de versiones del esquema';

INSERT IGNORE INTO _schema_version (version, description) VALUES 
('1.2', 'Soporte para categorías de ingreso, gasto y ambas (MoneyShield)');
