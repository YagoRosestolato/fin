# Fin — Controle Financeiro Pessoal Inteligente

App financeiro mobile-first com PWA, dark mode, automação de parcelas/fixos, método de gasto diário e categorização inteligente.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, TailwindCSS, Zustand, React Query, Recharts, Framer Motion |
| Backend | Node.js, Express, Prisma ORM |
| Banco | PostgreSQL |
| Auth | JWT + Refresh Token (httpOnly cookies) |
| Segurança | Helmet, CORS, Rate Limiting, bcrypt, Zod |
| Mobile | PWA (next-pwa), Service Worker, Manifest |

---

## Início Rápido

### 1. Subir banco com Docker

```bash
docker compose up postgres -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # edite as variáveis se necessário
npm install
npx prisma migrate dev --name init
npx prisma db seed          # cria usuário demo
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

**Login demo:** `demo@fin.app` | `Demo@1234`

---

## Docker (produção completa)

```bash
cp backend/.env.example backend/.env
docker compose up -d
```

---

## Funcionalidades

### Financeiro
- **Método Diário (Breno):** calcula quanto pode gastar por dia até o próximo salário
- **Perfil:** salário, % a guardar, dia do pagamento, reserva de segurança
- **Alerta automático** quando saldo cai abaixo da reserva

### Transações
- Tipos: Débito, Pix, Crédito, Parcelado
- **Parcelamento automático:** replica nos próximos N meses
- **Gastos fixos:** se replicam por 12 meses automaticamente
- **Categorização por IA:** detecta categoria pelo nome (iFood → alimentação, Uber → transporte, etc.)
- **Importação CSV** com parser automático
- Busca, filtro por tipo/categoria, paginação

### Dashboard
- Gasto diário disponível em destaque
- Cards: disponível, gasto total, guardado, gasto diário
- Gráfico de pizza por categoria
- Gráfico de barras por tipo
- Últimas transações

### Economia
- Total acumulado guardado
- Histórico mensal com gráfico de área
- Porcentagem poupada por mês

### Notificações
- Alerta de saldo baixo (automático ao criar transação)
- Marcar como lido / marcar todas

### Segurança
- Senhas com bcrypt (12 rounds)
- JWT + Refresh Token em httpOnly cookies (proteção XSS)
- Rate limiting (10 tentativas de login / 15min)
- Helmet (headers HTTP seguros)
- CORS configurado
- Validação Zod em todas as rotas
- Log de acessos
- Estrutura preparada para LGPD

### PWA
- Instalável no celular (ícone na home screen)
- Manifest configurado
- Service Worker com cache offline

---

## Formato CSV para Importação

```csv
data,nome,valor,tipo
2024-01-15,iFood,35.90,PIX
2024-01-16,Uber,18.00,DEBIT
2024-01-20,Netflix,39.90,CREDIT
```

---

## Estrutura

```
fin/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/  (auth, validate, rateLimit, error)
│   │   ├── routes/
│   │   ├── services/    (auth, transaction, user, financial, notification)
│   │   └── utils/       (logger, validators)
│   └── server.js
└── frontend/
    └── src/
        ├── app/
        │   ├── auth/     (login, register)
        │   └── dashboard/ (home, transactions, savings, notifications, settings)
        ├── components/   (ui, dashboard, transactions, charts, layout)
        ├── hooks/        (useTransactions, useFinancial, useNotifications)
        ├── stores/       (auth.store, ui.store)
        └── lib/          (api, utils)
```

## Variáveis de Ambiente

### Backend (.env)
| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Secret do access token (mín. 32 chars em prod) |
| `JWT_REFRESH_SECRET` | Secret do refresh token |
| `FRONTEND_URL` | URL do frontend (CORS) |

### Frontend (.env.local)
| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL da API do backend |
