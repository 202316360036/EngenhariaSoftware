// ============================================
// MotoJá - Rotas de Corridas
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../database');

// ---- PREÇO ----
// Configuração de preço para Valença-BA
const PRECO_BASE = 5.00;       // Taxa mínima (R$)
const PRECO_POR_KM = 2.00;     // Preço por km rodado

// Função pra calcular preço
function calcularPreco(distanciaKm) {
    let preco = PRECO_BASE + (distanciaKm * PRECO_POR_KM);
    // Arredonda pra cima pro próximo real inteiro
    preco = Math.ceil(preco);
    // Preço mínimo de R$ 5,00
    if (preco < 5) preco = 5;
    return preco;
}

// ---- SOLICITAR CORRIDA ----
// POST /api/corridas/solicitar
router.post('/solicitar', (req, res) => {
    const {
        passageiro_id,
        origem_endereco,
        destino_endereco,
        origem_lat,
        origem_lng,
        destino_lat,
        destino_lng,
        distancia_km
    } = req.body;

    if (!passageiro_id || !origem_endereco || !destino_endereco) {
        return res.status(400).json({ erro: 'Informe origem e destino.' });
    }

    const preco = calcularPreco(distancia_km || 0);

    const sql = `
        INSERT INTO corridas 
        (passageiro_id, origem_endereco, destino_endereco, origem_lat, origem_lng, destino_lat, destino_lng, distancia_km, preco, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'solicitada')
    `;
    const valores = [
        passageiro_id,
        origem_endereco,
        destino_endereco,
        origem_lat || null,
        origem_lng || null,
        destino_lat || null,
        destino_lng || null,
        distancia_km || null,
        preco
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error('Erro ao solicitar corrida:', err);
            return res.status(500).json({ erro: 'Erro ao solicitar corrida.' });
        }

        console.log(`🏍️ Nova corrida solicitada! ID: ${result.insertId} | R$ ${preco.toFixed(2)}`);
        res.status(201).json({
            mensagem: 'Corrida solicitada! Aguardando mototaxista...',
            corrida: {
                id: result.insertId,
                origem: origem_endereco,
                destino: destino_endereco,
                preco: preco,
                status: 'solicitada'
            }
        });
    });
});

// ---- ESTIMAR PREÇO (sem criar corrida) ----
// POST /api/corridas/estimar
router.post('/estimar', (req, res) => {
    const { distancia_km } = req.body;
    const preco = calcularPreco(distancia_km || 0);
    res.json({
        distancia_km: distancia_km,
        preco_base: PRECO_BASE,
        preco_por_km: PRECO_POR_KM,
        preco_total: preco
    });
});

// ---- LISTAR CORRIDAS DISPONÍVEIS (para mototaxistas) ----
// GET /api/corridas/disponiveis
router.get('/disponiveis', (req, res) => {
    const sql = `
        SELECT c.*, u.nome AS nome_passageiro, u.telefone AS telefone_passageiro
        FROM corridas c
        JOIN usuarios u ON c.passageiro_id = u.id
        WHERE c.status = 'solicitada'
        ORDER BY c.criado_em DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar corridas.' });
        }
        res.json(results);
    });
});

// ---- ACEITAR CORRIDA ----
// PUT /api/corridas/:id/aceitar
router.put('/:id/aceitar', (req, res) => {
    const { mototaxista_id } = req.body;
    const corrida_id = req.params.id;

    // Primeiro verifica se a corrida ainda está disponível
    const sqlVerifica = 'SELECT status FROM corridas WHERE id = ?';
    db.query(sqlVerifica, [corrida_id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ erro: 'Corrida não encontrada.' });
        }
        if (results[0].status !== 'solicitada') {
            return res.status(400).json({ erro: 'Esta corrida já foi aceita por outro mototaxista.' });
        }

        // Aceitar a corrida
        const sqlAceitar = `
            UPDATE corridas SET status = 'aceita', mototaxista_id = ? WHERE id = ?
        `;
        db.query(sqlAceitar, [mototaxista_id, corrida_id], (err, result) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao aceitar corrida.' });
            }
            console.log(`✅ Corrida #${corrida_id} aceita pelo mototaxista #${mototaxista_id}`);
            res.json({ mensagem: 'Corrida aceita! Vá buscar o passageiro.' });
        });
    });
});

// ---- INICIAR CORRIDA (mototaxista chegou) ----
// PUT /api/corridas/:id/iniciar
router.put('/:id/iniciar', (req, res) => {
    const sql = 'UPDATE corridas SET status = "em_andamento" WHERE id = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        res.json({ mensagem: 'Corrida em andamento!' });
    });
});

// ---- FINALIZAR CORRIDA ----
// PUT /api/corridas/:id/finalizar
router.put('/:id/finalizar', (req, res) => {
    const sql = 'UPDATE corridas SET status = "finalizada", finalizado_em = NOW() WHERE id = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        console.log(`🏁 Corrida #${req.params.id} finalizada!`);
        res.json({ mensagem: 'Corrida finalizada com sucesso!' });
    });
});

// ---- CANCELAR CORRIDA ----
// PUT /api/corridas/:id/cancelar
router.put('/:id/cancelar', (req, res) => {
    const sql = 'UPDATE corridas SET status = "cancelada" WHERE id = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        res.json({ mensagem: 'Corrida cancelada.' });
    });
});

// ---- MINHAS CORRIDAS (histórico do usuário) ----
// GET /api/corridas/minhas/:usuario_id
router.get('/minhas/:usuario_id', (req, res) => {
    const sql = `
        SELECT c.*, 
            p.nome AS nome_passageiro, 
            m.nome AS nome_mototaxista
        FROM corridas c
        LEFT JOIN usuarios p ON c.passageiro_id = p.id
        LEFT JOIN usuarios m ON c.mototaxista_id = m.id
        WHERE c.passageiro_id = ? OR c.mototaxista_id = ?
        ORDER BY c.criado_em DESC
        LIMIT 50
    `;
    db.query(sql, [req.params.usuario_id, req.params.usuario_id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar corridas.' });
        }
        res.json(results);
    });
});

// ---- CORRIDA ATIVA DO PASSAGEIRO ----
// GET /api/corridas/ativa/:passageiro_id
router.get('/ativa/:passageiro_id', (req, res) => {
    const sql = `
        SELECT c.*, m.nome AS nome_mototaxista, m.telefone AS telefone_mototaxista, 
               m.placa_moto, m.avaliacao_media
        FROM corridas c
        LEFT JOIN usuarios m ON c.mototaxista_id = m.id
        WHERE c.passageiro_id = ? AND c.status IN ('solicitada', 'aceita', 'em_andamento')
        ORDER BY c.criado_em DESC
        LIMIT 1
    `;
    db.query(sql, [req.params.passageiro_id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        if (results.length === 0) {
            return res.json(null);
        }
        res.json(results[0]);
    });
});

module.exports = router;
