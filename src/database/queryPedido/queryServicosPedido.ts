import { useSQLiteContext } from "expo-sqlite"

export const useServicosPedido = () =>{

const db = useSQLiteContext();

type servico_pedido = {
    codigo:number,
    desconto:number,
    quantidade:number,
    valor:number,
    total:number 
}
        async function create(servico:servico_pedido, codeOrder:number){
            try{
 
                let result = await db.runAsync(
                    `
                    INSERT INTO servicos_pedido 
                   (
                    pedido,
                    codigo,
                    desconto,
                    quantidade,
                    valor,
                    total 
                    ) VALUES (
                    ${codeOrder},
                    ${servico.codigo},
                    ${servico.desconto},
                    ${servico.quantidade},
                    ${servico.valor},
                    ${servico.total} 
                    ) `
                )

                console.log('')
                console.log(`servico inserido com sucesso para o orcamento codigo ${codeOrder} ${servico.codigo} `  );
                console.log('')
            }catch(e   ){ console.log( `erro ao inserir servico do orcamento` , e )}
        }

        async function update(servico:servico_pedido, codeOrder:number){
            try{
 
                let result = await db.runAsync(
                    `
                    UPDATE servicos_pedido SET 
                    
                    desconto = ${servico.desconto}, 
                    quantidade = ${servico.quantidade},
                    valor =     ${servico.valor},
                    total = ${servico.total} 
                     WHERE codigo = ${servico.codigo}
                      AND pedido = ${codeOrder}
                      `
                )

                console.log('')
                console.log(`servico ${servico.codigo} atualizado para o orcamento numero:  ${codeOrder}  `  );
                console.log('')
            }catch(e   ){ console.log( `erro ao atualizar servico do orcamento` , e )}
        }

        async function selectByCodeOrder( codeOrder:any ){
            let code = parseInt(codeOrder)

            try{

                const result = await db.getAllAsync(` SELECT sp.codigo , sp.pedido, sp.desconto, sp.valor, sp.quantidade, sp.total,
                                                        s.aplicacao

                                                        FROM servicos_pedido as sp
                                                        JOIN servicos as s on s.codigo = sp.codigo
                                                        WHERE sp.pedido = ${codeOrder}`)

                return result;
            }catch(e){
                console.log(`Erro ao consultar os servicos do pedido codigo: ${codeOrder}`, e)
                console.log(` SELECT sp.codigo , sp.pedido, sp.desconto, sp.valor, sp.quantidade, sp.total,
                                                        s.aplicacao

                                                        FROM servicos_pedido as sp
                                                        JOIN servicos as s on s.codigo = sp.codigo
                                                        WHERE sp.pedido = ${codeOrder}`)
            }
        }


        async function selectServiceByCodeOrder(codeService:number,  codeOrder:number ){

            try{
                let code = parseInt(codeOrder)
            
                const result = await db.getAllAsync(` SELECT sp.codigo , sp.pedido, sp.desconto, sp.valor, sp.quantidade, sp.total,
                                                        s.aplicacao

                                                        FROM servicos_pedido as sp
                                                        JOIN servicos as s on s.codigo = sp.codigo
                                                        WHERE 
                                                        sp.pedido = ${code} AND 
                                                        sp.codigo = ${codeService}
                                                        `)

                return result;
            }catch(e){console.log(e)}
        }



        async function selectAll(  ){
            try{
                 const result = await db.getAllAsync(` SELECT sp.codigo , sp.pedido, sp.desconto, sp.valor, sp.quantidade, sp.total,
                                                        s.aplicacao
 
                                                         FROM servicos_pedido sp
                                                         JOIN servicos s on s.codigo = sp.codigo
                                                         `)
                    
              //  console.log(result);
                return result;
            }catch(e){console.log(e)}
        }

        async function deleteByCodeOrder( code:number){
               try{
                let codeOrder = parseInt(code)

                   await db.runAsync(` DELETE from servicos_pedido where pedido = ${codeOrder}`)
                   console.log(`deletado servico do orcamento codigo: ${codeOrder}`)
                    return true;
                }catch(e){
                    console.log(e)
                    return false;
                }
        
            }



            async function deleteServiceByCodeOrder(codeService:number,  codeOrder:number ){
                try{
                let code = parseInt(codeOrder)

                    const result = await db.getAllAsync(` DELETE 
                                                            FROM servicos_pedido  
                                                            WHERE 
                                                             pedido = ${code} AND 
                                                             codigo = ${codeService}
                                                            `)
                        console.log(`deletado servico ${codeService} do orcamento codigo: ${codeOrder}`)
                    return result;
                }catch(e){console.log(e)}
            }


        return { update, deleteServiceByCodeOrder, selectServiceByCodeOrder, selectByCodeOrder, create ,deleteByCodeOrder,selectAll }

}