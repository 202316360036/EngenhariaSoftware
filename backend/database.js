// ============================================
// MotoJá - Conexão com o Banco de Dados MySQL
// ============================================

const mysql = require('mysql2');

// Configuração da conexão
// ALTERE aqui se seu MySQL tiver outra senha ou porta
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'motoja_user',
    password: 'Motoja@123',          // <-- coloque a senha do seu MySQL aqui
    database: 'motoja',
    port: 3306             // porta padrão do MySQL
});

// Testar a conexão
connection.connect((err) => {
    if (err) {
        console.error('[ERRO] Erro ao conectar no banco de dados:');
        console.error('   Verifique se o MySQL está rodando e se o banco "motoja" foi criado.');
        console.error('   Detalhes:', err.message);
        return;
    }
    console.log('[OK] Conectado ao banco de dados MySQL - motoja');
});

module.exports = connection;
