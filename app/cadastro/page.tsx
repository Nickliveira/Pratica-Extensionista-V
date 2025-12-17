'use client'

import { useSearchParams } from 'next/navigation'
import { SignupForm } from '@/components/signup-form'

export default function CadastroPage() {
  const searchParams = useSearchParams()
  const tipoParam = searchParams.get('tipo')
  
  const tipoInicial = tipoParam === 'comerciante' ? 'COMERCIANTE' : 'ASSOCIADO'

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm tipoInicial={tipoInicial} />
      </div>
    </div>
  )
}

