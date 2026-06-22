-- ============================================================
-- DEMO DATA — TireManager (v2 - mais dados)
-- Execute no SQL Editor do Supabase
-- Para remover depois: demo_cleanup.sql
-- ============================================================

-- 1. VEÍCULOS (10)
INSERT INTO veiculos (placa, frota, tipo, ano, centro_custo) VALUES
('ABC1D23', 'Frota 01', 'Cavalo + semirreboque', 2022, 'Transporte SP'),
('EFG4H56', 'Frota 02', 'Caminhão truck', 2021, 'Logística RJ'),
('IJK7L89', 'Frota 03', 'Carreta frigorífica', 2023, 'Distribuição MG'),
('MNO0P12', 'Frota 04', 'Caminhão toco', 2020, 'Obras DF'),
('QRS3T45', 'Frota 05', 'Cavalo + semirreboque', 2022, 'Transporte SP'),
('UVW6X78', 'Frota 06', 'Utilitário', 2023, 'Admin'),
('YZA9B01', 'Frota 07', 'Cavalo + semirreboque', 2021, 'Logística RJ'),
('CDE2F34', 'Frota 08', 'Carreta frigorífica', 2024, 'Distribuição MG'),
('GHI5J67', 'Frota 09', 'Caminhão truck', 2020, 'Obras DF'),
('KLM8N90', 'Frota 10', 'Cavalo + semirreboque', 2023, 'Transporte SP');

-- 2. PNEUS (55)
INSERT INTO pneus (serial_number, marca, modelo, medida, dot, data_compra, valor_compra, status, condicao, qtd_reformas) VALUES
-- Em estoque / novos (20)
('PN-24001', 'Michelin', 'X Multi', '295/80R22.5', '1123', '2026-01-15', 1850.00, 'estoque', 'Pneu novo', 0),
('PN-24002', 'Michelin', 'X Multi', '295/80R22.5', '1123', '2026-01-15', 1850.00, 'estoque', 'Pneu novo', 0),
('PN-24003', 'Bridgestone', 'R150', '295/80R22.5', '2324', '2026-02-10', 1720.00, 'estoque', 'Pneu novo', 0),
('PN-24004', 'Bridgestone', 'R150', '295/80R22.5', '2324', '2026-02-10', 1720.00, 'estoque', 'Pneu novo', 0),
('PN-24005', 'Goodyear', 'S200', '275/80R22.5', '0524', '2026-03-05', 1680.00, 'estoque', 'Pneu novo', 0),
('PN-24006', 'Pirelli', 'FH 02', '295/80R22.5', '0624', '2026-04-01', 1820.00, 'estoque', 'Pneu novo', 0),
('PN-24007', 'Pirelli', 'FH 02', '295/80R22.5', '0624', '2026-04-01', 1820.00, 'estoque', 'Pneu novo', 0),
('PN-24008', 'Michelin', 'X Multi', '295/80R22.5', '0724', '2026-04-20', 1860.00, 'estoque', 'Pneu novo', 0),
('PN-24009', 'Goodyear', 'S200', '275/80R22.5', '0824', '2026-05-05', 1690.00, 'estoque', 'Pneu novo', 0),
('PN-24010', 'Bridgestone', 'R150', '295/80R22.5', '0924', '2026-05-10', 1740.00, 'estoque', 'Pneu novo', 0),
('PN-24011', 'Michelin', 'X Multi Energy', '295/80R22.5', '1024', '2026-05-15', 1920.00, 'estoque', 'Pneu novo', 0),
('PN-24012', 'Michelin', 'X Multi Energy', '295/80R22.5', '1024', '2026-05-15', 1920.00, 'estoque', 'Pneu novo', 0),
('PN-24013', 'Pirelli', 'FH 02', '295/80R22.5', '1124', '2026-05-20', 1800.00, 'estoque', 'Pneu novo', 0),
('PN-24014', 'Goodyear', 'Marathon', '275/80R22.5', '1124', '2026-05-22', 1650.00, 'estoque', 'Pneu novo', 0),
('PN-24015', 'Bridgestone', 'M844', '295/80R22.5', '1224', '2026-06-01', 1760.00, 'estoque', 'Pneu novo', 0),
('PN-24016', 'Continental', 'HSR1', '295/80R22.5', '1224', '2026-06-02', 1880.00, 'estoque', 'Pneu novo', 0),
('PN-24017', 'Continental', 'HSR1', '295/80R22.5', '1224', '2026-06-02', 1880.00, 'estoque', 'Pneu novo', 0),
('PN-24018', 'Dunlop', 'SP246', '275/80R22.5', '0125', '2026-06-05', 1600.00, 'estoque', 'Pneu novo', 0),
('PN-24019', 'Dunlop', 'SP246', '275/80R22.5', '0125', '2026-06-05', 1600.00, 'estoque', 'Pneu novo', 0),
('PN-24020', 'Michelin', 'X Multi', '295/80R22.5', '0225', '2026-06-10', 1870.00, 'estoque', 'Pneu novo', 0),

