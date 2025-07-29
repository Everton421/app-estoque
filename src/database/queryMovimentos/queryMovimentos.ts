

 type movimentos = {
    setor:number
    produto:number
    quantidade:number
    tipo:string
    historico:string
    data_recadastro:string,
    codigo:number
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
 
 async function selectQuery ( query:any ):Promise<movimentos[] | undefined>{
     try{

         let result:movimentos[] = await db.getAllAsync(`SELECT *,
                   strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM movimentos_produtos 
                   where 
                       produto like '%${query}%' or 
                       historico like '%${query}%' or 
                       quantidade like '%${query}%'
                   `);
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
            produto,
            quantidade,
            tipo,
            historico,
            data_recadastro 

            ) VALUES (
                 ${obj.setor},
                 ${obj.produto},
                 ${obj.quantidade},
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
            produto,
            quantidade,
            tipo,
            historico,
            data_recadastro 

            ) VALUES (
                 ${obj.codigo},
                 ${obj.setor},
                 ${obj.produto},
                 ${obj.quantidade},
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
  