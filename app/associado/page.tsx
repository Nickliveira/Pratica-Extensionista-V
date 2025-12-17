'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AssociadoSidebar } from '@/components/associado-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatarData } from '@/lib/utils'

export default function AssociadoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cupons, setCupons] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [reservando, setReservando] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.tipo !== 'ASSOCIADO') {
      router.push('/comerciante')
    }
  }, [session, status, router])

  useEffect(() => {
    // Busca categorias
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data.categorias || []))
      .catch(err => console.error('Erro ao buscar categorias:', err))
  }, [])

  useEffect(() => {
    if (session?.user.tipo === 'ASSOCIADO') {
      carregarCupons()
    }
  }, [session])

  const carregarCupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cupons/disponiveis')
      const data = await response.json()
      setCupons(data.cupons || [])
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReservar = async (numeroCupom: string) => {
    if (!confirm('Deseja reservar este cupom?')) return

    try {
      setReservando(numeroCupom)
      const response = await fetch('/api/cupons/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroCupom })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Erro ao reservar cupom')
        return
      }

      alert('Cupom reservado com sucesso! Veja em "Meus Cupons"')
      carregarCupons()
    } catch (error) {
      alert('Erro ao reservar cupom')
    } finally {
      setReservando(null)
    }
  }

  if (status === 'loading' || !session) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  // Filtrar cupons por categoria
  const cuponsFiltrados = categoriaFiltro === 'todas'
    ? cupons
    : cupons.filter(c => c.comercio?.categoria?.id_categoria === parseInt(categoriaFiltro))

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AssociadoSidebar />
        <SidebarInset className="flex-1">
            <div className="flex flex-1 flex-col gap-6 p-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Cupons Disponíveis</h1>
                <p className="text-muted-foreground">
                  Encontre e reserve cupons de desconto dos estabelecimentos parceiros
                </p>
              </div>

              {/* Filtro por categoria */}
              <div className="flex flex-col gap-2 max-w-xs">
                <Label htmlFor="categoria">Filtrar por categoria</Label>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                        {cat.nom_categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Carregando cupons disponíveis...</p>
                  </div>
                </div>
              ) : cuponsFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-6xl mb-4">🎟️</div>
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum cupom disponível no momento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {categoriaFiltro !== 'todas' 
                      ? 'Tente selecionar outra categoria'
                      : 'Novos cupons serão adicionados em breve'}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cuponsFiltrados.map((cupom) => {
                    const estaVencido = new Date(cupom.dta_termino_cupom) < new Date()
                    
                    return (
                      <div key={cupom.num_cupom} className="rounded-lg border bg-card p-6 hover:shadow-lg transition">
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

                          {/* Desconto */}
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

                          {/* Botão Reservar */}
                          {cupom.jaReservado ? (
                            <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded text-center">
                              ✓ Já reservado por você
                            </div>
                          ) : estaVencido ? (
                            <div className="bg-red-50 text-red-800 text-sm p-3 rounded text-center">
                              Vencido
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleReservar(cupom.num_cupom)}
                              disabled={reservando === cupom.num_cupom}
                              className="w-full"
                            >
                              {reservando === cupom.num_cupom ? 'Reservando...' : 'Reservar Cupom'}
                            </Button>
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
