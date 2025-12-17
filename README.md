# Sistema de Cupons de Desconto

Sistema web para gestão de cupons de desconto entre estabelecimentos comerciais e associados, desenvolvido como projeto acadêmico.

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de UI acessíveis e customizáveis
- **Lucide React** - Biblioteca de ícones

### Backend
- **Next.js API Routes** - Endpoints REST serverless
- **NextAuth.js** - Autenticação e gerenciamento de sessões
- **Prisma ORM** - ORM TypeScript para banco de dados
- **Zod** - Validação de schemas e dados
- **bcryptjs** - Criptografia de senhas

### Banco de Dados
- **PostgreSQL** - Banco de dados relacional
- **Neon** - Plataforma serverless PostgreSQL

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Processador CSS
- **Git** - Controle de versão

---

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Neon (banco de dados PostgreSQL)

---

## ⚙️ Instalação e Configuração

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd PEV
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

### 4. Aplicar Migrations do Banco de Dados
```bash
# Executar o script SQL no Neon Dashboard
# Arquivo: prisma/manual-migration.sql

# Gerar Prisma Client
npx prisma generate
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila o projeto para produção |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | Executa o linter |
| `npx prisma studio` | Abre interface visual do banco de dados |
| `npx prisma generate` | Gera Prisma Client |

---

## 🧪 Usuários de Teste

### Associado
- **CPF:** `123.456.789-00` (ou `12345678900`)
- **Senha:** `teste123`
- **Nome:** João da Silva
- **Acesso:** Buscar e reservar cupons de desconto

### Estabelecimento Comercial
- **CNPJ:** `12.345.678/0001-90` (ou `12345678000190`)
- **Senha:** `teste123`
- **Nome:** Comércio Exemplo Ltda
- **Acesso:** Criar e gerenciar cupons

---

## 📱 Funcionalidades

### Para Associados
- ✅ Cadastro completo com CPF, endereço e dados pessoais
- ✅ Login com CPF e senha
- ✅ Buscar cupons disponíveis
- ✅ Filtrar cupons por categoria
- ✅ Reservar cupons
- ✅ Visualizar meus cupons (ativos, utilizados, vencidos)

### Para Estabelecimentos
- ✅ Cadastro completo com CNPJ, razão social, endereço e categoria
- ✅ Login com CNPJ e senha
- ✅ Criar cupons individuais
- ✅ Gerenciar cupons (ativos, vencidos)
- ✅ Visualizar reservas de cupons
- ✅ Confirmar uso de cupons

---

## 🗄️ Modelo de Dados

### Principais Entidades

**ASSOCIADO**
- CPF (Primary Key - BigInt)
- Nome, data de nascimento
- Endereço completo
- Celular, e-mail, senha

**COMERCIO**
- CNPJ (Primary Key - BigInt)
- Razão social, nome fantasia
- Categoria (FK → CATEGORIA)
- Endereço completo
- Contato, e-mail, senha

**CATEGORIA**
- ID (autoincrement)
- Nome da categoria
- 13 categorias pré-definidas

**CUPOM**
- Número do cupom (Primary Key - CHAR(12))
- Título, percentual de desconto
- Datas de início e término
- Comércio (FK → COMERCIO)

**CUPOM_ASSOCIADO**
- ID (autoincrement)
- Cupom (FK → CUPOM)
- Associado (FK → ASSOCIADO)
- Data de reserva
- Data de uso (nullable)

---

## 🎨 Estrutura do Projeto

```
PEV/
├── app/                          # Aplicação Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth
│   │   ├── cadastro/             # Registro de usuários
│   │   ├── categorias/           # Categorias
│   │   └── cupons/               # CRUD de cupons
│   ├── associado/                # Dashboard Associado
│   ├── comerciante/              # Dashboard Comerciante
│   ├── login/                    # Página de login
│   ├── cadastro/                 # Página de cadastro
│   └── layout.tsx                # Layout raiz
├── components/                   # Componentes React
│   ├── ui/                       # Componentes Shadcn
│   ├── login-form.tsx            # Formulário de login
│   └── signup-form.tsx           # Formulário de cadastro
├── lib/                          # Bibliotecas e utilitários
│   ├── auth.ts                   # Configuração NextAuth
│   ├── utils.ts                  # Funções utilitárias
│   └── validations.ts            # Schemas Zod
├── prisma/
│   ├── schema.prisma             # Schema do banco
│   └── manual-migration.sql      # Script SQL
├── types/                        # Tipos TypeScript
│   ├── index.ts                  # Tipos das entidades
│   └── next-auth.d.ts            # Tipos NextAuth
└── public/                       # Arquivos estáticos
```

---

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT com NextAuth.js
- Validação de dados no servidor com Zod
- Proteção de rotas com middleware
- Prepared statements via Prisma (prevenção SQL Injection)
- Separação de tipos de usuário (ASSOCIADO/COMERCIANTE)

---

## 🌐 Deploy

### Build de Produção
```bash
npm run build
npm start
```

### Recomendações de Hospedagem
- **Vercel** - Integração nativa com Next.js
- **Netlify** - Suporte a serverless functions
- **Railway** - Deploy full-stack simplificado

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

## 👥 Autores

Desenvolvido como projeto de extensão universitária.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Next.js: https://nextjs.org/docs
2. Consulte a documentação do Prisma: https://www.prisma.io/docs
3. Revise os logs do servidor em desenvolvimento

---

**Versão:** 1.0.0  
**Data de atualização:** Dezembro 2025
