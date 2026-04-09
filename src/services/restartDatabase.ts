
import { useSQLiteContext } from "expo-sqlite";

export const restartDatabaseService = ()=>{


    const db = useSQLiteContext();

    async function restart(){

        await  db.execAsync(` 
      
      DROP TABLE IF EXISTS produtos;
      DROP TABLE IF EXISTS servicos;
      DROP TABLE IF EXISTS setores;
      DROP TABLE IF EXISTS usuarios ;
      DROP TABLE IF EXISTS api_config;
      DROP TABLE IF EXISTS empresas;
      DROP TABLE IF EXISTS categorias;
      DROP TABLE IF EXISTS marcas;
      DROP TABLE IF EXISTS fotos_produtos;
      DROP TABLE IF EXISTS clientes;
      DROP TABLE IF EXISTS pedidos;
      DROP TABLE IF EXISTS produtos_pedido;
      DROP TABLE IF EXISTS servicos_pedido;
      DROP TABLE IF EXISTS parcelas;
      DROP TABLE IF EXISTS produto_setor;
      DROP TABLE IF EXISTS movimentos_produtos;
      
  CREATE TABLE IF NOT EXISTS usuarios (
      codigo INTEGER  NOT NULL, 
      nome TEXT NOT NULL,
      senha TEXT NOT NULL, 
      email TEXT NOT NULL,
      lembrar TEXT DEFAULT 'N',
      token TEXT
    ); 

    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

  CREATE TABLE IF NOT EXISTS produtos (
      codigo          INTEGER PRIMARY KEY NOT NULL,
      id              TEXT,   
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

    CREATE INDEX IF NOT EXISTS idx_produtos_num_fabricante ON produtos(num_fabricante);
    CREATE INDEX IF NOT EXISTS idx_produtos_num_original ON produtos(num_original);
    CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);
    CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca);
    CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
    CREATE INDEX IF NOT EXISTS idx_produtos_grupo ON produtos(grupo);
    CREATE INDEX IF NOT EXISTS idx_produtos_descricao ON produtos(descricao);
        

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

    CREATE INDEX IF NOT EXISTS idx_produto_setor_setor ON produto_setor(setor);
    CREATE INDEX IF NOT EXISTS idx_produto_setor_produto ON produto_setor(produto);
       
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

    CREATE INDEX IF NOT EXISTS idx_movimentos_produto ON movimentos_produtos(produto);
    CREATE INDEX IF NOT EXISTS idx_movimentos_setor ON movimentos_produtos(setor);
    CREATE INDEX IF NOT EXISTS idx_movimentos_tipo ON movimentos_produtos(tipo);
    CREATE INDEX IF NOT EXISTS idx_movimentos_data ON movimentos_produtos(data_recadastro);
 
   
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

    CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);

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

    CREATE INDEX IF NOT EXISTS idx_fotos_produto ON fotos_produtos(produto);
  
      
       CREATE TABLE IF NOT EXISTS clientes (
      codigo INTEGER PRIMARY KEY NOT NULL,
      id TEXT,
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

    CREATE INDEX IF NOT EXISTS idx_clientes_vendedor ON clientes(vendedor);
    CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);
    CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
    CREATE INDEX IF NOT EXISTS idx_clientes_cidade ON clientes(cidade);
    CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);


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
       
      CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_cadastro);
      CREATE INDEX IF NOT EXISTS idx_pedidos_vendedor ON pedidos(vendedor);
      CREATE INDEX IF NOT EXISTS idx_pedidos_situacao ON pedidos(situacao);
      CREATE INDEX IF NOT EXISTS idx_pedidos_tipo ON pedidos(tipo);
      CREATE INDEX IF NOT EXISTS idx_pedidos_enviado ON pedidos(enviado);
      CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente);


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

    CREATE INDEX IF NOT EXISTS idx_produtos_pedido_pedido ON produtos_pedido(pedido);
    CREATE INDEX IF NOT EXISTS idx_produtos_pedido_codigo ON produtos_pedido(codigo);

    CREATE TABLE IF NOT EXISTS servicos_pedido (
      pedido INTEGER NOT NULL,
      codigo INTEGER NOT NULL,
      desconto REAL DEFAULT 0.00,
      quantidade REAL DEFAULT 0.00,
      valor REAL DEFAULT 0.00 ,
      total REAL DEFAULT 0.00  
     -- FOREIGN KEY (pedido) REFERENCES pedidos(codigo) -- Add a foreign key constraint
     );

    CREATE INDEX IF NOT EXISTS idx_servicos_pedido_pedido ON servicos_pedido(pedido);

        CREATE TABLE IF NOT EXISTS parcelas (
      pedido INTEGER NOT NULL,
      parcela INTEGER NOT NULL,
      valor REAL NOT NULL DEFAULT 0.00,
      vencimento TEXT NOT NULL DEFAULT '0000-00-00' 
       -- FOREIGN KEY (pedido) REFERENCES pedidos(codigo)
     );

    CREATE INDEX IF NOT EXISTS idx_parcelas_pedido ON parcelas(pedido);

      CREATE TABLE IF NOT EXISTS servicos (
      codigo INTEGER PRIMARY KEY NOT NULL,
      valor REAL DEFAULT 0,
      aplicacao TEXT NOT NULL,
        data_cadastro TEXT NOT NULL,
      data_recadastro TEXT NOT NULL,
      tipo_serv INTEGER DEFAULT 0 
       );
     
       
     `); 
 
 
   console.log('restart database')
    }
return { restart }
}