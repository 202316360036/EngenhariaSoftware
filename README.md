# 🏍️ MotoJá — Aplicativo para Mototaxistas

**Cidade:** Valença - BA  
**Disciplina:** Engenharia de Software  
**Semestre:** 4º semestre — Análise e Desenvolvimento de Sistemas  

---

## 📋 Sobre o Projeto

O **MotoJá** é um sistema web responsivo (funciona no celular pelo navegador) que conecta **passageiros** a **mototaxistas** na cidade de Valença-BA.

### Funcionalidades implementadas:
- ✅ Cadastro de passageiro e mototaxista
- ✅ Login de usuários
- ✅ Mapa interativo com Leaflet (OpenStreetMap)
- ✅ Solicitação de corrida com origem e destino no mapa
- ✅ Cálculo automático de preço (R$ 5,00 base + R$ 2,00/km)
- ✅ Painel do mototaxista com corridas disponíveis
- ✅ Aceitar, iniciar e finalizar corridas
- ✅ Toggle online/offline para mototaxistas
- ✅ Histórico de corridas

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript |
| Backend | Node.js, Express.js |
| Banco de Dados | MySQL |
| Mapa | Leaflet.js + OpenStreetMap |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- **Node.js** instalado (baixe em https://nodejs.org)
- **MySQL** instalado (pode usar XAMPP, MySQL Workbench ou similar)

### Passo a passo

**1. Clone o repositório:**
```bash
git clone https://github.com/202316360036/EngenhariaSoftware.git
cd EngenhariaSoftware/motoja
```

**2. Crie o banco de dados:**
- Abra o MySQL Workbench (ou phpMyAdmin se usar XAMPP)
- Execute o script `database/script.sql`
- Isso vai criar o banco `motoja` com as tabelas e dados de teste

**3. Configure a conexão com o banco:**
- Abra o arquivo `backend/database.js`
- Altere a senha do MySQL se necessário:
```javascript
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',       // <-- coloque sua senha aqui
    database: 'motoja',
    port: 3306
});
```

**4. Instale as dependências do backend:**
```bash
cd backend
npm install
```

**5. Inicie o servidor:**
```bash
node server.js
```

**6. Acesse no navegador:**
```
http://localhost:3000
```

---

## 👤 Usuários de Teste

O script SQL já cria alguns usuários para teste:

| Tipo | Email | Senha |
|------|-------|-------|
| Passageiro | joao@email.com | 123456 |
| Passageiro | maria@email.com | 123456 |
| Mototaxista | carlos@email.com | 123456 |
| Mototaxista | pedro@email.com | 123456 |

Na tela de login também há botões de **acesso rápido** para testar.

---

## 📁 Estrutura de Pastas

```
motoja/
├── backend/
│   ├── server.js           # Servidor Express (arquivo principal)
│   ├── database.js         # Conexão com MySQL
│   ├── package.json        # Dependências do Node.js
│   └── routes/
│       ├── usuarios.js     # Rotas: cadastro, login, perfil
│       └── corridas.js     # Rotas: solicitar, aceitar, finalizar
├── frontend/
│   ├── index.html          # Tela de login
│   ├── cadastro.html       # Tela de cadastro
│   ├── painel-passageiro.html  # Painel do passageiro (mapa + corridas)
│   ├── painel-mototaxista.html # Painel do mototaxista
│   └── css/
│       └── style.css       # Estilos customizados
├── database/
│   └── script.sql          # Script SQL para criar o banco
└── README.md               # Este arquivo
```

---

## 💰 Cálculo de Preço

O preço das corridas é calculado com base na distância em linha reta entre origem e destino, multiplicada por 1.3 (fator que simula o percurso real pelas ruas):

- **Taxa base:** R$ 5,00
- **Por km:** R$ 2,00
- **Preço mínimo:** R$ 5,00

Exemplo: corrida de 2 km → R$ 5,00 + (2 × R$ 2,00) = **R$ 9,00**

---

## 📌 O que fica para versões futuras

- Pagamento integrado via Pix
- Rastreamento em tempo real com WebSocket
- Notificações push
- Painel administrativo
- Sistema de avaliação por estrelas
- Botão de emergência/pânico
- Deploy em servidor de produção

---

## 📄 Licença

Projeto acadêmico — uso educacional.
