// Nicolas Oliveira - RA 838094
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Categorias de comércio
export const CATEGORIAS_COMERCIO = [
  'Alimentação',
  'Vestuário',
  'Saúde',
  'Beleza',
  'Educação',
  'Entretenimento',
  'Serviços',
  'Tecnologia',
  'Esportes',
  'Casa e Decoração',
  'Automotivo',
  'Pet Shop',
  'Outros'
]

// Formatação de CPF
export function formatarCPF(cpf: string): string {
  if (!cpf) return ''
  
  // Remove tudo que não é dígito
  const numeros = cpf.replace(/\D/g, '')
  
  // Aplica a máscara
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// Formatação de CNPJ
export function formatarCNPJ(cnpj: string): string {
  if (!cnpj) return ''
  
  // Remove tudo que não é dígito
  const numeros = cnpj.replace(/\D/g, '')
  
  // Aplica a máscara
  return numeros
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

// Formatação de Data
export function formatarData(data: Date | string): string {
  if (typeof data === 'string') {
    // Se a string está no formato ISO (YYYY-MM-DD), adiciona horário para evitar problema de fuso
    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      data = data + 'T12:00:00'
    }
  }
  const d = typeof data === 'string' ? new Date(data) : data
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Converter string de data (YYYY-MM-DD) para Date no horário local (meio-dia)
export function parseDataLocal(dataString: string): Date {
  // Cria a data às 12h do horário local para evitar problemas de fuso horário
  const [ano, mes, dia] = dataString.split('-').map(Number)
  return new Date(ano, mes - 1, dia, 12, 0, 0)
}

// Obter data atual no formato YYYY-MM-DD no fuso horário local
export function obterDataHoje(): string {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// Gerar número de cupom único
export function gerarNumeroCupom(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let cupom = ''
  
  for (let i = 0; i < 12; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length)
    cupom += caracteres[indiceAleatorio]
  }
  
  return cupom
}
