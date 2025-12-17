import { z } from 'zod'
import { obterDataHoje } from './utils'

// Validação de CPF
export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let checkDigit = 11 - (sum % 11)
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
  if (checkDigit !== parseInt(cpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  checkDigit = 11 - (sum % 11)
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
  if (checkDigit !== parseInt(cpf.charAt(10))) return false
  
  return true
}

// Validação de CNPJ
export function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '')
  
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false
  
  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  const digits = cnpj.substring(length)
  let sum = 0
  let pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  length = length + 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

// Schema de Cadastro Associado
export const associadoSchema = z.object({
  cpf: z.string().refine(validarCPF, 'CPF inválido'),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(40),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  endereco: z.string().min(1, 'Endereço é obrigatório').max(40),
  bairro: z.string().min(1, 'Bairro é obrigatório').max(30),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  cidade: z.string().min(1, 'Cidade é obrigatória').max(40),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  celular: z.string().min(1, 'Celular é obrigatório').max(15),
  email: z.string().email('E-mail inválido').max(50),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmacaoSenha: z.string()
}).refine((data) => data.senha === data.confirmacaoSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmacaoSenha']
})

// Schema de Cadastro Comerciante
export const comercioSchema = z.object({
  cnpj: z.string().refine(validarCNPJ, 'CNPJ inválido'),
  idCategoria: z.number().int().min(1, 'Categoria é obrigatória'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória').max(50),
  nomeFantasia: z.string().min(1, 'Nome fantasia é obrigatório').max(30),
  endereco: z.string().min(1, 'Endereço é obrigatório').max(40),
  bairro: z.string().min(1, 'Bairro é obrigatório').max(30),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  cidade: z.string().min(1, 'Cidade é obrigatória').max(40),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  contato: z.string().min(1, 'Contato é obrigatório').max(15),
  email: z.string().email('E-mail inválido').max(50),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmacaoSenha: z.string()
}).refine((data) => data.senha === data.confirmacaoSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmacaoSenha']
})

// Schema de Cupom
export const cupomSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(25),
  dataInicio: z.string().refine((date) => {
    // Compara strings de data diretamente no fuso horário local
    return date >= obterDataHoje()
  }, 'Data de início deve ser hoje ou futura'),
  dataTermino: z.string(),
  percentualDesconto: z.number().min(0.01, 'Desconto mínimo de 0.01%').max(99.99, 'Desconto máximo de 99.99%')
}).refine((data) => {
  // Compara strings de data diretamente
  return data.dataTermino > data.dataInicio
}, {
  message: 'Data término deve ser posterior à data início',
  path: ['dataTermino']
})

// Schema de validação para login
export const loginSchema = z.object({
  documento: z.string().min(1, 'CPF ou CNPJ é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória')
})
