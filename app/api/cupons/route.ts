import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cupomSchema } from '@/lib/validations'
import { gerarNumeroCupom, parseDataLocal } from '@/lib/utils'
import { Decimal } from '@prisma/client/runtime/library'

// Criar cupom (comerciante)
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
    const dadosValidados = cupomSchema.parse(body)

    // Gera número único para o cupom
    let numeroCupom = gerarNumeroCupom()
    
    // Garante que o número é único
    let existe = await prisma.cupom.findUnique({
      where: { num_cupom: numeroCupom }
    })
    
    while (existe) {
      numeroCupom = gerarNumeroCupom()
      existe = await prisma.cupom.findUnique({
        where: { num_cupom: numeroCupom }
      })
    }

    // Cria cupom (converte datas para horário local)
    const cupom = await prisma.cupom.create({
      data: {
        num_cupom: numeroCupom,
        tit_cupom: dadosValidados.titulo,
        cnpj_comercio: BigInt(session.user.id),
        dta_inicio_cupom: parseDataLocal(dadosValidados.dataInicio),
        dta_termino_cupom: parseDataLocal(dadosValidados.dataTermino),
        per_desc_cupom: new Decimal(dadosValidados.percentualDesconto)
      }
    })

    return NextResponse.json(
      { 
        message: 'Cupom criado com sucesso',
        cupom: {
          num_cupom: cupom.num_cupom,
          tit_cupom: cupom.tit_cupom,
          per_desc_cupom: cupom.per_desc_cupom.toNumber()
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar cupom:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar cupom' },
      { status: 500 }
    )
  }
}

// Listar cupons do comerciante
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.tipo !== 'COMERCIANTE') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filtro = searchParams.get('filtro') || 'ativos'

    // Data atual no horário local (meio-dia para comparação correta)
    const agora = new Date()
    agora.setHours(12, 0, 0, 0)

    let whereClause: any = {
      cnpj_comercio: BigInt(session.user.id)
    }

    // Aplica filtros
    if (filtro === 'ativos') {
      // Cupons ativos = não vencidos (inclui cupons futuros e vigentes)
      whereClause.dta_termino_cupom = { gte: agora }
    } else if (filtro === 'vencidos') {
      whereClause.dta_termino_cupom = { lt: agora }
    }

    const cupons = await prisma.cupom.findMany({
      where: whereClause,
      include: {
        reservas: {
          include: {
            associado: true
          }
        }
      },
      orderBy: [
        { dta_emissao_cupom: 'desc' }
      ]
    })

    // Serializa BigInt para string
    const cuponsSerializados = cupons.map(cupom => ({
      ...cupom,
      cnpj_comercio: cupom.cnpj_comercio.toString(),
      per_desc_cupom: cupom.per_desc_cupom.toNumber(),
      reservas: cupom.reservas.map(reserva => ({
        ...reserva,
        cpf_associado: reserva.cpf_associado.toString(),
        associado: {
          ...reserva.associado,
          cpf_associado: reserva.associado.cpf_associado.toString()
        }
      }))
    }))

    return NextResponse.json({ cupons: cuponsSerializados })
  } catch (error) {
    console.error('Erro ao listar cupons:', error)
    return NextResponse.json(
      { error: 'Erro ao listar cupons' },
      { status: 500 }
    )
  }
}
