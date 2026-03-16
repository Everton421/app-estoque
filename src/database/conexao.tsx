import {  type SQLiteDatabase } from 'expo-sqlite';
 

export async function construtor(db: SQLiteDatabase) {
    
    await db.execAsync(` 
  PRAGMA journal_mode = 'wal';
 
  CREATE TABLE IF NOT EXISTS usuarios (
      codigo INTEGER  NOT NULL, 
      nome TEXT NOT NULL,
      senha TEXT NOT NULL, 
      email TEXT NOT NULL,
      lembrar TEXT DEFAULT 'N',
      token TEXT
    ); 


     CREATE TABLE IF NOT EXISTS produtos (
      codigo          INTEGER PRIMARY KEY NOT NULL,
      estoque         REAL DEFAULT 0,
      preco           REAL DEFAULT 0,
      unidade_medida  TEXT DEFAULT 'UND',
      grupo           INTEGER DEFAULT 0,
      origem          TEXT,   
      descricao       TEXT NOT NULL,
      num_fabricante  TEXT,
      num_original    TEXT,
      sku             TEXT,
      marca           INTEGER DEFAULT 0,
      ativo           TEXT DEFAULT 'S',
      class_fiscal    TEXT ,
      cst             TEXT DEFAULT '00',
      data_cadastro   TEXT NOT NULL,
      data_recadastro TEXT NOT NULL, 
      observacoes1    BLOB,
      observacoes2    BLOB,
      observacoes3    BLOB,
      tipo TEXT
      );
       
 

      CREATE TABLE IF NOT EXISTS setores (
       codigo INTEGER PRIMARY KEY NOT NULL,
       descricao TEXT NOT NULL,
       data_cadastro TEXT NOT NULL,
       data_recadastro TEXT NOT NULL 
      );

       

        CREATE TABLE IF NOT EXISTS produto_setor (
         setor INTEGER  NOT NULL DEFAULT 0,
         produto INTEGER  NOT NULL DEFAULT 0,
         estoque INTEGER  NOT NULL DEFAULT 0,
         local_produto TEXT,
         local1_produto TEXT,
         local2_produto TEXT,
         local3_produto TEXT,
         local4_produto TEXT, 
         data_recadastro TEXT NOT NULL 
      );
      
        CREATE TABLE IF NOT EXISTS movimentos_produtos (
         codigo    INTEGER PRIMARY KEY NOT NULL,
         setor INTEGER  NOT NULL DEFAULT 0,
         ent_sai TEXT,
         unidade_medida  TEXT DEFAULT 'UND',
         produto INTEGER  NOT NULL DEFAULT 0,
         quantidade INTEGER  NOT NULL DEFAULT 0,
         tipo TEXT NOT NULL DEFAULT A, 
         historico  TEXT NOT NULL,
         data_recadastro TEXT NOT NULL
      );

 
      CREATE TABLE IF NOT EXISTS api_config (
       codigo INTEGER PRIMARY KEY NOT NULL,
       url TEXT NOT NULL,
       porta INTEGER  NOT NULL DEFAULT 3000,
       token TEXT NOT NULL,
       data_sinc TEXT NOT NULL,
       data_env TEXT DEFAULT '0000-00-00 00:00:00' 
      );
      CREATE TABLE IF NOT EXISTS empresas (
       codigo INTEGER PRIMARY KEY NOT NULL,
       cnpj TEXT NOT NULL,
       email TEXT NOT NULL,
       responsavel  INTEGER  NOT NULL DEFAULT 0,
       nome TEXT NOT NULL 
      );

    CREATE TABLE IF NOT EXISTS categorias (
       codigo INTEGER PRIMARY KEY NOT NULL,
       id TEXT NOT NULL DEFAULT 0,
       descricao TEXT NOT NULL,
       data_cadastro TEXT NOT NULL,
       data_recadastro TEXT NOT NULL 
      );

  CREATE TABLE IF NOT EXISTS marcas (
       codigo INTEGER PRIMARY KEY NOT NULL,
       id TEXT NOT NULL DEFAULT 0,
       descricao TEXT NOT NULL,
       data_cadastro TEXT NOT NULL,
       data_recadastro TEXT NOT NULL 
      );

      CREATE TABLE IF NOT EXISTS fotos_produtos(
       produto INTEGER NOT NULL DEFAULT 0,
       sequencia INTEGER NOT NULL DEFAULT 0,
       descricao TEXT NOT NULL,
       link TEXT NOT NULL,
       foto TEXT NOT NULL,
       data_cadastro TEXT NOT NULL,
       data_recadastro TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS clientes (
      codigo INTEGER PRIMARY KEY NOT NULL,
      celular TEXT,
      nome TEXT NOT NULL,
      cep TEXT NOT NULL DEFAULT '00000-000',
      endereco TEXT,
      ie TEXT,
      numero TEXT,
      cnpj TEXT,
      cidade TEXT,
      bairro TEXT,
      estado TEXT,
      data_cadastro TEXT NOT NULL,
      data_recadastro TEXT NOT NULL,
      vendedor INTEGER NOT NULL DEFAULT 0
     );

       -- 
     CREATE TABLE IF NOT EXISTS pedidos (
      codigo INTEGER PRIMARY KEY ,
      id  TEXT NOT NULL,
      id_externo  TEXT NOT NULL,
      id_interno TEXT,
      vendedor INTEGER NOT NULL DEFAULT 0,   
      situacao TEXT NOT NULL DEFAULT 'EA',
      situacao_separacao TEXT NOT NULL DEFAULT 'N', -- N = Não Separado; P = Separado Parcialmente; I = Separado Integralmente
      contato TEXT ,
      frete REAL DEFAULT 0.00,
      descontos REAL DEFAULT 0.00,
      forma_pagamento INTEGER DEFAULT 0,
      observacoes BLOB,
      quantidade_parcelas INTEGER DEFAULT 0,
      total_geral REAL DEFAULT 0.00,
      total_produtos REAL DEFAULT 0.00,
      total_servicos REAL DEFAULT 0.00,
      cliente INTEGER NOT NULL DEFAULT 0,
      veiculo INTEGER NOT NULL DEFAULT 0,
      data_cadastro TEXT NOT NULL,
      data_recadastro TEXT NOT NULL,
      tipo_os INTEGER DEFAULT 0, 
      enviado TEXT NOT NULL DEFAULT 'N',
      tipo INTEGER NOT NULL DEFAULT 1   --1 = Orçamento (gerado no sistema); 2 = Orçamento (gerado fora do sistema); 3 = Ordem de Serviço; 4 = Contrato de Prestação de Serviços; 5 = Devolução
    ); 

       CREATE TABLE IF NOT EXISTS produtos_pedido (
      pedido INTEGER NOT NULL,
      codigo INTEGER NOT NULL,
      desconto REAL DEFAULT 0.00,
      quantidade REAL DEFAULT 0.00,
      preco REAL DEFAULT 0.00,
      frete REAL DEFAULT 0.00,
      total REAL DEFAULT 0.00,
      quantidade_separada REAL DEFAULT 0.00,
      quantidade_faturada REAL DEFAULT 0.00 

     -- FOREIGN KEY (pedido) REFERENCES pedidos(codigo) -- Add a foreign key constraint
    );
    CREATE TABLE IF NOT EXISTS servicos_pedido (
      pedido INTEGER NOT NULL,
      codigo INTEGER NOT NULL,
      desconto REAL DEFAULT 0.00,
      quantidade REAL DEFAULT 0.00,
      valor REAL DEFAULT 0.00 ,
      total REAL DEFAULT 0.00  
    -- FOREIGN KEY (pedido) REFERENCES pedidos(codigo) -- Add a foreign key constraint
    );
        CREATE TABLE IF NOT EXISTS parcelas (
      pedido INTEGER NOT NULL,
      parcela INTEGER NOT NULL,
      valor REAL NOT NULL DEFAULT 0.00,
      vencimento TEXT NOT NULL DEFAULT '0000-00-00' 
     -- FOREIGN KEY (pedido) REFERENCES pedidos(codigo)
    );

      CREATE TABLE IF NOT EXISTS servicos ( 
      codigo INTEGER PRIMARY KEY NOT NULL,
      valor REAL DEFAULT 0,
      aplicacao TEXT NOT NULL,
        data_cadastro TEXT NOT NULL,
      data_recadastro TEXT NOT NULL,
      tipo_serv INTEGER DEFAULT 0 
       );
     
       
     `); 
 
  console.log('banco carregado com sucesso !');
  
  } 