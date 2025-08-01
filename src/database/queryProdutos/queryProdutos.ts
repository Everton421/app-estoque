import { useSQLiteContext } from "expo-sqlite";
import { formatItem } from "../../services/formatStrings";
import { useFotosProdutos } from "../queryFotosProdutos/queryFotosProdutos";

type foto= { link:string}
 export type produto = {
          codigo:number,
          estoque?:number,
          preco?:number,
         unidade_medida:string
        grupo?:number,
        origem?:string,
        descricao:string,
        ativo?:string,
        sku?:string,
        marca:number,
        class_fiscal:string,
        cst:string,
        num_fabricante:string,
        num_original:string,
        observacoes1:string,
        observacoes2:string,
        observacoes3:string,
        data_cadastro:string,
        data_recadastro:string,
        tipo?:string
      fotos?: foto[]
    }
    
export const useProducts = ()=>{
 
    const db = useSQLiteContext();
    const formataDados =  formatItem();

    const useQueryFotos = useFotosProdutos()

      
    
        async function selectByCode( codigo:number ) {
            let aux = 0;
            if( isNaN(codigo)){
                aux = Number(codigo);
            }else{
                aux = codigo ; 
            }
                const result = await db.getAllAsync(`SELECT * FROM produtos where codigo = ${codigo}`);
           // console.log(result);
            return result;
          }

          async function selectAll() {
                 const result = await db.getAllAsync(
                  `SELECT * 
                  FROM produtos
                  `);
          //  console.log(result);
                 return result;
          }

          async function selectAllLimit(limit:number) {
            const result = await db.getAllAsync(
             `   SELECT p.*, sum(ps.estoque ) as estoque 
                  from produtos as p
                  join produto_setor   ps on p.codigo = ps.produto
              limit ${limit}
             `);
     //  console.log(result);
            return result;
     }

          
          async function selectByDescription( query:any, limit:number ) {
         
              let sql = `
                  SELECT 
                  p.*  , 
                    coalesce( sum(ps.estoque ) , 0) as estoque 
                  from produtos as p
                  left  join produto_setor 
                     ps on p.codigo = ps.produto  
                 `

                  let conditions = [ ]
                  let values = []
                  if(query != ''){
                    conditions.push(' p.descricao like ? ')
                    values.push(`%${query}%`)
                  }
                   if(query != ''){
                     conditions.push('  p.codigo like ? ')
                     values.push(`%${query}%`)
                   }
          
                  let whereClause = ' WHERE '
                  
                     let finalsql = sql
                  if( conditions.length > 0 ){
                     finalsql = sql +  whereClause + conditions.join(' OR ')  + ` group by p.codigo limit  ${limit} ` 
                  }else{
                   finalsql = sql  + ' by p.codigo ';
                  }
            const result = await db.getAllAsync(finalsql, values ) 
                
            return result;

             }
     
    type query ={
      chave: 'codigo' | 'num_fabricante' | 'num_original' | 'sku'
      value:any
    }
          async function findByParam( query:query  ) {
         
              let sql = `
                  SELECT 
                  p.*  , 
                    coalesce( sum(ps.estoque ) , 0) as estoque 
                  from produtos as p
                  left  join produto_setor 
                     ps on p.codigo = ps.produto  
                 `

                  let conditions = [ ]
                  let values = []
                  
                  if(query.chave === 'codigo'  ){
                    conditions.push(' p.codigo like = ? ')
                    values.push(`${query.value}`)
                  }

                   if(query.chave === 'num_fabricante'){
                     conditions.push('  p.num_fabricante = ? ')
                     values.push(`${query.value}`)
                   }
                 if( query.chave ===  'num_original'){
                     conditions.push('  p.num_original = ? ')
                     values.push(`${query.value}`)
                   }

                    if( query.chave ===  'sku'){
                     conditions.push('  p.sku = ? ')
                     values.push(`${query.value}`)
                   }
                  let whereClause = ' WHERE '
                  
                     let finalsql = sql
                  if( conditions.length > 0 ){
                     finalsql = sql +  whereClause + conditions.join(' OR ')  + ` group by p.codigo limit 1 ` 
                  }else{
                   finalsql = sql  + '  group by p.codigo ';
                  }
               //   console.log("SQL: ",finalsql,"value: ", values)
            const result = await db.getAllAsync(finalsql, values ) 
                
            return result;

             }

             async function selectProductAndImgsByDescription( query:any, limit:number ) {
              const result = await db.getAllAsync(
                `SELECT p.codigo, p.descricao, p.preco, p.estoque   FROM produtos as p
                WHERE  p.descricao like ? OR  p.codigo like ? LIMIT ?`, `%${query}%`, `%${query}%`,`${limit}` );
            //  console.log(result);

                  if(result.length > 0 ){
                     result.forEach( async (i:any)=>{
                          let fotos = await useQueryFotos.selectByCode(i.codigo)
                          if(fotos && fotos.length > 0 ){
                            i.fotos = fotos;
                          }else{
                            i.fotos = [];
                          }
                       
                         })
                  }
                  console.log(result)  

                  return result;

               }

            /// cria produto sem Informar o codigo 
            async function create( produto:produto){

              const descricao  = formataDados.normalizeString(produto.descricao)
               const observacoes1 =   formataDados.normalizeString(produto.observacoes1);
               const observacoes2 =   formataDados.normalizeString(produto.observacoes2);
               const observacoes3 =   formataDados.normalizeString(produto.observacoes3);

               const data_recadastro = formataDados.formatDateTime(produto.data_recadastro);
               const data_cadastro = formataDados.formatDate(produto.data_cadastro);


              const result = await db.runAsync( 

                      `INSERT INTO produtos 
                      ( 
                       estoque,
                       preco,
                       unidade_medida,
                       grupo,
                       origem,
                       descricao,
                       ativo,
                       sku, 
                       marca, 
                       class_fiscal,
                       cst,
                       num_fabricante,
                       num_original,
                       data_cadastro,
                       data_recadastro,
                       observacoes1,
                       observacoes2,
                       observacoes3,
                       tipo  
                       )
                       VALUES
                        (
                         ${produto.estoque},
                         ${produto.preco},
                       '${produto.unidade_medida}',
                         ${produto.grupo} ,
                        '${produto.origem}', 
                        '${descricao}',
                        '${produto.ativo}',
                        '${produto.sku}',
                         ${produto.marca}, 
                        '${produto.class_fiscal}',
                        '${produto.cst}', 
                        '${produto.num_fabricante}',
                        '${produto.num_original}',
                        '${data_cadastro}',
                        '${data_recadastro}',
                        '${observacoes1}',
                        '${observacoes2}', 
                        '${observacoes3}',
                        '${produto.tipo}'
                            );`
                  );
                  console.log(result);
            }

            
            async function update(produto:produto, code:number ){

              const descricao  = formataDados.normalizeString(produto.descricao)
              const observacoes1 =   formataDados.normalizeString(produto.observacoes1);
              const observacoes2 =   formataDados.normalizeString(produto.observacoes2);
              const observacoes3 =   formataDados.normalizeString(produto.observacoes3);

                const data_recadastro = formataDados.formatDateTime(produto.data_recadastro);
                const data_cadastro = formataDados.formatDate(produto.data_cadastro);

                let verifCode:any[]; 
                try{
                      verifCode = await selectByCode(code);
                      if(verifCode.length > 0 ){
                         // console.log('ja existe produto cadastrado com o codigo ', code );
                        //  console.log(verifCode);
                  let aux = await db.runAsync( 
                      `UPDATE produtos SET  
                      estoque         = ${produto.estoque},  
                      preco           = ${produto.preco},
                      unidade_medida  ='${produto.unidade_medida}',
                      grupo           = ${produto.grupo},  
                      origem          = '${produto.origem}',
                      descricao       = '${descricao}',
                      ativo           = '${produto.ativo}',
                      sku             = '${produto.sku}',    
                      marca           = ${produto.marca},
                      class_fiscal    = '${produto.class_fiscal}',   
                      cst             = '${produto.cst}', 
                      num_fabricante  = '${produto.num_fabricante}',
                      num_original  = '${produto.num_original}',
                      data_cadastro   = '${data_cadastro}',
                      data_recadastro = '${data_recadastro}',
                      observacoes1    = '${observacoes2}', 
                      observacoes2    = '${observacoes2}',
                      observacoes3    = '${observacoes3}',  
                      tipo            = '${produto.tipo}'
                      WHERE codigo =  ${code}`
                      )
                         
                  console.log( 'produto atualizado codigo: ',code)
                          }else{
                            console.log('nao foi encontrado produto com o codigo:', code)
                          }
                }catch(e){ console.log(` Erro ao tentar atualizar o produto codigo: ${code} `,e) }
               
            }


            /// cria produto informando  o codigo 
            async function createByCode( produto:produto, code:number ){
              const descricao  = formataDados.normalizeString(produto.descricao)
              const observacoes1 =   formataDados.normalizeString(produto.observacoes1);
              const observacoes2 =   formataDados.normalizeString(produto.observacoes2);
              const observacoes3 =   formataDados.normalizeString(produto.observacoes3);

              const data_recadastro = formataDados.formatDateTime(produto.data_recadastro);
              const data_cadastro = formataDados.formatDate(produto.data_cadastro);

                let verifCode:any[]; 
                try{
                      verifCode = await selectByCode(code);
                      if(verifCode.length > 0 ){
                          console.log('ja existe produto cadastrado com o codigo ', code );
                        //  console.log(verifCode);
                         // return;
                          }
                }catch(e){ console.log(e) }

                  const result = await db.runAsync( 
                      `INSERT INTO produtos 
                      ( 
                      codigo, 
                      estoque,
                      preco,
                      unidade_medida,
                      grupo,
                      origem,
                      descricao,
                      ativo,
                      sku,
                      marca,
                      class_fiscal,
                      cst,
                      num_fabricante,
                      num_original,
                      data_cadastro,
                      data_recadastro,
                      observacoes1,
                      observacoes2,
                      observacoes3,
                      tipo  )
                       VALUES
                        ( 
                       ${code} ,
                       ${produto.estoque},
                       ${produto.preco},
                      '${produto.unidade_medida}',
                       ${produto.grupo},
                      '${produto.origem}',
                      '${descricao}',
                      '${produto.ativo}',
                      '${produto.sku}', 
                       ${produto.marca},
                      '${produto.class_fiscal}' ,
                      '${produto.cst}',
                      '${produto.num_fabricante}',
                      '${produto.num_original}',
                      '${data_cadastro}',
                      '${data_recadastro}',
                      '${observacoes1}',
                      '${observacoes2}',
                      '${observacoes3}',
                      '${produto.tipo}'
                       );`
                  );
                 // console.log(result);
                  console.log( 'produto cadastrado codigo: ',result.lastInsertRowId)
            }
            
                

            async function deleteByCode( codigo:number ){
                    const statement = await db.prepareAsync(` DELETE FROM produtos WHERE codigo = $codigo`)
                    try{
                        await statement.executeAsync({$codigo:codigo})
                        console.log(' produto deletado com sucesso! ')
                    }catch(e){ console.log(e) }
             }

            async function deleteAll(){
                const statement = await db.prepareAsync(` DELETE FROM produtos`)
                try{
                    await statement.executeAsync()
                    console.log(' produtos deletado com sucesso! ')
                }catch(e){ console.log(e) }
             }



        return { update ,selectAllLimit, findByParam, selectByCode, create, deleteByCode, selectAll, createByCode,deleteAll,selectByDescription ,selectProductAndImgsByDescription }
    }

        
         

