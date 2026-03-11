// ============================================
// MotoJá - Rotas de Corridas (v2)
// Com: status detalhado, pagamento e avaliação
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../database');

// Configuração de preço para Valença-BA
const PRECO_BASE = 5.00;
const PRECO_POR_KM = 2.00;

function calcularPreco(distanciaKm) {
    let preco = PRECO_BASE + (distanciaKm * PRECO_POR_KM);
    preco = Math.ceil(preco);
    if (preco < 5) preco = 5;
    return preco;
}

// ---- SOLICITAR CORRIDA ----
router.post('/solicitar', (req, res) => {
    const { passageiro_id, origem_endereco, destino_endereco, origem_lat, origem_lng, destino_lat, destino_lng, distancia_km } = req.body;

    if (!passageiro_id || !origem_endereco || !destino_endereco) {
        return res.status(400).json({ erro: 'Informe origem e destino.' });
    }

    const preco = calcularPreco(distancia_km || 0);

    const sql = `INSERT INTO corridas (passageiro_id, origem_endereco, destino_endereco, origem_lat, origem_lng, destino_lat, destino_lng, distancia_km, preco, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'solicitada')`;
    const valores = [passageiro_id, origem_endereco, destino_endereco, origem_lat || null, origem_lng || null, destino_lat || null, destino_lng || null, distancia_km || null, preco];

    db.query(sql, valores, (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao solicitar corrida.' });
        console.log(`Nova corrida #${result.insertId} | R$ ${preco.toFixed(2)}`);
        res.status(201).json({
            mensagem: 'Corrida solicitada!',
            corrida: { id: result.insertId, origem: origem_endereco, destino: destino_endereco, preco, status: 'solicitada' }
        });
    });
});

// ---- ESTIMAR PREÇO ----
router.post('/estimar', (req, res) => {
    const preco = calcularPreco(req.body.distancia_km || 0);
    res.json({ preco_base: PRECO_BASE, preco_por_km: PRECO_POR_KM, preco_total: preco });
});

// ---- CORRIDAS DISPONÍVEIS ----
router.get('/disponiveis', (req, res) => {
    const sql = `SELECT c.*, u.nome AS nome_passageiro, u.telefone AS telefone_passageiro
                 FROM corridas c JOIN usuarios u ON c.passageiro_id = u.id
                 WHERE c.status = 'solicitada' ORDER BY c.criado_em DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar corridas.' });
        res.json(results);
    });
});

// ---- ACEITAR CORRIDA ----
router.put('/:id/aceitar', (req, res) => {
    const { mototaxista_id } = req.body;
    const corrida_id = req.params.id;

    db.query('SELECT status FROM corridas WHERE id = ?', [corrida_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        if (results.length === 0) return res.status(404).json({ erro: 'Corrida não encontrada.' });
        if (results[0].status !== 'solicitada') return res.status(400).json({ erro: 'Corrida já aceita por outro mototaxista.' });

        db.query('UPDATE corridas SET status = "aceita", mototaxista_id = ?, aceito_em = NOW() WHERE id = ?', 
            [mototaxista_id, corrida_id], (err) => {
            if (err) return res.status(500).json({ erro: 'Erro ao aceitar.' });
            console.log(`Corrida #${corrida_id} aceita`);
            res.json({ mensagem: 'Corrida aceita!' });
        });
    });
});

// ---- INICIAR CORRIDA ----
router.put('/:id/iniciar', (req, res) => {
    db.query('UPDATE corridas SET status = "em_andamento", iniciado_em = NOW() WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        console.log(`Corrida #${req.params.id} iniciada`);
        res.json({ mensagem: 'Corrida em andamento!' });
    });
});

// ---- FINALIZAR CORRIDA (com forma de pagamento) ----
router.put('/:id/finalizar', (req, res) => {
    const { forma_pagamento } = req.body;
    const sql = 'UPDATE corridas SET status = "finalizada", finalizado_em = NOW(), forma_pagamento = ? WHERE id = ?';
    db.query(sql, [forma_pagamento || 'dinheiro', req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        console.log(`Corrida #${req.params.id} finalizada | Pagamento: ${forma_pagamento || 'dinheiro'}`);
        res.json({ mensagem: 'Corrida finalizada!' });
    });
});

// ---- CONFIRMAR PAGAMENTO ----
router.put('/:id/confirmar-pagamento', (req, res) => {
    db.query('UPDATE corridas SET pagamento_confirmado = 1 WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        res.json({ mensagem: 'Pagamento confirmado!' });
    });
});

