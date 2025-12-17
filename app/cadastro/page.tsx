'use client'

import { Suspense } from 'react'
import { SignupForm } from '@/components/signup-form'

function CadastroContent() {
  return <SignupForm />
}

export default function CadastroPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={<div className="text-center">Carregando...</div>}>
          <CadastroContent />
        </Suspense>
      </div>
    </div>
  )
}
