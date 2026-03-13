import { useSQLiteContext } from "expo-sqlite"

export const useItemsPedido = () =>{

const db = useSQLiteContext();

   type produto_pedido = {
        codigo:number,
        sequencia:number
        desconto:number,
        quantidade:number,
        preco:number,
        total:number,
        quantidade_separada:number
        quantidade_faturada:number
    }
        async function create(produto:produto_pedido, codeOrder:number){
            try{
                const slq =  `
                    INSERT INTO produtos_pedido 
                   (
                    pedido,
                    codigo,
                    desconto,
                    quantidade,
                    preco,
                    total,
                    quantidade_separada,
                    quantidade_faturada
                    ) VALUES (
                     ?,
                      ?,
                      ?,
                      ?,
                      ?,
                      ?,
                      ?,
                      ?
                    ) `;
                     const values = [ 
                        codeOrder,
                        produto.codigo,
                        produto.desconto,
                        produto.quantidade,
                        produto.preco,
                        produto.total,
                        produto.quantidade_separada,
                        produto.quantidade_faturada
                        ]
                let result = await db.runAsync(slq,values
                   
                )

                console.log(`produto inserido com sucesso para o orcamento codigo ${codeOrder} ${produto.codigo} `  );
            }catch(e   ){ console.log( `erro ao inserir produto do orcamento` , e )}
        }


        async function selectByCodeOrder( codeOrder:number ){
            try{

                const result = await db.getAllAsync(` SELECT pp.codigo , pp.pedido, pp.desconto, pp.preco, pp.quantidade, pp.total,
                                                        p.descricao

                                                        FROM produtos_pedido as pp
                                                        JOIN produtos as p on p.codigo = pp.codigo
                                                        WHERE pp.pedido = ${codeOrder}`)

                return result;
            }catch(e){console.log( `Erro ao consultar os produtos do pedido codigo: ${codeOrder} `, e )}
        }


        async function selectAll(  ){
            try{
                 const result = await db.getAllAsync(` SELECT pp.codigo , pp.pedido,  pp.desconto, pp.preco, pp.quantidade, pp.total,
                                                         p.descricao
 
                                                         FROM produtos_pedido pp
                                                         JOIN produtos p on p.codigo = pp.codigo
                                                         `)
                    
              //  console.log(result);
                return result;
            }catch(e){console.log(e)}
        }

        async function deleteByCodeOrder( code:number){
               try{
                   await db.runAsync(` DELETE from produtos_pedido where pedido = ${code}`)
                   console.log(`deletado itens do orcamento codigo: ${code}`)
                    return true;
                }catch(e){
                    console.log(e)
                    return false;
                }
        
            }

            async function selectProductByCodeOrder( codigoProduto:number, code:number){
                try{
                    let aux = await db.getAllAsync(`
                        SELECT pp.codigo , pp.pedido,  pp.desconto, pp.preco, pp.quantidade, pp.total, p.descricao
                                                         FROM produtos_pedido pp
                                                         JOIN produtos p on p.codigo = pp.codigo
                                                         where pp.pedido = ${code}
                                                            AND pp.codigo = ${codigoProduto}  `)
                        
                        
                     return aux;
                 }catch(e){
                     console.log(` Erro ao filtrar o produto ${codigoProduto } do orcamento ${code}`, e)
                 }
         
             }
 

            async function deleteProductByCodeOrder(  codigoProduto:number , code:number){
                try{
                    await db.runAsync(` DELETE from produtos_pedido where  codigo = ${codigoProduto} AND pedido = ${code}`)
                    console.log(`deletado iten  ${codigoProduto} do orcamento codigo: ${code}`)
                     return true;
                 }catch(e){
                     console.log(e)
                     return false;
                 }
         
             }



             async function update(produto:produto_pedido , codeOrder:number){
                try{
     
                    const sql =     `
                        UPDATE produtos_pedido SET 
                          desconto =  ?, 
                          quantidade =  ?,
                          preco =      ?,
                          total =  ?,
                          quantidade_separada =  ?,
                          quantidade_faturada=  ? 
                         WHERE codigo ? 
                          AND pedido = ?
                          `;

                    const values = [ 
                        produto.desconto,
                        produto.quantidade,
                        produto.preco,
                        produto.total,
                        produto.quantidade_separada,
                        produto.quantidade_faturada,
                        produto.codigo,
                        codeOrder
                      ]
                    let result = await db.runAsync(
                    sql, values
                    )
    
                    console.log('')
                    console.log(`produto ${produto.codigo} atualizado para o orcamento numero:  ${codeOrder}  `  );
                    console.log('')
                }catch(e   ){ console.log( `erro ao atualizar produto ${ produto.codigo} do orcamento` , e )}
            }


               async function updatByParam(produto:Partial< Omit<produto_pedido, 'codigo'>> ,codigo_produto:number, codeOrder:number){
                try{
     
                    const baseSql =     `
                        UPDATE produtos_pedido SET 
                           
                          `;

                  
                      const params=[];
                       const values=[];
                        if(produto.desconto){
                            params.push(" desconto = ? ");
                            values.push(produto.desconto);
                        }
               
                        if(produto.quantidade){
                            params.push(" quantidade = ? ");
                            values.push(produto.quantidade);
                        }
                        if(produto.preco){
                            params.push(" preco = ? ");
                            values.push(produto.preco);
                        }
                        if(produto.total){
                            params.push(" total = ? ");
                            values.push(produto.total);
                        }
                        if(produto.quantidade_separada){
                            params.push(" quantidade_separada = ? ");
                            values.push(produto.quantidade_separada);
                        }
                        if(produto.quantidade_faturada){
                            params.push(" quantidade_faturada = ? ");
                            values.push(produto.quantidade_faturada);
                        }
                        const whereClause = " WHERE codigo = ? AND pedido = ?  ";
                            values.push(codigo_produto) 
                            values.push(codeOrder) 

                                const finalSql = baseSql + params.join(' , ') + whereClause;

                    let result = await db.runAsync(
                    finalSql, values
                    )
    
                    console.log('')
                    console.log(`produto ${codigo_produto} atualizado para o orcamento numero:  ${codeOrder}  `  );
                    console.log('')
                }catch(e   ){ console.log( `erro ao atualizar produto ${ codigo_produto} do orcamento` , e )}
            }

        return { selectByCodeOrder, updatByParam,selectProductByCodeOrder,  create ,deleteByCodeOrder,selectAll ,deleteProductByCodeOrder, update}

}