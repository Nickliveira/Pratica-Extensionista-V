'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const { data: session } = useSession()

  if (!session) return null

  const isCommerciante = session.user.tipo === 'COMERCIANTE'

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link href={isCommerciante ? '/comerciante' : '/associado'} className="text-2xl font-bold text-blue-600">
              Sistema de Cupons
            </Link>
            <p className="text-sm text-gray-600">
              {isCommerciante ? session.user.nomeComercio : session.user.name}
            </p>
          </div>
          
          <nav className="flex items-center gap-4">
            {isCommerciante ? (
              <>
                <Link
                  href="/comerciante"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Meus Cupons
                </Link>
                <Link
                  href="/comerciante/novo-cupom"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Novo Cupom
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/associado"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Buscar Cupons
                </Link>
                <Link
                  href="/associado/meus-cupons"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Meus Cupons
                </Link>
              </>
            )}
            
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Sair
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

