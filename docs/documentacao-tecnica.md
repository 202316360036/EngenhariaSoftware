# MotoJa - Documentacao Tecnica

**Projeto:** MotoJa - Aplicativo para Mototaxistas  
**Cidade:** Valenca - BA  
**Equipe:** Elder (202316360036) e Joaci (202326360002-lgtm)  
**Disciplina:** Engenharia de Software - 4o Semestre ADS

---

## 1. Cenarios de Uso do Sistema

### Cenario 1: Passageiro solicita corrida

**Ator:** Passageiro  
**Pre-condicao:** Passageiro esta logado no sistema.

**Fluxo principal:**
1. Passageiro acessa o painel e visualiza o mapa de Valenca-BA.
2. Passageiro clica no mapa para marcar o ponto de origem (marcador verde).
3. Passageiro clica novamente para marcar o destino (marcador vermelho).
4. Sistema calcula a distancia e exibe o preco estimado.
5. Passageiro clica em "Solicitar Mototaxi".
6. Sistema cria a corrida com status "solicitada" e exibe mensagem de aguardo.
7. Passageiro acompanha o status em tempo real (atualizacao a cada 3 segundos).

**Fluxo alternativo:**
- 5a. Se o passageiro nao preencher origem/destino, sistema exibe erro.
- 7a. Se o passageiro desistir, pode cancelar a corrida.

### Cenario 2: Mototaxista aceita e realiza corrida

**Ator:** Mototaxista  
**Pre-condicao:** Mototaxista esta logado e online.

**Fluxo principal:**
1. Mototaxista visualiza a lista de corridas disponiveis (atualiza automaticamente).
2. Mototaxista clica em "Aceitar" na corrida desejada.
3. Sistema verifica se a corrida ainda esta disponivel.
4. Sistema atualiza o status para "aceita" e exibe os dados do passageiro.
5. Mototaxista se desloca ate o passageiro e clica em "Iniciar corrida".
6. Status muda para "em andamento".
7. Ao chegar ao destino, mototaxista clica em "Finalizar".
8. Sistema solicita a forma de pagamento (dinheiro, Pix ou cartao).
9. Mototaxista seleciona e confirma. Corrida finalizada.

**Fluxo alternativo:**
- 3a. Se a corrida ja foi aceita por outro, exibe mensagem de erro.
- 9a. Mototaxista pode cancelar a qualquer momento.

### Cenario 3: Pagamento e avaliacao

**Ator:** Passageiro e Mototaxista  
**Pre-condicao:** Corrida foi finalizada.

**Fluxo principal:**
1. Passageiro ve modal de pagamento com 3 opcoes: dinheiro, Pix e cartao.
2. Se Pix: exibe QR Code simulado e chave Pix copiavel.
3. Se cartao: exibe instrucao para passar na maquininha.
4. Passageiro confirma o pagamento.
5. Sistema exibe modal de avaliacao com 5 estrelas.
6. Passageiro da nota ao mototaxista (1 a 5).
7. Sistema recalcula a media de avaliacao do mototaxista.
8. Do lado do mototaxista, tambem exibe modal para avaliar o passageiro.

---

## 2. Padroes de Arquitetura

### 2.1 Cliente-Servidor

O sistema separa o frontend (navegador) do backend (servidor Node.js). O frontend faz requisicoes HTTP via fetch() para a API REST do backend. O backend processa a logica, consulta o MySQL e retorna respostas em JSON.

```
FRONTEND (HTML/JS)  <--HTTP/JSON-->  BACKEND (Express)  <--SQL-->  MySQL
```

### 2.2 MVC Simplificado

- **Model:** Tabelas do MySQL (usuarios, corridas) e queries SQL dentro das rotas.
- **View:** Arquivos HTML do frontend com CSS e JavaScript.
- **Controller:** Arquivos de rota (routes/usuarios.js e routes/corridas.js) que recebem requisicoes, validam dados, executam queries e retornam respostas.

### 2.3 API REST

Cada URL representa um recurso e os metodos HTTP definem a acao:

