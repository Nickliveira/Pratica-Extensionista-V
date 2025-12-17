import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    tipo: string
    nomeComercio?: string
    categoriaComercio?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      tipo: string
      nomeComercio?: string
      categoriaComercio?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    tipo: string
    nomeComercio?: string
    categoriaComercio?: string
  }
}
