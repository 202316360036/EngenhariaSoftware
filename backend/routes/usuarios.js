// ============================================
// MotoJá - Rotas de Usuários
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../database');

// ---- CADASTRO ----
// POST /api/usuarios/cadastro
router.post('/cadastro', (req, res) => {
    const { nome, email, telefone, senha, tipo, cnh, placa_moto } = req.body;

    // Validações simples
    if (!nome || !email || !telefone || !senha || !tipo) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }

    if (tipo === 'mototaxista' && (!cnh || !placa_moto)) {
        return res.status(400).json({ erro: 'Mototaxista precisa informar CNH e placa da moto.' });
    }

    // Verificar se o email já existe
    const sqlVerifica = 'SELECT id FROM usuarios WHERE email = ?';
    db.query(sqlVerifica, [email], (err, results) => {
        if (err) {
            console.error('Erro ao verificar email:', err);
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        // Inserir o novo usuário
        const sqlInsert = `
            INSERT INTO usuarios (nome, email, telefone, senha, tipo, cnh, placa_moto) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const valores = [nome, email, telefone, senha, tipo, cnh || null, placa_moto || null];

        db.query(sqlInsert, valores, (err, result) => {
            if (err) {
                console.error('Erro ao cadastrar:', err);
                return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
            }

            console.log(`✅ Novo ${tipo} cadastrado: ${nome}`);
            res.status(201).json({
                mensagem: 'Cadastro realizado com sucesso!',
                usuario: {
                    id: result.insertId,
                    nome,
                    email,
                    tipo
                }
            });
        });
    });
});

// ---- LOGIN ----
// POST /api/usuarios/login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const sql = 'SELECT id, nome, email, telefone, tipo, avaliacao_media FROM usuarios WHERE email = ? AND senha = ?';
    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error('Erro no login:', err);
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuario = results[0];
        console.log(`🔑 Login: ${usuario.nome} (${usuario.tipo})`);
        res.json({
            mensagem: 'Login realizado com sucesso!',
            usuario: usuario
        });
    });
});

// ---- BUSCAR PERFIL ----
// GET /api/usuarios/:id
router.get('/:id', (req, res) => {
    const sql = 'SELECT id, nome, email, telefone, tipo, cnh, placa_moto, avaliacao_media, criado_em FROM usuarios WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
        res.json(results[0]);
    });
});

// ---- ATUALIZAR DISPONIBILIDADE DO MOTOTAXISTA ----
// PUT /api/usuarios/:id/disponibilidade
router.put('/:id/disponibilidade', (req, res) => {
    const { disponivel } = req.body;
    const sql = 'UPDATE usuarios SET disponivel = ? WHERE id = ? AND tipo = "mototaxista"';
    db.query(sql, [disponivel ? 1 : 0, req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }
        res.json({ mensagem: disponivel ? 'Você está online!' : 'Você está offline.' });
    });
});

module.exports = router;
