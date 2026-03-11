//  ============================================
// MotoJa - Servidor Principal
//  ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir os arquivos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Importar as rotas
const usuariosRoutes = require('./routes/usuarios');
const corridasRoutes = require('./routes/corridas');

// Usar as rotas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/corridas', corridasRoutes);

// Rota principal - redireciona pro login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log('');
    console.log(' ===========================================');
    console.log('  MotoJa - Servidor rodando!');
    console.log(`   Acesse: http://localhost:${PORT}`);
    console.log('  Cidade: Valenca - BA');
    console.log(' ===========================================');
    console.log('');
});
