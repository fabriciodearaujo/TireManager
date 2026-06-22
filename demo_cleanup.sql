-- ============================================================
-- CLEANUP — Remove todos os dados de demonstração
-- Execute no SQL Editor do Supabase APÓS os screenshots
-- ============================================================

-- Remove na ordem correta (respeitando foreign keys)
DELETE FROM movimentacoes;
DELETE FROM reformas;
DELETE FROM pneus;
DELETE FROM veiculos;

-- Reinicia as sequências (opcional — para IDs começarem de 1 novamente)
ALTER SEQUENCE veiculos_id_seq RESTART WITH 1;
ALTER SEQUENCE pneus_id_seq RESTART WITH 1;
ALTER SEQUENCE movimentacoes_id_seq RESTART WITH 1;
ALTER SEQUENCE reformas_id_seq RESTART WITH 1;
