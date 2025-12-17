'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ComercianteSidebar } from '@/components/comerciante-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { formatarData } from '@/lib/utils'

export default function ComerciantePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cupons, setCupons] = useState<any[]>([])
  const [filtro, setFiltro] = useState('ativos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.tipo !== 'COMERCIANTE') {
      router.push('/associado')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.tipo === 'COMERCIANTE') {
      carregarCupons()
    }
  }, [session, filtro])

  const carregarCupons = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cupons?filtro=${filtro}`)
      const data = await response.json()
      setCupons(data.cupons || [])
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUsarCupom = async (idReserva: number) => {
    if (!confirm('Confirma o uso deste cupom?')) return

    try {
      const response = await fetch('/api/cupons/usar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idReserva })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Erro ao usar cupom')
        return
      }

      alert('Cupom utilizado com sucesso!')
      carregarCupons()
    } catch (error) {
      alert('Erro ao usar cupom')
    }
  }

  if (status === 'loading' || !session) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ComercianteSidebar />
        <SidebarInset className="flex-1">
            <div className="flex flex-1 flex-col gap-6 p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Meus Cupons</h1>
                  <p className="text-muted-foreground">
                    Gerencie seus cupons e acompanhe o uso
                  </p>
                </div>
                <Button onClick={() => router.push('/comerciante/novo-cupom')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Cupom
                </Button>
              </div>

              {/* Filtros */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filtro === 'ativos' ? 'default' : 'outline'}
                  onClick={() => setFiltro('ativos')}
                >
                  Ativos
                </Button>
                <Button
                  variant={filtro === 'todos' ? 'default' : 'outline'}
                  onClick={() => setFiltro('todos')}
                >
                  Todos
                </Button>
                <Button
                  variant={filtro === 'vencidos' ? 'default' : 'outline'}
                  onClick={() => setFiltro('vencidos')}
                >
                  Vencidos
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Carregando cupons...</p>
                  </div>
                </div>
              ) : cupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-6xl mb-4">🎟️</div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum cupom encontrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie seu primeiro cupom e comece a atrair clientes
                  </p>
                  <Button onClick={() => router.push('/comerciante/novo-cupom')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Primeiro Cupom
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cupons.map((cupom) => {
                    const reservasAguardando = cupom.reservas.filter((r: any) => !r.dta_uso_cupom_associado)
                    const reservasUsadas = cupom.reservas.filter((r: any) => r.dta_uso_cupom_associado)
                    const agora = new Date()
                    const estaVencido = new Date(cupom.dta_termino_cupom) < agora
                    const aindaNaoComecou = new Date(cupom.dta_inicio_cupom) > agora
                    
                    return (
                      <div key={cupom.num_cupom} className="rounded-lg border bg-card p-6 hover:shadow-lg transition">
                        <div className="space-y-4">
                          {/* Header do Cupom */}
                        <div>
                            <h3 className="text-xl font-bold">{cupom.tit_cupom}</h3>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              {cupom.num_cupom}
                          </p>
                          </div>

                          {/* Percentual de Desconto */}
                          <div className="text-center py-4 bg-primary/10 rounded-lg">
                            <div className="text-3xl font-bold text-primary">
                              {cupom.per_desc_cupom}%
                        </div>
                            <div className="text-xs text-muted-foreground">de desconto</div>
                          </div>

                          {/* Datas */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Válido de:</span>
                              <span className="font-medium">{formatarData(cupom.dta_inicio_cupom)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Até:</span>
                              <span className="font-medium">{formatarData(cupom.dta_termino_cupom)}</span>
                        </div>
                          </div>

                          {/* Status */}
                          {estaVencido ? (
                            <div className="bg-red-50 text-red-800 text-sm p-2 rounded text-center font-medium">
                              ❌ Vencido
                            </div>
                          ) : aindaNaoComecou ? (
                            <div className="bg-blue-50 text-blue-800 text-sm p-2 rounded text-center font-medium">
                              ⏳ Inicia em {formatarData(cupom.dta_inicio_cupom)}
                            </div>
                          ) : (
                            <div className="bg-green-50 text-green-800 text-sm p-2 rounded text-center font-medium">
                              ✓ Vigente
                            </div>
                          )}

                          {/* Estatísticas */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        <div className="text-center">
                              <div className="text-xl font-bold text-yellow-600">
                                {reservasAguardando.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Reservados</div>
                        </div>
                        <div className="text-center">
                              <div className="text-xl font-bold text-green-600">
                                {reservasUsadas.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Utilizados</div>
                        </div>
                      </div>

                          {/* Lista de Reservas Aguardando */}
                          {reservasAguardando.length > 0 && (
                            <div className="border-t pt-4">
                              <h4 className="font-semibold text-sm mb-3">Aguardando Uso:</h4>
                          <div className="space-y-2">
                                {reservasAguardando.map((reserva: any) => (
                                  <div key={reserva.id_cupom_associado} className="bg-muted/50 p-3 rounded-lg">
                                    <div className="text-sm font-medium mb-1">
                                      {reserva.associado.nom_associado}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2">
                                      Reservado em {formatarData(reserva.dta_cupom_associado)}
                                  </div>
                                  <Button
                                    size="sm"
                                      onClick={() => handleUsarCupom(reserva.id_cupom_associado)}
                                      className="w-full"
                                  >
                                    Confirmar Uso
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
