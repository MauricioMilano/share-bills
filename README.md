# Share Bills (Splitwise Clone)

Um clone completo do Splitwise para gerenciar despesas compartilhadas entre amigos, viagens e grupos. Projeto **self-hosted**, com backend em Node.js/Express + Prisma + SQLite, e frontend em React + Vite + Tailwind + shadcn/ui.

---

## 🚀 Tecnologias
- **Backend**: Node.js, Express, Prisma, SQLite
- **Frontend**: React, Vite, TypeScript, TailwindCSS, shadcn/ui
- **Auth**: JWT + bcrypt
- **Infra**: Docker + docker-compose (compatível com EasyPanel)

---

## 📂 Estrutura do Projeto
```
share-bills/
├── backend/            # API + lógica de negócio
│   ├── src/            # Código fonte
│   ├── prisma/         # Schema + migrations + seed
│   ├── Dockerfile
│   └── docker-compose.full.yml (backend + frontend + db)
│
├── frontend/           # Aplicação React
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
│
└── README.md
```

---

## 🔧 Rodando em Desenvolvimento
### Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend sobe em `http://localhost:4000` e frontend em `http://localhost:5173`.

---

## 🐳 Rodando com Docker (Produção)
Na pasta `backend`, execute:
```bash
docker-compose -f docker-compose.full.yml up --build
```

- Backend: http://localhost:4000
- Frontend: http://localhost:3000
- Banco: SQLite (`dev.db` dentro do container backend)

Usuário padrão criado automaticamente:
- **Email:** `admin@splitwise.local`
- **Senha:** `admin123`

---

## 📌 Funcionalidades
- Autenticação (login/registro com JWT)
- Grupos (criação, listagem, membros)
- Despesas (criação, listagem, saldos automáticos)
- Histórico de transações
- Notificações (listagem + marcar como lidas)
- Dashboard com overview

---

## 📜 Licença
MIT