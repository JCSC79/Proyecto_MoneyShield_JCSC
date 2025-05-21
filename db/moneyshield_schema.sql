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
) COMMENT = 'Perfiles de acceso al sistema';

-- 2. Tabla de usuarios (optimizada, CHECK desactivado para pruebas)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL COMMENT 'Nombre del usuario',
  last_name VARCHAR(100) NOT NULL COMMENT 'Apellido del usuario',
  email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email único del usuario',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  profile_id INT NOT NULL COMMENT 'ID del perfil asociado',
  base_budget DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00 
    COMMENT 'Presupuesto mensual base',
  base_saving DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00 
    COMMENT 'Ahorro mensual base',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    COMMENT 'Fecha de creación del usuario',
  FOREIGN KEY (profile_id) REFERENCES profiles(id),
  INDEX idx_user_email (email)
) COMMENT = 'Usuarios del sistema';

-- 3. Tabla de categorías (con protección para Others)
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre único de la categoría'
) COMMENT = 'Categorías para clasificar transacciones';

-- 4. Tabla de tipos de transacción
CREATE TABLE transaction_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tipo de transacción (income/expense)'
) COMMENT = 'Tipos de transacción';

-- 5. Tabla de transacciones (optimizada)
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'Usuario relacionado',
  type_id INT NOT NULL COMMENT 'Tipo de transacción',
  category_id INT COMMENT 'Categoría opcional',
  amount DECIMAL(10,2) UNSIGNED NOT NULL 
    COMMENT 'Monto positivo de la transacción'
    CHECK (amount > 0),
  description TEXT COMMENT 'Descripción detallada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
    COMMENT 'Última actualización',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES transaction_types(id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_transactions_user_date (user_id, created_at)
) COMMENT = 'Registro de transacciones financieras';

-- 6. Tabla de presupuestos (estructura optimizada)
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'Usuario asociado',
  category_id INT NOT NULL COMMENT 'Categoría del presupuesto',
  budget_type ENUM('monthly', 'annual') NOT NULL DEFAULT 'monthly' 
    COMMENT 'Tipo de presupuesto',
  year YEAR NOT NULL COMMENT 'Año del presupuesto',
  month TINYINT UNSIGNED COMMENT 'Mes (solo para tipo mensual)',
  amount DECIMAL(10,2) UNSIGNED NOT NULL 
    COMMENT 'Monto presupuestado',
  notes TEXT COMMENT 'Notas adicionales',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    COMMENT 'Fecha de creación',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_month_range CHECK (
    (budget_type = 'annual' AND month IS NULL) OR 
    (budget_type = 'monthly' AND month BETWEEN 1 AND 12)
  ),
  UNIQUE INDEX unique_budget (user_id, category_id, year, budget_type, month),
  INDEX idx_budgets_user_year (user_id, year)
) COMMENT = 'Presupuestos por usuario y categoría';

-- 7. Tabla de tipos de ahorro
CREATE TABLE saving_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tipo de ahorro (fixed/extra)'
) COMMENT = 'Tipos de ahorro';

-- 8. Tabla de ahorros (optimizada)
CREATE TABLE savings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'Usuario asociado',
  type_id INT NOT NULL COMMENT 'Tipo de ahorro',
  name VARCHAR(100) NOT NULL COMMENT 'Nombre del objetivo',
  amount DECIMAL(10,2) UNSIGNED NOT NULL 
    COMMENT 'Monto actual ahorrado',
  target_amount DECIMAL(10,2) UNSIGNED 
    COMMENT 'Monto objetivo (opcional)',
  target_date DATE COMMENT 'Fecha objetivo (opcional)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    COMMENT 'Fecha de creación',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES saving_types(id),
  CONSTRAINT chk_savings_target CHECK (
    target_amount IS NULL OR target_amount > amount
  )
) COMMENT = 'Objetivos de ahorro de los usuarios';

-- ================== DATOS INICIALES ================== --
-- Perfiles
INSERT INTO profiles (name) VALUES 
('admin'), ('user');

-- Categorías
INSERT INTO categories (name) VALUES 
('General'), ('Food'), ('Housing'), ('Health'), 
('Transport'), ('Leisure'), ('Technology'), 
('Groceries'), ('Savings'), ('Investments'), 
('Education'), ('Utilities'), ('Insurance'), 
('Entertainment'), ('Childcare'), ('Others');

-- Tipos de transacción
INSERT INTO transaction_types (name) VALUES 
('income'), ('expense');

-- Tipos de ahorro
INSERT INTO saving_types (name) VALUES 
('fixed'), ('extra');

-- Trigger para proteger la categoría "Others"
DELIMITER $$
CREATE TRIGGER prevent_others_deletion
BEFORE DELETE ON categories
FOR EACH ROW
BEGIN
  IF OLD.name = 'Others' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La categoría "Others" no puede ser eliminada';
  END IF;
END$$
DELIMITER ;
