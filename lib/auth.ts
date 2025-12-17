import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        documento: { label: "CPF ou CNPJ", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.documento || !credentials?.password) {
          return null
        }

        // Remove formatação do documento
        const documento = credentials.documento.replace(/\D/g, '')

        // Tenta como Associado (CPF - 11 dígitos)
        if (documento.length === 11) {
          const associado = await prisma.associado.findUnique({
            where: { cpf_associado: BigInt(documento) }
          })

          if (associado && await bcrypt.compare(credentials.password, associado.sen_associado)) {
            return {
              id: associado.cpf_associado.toString(),
              email: associado.email_associado,
              name: associado.nom_associado,
              tipo: 'ASSOCIADO'
            }
          }
        }

        // Tenta como Comerciante (CNPJ - 14 dígitos)
        if (documento.length === 14) {
          const comercio = await prisma.comercio.findUnique({
            where: { cnpj_comercio: BigInt(documento) },
            include: { categoria: true }
          })

          if (comercio && await bcrypt.compare(credentials.password, comercio.sen_comercio)) {
            return {
              id: comercio.cnpj_comercio.toString(),
              email: comercio.email_comercio,
              name: comercio.nom_fantasia_comercio,
              tipo: 'COMERCIANTE',
              nomeComercio: comercio.nom_fantasia_comercio,
              categoriaComercio: comercio.categoria.nom_categoria
            }
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tipo = user.tipo
        token.nomeComercio = user.nomeComercio
        token.categoriaComercio = user.categoriaComercio
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.tipo = token.tipo as string
        session.user.nomeComercio = token.nomeComercio as string | undefined
        session.user.categoriaComercio = token.categoriaComercio as string | undefined
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
