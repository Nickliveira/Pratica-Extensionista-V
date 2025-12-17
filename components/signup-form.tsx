'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Store, User, Ticket } from "lucide-react"

import { cn, formatarCPF, formatarCNPJ } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SignupFormProps extends React.ComponentPropsWithoutRef<"div"> {
  tipoInicial?: 'ASSOCIADO' | 'COMERCIANTE'
}

export function SignupForm({
  className,
  tipoInicial = 'ASSOCIADO',
  ...props
}: SignupFormProps) {
  const router = useRouter()
  const [tipo, setTipo] = useState<'ASSOCIADO' | 'COMERCIANTE'>(tipoInicial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [categorias, setCategorias] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    cnpj: '',
    dataNascimento: '',
    razaoSocial: '',
    nomeFantasia: '',
    idCategoria: '',
    endereco: '',
    bairro: '',
    cep: '',
    cidade: '',
    uf: '',
    celular: '',
    contato: '',
    senha: '',
    confirmacaoSenha: ''
  })

  // Busca categorias
  useEffect(() => {
    if (tipo === 'COMERCIANTE') {
      fetch('/api/categorias')
        .then(res => res.json())
        .then(data => setCategorias(data.categorias || []))
        .catch(err => console.error('Erro ao buscar categorias:', err))
    }
  }, [tipo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const dados = tipo === 'ASSOCIADO' ? {
        cpf: formData.cpf.replace(/\D/g, ''),
        nome: formData.nome,
        email: formData.email,
        dataNascimento: formData.dataNascimento,
        endereco: formData.endereco,
        bairro: formData.bairro,
        cep: formData.cep.replace(/\D/g, ''),
        cidade: formData.cidade,
        uf: formData.uf.toUpperCase(),
        celular: formData.celular,
        senha: formData.senha,
        confirmacaoSenha: formData.confirmacaoSenha
      } : {
        cnpj: formData.cnpj.replace(/\D/g, ''),
        idCategoria: formData.idCategoria,
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.nomeFantasia,
        email: formData.email,
        endereco: formData.endereco,
        bairro: formData.bairro,
        cep: formData.cep.replace(/\D/g, ''),
        cidade: formData.cidade,
        uf: formData.uf.toUpperCase(),
        contato: formData.contato,
        senha: formData.senha,
        confirmacaoSenha: formData.confirmacaoSenha
      }

      const response = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro do servidor:', data)
        
        // Se há detalhes de validação, mostra todos
        if (data.details && Array.isArray(data.details)) {
          const mensagens = data.details.map((d: any) => `${d.field}: ${d.message}`).join('\n')
          throw new Error(`Dados inválidos:\n${mensagens}`)
        }
        
        throw new Error(data.error || 'Erro ao cadastrar')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                <Ticket className="size-6 text-primary-foreground" />
              </div>
              <span className="sr-only">Sistema de Cupons</span>
            </Link>
            <h1 className="text-xl font-bold">Criar Conta</h1>
            <div className="text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/login" className="underline underline-offset-4">Fazer login</Link>
            </div>
          </div>

          {/* Seletor de Tipo */}
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={tipo === 'ASSOCIADO' ? 'default' : 'outline'}
              onClick={() => setTipo('ASSOCIADO')} className="w-full">
              <User className="mr-2 size-4" />Associado
            </Button>
            <Button type="button" variant={tipo === 'COMERCIANTE' ? 'default' : 'outline'}
              onClick={() => setTipo('COMERCIANTE')} className="w-full">
              <Store className="mr-2 size-4" />Comerciante
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              ✓ Cadastro realizado com sucesso! Redirecionando...
            </div>
          )}

          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Campos específicos por tipo */}
            {tipo === 'ASSOCIADO' ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" type="text" placeholder="Seu nome completo"
                    value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" type="text" placeholder="000.000.000-00"
                    value={formatarCPF(formData.cpf)}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') })}
                    maxLength={14} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input id="dataNascimento" type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input id="celular" type="tel" placeholder="(00) 00000-0000"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })} required />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" type="text" placeholder="00.000.000/0000-00"
                    value={formatarCNPJ(formData.cnpj)}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value.replace(/\D/g, '') })}
                    maxLength={18} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input id="razaoSocial" type="text" placeholder="Razão social da empresa"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input id="nomeFantasia" type="text" placeholder="Nome fantasia"
                    value={formData.nomeFantasia}
                    onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.idCategoria}
                    onValueChange={(value) => setFormData({ ...formData, idCategoria: value })} required>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                          {cat.nom_categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contato">Telefone de Contato</Label>
                  <Input id="contato" type="tel" placeholder="(00) 0000-0000"
                    value={formData.contato}
                    onChange={(e) => setFormData({ ...formData, contato: e.target.value })} required />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com"
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>

            {/* Endereço (ambos os tipos) */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Endereço</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="endereco">Rua/Avenida</Label>
                  <Input id="endereco" type="text" placeholder="Nome da rua"
                    value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} required />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" type="text" placeholder="Bairro"
                      value={formData.bairro} onChange={(e) => setFormData({ ...formData, bairro: e.target.value })} required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" type="text" placeholder="00000-000"
                      value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      maxLength={9} required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" type="text" placeholder="Cidade"
                      value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input id="uf" type="text" placeholder="SP" maxLength={2}
                      value={formData.uf} onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="border-t pt-4 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" placeholder="Mínimo 6 caracteres"
                  value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  minLength={6} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmacaoSenha">Confirmar Senha</Label>
                <Input id="confirmacaoSenha" type="password" placeholder="Confirme sua senha"
                  value={formData.confirmacaoSenha}
                  onChange={(e) => setFormData({ ...formData, confirmacaoSenha: e.target.value })} required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || success}>
              {loading ? 'Cadastrando...' : success ? 'Sucesso!' : 'Criar Conta'}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          Sistema criado por Nicolas B. Moreira de Oliveira - 838094
      </div>
    </div>
  )
}
