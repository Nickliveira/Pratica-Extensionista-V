'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ComercianteSidebar } from '@/components/comerciante-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { obterDataHoje } from '@/lib/utils'

export default function NovoCupomPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    titulo: '',
    dataInicio: '',
    dataTermino: '',
    percentualDesconto: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: formData.titulo,
          dataInicio: formData.dataInicio,
          dataTermino: formData.dataTermino,
          percentualDesconto: parseFloat(formData.percentualDesconto)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar cupom')
      }

      alert('Cupom criado com sucesso!')
      router.push('/comerciante')
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!session || session.user.tipo !== 'COMERCIANTE') {
    router.push('/login')
    return null
  }

  // Define data mínima como hoje (no fuso horário local)
  const dataHoje = obterDataHoje()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ComercianteSidebar />
        <SidebarInset className="flex-1">
            <div className="flex flex-1 flex-col gap-6 p-6">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Novo Cupom</h1>
                <p className="text-muted-foreground">
                  Crie um novo cupom de desconto para seus clientes
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/15 p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="rounded-lg border bg-card p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Cupom *</Label>
                    <Input
                      id="titulo"
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Desconto de Boas-Vindas"
                      maxLength={25}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo 25 caracteres
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data Início *</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                        min={dataHoje}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataTermino">Data Término *</Label>
                      <Input
                        id="dataTermino"
                        type="date"
                        value={formData.dataTermino}
                        onChange={(e) => setFormData({ ...formData, dataTermino: e.target.value })}
                        min={formData.dataInicio || dataHoje}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="percentual">Percentual de Desconto (%) *</Label>
                    <Input
                      id="percentual"
                      type="number"
                      value={formData.percentualDesconto}
                      onChange={(e) => setFormData({ ...formData, percentualDesconto: e.target.value })}
                      min="0.01"
                      max="99.99"
                      step="0.01"
                      placeholder="Ex: 15.50"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor entre 1 e 100%
                    </p>
                  </div>

                  <div className="rounded-lg border bg-primary/10 p-4">
                    <p className="text-sm">
                      🎫 Será gerado automaticamente um código único de 12 caracteres para este cupom.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Criando...' : 'Criar Cupom'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