-- Instalados (14)
('PN-23001', 'Pirelli', 'FH 01', '295/80R22.5', '3423', '2025-08-20', 1900.00, 'instalado', 'Novo Usado', 0),
('PN-23002', 'Pirelli', 'FH 01', '295/80R22.5', '3423', '2025-08-20', 1900.00, 'instalado', 'Novo Usado', 0),
('PN-23003', 'Bridgestone', 'R150', '295/80R22.5', '1123', '2025-09-12', 1750.00, 'instalado', 'Novo Usado', 0),
('PN-23004', 'Michelin', 'X Multi', '295/80R22.5', '4523', '2025-10-01', 1890.00, 'instalado', 'Novo Usado', 0),
('PN-23005', 'Goodyear', 'S200', '275/80R22.5', '5123', '2025-11-05', 1700.00, 'instalado', 'Novo Usado', 0),
('PN-23006', 'Goodyear', 'S200', '275/80R22.5', '5123', '2025-11-05', 1700.00, 'instalado', 'Novo Usado', 0),
('PN-23007', 'Pirelli', 'FH 01', '295/80R22.5', '0224', '2025-12-01', 1850.00, 'instalado', 'Novo Usado', 0),
('PN-23008', 'Bridgestone', 'R150', '295/80R22.5', '0324', '2026-01-10', 1730.00, 'instalado', 'Novo Usado', 0),
('PN-22001', 'Michelin', 'X Multi', '295/80R22.5', '4022', '2024-06-10', 1950.00, 'instalado', 'Reformado', 1),
('PN-22002', 'Goodyear', 'S200', '275/80R22.5', '3822', '2024-07-15', 1720.00, 'instalado', 'Reformado', 1),
('PN-22003', 'Bridgestone', 'R150', '295/80R22.5', '5022', '2024-08-20', 1780.00, 'instalado', 'Reformado Usado', 2),
('PN-22004', 'Pirelli', 'FH 01', '295/80R22.5', '5122', '2024-09-10', 1920.00, 'instalado', 'Reformado', 1),
('PN-22005', 'Michelin', 'X Multi', '295/80R22.5', '0123', '2024-10-05', 1900.00, 'instalado', 'Reformado Usado', 2),
('PN-22006', 'Continental', 'HSR1', '295/80R22.5', '0223', '2024-11-20', 1850.00, 'instalado', 'Reformado', 1),

-- Em reforma (6)
('PN-21001', 'Pirelli', 'FH 01', '295/80R22.5', '2021', '2024-01-10', 2000.00, 'reforma', 'Reformado', 2),
('PN-21002', 'Michelin', 'X Multi', '295/80R22.5', '2921', '2024-02-15', 1980.00, 'reforma', 'Reformado', 1),
('PN-21003', 'Goodyear', 'S200', '275/80R22.5', '3021', '2024-03-01', 1750.00, 'reforma', 'Reformado', 2),
('PN-21004', 'Bridgestone', 'R150', '295/80R22.5', '3121', '2024-03-20', 1800.00, 'reforma', 'Reformado', 1),
('PN-21005', 'Pirelli', 'FH 01', '295/80R22.5', '3321', '2024-05-10', 1950.00, 'reforma', 'Reformado Usado', 3),
('PN-21006', 'Michelin', 'X Multi', '295/80R22.5', '3521', '2024-06-15', 1970.00, 'reforma', 'Reformado', 1),

-- Descartados (9)
('PN-20001', 'Bridgestone', 'R150', '295/80R22.5', '3820', '2023-03-01', 1850.00, 'descartado', 'Sucata', 3),
('PN-20002', 'Goodyear', 'S200', '275/80R22.5', '3920', '2023-04-10', 1700.00, 'descartado', 'Sucata', 2),
('PN-20003', 'Pirelli', 'FH 01', '295/80R22.5', '4020', '2023-05-15', 1950.00, 'descartado', 'Sucata', 3),
('PN-20004', 'Michelin', 'X Multi', '295/80R22.5', '4120', '2023-06-01', 1980.00, 'descartado', 'Sucata', 2),
('PN-20005', 'Bridgestone', 'R150', '295/80R22.5', '4220', '2023-06-20', 1820.00, 'descartado', 'Sucata', 3),
('PN-20006', 'Continental', 'HSR1', '295/80R22.5', '4320', '2023-07-15', 1900.00, 'descartado', 'Sucata', 2),
('PN-20007', 'Goodyear', 'S200', '275/80R22.5', '4420', '2023-08-05', 1680.00, 'descartado', 'Sucata', 3),
('PN-20008', 'Pirelli', 'FH 01', '295/80R22.5', '4520', '2023-09-10', 1930.00, 'descartado', 'Sucata', 2),
('PN-20009', 'Dunlop', 'SP246', '275/80R22.5', '4620', '2023-10-01', 1580.00, 'descartado', 'Sucata', 1);

