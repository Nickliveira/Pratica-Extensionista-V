// Nicolas Oliveira - RA 838094
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Força rota dinâmica (não estática)
export const dynamic = 'force-dynamic'

// Usar cupom (comerciante)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 'COMERCIANTE') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { idReserva } = body

    if (!idReserva) {
      return NextResponse.json(
        { error: 'ID da reserva é obrigatório' },
        { status: 400 }
      )
    }

    // Busca reserva com dados do cupom
    const reserva = await prisma.cupomAssociado.findUnique({
      where: { id_cupom_associado: idReserva },
      include: {
        cupom: true
      }
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      )
    }

    // Verifica se o cupom pertence ao comerciante
    if (reserva.cupom.cnpj_comercio.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Este cupom não pertence ao seu estabelecimento' },
        { status: 403 }
      )
    }

    // Verifica se já foi usado
    if (reserva.dta_uso_cupom_associado) {
      return NextResponse.json(
        { error: 'Cupom já foi utilizado' },
        { status: 400 }
      )
    }

    // Verifica validade do cupom
    const agora = new Date()
    if (agora > reserva.cupom.dta_termino_cupom) {
      return NextResponse.json(
        { error: 'Cupom vencido' },
        { status: 400 }
      )
    }

    // Atualiza reserva como usada
    const reservaAtualizada = await prisma.cupomAssociado.update({
      where: { id_cupom_associado: idReserva },
      data: {
        dta_uso_cupom_associado: agora
      }
    })

    return NextResponse.json({
      message: 'Cupom utilizado com sucesso',
      reserva: {
        id: reservaAtualizada.id_cupom_associado,
        dataUso: reservaAtualizada.dta_uso_cupom_associado
      }
    })
  } catch (error) {
    console.error('Erro ao usar cupom:', error)
    return NextResponse.json(
      { error: 'Erro ao usar cupom' },
      { status: 500 }
    )
  }
}