// ---- CANCELAR CORRIDA ----
router.put('/:id/cancelar', (req, res) => {
    db.query('UPDATE corridas SET status = "cancelada" WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        res.json({ mensagem: 'Corrida cancelada.' });
    });
});

// ---- AVALIAR CORRIDA ----
router.post('/:id/avaliar', (req, res) => {
    const { usuario_id, tipo_avaliador, nota } = req.body;
    const corrida_id = req.params.id;

    if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ erro: 'Nota deve ser de 1 a 5.' });
    }

    // Definir qual campo atualizar
    const campo = tipo_avaliador === 'passageiro' ? 'avaliacao_passageiro' : 'avaliacao_mototaxista';
    
    db.query(`UPDATE corridas SET ${campo} = ? WHERE id = ?`, [nota, corrida_id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao avaliar.' });

        // Buscar a corrida pra saber quem foi avaliado
        db.query('SELECT passageiro_id, mototaxista_id FROM corridas WHERE id = ?', [corrida_id], (err, results) => {
            if (err || results.length === 0) return res.json({ mensagem: 'Avaliação salva!' });

            // O avaliado é o OUTRO participante
            const avaliado_id = tipo_avaliador === 'passageiro' ? results[0].mototaxista_id : results[0].passageiro_id;
            
            if (avaliado_id) {
                // Recalcular média do avaliado
                const campoNota = tipo_avaliador === 'passageiro' ? 'avaliacao_passageiro' : 'avaliacao_mototaxista';
                const sqlMedia = tipo_avaliador === 'passageiro' 
                    ? 'SELECT AVG(avaliacao_passageiro) as media, COUNT(avaliacao_passageiro) as total FROM corridas WHERE mototaxista_id = ? AND avaliacao_passageiro IS NOT NULL'
                    : 'SELECT AVG(avaliacao_mototaxista) as media, COUNT(avaliacao_mototaxista) as total FROM corridas WHERE passageiro_id = ? AND avaliacao_mototaxista IS NOT NULL';
                
                db.query(sqlMedia, [avaliado_id], (err, mediaResult) => {
                    if (!err && mediaResult.length > 0) {
                        const media = parseFloat(mediaResult[0].media) || 5.0;
                        const total = mediaResult[0].total || 0;
                        db.query('UPDATE usuarios SET avaliacao_media = ?, total_avaliacoes = ? WHERE id = ?', 
                            [media.toFixed(1), total, avaliado_id]);
                    }
                });
            }

            console.log(`Corrida #${corrida_id} avaliada: ${nota} estrelas`);
            res.json({ mensagem: 'Avaliação registrada!' });
        });
    });
});

// ---- CORRIDA ATIVA DO PASSAGEIRO ----
router.get('/ativa/:passageiro_id', (req, res) => {
    const sql = `SELECT c.*, m.nome AS nome_mototaxista, m.telefone AS telefone_mototaxista, 
                 m.placa_moto, m.avaliacao_media AS avaliacao_mototaxista
                 FROM corridas c LEFT JOIN usuarios m ON c.mototaxista_id = m.id
                 WHERE c.passageiro_id = ? AND c.status IN ('solicitada', 'aceita', 'em_andamento')
                 ORDER BY c.criado_em DESC LIMIT 1`;
    db.query(sql, [req.params.passageiro_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        res.json(results.length === 0 ? null : results[0]);
    });
});

// ---- MINHAS CORRIDAS (histórico) ----
router.get('/minhas/:usuario_id', (req, res) => {
    const sql = `SELECT c.*, p.nome AS nome_passageiro, m.nome AS nome_mototaxista
                 FROM corridas c
                 LEFT JOIN usuarios p ON c.passageiro_id = p.id
                 LEFT JOIN usuarios m ON c.mototaxista_id = m.id
                 WHERE c.passageiro_id = ? OR c.mototaxista_id = ?
                 ORDER BY c.criado_em DESC LIMIT 50`;
    db.query(sql, [req.params.usuario_id, req.params.usuario_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar corridas.' });
        res.json(results);
    });
});

// ---- CORRIDA ATIVA DO MOTOTAXISTA ----
router.get('/ativa-moto/:mototaxista_id', (req, res) => {
    const sql = `SELECT c.*, p.nome AS nome_passageiro, p.telefone AS telefone_passageiro
                 FROM corridas c LEFT JOIN usuarios p ON c.passageiro_id = p.id
                 WHERE c.mototaxista_id = ? AND c.status IN ('aceita', 'em_andamento')
                 ORDER BY c.criado_em DESC LIMIT 1`;
    db.query(sql, [req.params.mototaxista_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        res.json(results.length === 0 ? null : results[0]);
    });
});

module.exports = router;
