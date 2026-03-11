-- ============================================
-- MotoJá - Script de Criação do Banco de Dados (v2)
-- Cidade: Valença - BA
-- ============================================

CREATE DATABASE IF NOT EXISTS motoja;
USE motoja;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('passageiro', 'mototaxista') NOT NULL,
    cnh VARCHAR(20) DEFAULT NULL,
    placa_moto VARCHAR(10) DEFAULT NULL,
    disponivel TINYINT(1) DEFAULT 1,
    avaliacao_media DECIMAL(2,1) DEFAULT 5.0,
    total_avaliacoes INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Corridas (atualizada com pagamento)
CREATE TABLE IF NOT EXISTS corridas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passageiro_id INT NOT NULL,
    mototaxista_id INT DEFAULT NULL,
    origem_endereco VARCHAR(255) NOT NULL,
    destino_endereco VARCHAR(255) NOT NULL,
    origem_lat DECIMAL(10, 7) DEFAULT NULL,
    origem_lng DECIMAL(10, 7) DEFAULT NULL,
    destino_lat DECIMAL(10, 7) DEFAULT NULL,
    destino_lng DECIMAL(10, 7) DEFAULT NULL,
    distancia_km DECIMAL(5, 2) DEFAULT NULL,
    preco DECIMAL(6, 2) NOT NULL,
    status ENUM('solicitada', 'aceita', 'em_andamento', 'finalizada', 'cancelada') DEFAULT 'solicitada',
    forma_pagamento ENUM('dinheiro', 'pix', 'cartao') DEFAULT NULL,
    pagamento_confirmado TINYINT(1) DEFAULT 0,
    avaliacao_passageiro INT DEFAULT NULL,
    avaliacao_mototaxista INT DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aceito_em TIMESTAMP NULL,
    iniciado_em TIMESTAMP NULL,
    finalizado_em TIMESTAMP NULL,
    FOREIGN KEY (passageiro_id) REFERENCES usuarios(id),
    FOREIGN KEY (mototaxista_id) REFERENCES usuarios(id)
);

-- Dados de teste
INSERT INTO usuarios (nome, email, telefone, senha, tipo, cnh, placa_moto) VALUES
('João Silva', 'joao@email.com', '(75) 99999-1111', '123456', 'passageiro', NULL, NULL),
('Maria Santos', 'maria@email.com', '(75) 99999-2222', '123456', 'passageiro', NULL, NULL),
('Carlos Moto', 'carlos@email.com', '(75) 99999-3333', '123456', 'mototaxista', '12345678900', 'ABC-1234'),
('Pedro Moto', 'pedro@email.com', '(75) 99999-4444', '123456', 'mototaxista', '98765432100', 'XYZ-5678');
