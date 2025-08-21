import { useSQLiteContext } from "expo-sqlite"


export type categoria = {
    codigo:number,
    descricao:string,
     data_cadastro:string,
     data_recadastro:string 
 }

export const useCategoria = ()=> {


const db = useSQLiteContext();

  
 
  
    async function create(  categoria:categoria ) {
            try{
                let aux:any  = await selectByCode( categoria.codigo ); 
                 const result = await  db.runAsync(
                     `
                     INSERT INTO categorias 
                     (codigo, descricao , data_cadastro, data_recadastro  
                     ) values ( ${categoria.codigo},'${categoria.descricao}', '${categoria.data_cadastro}','${categoria.data_recadastro}' )`);
                      console.log(`categoria ${categoria.descricao} registrada com sucesso! `)
            }catch( e ){ console.log(`erro ao cadastrar categoria `,e) }
    }
 

    async function update(categoria:categoria , code:number) {
        try{
                let aux = await db.runAsync( `UPDATE categorias SET  
                        descricao = '${categoria.descricao}',
                          data_cadastro ='${categoria.data_cadastro}' ,
                         data_recadastro = '${categoria.data_recadastro}'
                        where codigo = ${code} ` 
                    )
                console.log(`categoria codigo : ${ code} atualizada com sucesso! `)
                  return;
        }catch(e){ console.log(e) }
       
    }

    async function selectByCode( code:number ){
        let aux = 0;
        if( isNaN(code)){
            aux = Number(code);
        }else{
            aux = code ; 
        }
        try{
            let result   = await db.getAllAsync   ( `SELECT * ,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro FROM categorias WHERE codigo = ${aux} `)
            //console.log(result);
            return result;
        }catch(e){ console.log(`erro ao consultar o categoria com o codigo :  ${code}`,e)}
    }

    async function selectAll(){
        try{
            let result = await db.getAllAsync(`SELECT *,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  from categorias;`);
          //  console.log(result);
            return result;
        }catch(e){ console.log( "erro ao buscar as categorias ",e) }
    }  

    async function selectByDescription( descricao:string ){
        try{
            let result   = await db.getAllAsync   ( `SELECT * ,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro FROM categorias WHERE descricao like ?     `,  `%${descricao}%` )
            //console.log(result);
            return result;
        }catch(e){ console.log(`erro ao consultar o categoria ${descricao} `,e)}
    }
 
    return { selectAll, selectByCode, create,update ,selectByDescription } 
 
}