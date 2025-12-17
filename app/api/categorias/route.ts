import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Listar todas as categorias
export async function GET(request: NextRequest) {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nom_categoria: 'asc' }
    })

    return NextResponse.json({ categorias })
  } catch (error) {
    console.error('Erro ao listar categorias:', error)
    return NextResponse.json(
      { error: 'Erro ao listar categorias' },
      { status: 500 }
    )
  }
}
