import { useSQLiteContext } from "expo-sqlite";
import { typeFotoProduto } from "../../screens/cadastro_produto/types/fotos";

export const useFotosProdutos = ()=> {

const db = useSQLiteContext();

    
 

async function create(  foto:typeFotoProduto  ) {
    try{
      
      //  let aux:any  = await selectByCode( marca.codigo ); 
 
         const result = await  db.runAsync(
              
          `  INSERT INTO fotos_produtos 
             (
            produto,
            sequencia,
            descricao,
            link,
            foto,
            data_cadastro,
            data_recadastro
             ) 
             values
             ( 
             ${foto.produto} ,
             ${foto.sequencia},
             '${foto.descricao}',
             '${foto.link}',
             '${foto.foto}',
             '${foto.data_cadastro}',
             '${foto.data_recadastro}'
              
             )`);
           
              console.log(`foto ${foto.link} registrada com sucesso! `)
    }catch( e ){ console.log(`erro ao registrar foto `,e) }
}

async function update(  foto:typeFotoProduto,codigo:number ) {
    try{
    let aux = await db.runAsync( 
        `UPDATE fotos SET
        produto  = ${foto.produto},  
        sequencia  = ${foto.sequencia}, 
        descricao  = '${foto.descricao}', 
        link  = '${foto.link}', 
        foto  = '${foto.foto}', 
        data_cadastro  ='${foto.data_cadastro}', 
        data_recadastro  = '${foto.data_recadastro}',   
        WHERE produto =  ${codigo}`
         )
         console.log('foto atualizada com sucesso ')
        }catch(e){
            console.log('erro ao atualizar foto do produto ', codigo)
        }
}

async function selectAll(){
        try{
            let result = await db.getAllAsync(`SELECT *,
                  strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
                  strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  from fotos_produtos;`);
          //  console.log(result);
            return result;
        }catch(e){ console.log( "erro ao buscar as fotos ",e) }
}

async function selectByCode ( codigo:number):Promise< typeFotoProduto[]   |undefined > {
    try{
        let result:typeFotoProduto[] = await db.getAllAsync(`SELECT *,
              strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
              strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  from fotos_produtos 
              where produto = ${codigo}
              ;`);
      //  console.log(result);
        return result;
    }catch(e){ console.log( "erro ao buscar as fotos ",e) }
}

async function selectByCodeAndSequenci( codigo:number, sequencia:number) {
    try{
        let result = await db.getAllAsync(`SELECT *,
              strftime('%Y-%m-%d',  data_cadastro) AS data_cadastro,
              strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro  from fotos_produtos 
              where produto = ${codigo} and sequencia = ${sequencia}
              ;`);
      //  console.log(result);
        return result;
    }catch(e){ console.log( "erro ao buscar as fotos ",e) }
}


async function deleteAll(){
    try{
        await db.execAsync('DELETE   FROM fotos_produtos;')
    }catch(e){
        console.log('erro ao excluir fotos dos produtos',e)
    }
}

async function deleteByCodeProduct(codigo:number){
    try{
        await db.execAsync(`DELETE   FROM fotos_produtos where produto = ${codigo};`)
    }catch(e){
        console.log('erro ao excluir fotos dos produtos',e)
    }
}
 return { create, selectAll, deleteAll, selectByCode,update,selectByCodeAndSequenci,deleteByCodeProduct }

}