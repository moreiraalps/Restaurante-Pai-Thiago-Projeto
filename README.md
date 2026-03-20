# 🍴 Restaurante Pai Thiag - Sistema Completo

Sistema profissional e completo de gestão de restaurante com autenticação diferenciada, pedidos online, reservas de mesas e painéis específicos para cada tipo de usuário.
**Url Site On-line**https://69bc43f46fe16724e4cd079a--helpful-starburst-78e500.netlify.app/

## ✨ Características Principais

### 🔐 Sistema de Autenticação Multi-Role
- **Login diferenciado** para Clientes e Funcionários
- **4 tipos de usuários** com permissões específicas:
  - 👤 **Cliente**: Visualizar cardápio, fazer pedidos e reservas
  - 👔 **Garçom**: Gerenciar pedidos ativos e status das mesas
  - 👨‍💼 **Gerente**: Gerenciar cardápio, aprovar reservas, visualizar estatísticas
  - 🏆 **Dono**: Acesso completo ao sistema

### 📱 Funcionalidades por Tipo de Usuário

#### Cliente
- ✅ Visualizar cardápio completo com categorias
- ✅ Adicionar itens ao carrinho
- ✅ Fazer pedidos online
- ✅ Criar reservas de mesas
- ✅ Acompanhar status dos pedidos em tempo real
- ✅ Ver histórico de pedidos e reservas

#### Garçom
- ✅ Visualizar pedidos ativos (pendentes, em preparo, prontos)
- ✅ Atualizar status dos pedidos
- ✅ Gerenciar status das mesas (disponível, ocupada, reservada)
- ✅ Atualização automática a cada 10 segundos

#### Gerente
- ✅ Dashboard com estatísticas em tempo real
- ✅ Gerenciar cardápio (CRUD completo)
  - Adicionar novos pratos
  - Editar pratos existentes
  - Remover pratos
- ✅ Visualizar todos os pedidos
- ✅ Aprovar ou cancelar reservas
- ✅ Métricas: receita do dia, total de pedidos, pedidos pendentes, reservas

#### Dono
- ✅ Todas as funcionalidades do gerente
- ✅ (Pode ser expandido com gestão de funcionários, relatórios financeiros, etc.)

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14 com App Router
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT + bcrypt
- **Ícones**: Lucide React

## 📋 Setup e Instalação

### 1. Pré-requisitos
- Node.js 18+
- Conta no Supabase (gratuita)

### 2. Configurar Banco de Dados Supabase

1. Acesse o Supabase Dashboard:
   https://supabase.com/dashboard/project/gxrdmnjvazoxlyudczmx/sql/new

2. Copie todo o conteúdo do arquivo `supabase_setup.sql`

3. Cole no editor SQL do Supabase e clique em **RUN**

Isso criará:
- ✅ Todas as tabelas necessárias (users, menu_items, orders, reservations, tables)
- ✅ Índices otimizados para performance
- ✅ Dados iniciais (cardápio com 15 itens, 10 mesas, usuários de teste)

### 3. Credenciais de Teste

Após executar o SQL, você pode fazer login com:

**CLIENTE:**
- Email: `cliente@teste.com`
- Senha: `senha123`

**GARÇOM:**
- Email: `garcom@paithiag.com`
- Senha: `senha123`

**GERENTE:**
- Email: `gerente@paithiag.com`
- Senha: `senha123`

**DONO:**
- Email: `dono@paithiag.com`
- Senha: `senha123`

### 4. Acessar o Sistema

O sistema está rodando em:
(caso baixe o projeto)
- **Local**: http://localhost:3000

## 🎨 Design e UX

- ✨ Interface moderna e profissional
- 🎨 Esquema de cores vermelho/laranja (tema restaurante)
- 📱 Totalmente responsivo
- ⚡ Feedback visual com toasts e badges coloridos
- 🔄 Atualização automática de dados

## 📊 Estrutura do Projeto

```
/app
├── app/
│   ├── page.js                    # Página de login/registro
│   ├── layout.js                  # Layout principal
│   ├── globals.css                # Estilos globais
│   └── api/[[...path]]/route.js   # API Routes (backend)
├── components/
│   ├── dashboards/
│   │   ├── ClientDashboard.js     # Dashboard do cliente
│   │   ├── WaiterDashboard.js     # Dashboard do garçom
│   │   ├── ManagerDashboard.js    # Dashboard do gerente
│   │   └── OwnerDashboard.js      # Dashboard do dono
│   └── ui/                        # Componentes shadcn/ui
├── lib/
│   ├── supabase.js                # Cliente Supabase
│   └── auth.js                    # Funções de autenticação
├── supabase_setup.sql             # Script de setup do banco
└── .env                           # Variáveis de ambiente
```

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ JWT tokens com expiração de 7 dias
- ✅ Validação de roles no backend
- ✅ Proteção de rotas por autenticação
- ✅ Separação de login cliente/funcionário

## 🌟 Fluxos Principais

### Fluxo do Cliente
1. Criar conta ou fazer login
2. Navegar pelo cardápio
3. Adicionar itens ao carrinho
4. Finalizar pedido
5. Acompanhar status em tempo real
6. Criar reserva de mesa

### Fluxo do Garçom
1. Login com credenciais de funcionário
2. Ver pedidos ativos
3. Atualizar status dos pedidos (Pendente → Preparando → Pronto → Entregue)
4. Gerenciar status das mesas

### Fluxo do Gerente
1. Login como gerente
2. Visualizar dashboard com métricas
3. Gerenciar cardápio (adicionar/editar/remover itens)
4. Aprovar ou cancelar reservas
5. Monitorar todos os pedidos

## 📈 Próximas Melhorias (Opcional)

- [ ] Sistema de notificações push
- [ ] Integração com WhatsApp
- [ ] Pagamento online (Stripe/MercadoPago)
- [ ] Relatórios e analytics avançados
- [ ] Sistema de avaliações e comentários
- [ ] Gestão de estoque
- [ ] Cardápio com fotos (upload de imagens)
- [ ] Múltiplos restaurantes/franquias

## 🐛 Suporte

Em caso de dúvidas ou problemas:
1. Verifique se o setup do Supabase foi executado corretamente
2. Confirme se as variáveis de ambiente estão corretas no .env
3. Verifique os logs do console do navegador (F12)

## 📝 Licença

Este é um projeto desenvolvido para o Restaurante Pai Thiag.

---

**Desenvolvido com ❤️ usando Next.js + Supabase**
