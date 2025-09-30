# 💸 Share Bills (Splitwise Clone)

Aplicação completa para dividir despesas em grupos, inspirada no Splitwise.

## 🚀 Tecnologias
- **Backend:** Node.js, Express, Prisma, SQLite
- **Frontend:** React, Vite, TailwindCSS, shadcn/ui
- **Infra:** Docker + Docker Compose

## 📂 Estrutura
```
share-bills/
├── backend/      # API Express + Prisma (SQLite)
├── frontend/     # React + Vite + Tailwind + shadcn/ui
└── docker-compose.full.yml  # Sobe frontend + backend juntos
```

## 🔧 Desenvolvimento local
### Backend
```bash
cd backend
npm install
npm run prisma:deploy
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Acesse em: [http://localhost:5173](http://localhost:5173)

## 🐳 Rodar com Docker Compose (full stack)
```bash
cd backend
docker-compose -f docker-compose.full.yml up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)

## 🔑 Usuário padrão (seed)
- **Email:** `admin@splitwise.local`
- **Senha:** `admin123`

## 🌐 Variáveis de ambiente
### Backend (.env)
```
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_SECRET="supersecretkey"
```

### Frontend (Docker ARG)
```
VITE_API_URL=http://backend:4000
```

---
✅ Projeto pronto para uso no **EasyPanel** com rede `easy-panel`.
