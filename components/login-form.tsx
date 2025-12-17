// Nicolas Oliveira - RA 838094
'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Store, User, Ticket } from "lucide-react"

import { cn, formatarCPF, formatarCNPJ } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    documento: "",
    senha: ""
  })

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '')
    
    let valorFormatado = valor
    if (valor.length <= 11) {
      valorFormatado = formatarCPF(valor)
    } else if (valor.length <= 14) {
      valorFormatado = formatarCNPJ(valor)
    }
    
    setFormData({ ...formData, documento: valorFormatado })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        documento: formData.documento,
        password: formData.senha,
        redirect: false
      })

      if (result?.error) {
        setError("CPF/CNPJ ou senha inválidos")
        setLoading(false)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Erro ao fazer login")
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                <Ticket className="size-6 text-primary-foreground" />
              </div>
              <span className="sr-only">Sistema de Cupons</span>
            </Link>
            <h1 className="text-xl font-bold">Bem-vindo ao Sistema de Cupons</h1>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="documento">CPF ou CNPJ</Label>
              <Input
                id="documento"
                type="text"
                placeholder="Insira seu CPF ou CNPJ"
                value={formData.documento}
                onChange={handleDocumentoChange}
                maxLength={18}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Ou cadastre-se como
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => router.push("/cadastro?tipo=comerciante")}
            >
              <Store className="mr-2 size-4" />
              Estabelecimento
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              type="button"
              onClick={() => router.push("/cadastro?tipo=associado")}
            >
              <User className="mr-2 size-4" />
              Associado
            </Button>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Sistema criado por Nicolas B. Moreira de Oliveira - 838094{" "}
      </div>
    </div>
  )
}
