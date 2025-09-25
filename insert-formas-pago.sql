-- ===========================================
-- INSERTAR FORMAS DE PAGO BÁSICAS
-- ===========================================

-- Insertar formas de pago básicas si no existen
IF NOT EXISTS (SELECT 1 FROM Formas_Pago WHERE Formas_Pagonombre = 'Efectivo')
BEGIN
    INSERT INTO Formas_Pago (Formas_Pagonombre) VALUES ('Efectivo');
END

IF NOT EXISTS (SELECT 1 FROM Formas_Pago WHERE Formas_Pagonombre = 'Tarjeta de Crédito/Débito')
BEGIN
    INSERT INTO Formas_Pago (Formas_Pagonombre) VALUES ('Tarjeta de Crédito/Débito');
END

IF NOT EXISTS (SELECT 1 FROM Formas_Pago WHERE Formas_Pagonombre = 'Transferencia Bancaria')
BEGIN
    INSERT INTO Formas_Pago (Formas_Pagonombre) VALUES ('Transferencia Bancaria');
END

-- Verificar que se insertaron correctamente
SELECT * FROM Formas_Pago;