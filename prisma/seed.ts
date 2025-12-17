import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (CUIDADO: use apenas em desenvolvimento)
  console.log('🗑️  Limpando dados existentes...')
  await prisma.cupomReservado.deleteMany({})
  await prisma.cupom.deleteMany({})
  await prisma.promocao.deleteMany({})
  await prisma.usuario.deleteMany({})

  // Criar comerciantes
  console.log('👨‍💼 Criando comerciantes...')
  
  const comerciante1 = await prisma.usuario.create({
    data: {
      nome: 'João Silva',
      email: 'joao@padaria.com',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'COMERCIANTE',
      cnpj: '12345678000190',
      nomeComercio: 'Padaria do João',
      categoriaComercio: 'Alimentação'
    }
  })

  const comerciante2 = await prisma.usuario.create({
    data: {
      nome: 'Maria Santos',
      email: 'maria@boutique.com',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'COMERCIANTE',
      cnpj: '98765432000111',
      nomeComercio: 'Boutique Maria',
      categoriaComercio: 'Vestuário'
    }
  })

  const comerciante3 = await prisma.usuario.create({
    data: {
      nome: 'Carlos Oliveira',
      email: 'carlos@academia.com',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'COMERCIANTE',
      cnpj: '11222333000144',
      nomeComercio: 'Academia Fitness Pro',
      categoriaComercio: 'Saúde e Beleza'
    }
  })

  console.log(`✅ ${3} comerciantes criados`)

  // Criar associados
  console.log('👥 Criando associados...')
  
  const associado1 = await prisma.usuario.create({
    data: {
      nome: 'Ana Paula Costa',
      email: 'ana@email.com',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'ASSOCIADO',
      cpf: '12345678909'
    }
  })

  const associado2 = await prisma.usuario.create({
    data: {
      nome: 'Pedro Henrique',
      email: 'pedro@email.com',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'ASSOCIADO',
      cpf: '98765432100'
    }
  })

  console.log(`✅ ${2} associados criados`)

  // Criar promoções e cupons
  console.log('🎟️  Criando promoções e cupons...')

  // Promoção 1 - Padaria (Ativa)
  const dataInicio1 = new Date()
  dataInicio1.setDate(dataInicio1.getDate() - 5) // 5 dias atrás
  const dataFim1 = new Date()
  dataFim1.setDate(dataFim1.getDate() + 25) // 25 dias no futuro

  const promocao1 = await prisma.promocao.create({
    data: {
      titulo: 'Desconto de Inauguração',
      dataInicio: dataInicio1,
      dataFim: dataFim1,
      percentualDesconto: 20,
      quantidadeCupons: 5,
      comercianteId: comerciante1.id
    }
  })

  // Gerar cupons para promoção 1
  for (let i = 0; i < 5; i++) {
    await prisma.cupom.create({
      data: {
        numeroCupom: gerarCodigoCupom(),
        promocaoId: promocao1.id,
        status: 'DISPONIVEL'
      }
    })
  }

  // Promoção 2 - Boutique (Ativa)
  const promocao2 = await prisma.promocao.create({
    data: {
      titulo: 'Liquidação de Verão',
      dataInicio: dataInicio1,
      dataFim: dataFim1,
      percentualDesconto: 30,
      quantidadeCupons: 10,
      comercianteId: comerciante2.id
    }
  })

  // Gerar cupons para promoção 2 (alguns reservados)
  const cupons2 = []
  for (let i = 0; i < 10; i++) {
    const cupom = await prisma.cupom.create({
      data: {
        numeroCupom: gerarCodigoCupom(),
        promocaoId: promocao2.id,
        status: i < 3 ? 'RESERVADO' : 'DISPONIVEL' // 3 reservados, 7 disponíveis
      }
    })
    if (i < 3) cupons2.push(cupom)
  }

  // Criar reservas para cupons da promoção 2
  for (let i = 0; i < cupons2.length; i++) {
    await prisma.cupomReservado.create({
      data: {
        cupomId: cupons2[i].id,
        associadoId: i === 0 ? associado1.id : associado2.id
      }
    })
  }

  // Promoção 3 - Academia (Ativa)
  const promocao3 = await prisma.promocao.create({
    data: {
      titulo: 'Black Friday Fitness',
      dataInicio: dataInicio1,
      dataFim: dataFim1,
      percentualDesconto: 50,
      quantidadeCupons: 8,
      comercianteId: comerciante3.id
    }
  })

  // Gerar cupons para promoção 3 (alguns utilizados)
  const cupons3 = []
  for (let i = 0; i < 8; i++) {
    const cupom = await prisma.cupom.create({
      data: {
        numeroCupom: gerarCodigoCupom(),
        promocaoId: promocao3.id,
        status: i < 2 ? 'UTILIZADO' : (i < 5 ? 'RESERVADO' : 'DISPONIVEL'),
        dataUso: i < 2 ? new Date() : null
      }
    })
    if (i >= 2 && i < 5) cupons3.push(cupom)
  }

  // Criar reservas para cupons da promoção 3
  for (let i = 0; i < cupons3.length; i++) {
    await prisma.cupomReservado.create({
      data: {
        cupomId: cupons3[i].id,
        associadoId: associado1.id
      }
    })
  }

  // Promoção 4 - Vencida
  const dataInicioVencida = new Date()
  dataInicioVencida.setDate(dataInicioVencida.getDate() - 40)
  const dataFimVencida = new Date()
  dataFimVencida.setDate(dataFimVencida.getDate() - 10)

  const promocaoVencida = await prisma.promocao.create({
    data: {
      titulo: 'Promoção Encerrada',
      dataInicio: dataInicioVencida,
      dataFim: dataFimVencida,
      percentualDesconto: 15,
      quantidadeCupons: 3,
      comercianteId: comerciante1.id
    }
  })

  for (let i = 0; i < 3; i++) {
    await prisma.cupom.create({
      data: {
        numeroCupom: gerarCodigoCupom(),
        promocaoId: promocaoVencida.id,
        status: 'VENCIDO'
      }
    })
  }

  console.log(`✅ ${4} promoções criadas com cupons`)

  console.log('\n✅ Seed concluído com sucesso!')
  console.log('\n📊 Dados criados:')
  console.log(`   - ${3} comerciantes`)
  console.log(`   - ${2} associados`)
  console.log(`   - ${4} promoções`)
  console.log(`   - ${26} cupons`)
  
  console.log('\n🔑 Credenciais de teste:')
  console.log('\n   Comerciantes:')
  console.log('   - CNPJ: 12345678000190 | Senha: senha123 (Padaria do João)')
  console.log('   - CNPJ: 98765432000111 | Senha: senha123 (Boutique Maria)')
  console.log('   - CNPJ: 11222333000144 | Senha: senha123 (Academia Fitness)')
  console.log('\n   Associados:')
  console.log('   - CPF: 12345678909 | Senha: senha123 (Ana Paula)')
  console.log('   - CPF: 98765432100 | Senha: senha123 (Pedro Henrique)')
  console.log('\n')
}

function gerarCodigoCupom(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = ''
  for (let i = 0; i < 12; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

