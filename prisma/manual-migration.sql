-- Script SQL Manual para Criar o Novo Schema
-- Execute este script manualmente no seu banco de dados Neon

-- 1. Dropar tabelas antigas (se existirem)
DROP TABLE IF EXISTS "cupons_reservados" CASCADE;
DROP TABLE IF EXISTS "cupons" CASCADE;
DROP TABLE IF EXISTS "promocoes" CASCADE;
DROP TABLE IF EXISTS "usuarios" CASCADE;

-- 2. Dropar tipos enum antigos (se existirem)
DROP TYPE IF EXISTS "TipoUsuario" CASCADE;
DROP TYPE IF EXISTS "StatusCupom" CASCADE;

-- 3. Criar tabela CATEGORIA
CREATE TABLE IF NOT EXISTS "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nom_categoria" VARCHAR(25) NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- 4. Popular tabela CATEGORIA
INSERT INTO "categoria" ("nom_categoria") VALUES
    ('Alimentação'),
    ('Vestuário'),
    ('Saúde'),
    ('Beleza'),
    ('Educação'),
    ('Entretenimento'),
    ('Serviços'),
    ('Tecnologia'),
    ('Esportes'),
    ('Casa e Decoração'),
    ('Automotivo'),
    ('Pet Shop'),
    ('Outros');

-- 5. Criar tabela ASSOCIADO
CREATE TABLE IF NOT EXISTS "associado" (
    "cpf_associado" BIGINT NOT NULL,
    "nom_associado" VARCHAR(40) NOT NULL,
    "dtn_associado" DATE NOT NULL,
    "end_associado" VARCHAR(40) NOT NULL,
    "bai_associado" VARCHAR(30) NOT NULL,
    "cep_associado" VARCHAR(8) NOT NULL,
    "cid_associado" VARCHAR(40) NOT NULL,
    "uf_associado" CHAR(2) NOT NULL,
    "cel_associado" VARCHAR(15) NOT NULL,
    "email_associado" VARCHAR(50) NOT NULL,
    "sen_associado" VARCHAR(255) NOT NULL,

    CONSTRAINT "associado_pkey" PRIMARY KEY ("cpf_associado")
);

-- 6. Criar índice único em email_associado
CREATE UNIQUE INDEX "associado_email_associado_key" ON "associado"("email_associado");

-- 7. Criar tabela COMERCIO
CREATE TABLE IF NOT EXISTS "comercio" (
    "cnpj_comercio" BIGINT NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "raz_social_comercio" VARCHAR(50) NOT NULL,
    "nom_fantasia_comercio" VARCHAR(30) NOT NULL,
    "end_comercio" VARCHAR(40) NOT NULL,
    "bai_comercio" VARCHAR(30) NOT NULL,
    "cep_comercio" VARCHAR(8) NOT NULL,
    "cid_comercio" VARCHAR(40) NOT NULL,
    "uf_comercio" CHAR(2) NOT NULL,
    "con_comercio" VARCHAR(15) NOT NULL,
    "email_comercio" VARCHAR(50) NOT NULL,
    "sen_comercio" VARCHAR(255) NOT NULL,

    CONSTRAINT "comercio_pkey" PRIMARY KEY ("cnpj_comercio")
);

-- 8. Criar índice único em email_comercio
CREATE UNIQUE INDEX "comercio_email_comercio_key" ON "comercio"("email_comercio");

-- 9. Adicionar FK de comercio para categoria
ALTER TABLE "comercio" ADD CONSTRAINT "comercio_id_categoria_fkey" 
    FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. Criar tabela CUPOM
CREATE TABLE IF NOT EXISTS "cupom" (
    "num_cupom" CHAR(12) NOT NULL,
    "tit_cupom" VARCHAR(25) NOT NULL,
    "cnpj_comercio" BIGINT NOT NULL,
    "dta_emissao_cupom" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dta_inicio_cupom" DATE NOT NULL,
    "dta_termino_cupom" DATE NOT NULL,
    "per_desc_cupom" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "cupom_pkey" PRIMARY KEY ("num_cupom")
);

-- 11. Adicionar FK de cupom para comercio
ALTER TABLE "cupom" ADD CONSTRAINT "cupom_cnpj_comercio_fkey" 
    FOREIGN KEY ("cnpj_comercio") REFERENCES "comercio"("cnpj_comercio") ON DELETE CASCADE ON UPDATE CASCADE;

-- 12. Criar tabela CUPOM_ASSOCIADO
CREATE TABLE IF NOT EXISTS "cupom_associado" (
    "id_cupom_associado" SERIAL NOT NULL,
    "num_cupom" CHAR(12) NOT NULL,
    "cpf_associado" BIGINT NOT NULL,
    "dta_cupom_associado" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dta_uso_cupom_associado" DATE,

    CONSTRAINT "cupom_associado_pkey" PRIMARY KEY ("id_cupom_associado")
);

-- 13. Adicionar FK de cupom_associado para cupom
ALTER TABLE "cupom_associado" ADD CONSTRAINT "cupom_associado_num_cupom_fkey" 
    FOREIGN KEY ("num_cupom") REFERENCES "cupom"("num_cupom") ON DELETE CASCADE ON UPDATE CASCADE;

-- 14. Adicionar FK de cupom_associado para associado
ALTER TABLE "cupom_associado" ADD CONSTRAINT "cupom_associado_cpf_associado_fkey" 
    FOREIGN KEY ("cpf_associado") REFERENCES "associado"("cpf_associado") ON DELETE CASCADE ON UPDATE CASCADE;

-- Verificar estrutura criada
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;