-- 3. MOVIMENTAÇÕES (18)
-- Junho 2026
INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Dianteiro E', '2026-06-01 08:30:00'::timestamp, 45230, 'Instalação programada'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23001' AND v.placa = 'ABC1D23';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Dianteiro D', '2026-06-01 08:35:00'::timestamp, 45230, 'Instalação programada'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23002' AND v.placa = 'ABC1D23';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Tracionar E', '2026-06-01 09:00:00'::timestamp, 45230, 'Substituição reformado'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-22001' AND v.placa = 'ABC1D23';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Tracionar D', '2026-06-01 09:05:00'::timestamp, 45230, 'Substituição reformado'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-22002' AND v.placa = 'ABC1D23';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Dianteiro E', '2026-06-02 07:30:00'::timestamp, 38900, 'Pneu novo'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23005' AND v.placa = 'EFG4H56';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Dianteiro D', '2026-06-02 07:35:00'::timestamp, 38900, 'Pneu novo'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23006' AND v.placa = 'EFG4H56';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Tracionar E', '2026-06-05 10:00:00'::timestamp, 52100, 'Reformado'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-22004' AND v.placa = 'QRS3T45';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Tracionar D', '2026-06-05 10:05:00'::timestamp, 52100, 'Reformado'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-22006' AND v.placa = 'QRS3T45';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Dianteiro E', '2026-06-10 14:00:00'::timestamp, 31500, 'Substituição preventiva'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23007' AND v.placa = 'IJK7L89';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Dianteiro D', '2026-06-10 14:05:00'::timestamp, 31500, 'Substituição preventiva'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23008' AND v.placa = 'IJK7L89';

-- Maio 2026
INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, motivo, observacoes)
SELECT p.id, v.id, 'remocao', 'Dianteiro E', '2026-05-25 14:00:00'::timestamp, 44890, 'reforma', 'Enviado para reforma'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-21001' AND v.placa = 'EFG4H56';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, motivo, observacoes)
SELECT p.id, v.id, 'remocao', 'Tracionar D', '2026-05-20 10:30:00'::timestamp, 43500, 'desgaste', 'Fim de vida útil'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-20001' AND v.placa = 'IJK7L89';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Tracionar E', '2026-05-10 07:45:00'::timestamp, 44000, 'Pneu novo'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23004' AND v.placa = 'IJK7L89';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, observacoes)
SELECT p.id, v.id, 'instalacao', 'Tracionar D', '2026-05-10 07:50:00'::timestamp, 44000, 'Pneu novo'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-23003' AND v.placa = 'IJK7L89';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, motivo, observacoes)
SELECT p.id, v.id, 'remocao', 'Tracionar E', '2026-05-08 16:00:00'::timestamp, 52000, 'reforma', 'Reformar'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-21003' AND v.placa = 'QRS3T45';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, motivo, observacoes)
SELECT p.id, v.id, 'remocao', 'Tracionar D', '2026-05-08 16:05:00'::timestamp, 52000, 'reforma', 'Reformar'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-21004' AND v.placa = 'QRS3T45';

-- Abril 2026
INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, motivo, observacoes)
SELECT p.id, v.id, 'remocao', 'Dianteiro E', '2026-04-15 09:00:00'::timestamp, 41000, 'preventiva', 'Troca programada'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-22005' AND v.placa = 'MNO0P12';

INSERT INTO movimentacoes (pneu_id, veiculo_id, tipo, posicao, data, quilometragem, motivo, observacoes)
SELECT p.id, v.id, 'remocao', 'Dianteiro D', '2026-04-15 09:05:00'::timestamp, 41000, 'preventiva', 'Troca programada'
FROM pneus p, veiculos v WHERE p.serial_number = 'PN-22003' AND v.placa = 'MNO0P12';

-- 4. REFORMAS (10)
INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'Borracheiro Express', 450.00, '2026-06-01', '2026-06-08', 3, 'Reforma completa - recapagem', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-21001';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'Reformadora ABC', 520.00, '2026-05-28', '2026-06-05', 2, 'Reforma com recapagem banda nova', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-21002';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'Borracheiro Express', 380.00, '2026-04-10', '2026-04-18', 2, 'Reforma simples', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-22001';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'Reformadora ABC', 490.00, '2026-03-15', '2026-03-22', 1, 'Primeira reforma', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-22002';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'PneusPrime Reformas', 560.00, '2026-05-10', '2026-05-18', 2, 'Recapagem de alta qualidade', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-21003';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'Reformadora ABC', 430.00, '2026-05-12', '2026-05-19', 2, 'Reforma padrão', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-21004';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'PneusPrime Reformas', 600.00, '2026-04-05', '2026-04-14', 3, 'Reforma completa', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-21005';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'Borracheiro Express', 420.00, '2026-05-20', '2026-05-28', 2, 'Reforma com garantia', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-21006';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'Reformadora ABC', 470.00, '2026-02-10', '2026-02-18', 1, 'Primeira reforma do pneu', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-22004';

INSERT INTO reformas (pneu_id, empresa, valor, data_envio, data_retorno, numero_reforma, observacoes, condicao_antes, status_antes)
SELECT p.id, 'PneusPrime Reformas', 540.00, '2026-02-20', '2026-02-28', 2, 'Reforma completa', p.condicao, p.status
FROM pneus p WHERE p.serial_number = 'PN-22006';
