

export  type movimentos = {
    setor:number
    produto:number
    quantidade:number
    tipo:string
    historico:string
    data_recadastro:string,
    ent_sai:string,
    codigo:number
    unidade_medida:string
 }



 import { SQLiteRunResult, useSQLiteContext } from "expo-sqlite"
 
 
 export const useMovimentos = ()=>{
  
 const db = useSQLiteContext();
 
 
 async function selectAll():Promise<movimentos[] | undefined >{
     try{
         let result:movimentos[] = await db.getAllAsync(`SELECT * ,
                   strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM movimentos_produtos `);
         return result;
     }catch( e){
         console.log(`erro ao buscar setores `, e);
     } 
 }
  
 
 async function selectByCodeProductAndCodeSector( code:number, sector:number ):Promise<movimentos[] | undefined>{
     try{
         let result:movimentos[] = await db.getAllAsync(`SELECT *,
                  -- strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                   strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM movimentos_produtos 
                   where produto = ${ code } and setor = ${sector} `);
         return result;
     }catch( e){
         console.log(`erro ao buscar movimeto do produto: ${code}  no  setor : ${ sector }`, e);
     } 
 }
 
  async function findByCodeMoviment( code:number ):Promise<movimentos[] | undefined>{
     try{
         let result:movimentos[] = await db.getAllAsync(`SELECT *,
                   
                   strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM movimentos_produtos 
                   where codigo = ${code} `);
         return result;
     }catch( e){
         console.log(`erro ao buscar movimento codigo: ${code} `, e);
     } 
 }

   /**
    *  busca por tipo de movimento 
    * @param code 
    * @returns 
    */
 async function findByTypeMoviment( mov:string ):Promise<movimentos[] | undefined>{
     try{
         let result:movimentos[] = await db.getAllAsync(`SELECT *,
                  -- strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                   strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM movimentos_produtos 
                   where tipo = '${mov}' `);
         return result;
     }catch( e){
         console.log(`erro ao buscar movimentos dos produtos do tipo ${mov} `, e);
     } 
 }
 async function selectByCodeProduct ( code:number ):Promise<movimentos[] | undefined>{
     try{
         let result:movimentos[] = await db.getAllAsync(`SELECT *,
                  -- strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                   strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM movimentos_produtos 
                   where produto = ${ code }   `);
         return result;
     }catch( e){
         console.log(`erro ao buscar movimentos do  produto: ${code} nos setores`, e);
     } 
 }
 

 type resultQueryMov = {
  data_recadastro :string
  codigo_produto :number
  descricao_produto:string
  quantidade_movimento:number
  codigo_setor:number
  historico_movimento:string
  codigo_movimento:number
  descricao_setor:string,
  entrada_saida: 'E' | 'S'
  unidade_medida:string
}

 async function selectQuery ( input:string, query: { tipo:'E'| 'S'|'*', data:string } ):Promise<resultQueryMov[] | undefined>{
     try{


            let sql = `SELECT 
                             p.descricao as descricao_produto, 
                             p.codigo as codigo_produto,
                             strftime('%Y-%m-%d %H:%M:%S',  mvp.data_recadastro) AS data_recadastro,
                             mvp.unidade_medida as unidade_medida,
                             mvp.quantidade as quantidade_movimento,
                             mvp.setor as codigo_setor,
                             mvp.historico as historico_movimento,
                             mvp.codigo as codigo_movimento,
                             mvp.ent_sai as entrada_saida,
                             s.descricao as descricao_setor
                        FROM movimentos_produtos mvp
                           left join produtos p on p.codigo = mvp.produto
                           left join setores s on s.codigo = mvp.setor
                                    ` 
                                        let conditions = [ ];
                                        let values = []
                                     if(query.tipo !== '*'  ){
                                        conditions.push(` mvp.ent_sai = ? `)
                                        values.push(`${query.tipo}`)
                                    }
                                 
                                 conditions.push(` mvp.data_recadastro >=  '${query.data}' `)

                                 let paramsLike = ``
                                    if(input !== ''){
                                        paramsLike = ` and ( 
                                                    mvp.produto like '%${input}%' or 
                                                    mvp.historico like '%${input}%' or 
                                                    mvp.quantidade like '%${input}%' or 
                                                    p.descricao like '%${input}%' or 
                                                    s.descricao like '%${input}%'
                                              )`
                                    }

                                    let whereClause = ' where '
                                    let finalsql = sql + whereClause + conditions.join(' and ')  +paramsLike;
                                     // console.log(finalsql)
                                     // console.log(values)

            let result:resultQueryMov[] = await db.getAllAsync( finalsql, values );
            return result;
        }catch( e){
            console.log(`erro ao buscar os movimentos dos produtos, busca por parametros de pesquisa `, e);
        } 
 }
 
 
 
 async function update(obj:Partial<movimentos>  ): Promise<SQLiteRunResult |  undefined > {
    
    if(!obj.codigo){  
     console.log("É necessario o codigo do movimento para atualizar") 
        return
    }

    try{
         const sql =  ` UPDATE movimentos_produtos SET   `
 
             let conditions = [];
             let values=[]
 
              if(obj.setor){
                conditions.push(' setor = ? ');
                values.push( obj.setor )
              }
              if(obj.produto){
                conditions.push(' produto = ? ');
                values.push( obj.produto )
              }
              if(obj.quantidade){
                conditions.push(' quantidade = ? ');
                values.push( obj.quantidade  )
              }
               if(obj.unidade_medida){
                conditions.push(' unidade_medida = ? ');
                values.push(`${obj.unidade_medida}`)
              }
              if(obj.tipo){
                conditions.push(' tipo = ? ');
                values.push(`${obj.tipo}`)
              }
              if(obj.historico){
                conditions.push(' historico = ? ');
                values.push(`${obj.historico}`)
              }
              if(obj.data_recadastro){
                conditions.push(' data_recadastro = ? ');
                values.push(`${obj.data_recadastro}`)
              }
 
             let whereClause = ` WHERE   codigo = ${obj.codigo};`
             let finalsql = sql + conditions.join(' , ') + whereClause;
 
             let result = await db.runAsync( finalsql,values);
         console.log(` atualizado movimento do produto codigo: ${obj.produto}  `  );
              return result
     }catch(e   ){ console.log( `erro ao atualizar movimento do  produto codigo: ${obj.produto} no setor: ${obj.setor} ` , e )}
 }
 
  type newMoviment = Omit<movimentos, 'codigo' > 

 async function create( obj:newMoviment ): Promise<SQLiteRunResult | any>{
     try{
 
         let result = await db.runAsync(
             `
             INSERT INTO movimentos_produtos 
            (
            setor,
            ent_sai,
            produto,
            quantidade,
            unidade_medida,
            tipo,
            historico,
            data_recadastro 

            ) VALUES (
                 ${obj.setor},
                 '${obj.ent_sai}',
                 ${obj.produto},
                 ${obj.quantidade},
                 '${obj.unidade_medida}',
                '${obj.tipo}',
                '${obj.historico}',
                '${obj.data_recadastro}'           
             );`
         )
         console.log(` Registrado o movimento do produto ${obj.produto} `);

         return result;
     }catch(e   ){ console.log( `erro ao registrar o movimento do  Produto ${obj.produto}  ` , e )}
 }
 
 async function createByCode( obj:movimentos ): Promise<SQLiteRunResult | any>{
     try{
 
         let result = await db.runAsync(
             `
             INSERT INTO movimentos_produtos 
            (
            codigo,
            setor,
            ent_sai,
            produto,
            quantidade,
            unidade_medida ,
            tipo,
            historico,
            data_recadastro 

            ) VALUES (
                 ${obj.codigo},
                 ${obj.setor},
                 '${obj.ent_sai}',
                 ${obj.produto},
                 ${obj.quantidade},
                '${obj.unidade_medida}',
                '${obj.tipo}',
                '${obj.historico}',
                '${obj.data_recadastro}'           
             );`
         )
         console.log(` Registrado o movimento do produto ${obj.produto} `);

         return result;
     }catch(e   ){ console.log( `erro ao registrar o movimento do  Produto ${obj.produto}  ` , e )}
 }
 
  
  
 
 return {   selectAll,findByCodeMoviment, createByCode, create, findByTypeMoviment,selectQuery,  selectByCodeProductAndCodeSector,  selectByCodeProduct, update     } 
 }
  