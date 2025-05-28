USE moneyshield;

-- Usuarios con hashes bcrypt válidos (contraseña = "Password123!")
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
