# 🍕 PizzaRia

Sistema web de pizzaria desenvolvido com React e Flask.

---

## 📌 Sobre o projeto

A PizzaRia é uma aplicação fullstack focada em pedidos online de pizzas, desenvolvida
originalmente como projeto em equipe (3 integrantes) da disciplina de Programação Web
(XDES03) na UNIFEI.

Este repositório é a minha versão pessoal do projeto, reorganizada para portfólio,
reunindo o trabalho que desenvolvi no time: estilos CSS, layouts estruturais,
infraestrutura do projeto e documentação.

O projeto utiliza:
- React no frontend
- Flask no backend
- Comunicação via API REST com JSON puro

---

## ✨ Funcionalidades

- 🔐 Sistema de login e cadastro de usuários (com JWT)
- 🍕 Visualização do cardápio de pizzas
- 📦 Criação e gerenciamento de pedidos (CRUD)
- ✏️ Edição e remoção de pedidos
- 📍 Busca automática de endereço via CEP (BrasilAPI)
- 🔒 Rotas protegidas com autenticação
- 📱 Interface responsiva
- ⚡ Integração frontend/backend via JSON

---

## 🛠️ Tecnologias utilizadas

### Frontend
- React 19
- Vite
- CSS puro (sem frameworks)
- JavaScript (ES Modules)
- React Router DOM v7

### Backend
- Flask (Python)
- Flask-CORS
- Pydantic (validação de dados)
- PyJWT (autenticação)
- API REST
- JSON (arquivos como banco de dados)

---

## 📂 Estrutura do projeto

```bash
PizzaRia/
│
├── backend/                          ← Servidor Flask (API REST)
│   ├── app.py                        ← Inicialização do Flask + CORS + Blueprints
│   ├── auth_middleware.py            ← Geração e validação de tokens JWT
│   ├── schemas.py                    ← Validação de dados com Pydantic
│   ├── requirements.txt              ← Dependências Python
│   ├── routes/
│   │   ├── auth.py                   ← POST /auth/login e /auth/register
│   │   ├── pedidos.py                ← CRUD /pedidos (GET, POST, DELETE, PATCH)
│   │   ├── pizzas.py                 ← GET /pizzas (cardápio)
│   │   └── user.py                   ← GET/PUT /user/perfil
│   └── data/
│       ├── usuarios.json             ← Base de usuários cadastrados
│       ├── pizzas.json               ← Cardápio de pizzas
│       ├── pedidos.json              ← Histórico de pedidos
│       └── enderecos.json            ← Endereços (reserva)
│
├── frontend/                         ← App React (Vite)
│   ├── index.html                    ← HTML principal (div#root)
│   ├── package.json                  ← Dependências (react, vite, react-router-dom)
│   ├── vite.config.js                ← Configuração do Vite
│   └── src/
│       ├── main.jsx                  ← Ponto de entrada React
│       ├── App.jsx                   ← Roteamento (BrowserRouter + todas as rotas)
│       ├── services/
│       │   └── api.js                ← Central de chamadas HTTP ao backend
│       ├── pages/
│       │   ├── Login.jsx             ← Tela de login
│       │   ├── Cadastro.jsx          ← Tela de cadastro
│       │   ├── Home.jsx              ← Dashboard inicial (stats + pizzas + pedidos)
│       │   ├── Cardapio.jsx          ← Cardápio completo de pizzas
│       │   ├── NovoPedido.jsx        ← Wizard de montagem + checkout
│       │   ├── MeusPedidos.jsx       ← Lista de pedidos + filtros + timers
│       │   └── Perfil.jsx            ← Editar dados pessoais + endereço
│       ├── components/
│       │   ├── AuthLayout.jsx        ← Layout visual da tela de login (split)
│       │   ├── AuthForm.jsx          ← Formulário reutilizável login/cadastro
│       │   ├── DashboardLayout.jsx   ← Layout com sidebar + conteúdo
│       │   ├── Navbar.jsx            ← Sidebar de navegação
│       │   ├── ProtectedRoute.jsx    ← Guardião de rotas (redireciona se não logado)
│       │   ├── PizzaCard.jsx         ← Card individual de pizza
│       │   ├── PizzaSelector.jsx     ← Seletor de sabor no wizard
│       │   ├── SizeSelector.jsx      ← Seletor de tamanho
│       │   ├── ExtrasSelector.jsx    ← Seleção de adicionais
│       │   └── OrderSummary.jsx      ← Resumo do pedido no carrinho
│       ├── styles/
│       │   ├── global.css            ← Reset básico e variáveis CSS
│       │   ├── login.css             ← Layout split da tela de login
│       │   ├── forms.css             ← Inputs, botões, grids de endereço
│       │   ├── dashboard.css         ← Layout dashboard (sidebar + content)
│       │   ├── navbar.css            ← Estilos da sidebar
│       │   ├── home.css              ← Home, stats, tabelas, pizza-grid
│       │   ├── card.css              ← Cards de pizza no cardápio
│       │   └── novo-pedido.css       ← Wizard de montagem e checkout
│       └── assets/                   ← Imagens e ícones da interface
│
├── README.md                         ← Este arquivo
├── .gitignore                        ← Arquivos ignorados pelo git (raiz)
└── LICENSE                           ← Licença do projeto
```

---

## 🚀 Como executar

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install Flask Flask-CORS pydantic email-validator PyJWT
python app.py
```

O servidor roda em `http://127.0.0.1:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O servidor de desenvolvimento roda em `http://127.0.0.1:5173`

---

## 🔗 Fluxo de comunicação
[Browser] → React (Vite, :5173) → fetch() → Flask (:5000) → JSON files
↕
BrasilAPI (CEP público)

1. O React (Vite) serve as páginas em `localhost:5173`
2. As páginas chamam funções em `src/services/api.js`
3. `api.js` faz requisições `fetch()` para o Flask em `localhost:5000`
4. O Flask lê/escreve nos arquivos JSON e retorna os dados
5. O React renderiza os dados recebidos

---

## 👤 Autor

**Gustavo Barbosa Gonçalves**
Graduando em Sistemas de Informação (UNIFEI) — Analista de Dados & Assessor de Vendas na Asimov Jr.

- GitHub: [@gubgoncalves](https://github.com/gubgoncalves)
- LinkedIn: [gugoncalves25](https://linkedin.com/in/gugoncalves25)
- Portfólio: [gubgoncalves.github.io/CV_PORTFOLIO](https://gubgoncalves.github.io/CV_PORTFOLIO/)

---

## 📄 Licença

Este projeto está sob a licença descrita no arquivo [LICENSE](LICENSE).