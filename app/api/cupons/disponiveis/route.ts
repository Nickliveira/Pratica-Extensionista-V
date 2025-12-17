// Nicolas Oliveira - RA 838094
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Força rota dinâmica (não estática)
export const dynamic = 'force-dynamic'

// Listar cupons disponíveis para associados
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 'ASSOCIADO') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Data atual no horário local (meio-dia para comparação correta)
    const agora = new Date()
    agora.setHours(12, 0, 0, 0)

    // Busca cupons ativos
    const cupons = await prisma.cupom.findMany({
      where: {
        dta_inicio_cupom: { lte: agora },
        dta_termino_cupom: { gte: agora }
      },
      include: {
        comercio: {
          include: {
            categoria: true
          }
        },
        reservas: {
          where: {
            cpf_associado: BigInt(session.user.id)
          }
        }
      },
      orderBy: { dta_emissao_cupom: 'desc' }
    })

    // Serializa BigInt
    const cuponsSerializados = cupons.map(cupom => ({
      ...cupom,
      cnpj_comercio: cupom.cnpj_comercio.toString(),
      per_desc_cupom: cupom.per_desc_cupom.toNumber(),
      jaReservado: cupom.reservas.length > 0,
      comercio: {
        ...cupom.comercio,
        cnpj_comercio: cupom.comercio.cnpj_comercio.toString()
      },
      reservas: undefined
    }))

    return NextResponse.json({ cupons: cuponsSerializados })
  } catch (error) {
    console.error('Erro ao listar cupons disponíveis:', error)
    return NextResponse.json(
      { error: 'Erro ao listar cupons' },
      { status: 500 }
    )
  }
}
