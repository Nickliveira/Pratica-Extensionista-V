import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Listar cupons do associado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 'ASSOCIADO') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Busca reservas do associado
    const reservas = await prisma.cupomAssociado.findMany({
      where: {
        cpf_associado: BigInt(session.user.id)
      },
      include: {
        cupom: {
          include: {
            comercio: {
              include: {
                categoria: true
              }
            }
          }
        }
      },
      orderBy: { dta_cupom_associado: 'desc' }
    })

    // Serializa BigInt
    const reservasSerializadas = reservas.map(reserva => ({
      id: reserva.id_cupom_associado,
      dta_cupom_associado: reserva.dta_cupom_associado,
      dta_uso_cupom_associado: reserva.dta_uso_cupom_associado,
      cupom: {
        num_cupom: reserva.cupom.num_cupom,
        tit_cupom: reserva.cupom.tit_cupom,
        per_desc_cupom: reserva.cupom.per_desc_cupom.toNumber(),
        dta_inicio_cupom: reserva.cupom.dta_inicio_cupom,
        dta_termino_cupom: reserva.cupom.dta_termino_cupom,
        comercio: {
          cnpj_comercio: reserva.cupom.comercio.cnpj_comercio.toString(),
          nom_fantasia_comercio: reserva.cupom.comercio.nom_fantasia_comercio,
          categoria: {
            nom_categoria: reserva.cupom.comercio.categoria.nom_categoria
          }
        }
      }
    }))

    return NextResponse.json({ reservas: reservasSerializadas })
  } catch (error) {
    console.error('Erro ao listar cupons do associado:', error)
    return NextResponse.json(
      { error: 'Erro ao listar cupons' },
      { status: 500 }
    )
  }
}
