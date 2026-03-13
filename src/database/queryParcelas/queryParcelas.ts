import { useSQLiteContext } from "expo-sqlite"

export const useParcelas = ()=>{
    const db = useSQLiteContext();

    type parcela = {
        pedido:number,
        parcela:number,
        valor:number,
        vencimento:string
    } 

    async function create( parcela:parcela, code:number ){
        
        try{
            let result = await db.runAsync(
                ` INSERT INTO parcelas 
                (
                    pedido,
                    parcela,
                    valor,
                    vencimento
                ) VALUES (
                    ${code},
                    ${parcela.parcela},
                    ${parcela.valor},
                   '${parcela.vencimento}'
                )
                `
            )
            console.log(` parcela ${result.lastInsertRowId}  inserida com sucesso `,);
            return result.lastInsertRowId;
        }catch(e){ console.log(`erro ao gravar as parcelas ${e}` ) }
    }


    async function createByCode( parcela:parcela, code:number ){
        
        try{
            let result = await db.runAsync(
                ` INSERT INTO parcelas 
                (
                    pedido,
                    parcela,
                    valor,
                    vencimento
                ) VALUES (
                    ${code},
                    ${parcela.parcela},
                    ${parcela.valor},
                   '${parcela.vencimento}'
                )
                   
                `
            )
            console.log(` parcela ${result.lastInsertRowId}  inserida com sucesso `,);
            return result.lastInsertRowId;
        }catch(e){ console.log(`erro ao gravar as parcelas ${e}` ) }
    }





    async function selectByCodeOrder( code:number){
        try{
            let result = await db.getAllAsync(`SELECT *,strftime('%Y-%m-%d',  vencimento) AS vencimento  FROM parcelas where pedido = ${code}`);
           // console.log(result);
            return result
        }catch(e) { console.log(e)}
    }
    
     
    async function deleteByCodeOrder( code:number){
        try{
            await db.runAsync(` DELETE from parcelas where pedido = ${code}`)
            console.log(`deletado parcelas do orcamento codigo: ${code}`)
            return true;
         }catch(e){console.log(e)
            return false;
         }
     }

    return { selectByCodeOrder, create , deleteByCodeOrder}
}