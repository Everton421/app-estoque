import { useSQLiteContext } from "expo-sqlite"

export type  setor = {
    codigo : number,
    descricao:string,
    data_cadastro:string,
    data_recadastro:string 

}


export const useSetores = ()=>{
 
const db = useSQLiteContext();



async function selectAll(){
    try{
        let result = await db.getAllAsync(`SELECT * ,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM setores `);
        return result;
    }catch( e){
        console.log(`erro ao buscar setores `, e);
    } 
}
 
async function selectByDescription(descricao:string){
    try{
        
            let sql = `SELECT * ,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM setores `
                  
                  if( descricao !== ''){
                  sql =   `SELECT * ,
                        strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                        strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM setores
                            where codigo like '${descricao} or descricao like '${descricao}'  
                        `
                  }
        let result = await db.getAllAsync( sql);

                  return result;
    }catch( e){
        console.log(`erro ao buscar setores `, e);
    } 
}
async function selectByCode( code:number ):Promise<setor[] | undefined>{
    try{
        let result:setor[] = await db.getAllAsync(`SELECT *,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  FROM setores where codigo = ${ code } `);
        return result;
    }catch( e){
        console.log(`erro ao buscar setores codigo : ${ code }`, e);
    } 
}

 

async function update(setor:Partial<setor> ){
    try{

        let result = await db.runAsync(
            `
            UPDATE setores SET 
            codigo = ${setor.codigo}, 
            descricao = '${setor.descricao}',
            data_cadastro ='${setor.data_cadastro}' ,
            data_recadastro = '${setor.data_recadastro}' 
             WHERE codigo = ${setor.codigo}
              `
        )

        console.log(` atualizado setor codigo: ${setor.codigo} `  );
 
    }catch(e   ){ console.log( `erro ao  atualizar setor ${ setor.codigo}  ` , e )}
}

 
async function create( setor:setor ){
    try{

        let result = await db.runAsync(
            `
            INSERT INTO setores 
           (
            codigo,
            descricao,
            data_cadastro,
            data_recadastro 
            ) VALUES (
            ${setor.codigo},
            '${setor.descricao}',                
            '${setor.data_cadastro}',
            '${setor.data_recadastro}'           
            );`
        )

        console.log(`setor codigo ${setor.codigo} registrado com sucesso `);
    }catch(e   ){ console.log( `erro ao inserir setor codigo ${setor.codigo}` , e )}
}

 

return {   selectAll, create,  selectByCode, selectByDescription,update     } 
}