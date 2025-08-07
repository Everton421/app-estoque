import { SQLiteRunResult, useSQLiteContext } from "expo-sqlite"

export type  prod_setor = {
        setor :string  ,
        produto :string  ,
        estoque :number  ,
        local_produto :string  ,
        local1_produto :string ,
        local2_produto :string ,
        local3_produto :string ,
        local4_produto :string , 
        data_recadastro:string 
}

 type unidade_medida= {
    unidade_medida:string
} 

 type dataProdMov =  prod_setor & unidade_medida   


export const useProdutoSetores = ()=>{
 
const db = useSQLiteContext();



async function selectAll():Promise<prod_setor[] | undefined>{ 
    try{
        let result:prod_setor[]  = await db.getAllAsync(`SELECT * ,
                 -- strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM produto_setor `);
        return result;
    }catch( e){
        console.log(`erro ao buscar setores `, e);
    } 
}
 

async function selectByCodeProductAndCodeSector( code:number, sector:number ):Promise<dataProdMov[] | undefined>{
    try{
        let result:dataProdMov[] = await db.getAllAsync(`SELECT ps.*,
                                    strftime('%Y-%m-%d %H:%M:%S',  ps.data_recadastro) AS data_recadastro,
                                    p.unidade_medida 
                            FROM produto_setor ps 
                                join produtos as p on p.codigo = ps.produto
                              where ps.produto = ${ code } and ps.setor = ${sector} `);
        return result;
    }catch( e){
        console.log(`erro ao buscar o produto: ${code}  no  setor : ${ sector }`, e);
    } 
}

 async function selectUltimaAlteracao(data:string ):Promise<prod_setor[] | undefined>{
      
    try{
             const sql= `SELECT *,
                     strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro 
                   FROM produto_setor 
                  where  data_recadastro   > ? ;`

                  
        let result:prod_setor[] = await db.getAllAsync(sql,[data] );

             
        return result;
    }catch( e){
        console.log(`erro os produtos nos setores, filtro por data: ${data}`, e);
    } 
}

async function selectByCodeProduct ( code:number ):Promise<prod_setor[] | undefined>{
    try{
        let result:prod_setor[] = await db.getAllAsync(`SELECT *,
                 -- strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM produto_setor 
                  where produto = ${ code }   `);
        return result;
    }catch( e){
        console.log(`erro ao buscar o produto: ${code} nos setores`, e);
    } 
}


type  selectCompleteProdSector
= {
    data_recadastro :  string,
    descricao_produto:  string,
    descricao_setor:  string,
    estoque: number, 
    produto: number,
    setor: number,
    local_produto:string,
    local1_produto:string
    local2_produto:string
    local3_produto:string
    local4_produto:string
}
 
/**
 * 
 * @param code codigo do produto a ser pesquisado
 * @returns 
 */
async function selectCompleteProdSector( code:number ):Promise<selectCompleteProdSector[] | undefined>{
        try{
            let result:selectCompleteProdSector[] = await db.getAllAsync(
                `SELECT p.codigo as produto,  ps.estoque, ps.setor, s.descricao as descricao_setor, p.descricao descricao_produto,
                  strftime('%Y-%m-%d %H:%M:%S',  ps.data_recadastro) AS data_recadastro,
            ps.local_produto,
            ps.local1_produto,
            ps.local2_produto,
            ps.local3_produto,
            ps.local4_produto 
                    FROM produto_setor ps  
                    join produtos as p on p.codigo = ps.produto 
                    join setores as s on s.codigo = ps.setor
                  where ps.produto = ${ code }   `);
        return result;
    }catch( e){
        console.log(`erro ao buscar o produto: ${code} nos setores`, e);
    }
}


async function update(obj: prod_setor  ): Promise<SQLiteRunResult | null | undefined > {

    try{

        const sql =  ` UPDATE produto_setor SET   `

            let conditions = [];
            let values=[]

            if(!obj.setor){
                 console.log("é necessario informar o setor ")
                 return null
                }

            if(!obj.produto) {
                 console.log("é necessario informar o produto ")
               return null
                }
            if(obj.estoque){
                conditions.push(' estoque = ? ');
                values.push(obj.estoque);
            }
            if(obj.local_produto){
                conditions.push(' local_produto = ? ');
                values.push(`${obj.local_produto}`);
            }
            if(obj.local1_produto){
                conditions.push(' local1_produto = ? ');
                values.push(`${obj.local1_produto}`);
            }
            if(obj.local2_produto){
                conditions.push(' local2_produto = ? ');
                values.push(`${obj.local2_produto}`);
            }
            if(obj.local3_produto){
                conditions.push(' local3_produto = ? ');
                values.push(`${obj.local3_produto}`);
            }
            if(obj.local4_produto){
                conditions.push(' local4_produto = ? ');
                values.push(`${obj.local4_produto}`);
            }
            if(obj.data_recadastro){
                conditions.push(' data_recadastro = ? ');
                values.push(`${obj.data_recadastro}`);
            }
            let whereClause = ` WHERE setor = ${obj.setor} AND produto = ${obj.produto};`
            let finalsql = sql + conditions.join(' , ') + whereClause;
           
            // console.log("SQL: ",finalsql,"  values: ", obj)

            let result = await db.runAsync( finalsql,values);
        console.log(` atualizado  produto codigo: ${obj.produto} no setor: ${obj.setor} `  );
 
    }catch(e   ){ console.log( `erro ao atualizar produto codigo: ${obj.produto} no setor: ${obj.setor} ` , e )}
}

 
async function create( obj:prod_setor ): Promise<SQLiteRunResult | any>{
    try{

        let result = await db.runAsync(
            `
            INSERT INTO produto_setor 
           (
              setor,
              produto,
              estoque,
              local_produto,
              local1_produto,
              local2_produto,
              local3_produto,
              local4_produto,
              data_recadastro 
            ) VALUES (
             ${obj.setor},
             ${obj.produto} ,
             ${obj.estoque} ,
            '${obj.local_produto}',
            '${obj.local1_produto}',
            '${obj.local2_produto}',
            '${obj.local3_produto}',
            '${obj.local4_produto}',
            '${obj.data_recadastro}'            
            );`
        )
        console.log(`Produto ${obj.produto} inserido com sucesso no setor ${obj.setor}`);
    }catch(e   ){ console.log( `erro ao inserir Produto ${obj.produto} no setor ${obj.setor}` , e )}
}

 

return {   selectAll, create, selectUltimaAlteracao, selectByCodeProductAndCodeSector, selectCompleteProdSector, selectByCodeProduct, update     } 
}