// Nicolas Oliveira - RA 838094
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { associadoSchema, comercioSchema } from '@/lib/validations'

// Força rota dinâmica (não estática)
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Remove formatação de documentos
    const documentoLimpo = body.cpf ? body.cpf.replace(/\D/g, '') : body.cnpj ? body.cnpj.replace(/\D/g, '') : null
    
    if (!documentoLimpo) {
      return NextResponse.json(
        { error: 'CPF ou CNPJ é obrigatório' },
        { status: 400 }
      )
    }

    // Determina o tipo baseado no tamanho do documento
    const tipo = documentoLimpo.length === 11 ? 'ASSOCIADO' : documentoLimpo.length === 14 ? 'COMERCIANTE' : null

    if (!tipo) {
      return NextResponse.json(
        { error: 'Documento inválido' },
        { status: 400 }
      )
    }

    // Valida dados com base no tipo
    if (tipo === 'ASSOCIADO') {
      // Valida com Zod
      const validacao = associadoSchema.safeParse({
        ...body,
        cpf: documentoLimpo,
        cep: body.cep?.replace(/\D/g, ''),
        celular: body.celular?.replace(/\D/g, '')
      })

      if (!validacao.success) {
        return NextResponse.json(
          { 
            error: 'Dados inválidos', 
            details: validacao.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      }

      const dadosValidados = validacao.data

      // Verifica se CPF já existe
      const cpfExiste = await prisma.associado.findUnique({
        where: { cpf_associado: BigInt(documentoLimpo) }
      })

      if (cpfExiste) {
        return NextResponse.json(
          { error: 'CPF já cadastrado' },
          { status: 400 }
        )
      }

      // Verifica se email já existe
      const emailExiste = await prisma.associado.findUnique({
        where: { email_associado: dadosValidados.email }
      })

      if (emailExiste) {
        return NextResponse.json(
          { error: 'E-mail já cadastrado' },
          { status: 400 }
        )
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(dadosValidados.senha, 10)

      // Cria associado
      const associado = await prisma.associado.create({
        data: {
          cpf_associado: BigInt(documentoLimpo),
          nom_associado: dadosValidados.nome,
          dtn_associado: new Date(dadosValidados.dataNascimento),
          end_associado: dadosValidados.endereco,
          bai_associado: dadosValidados.bairro,
          cep_associado: dadosValidados.cep,
          cid_associado: dadosValidados.cidade,
          uf_associado: dadosValidados.uf,
          cel_associado: dadosValidados.celular,
          email_associado: dadosValidados.email,
          sen_associado: senhaHash
        }
      })

      return NextResponse.json(
        { 
          message: 'Associado cadastrado com sucesso',
          usuario: {
            cpf: associado.cpf_associado.toString(),
            nome: associado.nom_associado,
            email: associado.email_associado,
            tipo: 'ASSOCIADO'
          }
        },
        { status: 201 }
      )
    } else {
      // Valida com Zod
      const validacao = comercioSchema.safeParse({
        ...body,
        cnpj: documentoLimpo,
        cep: body.cep?.replace(/\D/g, ''),
        contato: body.contato?.replace(/\D/g, ''),
        idCategoria: parseInt(body.idCategoria)
      })

      if (!validacao.success) {
        return NextResponse.json(
          { 
            error: 'Dados inválidos', 
            details: validacao.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      }

      const dadosValidados = validacao.data

      // Verifica se CNPJ já existe
      const cnpjExiste = await prisma.comercio.findUnique({
        where: { cnpj_comercio: BigInt(documentoLimpo) }
      })

      if (cnpjExiste) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado' },
          { status: 400 }
        )
      }

      // Verifica se email já existe
      const emailExiste = await prisma.comercio.findUnique({
        where: { email_comercio: dadosValidados.email }
      })

      if (emailExiste) {
        return NextResponse.json(
          { error: 'E-mail já cadastrado' },
          { status: 400 }
        )
      }

      // Verifica se categoria existe
      const categoria = await prisma.categoria.findUnique({
        where: { id_categoria: dadosValidados.idCategoria }
      })

      if (!categoria) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
          { status: 400 }
        )
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(dadosValidados.senha, 10)

      // Cria comercio
      const comercio = await prisma.comercio.create({
        data: {
          cnpj_comercio: BigInt(documentoLimpo),
          id_categoria: dadosValidados.idCategoria,
          raz_social_comercio: dadosValidados.razaoSocial,
          nom_fantasia_comercio: dadosValidados.nomeFantasia,
          end_comercio: dadosValidados.endereco,
          bai_comercio: dadosValidados.bairro,
          cep_comercio: dadosValidados.cep,
          cid_comercio: dadosValidados.cidade,
          uf_comercio: dadosValidados.uf,
          con_comercio: dadosValidados.contato,
          email_comercio: dadosValidados.email,
          sen_comercio: senhaHash
        }
      })

      return NextResponse.json(
        { 
          message: 'Comerciante cadastrado com sucesso',
          usuario: {
            cnpj: comercio.cnpj_comercio.toString(),
            nome: comercio.nom_fantasia_comercio,
            email: comercio.email_comercio,
            tipo: 'COMERCIANTE'
          }
        },
        { status: 201 }
      )
    }
  } catch (error: any) {
    console.error('Erro no cadastro:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao cadastrar usuário' },
      { status: 500 }
    )
  }
}
