// Tipos das entidades do banco de dados

export type Associado = {
  cpf_associado: bigint
  nom_associado: string
  dtn_associado: Date
  end_associado: string
  bai_associado: string
  cep_associado: string
  cid_associado: string
  uf_associado: string
  cel_associado: string
  email_associado: string
}

export type Comercio = {
  cnpj_comercio: bigint
  id_categoria: number
  raz_social_comercio: string
  nom_fantasia_comercio: string
  end_comercio: string
  bai_comercio: string
  cep_comercio: string
  cid_comercio: string
  uf_comercio: string
  con_comercio: string
  email_comercio: string
}

export type Categoria = {
  id_categoria: number
  nom_categoria: string
}

export type Cupom = {
  num_cupom: string
  tit_cupom: string
  cnpj_comercio: bigint
  dta_emissao_cupom: Date
  dta_inicio_cupom: Date
  dta_termino_cupom: Date
  per_desc_cupom: number
}

export type CupomAssociado = {
  id_cupom_associado: number
  num_cupom: string
  cpf_associado: bigint
  dta_cupom_associado: Date
  dta_uso_cupom_associado: Date | null
}

// Tipos com relacionamentos (para queries do Prisma)
export type CupomComComercio = Cupom & {
  comercio: Comercio & {
    categoria: Categoria
  }
}

export type CupomComReservas = Cupom & {
  reservas: CupomAssociado[]
}

export type CupomAssociadoComDados = CupomAssociado & {
  cupom: CupomComComercio
  associado: Associado
}
