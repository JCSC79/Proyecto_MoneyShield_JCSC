USE moneyshield;

-- ================== DATOS MEJORADOS Y CORREGIDOS ==================
-- Inserto 3 usuarios nuevos (IDs 13, 14 y 15)
INSERT INTO users (first_name, last_name, email, password_hash, profile_id, base_budget, base_saving, created_at)
VALUES
('Crisis', 'Financiera', 'crisis@test.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 1000.00, 200.00, '2024-01-01'),
('Inversor', 'Activo', 'inversor@test.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 5000.00, 1500.00, '2024-03-15'),
('Freelance', 'Variable', 'freelance@test.com', '$2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa', 2, 0.00, 500.00, '2024-06-01');

-- Transacciones históricas (usando IDs reales de usuarios: 13, 14, 15)
INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at) VALUES
-- Usuario 13 (Crisis)
(13, 2, 2, 1200.00, 'Supermercado (diciembre)', '2024-12-15'),
(13, 2, 3, 950.00, 'Alquiler (diciembre)', '2024-12-01'),
(13, 1, 1, 800.00, 'Ingreso extra', '2024-12-20'),

-- Usuario 14 (Inversor)
(14, 1, 10, 2500.00, 'Dividendos inversiones', '2024-04-05'),
(14, 1, 10, 1800.00, 'Intereses bonos', '2024-07-12'),
(14, 2, 13, 700.00, 'Seguro de vida', '2024-09-01'),

-- Usuario 15 (Freelance)
(15, 1, 1, 3000.00, 'Proyecto cliente A', '2024-06-10'),
(15, 1, 1, 4500.00, 'Proyecto cliente B', '2024-07-25'),
(15, 2, 5, 200.00, 'Transporte reuniones', '2024-08-03');

-- Transacciones futuras (usando IDs existentes: 1 y 2)
INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at) VALUES
(1, 1, 1, 2000.00, 'Salario proyectado', '2025-07-01'),
(1, 2, 2, 500.00, 'Supermercado proyectado', '2025-07-05'),
(2, 2, 4, 250.00, 'Consulta médica programada', '2025-08-15');

-- Presupuestos (usando IDs reales: 13, 14 y 2)
INSERT INTO budgets (user_id, category_id, budget_type, year, month, amount, notes) VALUES
(14, 10, 'annual', 2025, NULL, 15000.00, 'Inversiones anuales'),    -- Inversor (14)
(13, 2, 'monthly', 2025, 6, 800.00, 'Supermercado (necesita ajuste)'),  -- Crisis (13)
(2, 3, 'monthly', 2025, 6, 750.00, 'Alquiler con aumento del 5%');     -- Usuario 2

-- Ahorros (usando IDs reales: 13, 14, 15)
INSERT INTO savings (user_id, type_id, name, amount, target_amount, target_date) VALUES
(13, 1, 'Rescate financiero', 300.00, 5000.00, '2025-12-31'),      -- Crisis (13)
(14, 2, 'Fondo libertad financiera', 15000.00, 50000.00, '2026-06-30'), -- Inversor (14)
(15, 1, 'Fondo vacaciones extremas', 4500.00, 5000.00, '2025-11-01');  -- Freelance (15)

-- Transacciones masivas (ajustado para usuarios 1-15 y categorías 1-15)
DELIMITER $$
CREATE PROCEDURE GenerateMassiveTransactions()
BEGIN
  DECLARE i INT DEFAULT 0;
  WHILE i < 100 DO
    INSERT INTO transactions (user_id, type_id, category_id, amount, description, created_at)
    VALUES (
      FLOOR(1 + RAND() * 15),  -- user_id entre 1-15 (incluye nuevos usuarios)
      IF(RAND() > 0.3, 1, 2),  -- 70% income, 30% expense
      FLOOR(1 + RAND() * 15),  -- category_id entre 1-15
      ROUND(100 + RAND() * 9900, 2),
      CONCAT('Transacción automática #', i),
      DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY)
    );
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL GenerateMassiveTransactions();
DROP PROCEDURE GenerateMassiveTransactions;
