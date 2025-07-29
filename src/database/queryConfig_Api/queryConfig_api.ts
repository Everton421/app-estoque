import { useSQLiteContext } from "expo-sqlite"

export const queryConfig_api = ()=>{

    const db = useSQLiteContext();

    type ApiConfig = {
        codigo?:number
        url: string,
        porta: number,
        token: string
        data_sinc:string,
        data_env:string
    }

    async function  select( codigo:number ):Promise<ApiConfig[] | undefined> {

        try{

            let data:ApiConfig[] = await db.getAllAsync(
                ` select * from api_config where codigo = ${codigo} `
            )
            return data;

        }catch(e){ console.log(`erro ao consultar as configurações da api `, e )}

    }

    async function update( api:ApiConfig ){
      try{
         await db.runAsync( ` update api_config set  
                     url   ='${api.url}',
                     porta = ${api.porta},
                     token = '${api.token}',
                     data_sinc = '${api.data_sinc}',
                     data_env ='${api.data_env}'
                     where codigo = ${api.codigo}
                    ` )
            }catch(e){ console.log(`Erro ao tentar atualizar as configurações da api `, e)}
        }

         
        type partialApiConf = {
             codigo :number
             url?: string,
             porta?: number,
             token?: string
             data_sinc?:string,
             data_env?:string
        }
    async function updateByParam( api:partialApiConf  ){
      
       
      let sql = ` update api_config set `
      let params =[]
      let values=[]
      let finalSql = sql;
    if(api.url){
        params.push(' url = ? ')
        values.push(`${api.url}`)
    }
    if(api.porta){
        params.push(' porta = ? ')
        values.push(`${api.porta}`)
    }
    if(api.token){
        params.push(' token = ? ')
        values.push(`${api.token}`)
    }
    if(api.data_sinc){
        params.push(' data_sinc = ? ')
        values.push(`${api.data_sinc}`)
    }
    if(api.data_env){
        params.push(' data_env = ? ')
        values.push(`${api.data_env}`)

        let whereClause = ` WHERE codigo = ${api.codigo };`;
    if( params.length > 0 ){
        finalSql = sql + params.join(' , ') + whereClause
    }
  
        try{
           // console.log("SQL : ", finalSql, " VALUES : ",values)
         await db.runAsync( finalSql, values )
            }catch(e){ console.log(`Erro ao tentar atualizar as configurações da api `, e)}
        }
}

 async function create( api:ApiConfig ){

    try{
        let aux = await db.runAsync(
            `INSERT INTO api_config 
            ( codigo, url, porta , token, data_sinc, data_env )
             VALUES ( ${api.codigo}, ${api.porta}, '${api.token}','${api.url}','${api.data_sinc}' ,'${api.data_env}' ) 
            `)
            return aux;
    } catch ( e) { console.log(' erro ao cadastrar a configuracao da api ',e)} 
    
 }

    return { select, update ,updateByParam, create}
}