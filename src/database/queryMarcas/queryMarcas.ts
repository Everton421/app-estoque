import { useSQLiteContext } from "expo-sqlite"




export type marca = {
    codigo:number,
    descricao:string,
     data_cadastro:string,
     data_recadastro:string 
 }

export const useMarcas = ()=> {


const db = useSQLiteContext();

 
 
  
    async function create(  marca:marca ) {
            try{
                let aux:any  = await selectByCode( marca.codigo ); 
                 const result = await  db.runAsync(
                     `
                     INSERT INTO marcas 
                     (codigo, descricao , data_cadastro, data_recadastro  
                     ) values ( ${marca.codigo},'${marca.descricao}', '${marca.data_cadastro}','${marca.data_recadastro}' )`);
                      console.log(`marca ${marca.descricao} registrada com sucesso! `)
            }catch( e ){ console.log(`erro ao cadastrar marca `,e) }
    }
 

    async function update(marca:marca , code:number) {
        try{
                let aux = await db.runAsync( `UPDATE marcas SET  
                        descricao = '${marca.descricao}',
                          data_cadastro ='${marca.data_cadastro}' ,
                         data_recadastro = '${marca.data_recadastro}'
                        where codigo = ${code} ` 
                    )
                console.log(`marca codigo : ${ code} atualizada com sucesso! `)
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
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro FROM marcas WHERE codigo = ${aux} `)
            //console.log(result);
            return result;
        }catch(e){ console.log(`erro ao consultar o marca com o codigo :  ${code}`,e)}
    }

    async function selectAll(){
        try{
            let result = await db.getAllAsync(`SELECT *,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  from marcas;`);
          //  console.log(result);
            return result;
        }catch(e){ console.log( "erro ao buscar as marcas ",e) }
    }  



    async function selectByDescription( descricao:string ){
        try{
            let result   = await db.getAllAsync   ( `SELECT * ,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro FROM marcas WHERE descricao like ?   `,  `%${descricao}%` )
            //console.log(result);
            return result;
        }catch(e){ console.log(`erro ao consultar o categoria ${descricao} `,e)}
    }
 
    return { selectAll, selectByCode, create,update,selectByDescription  } 
 
}