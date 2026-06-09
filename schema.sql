-- Tire Management System Schema

-- Enums for better data consistency
CREATE TYPE pneu_status AS ENUM ('estoque', 'instalado', 'reforma', 'descartado', 'novo');
CREATE TYPE mov_type AS ENUM ('instalacao', 'remocao');
CREATE TYPE removacao_motivo AS ENUM ('desgaste', 'furo', 'reforma', 'preventiva', 'descarte');

-- Vehicles Table
CREATE TABLE veiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    frota VARCHAR(20),
    tipo VARCHAR(50),
    ano INTEGER,
    centro_custo VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tires Table
CREATE TABLE pneus (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(100),
    medida VARCHAR(50) NOT NULL,
    dot VARCHAR(10),
    data_compra DATE,
    valor_compra DECIMAL(10, 2),
    status pneu_status DEFAULT 'novo',
    condicao VARCHAR(50) DEFAULT 'Pneu novo' CHECK (condicao IN ('Pneu novo', 'Novo Usado', 'Reformado', 'Reformado Usado', 'Sucata')),
    qtd_reformas INTEGER DEFAULT 0,
    vida_util_acumulada INTEGER DEFAULT 0, -- in km
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Movements Table (Installations and Removals)
CREATE TABLE movimentacoes (
    id SERIAL PRIMARY KEY,
    pneu_id INTEGER REFERENCES pneus(id) ON DELETE CASCADE,
    veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE SET NULL,
    tipo mov_type NOT NULL,
    posicao VARCHAR(50),
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    quilometragem INTEGER,
    motivo removacao_motivo,
    observacoes TEXT
);

-- Reforms Table
CREATE TABLE reformas (
    id SERIAL PRIMARY KEY,
    pneu_id INTEGER REFERENCES pneus(id) ON DELETE CASCADE,
    empresa VARCHAR(100),
    valor DECIMAL(10, 2),
    data_envio DATE,
    data_retorno DATE,
    numero_reforma INTEGER,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_pneus_serial ON pneus(serial_number);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_mov_pneu ON movimentacoes(pneu_id);
CREATE INDEX idx_mov_veiculo ON movimentacoes(veiculo_id);
CREATE INDEX idx_reformas_pneu ON reformas(pneu_id);
