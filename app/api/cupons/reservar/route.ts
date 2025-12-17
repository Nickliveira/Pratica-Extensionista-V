// Nicolas Oliveira - RA 838094
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Força rota dinâmica (não estática)
export const dynamic = 'force-dynamic'

// Reservar cupom (associado)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 'ASSOCIADO') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { numeroCupom } = body

    if (!numeroCupom) {
      return NextResponse.json(
        { error: 'Número do cupom é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se cupom existe e está ativo
    const cupom = await prisma.cupom.findUnique({
      where: { num_cupom: numeroCupom }
    })

    if (!cupom) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      )
    }

    const agora = new Date()
    if (agora < cupom.dta_inicio_cupom || agora > cupom.dta_termino_cupom) {
      return NextResponse.json(
        { error: 'Cupom fora do período de validade' },
        { status: 400 }
      )
    }

    // Verifica se associado já reservou este cupom
    const jaReservado = await prisma.cupomAssociado.findFirst({
      where: {
        num_cupom: numeroCupom,
        cpf_associado: BigInt(session.user.id)
      }
    })

    if (jaReservado) {
      return NextResponse.json(
        { error: 'Você já reservou este cupom' },
        { status: 400 }
      )
    }

    // Cria reserva
    const reserva = await prisma.cupomAssociado.create({
      data: {
        num_cupom: numeroCupom,
        cpf_associado: BigInt(session.user.id)
      }
    })

    return NextResponse.json({
      message: 'Cupom reservado com sucesso',
      reserva: {
        id: reserva.id_cupom_associado,
        num_cupom: reserva.num_cupom
      }
    })
  } catch (error) {
    console.error('Erro ao reservar cupom:', error)
    return NextResponse.json(
      { error: 'Erro ao reservar cupom' },
      { status: 500 }
    )
  }
}