| Metodo | Endpoint | Acao |
|--------|----------|------|
| POST | /api/usuarios/cadastro | Criar usuario |
| POST | /api/usuarios/login | Autenticar |
| GET | /api/usuarios/:id | Buscar perfil |
| POST | /api/corridas/solicitar | Solicitar corrida |
| GET | /api/corridas/disponiveis | Listar corridas abertas |
| PUT | /api/corridas/:id/aceitar | Aceitar corrida |
| PUT | /api/corridas/:id/iniciar | Iniciar corrida |
| PUT | /api/corridas/:id/finalizar | Finalizar corrida |
| PUT | /api/corridas/:id/cancelar | Cancelar corrida |
| POST | /api/corridas/:id/avaliar | Registrar avaliacao |
| GET | /api/corridas/minhas/:id | Historico do usuario |

---

## 3. Principios SOLID

### S - Single Responsibility (Responsabilidade Unica)

Cada modulo tem uma unica responsabilidade:
- routes/usuarios.js cuida apenas de cadastro, login e perfil.
- routes/corridas.js cuida apenas da logica de corridas.
- database.js cuida apenas da conexao com o banco.
- server.js cuida apenas da configuracao do Express.
- Cada arquivo HTML cuida de uma tela especifica.

### O - Open/Closed (Aberto/Fechado)

- A funcao calcularPreco() usa constantes (PRECO_BASE, PRECO_POR_KM) que podem ser alteradas sem modificar a logica.
- Novas formas de pagamento podem ser adicionadas ao ENUM do banco sem alterar o codigo existente.
- Novas rotas podem ser criadas em novos arquivos sem modificar os ja existentes.

### L - Liskov Substitution (Substituicao de Liskov)

- Passageiro e mototaxista usam a mesma tabela e as mesmas rotas de cadastro/login. O campo "tipo" define o comportamento, mas ambos sao tratados como Usuario de forma generica pela API.

### I - Interface Segregation (Segregacao de Interface)

- O passageiro so acessa as rotas que precisa: solicitar, acompanhar, cancelar, avaliar.
- O mototaxista so acessa as que precisa: listar, aceitar, iniciar, finalizar, avaliar.
- Cada painel HTML carrega apenas os endpoints necessarios para seu papel.

### D - Dependency Inversion (Inversao de Dependencia)

- As rotas nao criam a conexao com o banco diretamente. Importam o modulo database.js que abstrai a conexao.
- Se trocarmos MySQL por outro banco, so precisamos alterar database.js.
- O frontend depende da API REST como abstracao, nao acessa o banco diretamente.

---

## 4. Padroes de Projeto

### 4.1 Router Pattern

Separacao da logica de roteamento em modulos independentes:

```javascript
// server.js
const usuariosRoutes = require('./routes/usuarios');
const corridasRoutes = require('./routes/corridas');
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/corridas', corridasRoutes);
```

### 4.2 Module Pattern

Encapsulamento de funcionalidades em modulos que exportam apenas o necessario:

```javascript
// database.js exporta apenas a conexao
const connection = mysql.createConnection({...});
module.exports = connection;

// routes/corridas.js exporta apenas o router
const router = express.Router();
module.exports = router;
```

### 4.3 Observer (Simplificado)

O frontend "observa" mudancas no estado da corrida consultando a API periodicamente:

```javascript
setInterval(async () => {
    const resp = await fetch(`/api/corridas/ativa/${usuario.id}`);
    const corrida = await resp.json();
    if (corrida) mostrarCorridaAtiva(corrida);
}, 3000);
```

### 4.4 State Pattern (Simplificado)

A corrida tem 5 estados possiveis e cada estado define quais acoes sao permitidas:

```
solicitada --> aceitar --> aceita --> iniciar --> em_andamento --> finalizar --> finalizada
     |                      |
  cancelar               cancelar
```

No backend, cada rota verifica o estado antes de permitir a acao.

### 4.5 Singleton

O modulo database.js cria uma unica conexao com o MySQL. Todos os arquivos que fazem require('../database') recebem a mesma instancia.

---

## 5. Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript |
| Mapa | Leaflet.js + OpenStreetMap |
| Backend | Node.js + Express.js |
| Banco | MySQL |
| Versionamento | GitHub (Issues, Milestones) |

## 6. Repositorio

GitHub: https://github.com/202316360036/EngenhariaSoftware

59 Issues organizadas em 5 Milestones (Sprint 0 a Sprint 4), com labels por tipo de tarefa.
