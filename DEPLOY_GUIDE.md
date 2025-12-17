# 🚀 Guia de Deploy - GitHub e Vercel

## ✅ Status Atual
- ✅ Git inicializado
- ✅ Commit inicial criado (67 arquivos)
- ⏳ Aguardando push para GitHub
- ⏳ Aguardando deploy na Vercel

---

## 📦 Passo 1: Criar Repositório no GitHub

### Opção A: Via Navegador (Recomendado)

1. **Acesse:** https://github.com/new

2. **Configure o repositório:**
   - **Nome:** `Pratica-Extensionista-V`
   - **Descrição:** `Sistema de cupons de desconto para estabelecimentos e associados`
   - **Visibilidade:** ✅ Public
   - **NÃO marque:** README, .gitignore, license (já temos esses arquivos)

3. **Clique em:** "Create repository"

4. **No seu terminal, execute:**
   ```bash
   cd /Users/nickliveira/Documents/PEV
   
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/Pratica-Extensionista-V.git
   git push -u origin main
   ```

### Opção B: Via GitHub CLI (se tiver instalado)

```bash
cd /Users/nickliveira/Documents/PEV

# Instalar gh CLI (se necessário)
brew install gh

# Fazer login
gh auth login

# Criar e fazer push
gh repo create "Pratica-Extensionista-V" --public --source=. --remote=origin --push
```

---

## 🌐 Passo 2: Deploy na Vercel

### 2.1 Preparar Variáveis de Ambiente

Antes de fazer deploy, você precisa configurar estas variáveis na Vercel:

```env
# Banco de Dados Neon
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="sua-chave-secreta-gerada"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2.2 Fazer Deploy

**Opção A: Via Dashboard Vercel (Recomendado)**

1. **Acesse:** https://vercel.com/new

2. **Importe seu repositório:**
   - Clique em "Import Git Repository"
   - Selecione `Pratica-Extensionista-V`
   - Clique em "Import"

3. **Configure o projeto:**
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** .next (padrão)

4. **Adicione Environment Variables:**
   - Clique em "Environment Variables"
   - Adicione cada variável (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET)
   - Importante: NEXTAUTH_URL deve ser o domínio da Vercel

5. **Clique em:** "Deploy"

**Opção B: Via Vercel CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
cd /Users/nickliveira/Documents/PEV
vercel

# Seguir instruções no terminal
# Adicionar variáveis de ambiente quando solicitado
```

---

## ⚙️ Passo 3: Configurar Banco de Dados na Vercel

Após o primeiro deploy:

1. **Acesse o Dashboard do Neon:** https://console.neon.tech

2. **Execute o SQL de Migration:**
   - Vá em "SQL Editor"
   - Abra o arquivo `prisma/manual-migration.sql`
   - Cole todo o conteúdo
   - Execute

3. **Re-deploy na Vercel:**
   - Vá em "Deployments"
   - Clique nos 3 pontos do último deploy
   - Clique em "Redeploy"

---

## 🧪 Passo 4: Testar Deploy

Após o deploy ser concluído:

1. **Acesse a URL da Vercel** (ex: `https://pratica-extensionista-v.vercel.app`)

2. **Teste o fluxo completo:**
   - ✅ Página inicial redireciona para /login
   - ✅ Criar conta (associado e comerciante)
   - ✅ Fazer login
   - ✅ Criar cupom
   - ✅ Reservar cupom
   - ✅ Usar cupom

---

## 🔧 Comandos Úteis

### Atualizar o Repositório
```bash
cd /Users/nickliveira/Documents/PEV

git add .
git commit -m "fix: descrição da correção"
git push
```

### Re-deploy Automático
A Vercel faz deploy automático sempre que você faz push no GitHub!

### Ver Logs da Vercel
```bash
vercel logs
```

### Listar Deployments
```bash
vercel ls
```

---

## 📝 Variáveis de Ambiente Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do banco Neon | `postgresql://...` |
| `NEXTAUTH_URL` | URL do seu app | `https://seu-app.vercel.app` |
| `NEXTAUTH_SECRET` | Chave secreta JWT | Gerar com `openssl rand -base64 32` |

---

## 🎯 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Push realizado com sucesso
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy realizado
- [ ] Migration SQL aplicada no Neon
- [ ] Aplicação testada e funcionando

---

## 🆘 Problemas Comuns

### Erro: "Missing environment variables"
**Solução:** Configure as variáveis no dashboard da Vercel e re-deploy.

### Erro: "Database connection failed"
**Solução:** 
1. Verifique se DATABASE_URL está correto
2. Certifique-se que aplicou o `manual-migration.sql` no Neon
3. Execute `npx prisma generate` localmente e faça novo commit

### Erro: "NextAuth configuration error"
**Solução:** 
1. Verifique se NEXTAUTH_URL aponta para o domínio correto da Vercel
2. Verifique se NEXTAUTH_SECRET foi gerado e configurado

### Build Error na Vercel
**Solução:**
1. Verifique se todos os arquivos foram commitados
2. Execute `npm run build` localmente para testar
3. Veja os logs detalhados no dashboard da Vercel

---

## 📚 Links Úteis

- **Repositório:** https://github.com/SEU_USUARIO/Pratica-Extensionista-V
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech
- **Docs Vercel:** https://vercel.com/docs
- **Docs Next.js:** https://nextjs.org/docs

---

**Boa sorte com o deploy! 🚀**
