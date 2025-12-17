'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AssociadoSidebar } from '@/components/associado-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { formatarData } from '@/lib/utils'

export default function MeusCuponsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reservas, setReservas] = useState<any[]>([])
  const [filtro, setFiltro] = useState('ativos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.tipo !== 'ASSOCIADO') {
      router.push('/comerciante')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.tipo === 'ASSOCIADO') {
      carregarCupons()
    }
  }, [session])

  const carregarCupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cupons/meus')
      const data = await response.json()
      setReservas(data.reservas || [])
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !session) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  // Filtrar reservas
  const agora = new Date()
  const reservasFiltradas = reservas.filter(reserva => {
    const cupom = reserva.cupom
    const estaVencido = new Date(cupom.dta_termino_cupom) < agora
    const foiUsado = !!reserva.dta_uso_cupom_associado

    if (filtro === 'ativos') {
      return !foiUsado && !estaVencido
    } else if (filtro === 'utilizados') {
      return foiUsado
    } else if (filtro === 'vencidos') {
      return estaVencido && !foiUsado
    }
    return true
  })

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AssociadoSidebar />
        <SidebarInset className="flex-1">
            <div className="flex flex-1 flex-col gap-6 p-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Meus Cupons</h1>
                <p className="text-muted-foreground">
                  Gerencie seus cupons reservados e utilizados
                </p>
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
                  variant={filtro === 'utilizados' ? 'default' : 'outline'}
                  onClick={() => setFiltro('utilizados')}
                >
                  Utilizados
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
                    <p className="text-sm text-muted-foreground">Carregando seus cupons...</p>
                  </div>
                </div>
              ) : reservasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-6xl mb-4">🎟️</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {filtro === 'ativos' && 'Você ainda não tem cupons ativos'}
                    {filtro === 'utilizados' && 'Você ainda não utilizou nenhum cupom'}
                    {filtro === 'vencidos' && 'Você não tem cupons vencidos'}
                  </h3>
                  {filtro === 'ativos' && (
                    <Button onClick={() => router.push('/associado')} className="mt-4">
                      Buscar Cupons
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reservasFiltradas.map((reserva) => {
                    const cupom = reserva.cupom
                    const estaVencido = new Date(cupom.dta_termino_cupom) < agora
                    const foiUsado = !!reserva.dta_uso_cupom_associado

                    return (
                      <div key={reserva.id} className="rounded-lg border bg-card p-6 hover:shadow-lg transition">
                        <div className="space-y-4">
                          {/* Header */}
                          <div>
                            <h3 className="text-xl font-bold">{cupom.tit_cupom}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {cupom.comercio.nom_fantasia_comercio}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 bg-[#c0efbd] text-green-600 text-xs rounded-full border border-[#0c9d30]">
                              {cupom.comercio.categoria.nom_categoria}
                            </span>
                          </div>

                          {/* Código do Cupom */}
                          <div className="bg-primary/10 p-4 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Código do Cupom</div>
                            <div className="text-2xl font-mono font-bold text-primary">
                              {cupom.num_cupom}
                            </div>
                          </div>

                          {/* Desconto */}
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              {cupom.per_desc_cupom}%
                            </div>
                            <div className="text-xs text-muted-foreground">de desconto</div>
                          </div>

                          {/* Datas */}
                          <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reservado em:</span>
                              <span className="font-medium">{formatarData(reserva.dta_cupom_associado)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Válido até:</span>
                              <span className="font-medium">{formatarData(cupom.dta_termino_cupom)}</span>
                            </div>
                            {foiUsado && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Usado em:</span>
                                <span className="font-medium text-green-600">
                                  {formatarData(reserva.dta_uso_cupom_associado)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Status */}
                          <div className="border-t pt-4">
                            {foiUsado ? (
                              <div className="bg-green-50 text-green-800 text-sm p-3 rounded text-center font-medium">
                                ✓ Cupom Utilizado
                              </div>
                            ) : estaVencido ? (
                              <div className="bg-red-50 text-red-800 text-sm p-3 rounded text-center font-medium">
                                ✗ Cupom Vencido
                              </div>
                            ) : (
                              <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded text-center font-medium">
                                ⏳ Aguardando Uso
                              </div>
                            )}
                          </div>
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
