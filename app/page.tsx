'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // Redireciona baseado no tipo de usuário
    if (session?.user.tipo === 'ASSOCIADO') {
      router.push('/associado')
    } else if (session?.user.tipo === 'COMERCIANTE') {
      router.push('/comerciante')
    }
  }, [session, status, router])

  // Tela de loading enquanto verifica a sessão
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}

