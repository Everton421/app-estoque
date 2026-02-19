
import { useSQLiteContext } from "expo-sqlite";

export const restartDatabaseService = ()=>{


    const db = useSQLiteContext();

    async function restart(){

        await  db.execAsync(` 
      
      DROP TABLE IF EXISTS produtos;
      DROP TABLE IF EXISTS setores;
   -- DROP TABLE IF EXISTS usuarios ;
       
      DROP TABLE IF EXISTS produto_setor ;
      DROP TABLE IF EXISTS empresas;
      DROP TABLE IF EXISTS marcas;
      DROP TABLE IF EXISTS categorias;
      DROP TABLE IF EXISTS fotos_produtos;
      DROP TABLE IF EXISTS api_config;
      DROP TABLE IF EXISTS  movimentos_produtos;

   CREATE TABLE IF NOT EXISTS usuarios (
      codigo INTEGER  NOT NULL, 
      nome TEXT NOT NULL,
      senha TEXT NOT NULL, 
      email TEXT NOT NULL,
      lembrar TEXT DEFAULT 'N',
      token TEXT
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
      )
     `); 
 
   console.log('restart database')
    }
return { restart }
}