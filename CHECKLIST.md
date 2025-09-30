# ✅ Checklist do Projeto Share Bills

## Infra & Setup
- [x] Backend Node + Express configurado
- [x] Prisma + SQLite integrado
- [x] Seed com usuário padrão
- [x] Dockerfile unificado (backend + frontend)
- [x] Docker Compose configurado para EasyPanel
- [x] Frontend React + Vite + Tailwind
- [x] Integração backend + frontend no mesmo host
- [x] Healthcheck movido para `/health`
- [x] Variáveis de ambiente (.env) padronizadas
- [x] URLs relativas no frontend (sem VITE_API_URL)

## Funcionalidades Backend
- [x] Autenticação (JWT, login, registro)
- [x] Criação de grupos
- [x] Adição de despesas
- [x] Divisão de despesas (splits)
- [x] Histórico de transações
- [x] Notificações básicas
- [ ] Cálculo automático de saldos por grupo
- [ ] Exibir “quem deve para quem”
- [ ] Quitação de dívidas (pagamentos entre usuários)
- [ ] Convites e papéis em grupos (admin / membro)
- [ ] Validações e segurança adicionais (tokens expirados, inputs, etc.)

## Funcionalidades Frontend
- [x] Páginas principais (Login, Register, Dashboard, Groups, GroupDetails, History, Notifications)
- [x] Navegação via React Router
- [ ] Dashboard com resumo de saldos
- [ ] Tela de “quem deve para quem”
- [ ] Exibir histórico consolidado
- [ ] UI para quitação de dívidas
- [ ] Gestão de grupos (convites, papéis)
- [ ] Melhorias de layout para mobile

## DevOps / Extras
- [x] Git configurado com GitHub remoto
- [ ] CI/CD com GitHub Actions (build + test + deploy automático)
- [ ] Testes automatizados (unitários + integração)

---
📌 Próximos passos sugeridos:
1. Implementar **cálculo automático de saldos** no backend.
2. Exibir saldos no **Dashboard do frontend**.
3. Criar rota e UI para **quem deve para quem**.