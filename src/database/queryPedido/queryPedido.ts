import { useSQLiteContext } from "expo-sqlite"
import { useItemsPedido } from "./queryItems";
import { useParcelas } from "../queryParcelas/queryParcelas";
import { useProducts } from "../queryProdutos/queryProdutos";
import { useClients } from "../queryClientes/queryCliente";
import { useServicosPedido } from "./queryServicosPedido";
import { parcela, pedido, pedidoApi, produto_pedido, servico_pedido } from "./types/types-pedido";


export const usePedidos = () =>{

    const db =  useSQLiteContext();
  const queryItems          = useItemsPedido();
  const queryParcelas       = useParcelas(); 
  const queryProdutos       = useProducts();
  const queryClientes       = useClients();
  const queryServicosPedido =  useServicosPedido();
      
 

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda se o mês for menor que 10
  const day = String(now.getDate()).padStart(2, '0'); // Adiciona zero à esquerda se o dia for menor que 10

  return `${year}-${month}-${day}`;
};

    async function create( pedido:pedidoApi, id:string, id_externo:any, id_interno:any ){

      let data = getCurrentDate();
      try{
        let result = await db.runAsync(
            ` INSERT INTO pedidos 
            (
            codigo,
            id,
            id_externo,
            id_interno,
            situacao,
            situacao_separacao,
            contato,
            frete,
            vendedor,
            descontos,
            forma_pagamento,
            enviado,
            observacoes,
            quantidade_parcelas,
            total_geral,
            total_produtos,
            total_servicos,
            cliente,
            data_cadastro,
            data_recadastro,
            veiculo,
            tipo_os,
              tipo  
            ) VALUES (
             ${ pedido.codigo}, 
            '${id}',
            '${id_externo}',
            '${id_interno}',
            '${pedido.situacao}',
            '${pedido.situacao_separacao}',
            '${ pedido.contato}',
             ${ pedido.frete} ,
             ${ pedido.vendedor},
             ${ pedido.descontos},
             ${ pedido.forma_pagamento},
             '${pedido.enviado}',
            '${ pedido.observacoes}',
             ${ pedido.quantidade_parcelas},
             ${ pedido.total_geral},
             ${ pedido.total_produtos},
             ${ pedido.total_servicos},
             ${ pedido.cliente.codigo},
            '${ pedido.data_cadastro }',
            '${pedido.data_recadastro}',
             ${ pedido.veiculo},
             ${ pedido.tipo_os},
             ${ pedido.tipo}
            )` 
        );
  

        console.log(' orcamento inserido codigo : ' ,result.lastInsertRowId);
        return result.lastInsertRowId;
        }catch( e ){ console.log(` ocorreu um erro ao gravar o orcamento `,e)}
    
        
      }

      async function createByCode( pedido:pedidoApi , code:number, id:string, id_externo:string,id_interno:any ){

        let data = getCurrentDate();
        try{
            if(pedido.codigo_site > 0 ) {
              pedido.enviado = 'S'
            }
          
          let result = await db.runAsync(
              ` INSERT INTO pedidos 
              (
              codigo,
              id,
              id_externo,
              id_interno,
              situacao,
              situacao_separacao,
              contato,
              frete,
              vendedor,
              descontos,
              forma_pagamento,
              enviado,
              observacoes,
              quantidade_parcelas,
              total_geral,
              total_produtos,
              total_servicos,
              cliente,
              data_cadastro,
              data_recadastro,
              veiculo,
              tipo_os,
                tipo  
              ) VALUES (
              ${code}, 
              '${id}',
              '${id_externo}',
              '${id_interno}',
              '${pedido.situacao}',
             '${pedido.situacao_separacao}',
              '${ pedido.contato}',
               ${pedido.frete},
               ${ pedido.vendedor},
               ${ pedido.descontos},
               ${ pedido.forma_pagamento},
               '${pedido.enviado}',
              '${ pedido.observacoes}',
               ${ pedido.quantidade_parcelas},
               ${ pedido.total_geral},
               ${ pedido.total_produtos},
               ${ pedido.total_servicos},
               ${ pedido.cliente.codigo},
              '${ pedido.data_cadastro}',
              '${pedido.data_recadastro}',
               ${ pedido.veiculo},
               ${ pedido.tipo_os},
               ${ pedido.tipo}
              )` 
          );
    
       
  
           console.log(' orcamento inserido codigo : ' ,result.lastInsertRowId);
          return result.lastInsertRowId;
          }catch( e ){ console.log(` ocorreu um erro ao gravar o orcamento `,e)}
      
          
        }
  async function selectByCode( code:number ) {
      try{

        let result = await db.getAllAsync(
          `SELECT
          p.codigo,
          p.id,
          p.id_externo,
          p.id_interno,
          c.codigo as codigo_cliente,
          p.contato,
          p.quantidade_parcelas,
          c.nome,
          p.situacao,
          p.situacao_separacao,
          p.observacoes,
          p.descontos,
          p.forma_pagamento,
         p.frete,
          p.enviado,
          p.vendedor,
          p.total_geral,
          p.total_produtos,
          p.total_servicos,
          p.veiculo,
          strftime('%Y-%m-%d', p.data_cadastro) AS data_cadastro,
          strftime('%Y-%m-%d %H:%M:%S', p.data_recadastro) AS data_recadastro,
          p.tipo_os,
          p.tipo
          FROM pedidos p
          JOIN  clientes c on c.codigo = p.cliente
          WHERE p.codigo = ${code}`
        );
        return result;
      }catch(e){console.log(e)}
  }

  async function selectByCode2( code:number ) {
    try{
      let result = await db.getAllAsync(
        `SELECT
         codigo,
           id,
          id_externo,
          id_interno,
         contato,
         quantidade_parcelas,
         situacao,
           situacao_separacao,
         descontos,
         frete,
         forma_pagamento,
           enviado,
         observacoes,
         vendedor,
         total_geral,
         total_produtos,
         total_servicos,
         veiculo,
         strftime('%Y-%m-%d', data_cadastro) AS data_cadastro,
         strftime('%Y-%m-%d %H:%M:%S',  data_recadastro) AS data_recadastro,
         tipo_os,
         tipo
        FROM pedidos  
        WHERE codigo = ${code}`
      );
      return result;
    }catch(e){console.log(e)}
}


    async function selectAll(){
        try{ 
        let result = await db.getAllAsync(`SELECT 
          p.codigo,
          p.id,
          p.id_externo,
          p.id_interno,
          c.nome,
          p.contato,
          c.codigo as codigo_cliente,
          p.situacao,
         p.frete,
          p.descontos,
          p.observacoes,
          p.forma_pagamento,
          p.enviado,
          p.total_geral,
          p.total_produtos, 
          p.veiculo,
          strftime('%Y-%m-%d', p.data_cadastro) AS data_cadastro,
          strftime('%Y-%m-%d %H:%M:%S', p.data_recadastro) AS data_recadastro,
          p.vendedor,
          p.tipo_os,
          p.tipo
          FROM pedidos p
          JOIN  clientes c on c.codigo = p.cliente
          `);
        //console.log(result);
          return result;
          }catch(e){ console.log(' erro ao consultar os pedidos! ',e) }
    }

      async function findByTipe( tipo:number, vendedor:number ){
        try{ 
        let result = await db.getAllAsync(`SELECT 
          p.codigo,
          p.id,
          p.id_externo,
          c.nome,
          p.contato,
          c.codigo as codigo_cliente,
          p.situacao,
        p.situacao_separacao,
        p.frete,

          p.observacoes,
          p.descontos,
          p.forma_pagamento,
          p.enviado,
          p.total_geral,
          p.total_produtos, 
          p.total_servicos,
          p.data_cadastro,
          p.veiculo,
          strftime('%Y-%m-%d', p.data_cadastro) AS data_cadastro,
          strftime('%Y-%m-%d %H:%M:%S', p.data_recadastro) AS data_recadastro,
          p.vendedor,
          p.tipo_os,
          p.tipo
          FROM pedidos p
          JOIN  clientes c on c.codigo = p.cliente
          WHERE p.tipo ='${tipo}' AND p.vendedor =  ${vendedor}         
          `);
      //   console.log(result);
          return result;
          }catch(e){ console.log(` erro ao consultar os pedidos  do vendedor : ${vendedor}  `,e) }
    }

    type queryOrder = { 
      tipo:number,
      vendedor:number,
      data:any,
      situacao:string
      input:string
    }
    async function newSelect ( query: Partial<queryOrder> ) {
      try{ 

          let sql = `SELECT 
        p.codigo,
        p.id,
        p.id_externo,
        p.id_interno,
        c.nome,
        p.contato,
        c.codigo as codigo_cliente,
        p.situacao,
        p.situacao_separacao,
        p.observacoes,
        p.descontos,
        p.frete,
        p.forma_pagamento,
        p.enviado,
        p.total_geral,
        p.total_produtos, 
        p.total_servicos,
        p.data_cadastro,
        p.veiculo,
        strftime('%Y-%m-%d', p.data_cadastro) AS data_cadastro,
        strftime('%Y-%m-%d %H:%M:%S', p.data_recadastro) AS data_recadastro,
        p.vendedor,
        p.tipo_os,
        p.tipo
        FROM pedidos p
        JOIN  clientes c on c.codigo = p.cliente
          `;

          let conditions = []
          let values = []

          let inputConditions = []
          let inputValues = []

          if(query.tipo){
              conditions.push( ' p.tipo = ? ' );
            values.push( query.tipo );
          }
          if( query.vendedor ){
             conditions.push( ' p.vendedor = ? ' );
             values.push( query.vendedor );
          }
       if( query.data ){
             conditions.push( ' p.data_cadastro >= ? ' );
             values.push( query.data );
          }

            if( query.input){
              inputConditions.push(`  AND  c.nome like '%${query.input}%' `)
            }
          if( query.input){
              inputConditions.push( ` p.id like '%${query.input}%' ` )
            }
          if( query.input){
               inputConditions.push(` p.id_externo like  '%${query.input}%' `)
             }

       if (query.situacao !== '*'){
            conditions.push( ' p.situacao = ? ' );
             values.push( query.situacao );
          }

      let finalSql= sql;

              finalSql = sql + ' WHERE '+ conditions.join(' AND ') +   inputConditions.join(' OR ') +' ORDER BY p.data_cadastro' ;

        let result = await db.getAllAsync(finalSql,values );
       
       return result;
        }catch(e){ console.log(` erro ao consultar os pedidos  do vendedor : ${query.vendedor}  `,e) }
  }


type resultQuery= {
     codigo: number,
 codigo_cliente : number,
 contato : string,
 data_cadastro: string,
 data_recadastro: string,
 descontos : 0,
 enviado : 'S' | 'N',
 forma_pagamento : number
 id:  string
 id_externo: number
 id_interno : number
 nome : string,
 observacoes :  string ,
situacao: string,
tipo : number,
tipo_os : number,
total_geral : number
total_produtos : number
total_servicos : number
veiculo : number
vendedor : number
}
      type query ={
      chave: 'codigo' | 'id_interno' | 'id_externo'  
      value:any
    }

     async function findByParam ( query:query  ) {
      try{ 

          let sql = `SELECT 
        p.codigo,
        p.id,
        p.id_externo,
        p.id_interno,
        c.nome,
        p.contato,
        c.codigo as codigo_cliente,
        p.situacao,
        p.situacao_separacao,
        p.observacoes,
        p.frete,
        p.descontos,
        p.forma_pagamento,
        p.enviado,
        p.total_geral,
        p.total_produtos, 
        p.total_servicos,
        p.data_cadastro,
        p.veiculo,
        strftime('%Y-%m-%d', p.data_cadastro) AS data_cadastro,
        strftime('%Y-%m-%d %H:%M:%S', p.data_recadastro) AS data_recadastro,
        p.vendedor,
        p.tipo_os,
        p.tipo
        FROM pedidos p
        JOIN  clientes c on c.codigo = p.cliente  
          `;

          let conditions = []
          let values = []

        
          if(query.chave === 'id_interno'){
              conditions.push( ' p.id_interno = ? ' );
            values.push(String(query.value));
          }

          if(query.chave === 'id_externo'){
              conditions.push( ' p.id_externo = ? ' );
            values.push(String(query.value));
          }
          if(query.chave === 'codigo'){
              conditions.push( ' p.codigo = ? ' );
            values.push(String(query.value));
          }
        
           let finalSql= sql;

            if(values.length === 0){
              console.log("Nenhum valor de pesquisa fornecido.")
            }
              finalSql = sql + ' WHERE '+ conditions.join(' AND ')     +' ORDER BY p.data_cadastro' ;
          
        let result = await db.getAllAsync(finalSql,values );
       
       return result as resultQuery[];
        }catch(e){ 
          console.log(` erro ao consultar os pedidos   `,e)
         }
  }

    async function findByTipeAndDate( tipo:number, vendedor:number, data:any ){
      try{ 

      let result = await db.getAllAsync(`SELECT 
        p.codigo,
        p.id,
        p.id_externo,
        p.id_interno,
        c.nome,
        p.contato,
        c.codigo as codigo_cliente,
        p.situacao,
        p.situacao_separacao,
        p.observacoes,
        p.descontos,
        p.frete,
        p.forma_pagamento,
        p.enviado,
        p.total_geral,
        p.total_produtos, 
        p.total_servicos,
        p.data_cadastro,
        p.veiculo,
        strftime('%Y-%m-%d', p.data_cadastro) AS data_cadastro,
        strftime('%Y-%m-%d %H:%M:%S', p.data_recadastro) AS data_recadastro,
        p.vendedor,
        p.tipo_os,
        p.tipo
        FROM pedidos p
        JOIN  clientes c on c.codigo = p.cliente
        WHERE p.tipo ='${tipo}' AND p.vendedor =  ${vendedor} 
        AND p.data_cadastro = '${data}'        
        `);
    //   console.log(result);
        return result;
        }catch(e){ console.log(` erro ao consultar os pedidos  do vendedor : ${vendedor}  `,e) }
  }


    async function findByTipeAndClient( tipo:number, vendedor:number , nome:any){
      try{ 
      let result = await db.getAllAsync(`SELECT 
        p.codigo,
        p.id,
        p.id_externo,
        p.id_interno,
        c.nome,
        p.contato,
        c.codigo as codigo_cliente,
        p.situacao,
        p.situacao_separacao,
        p.observacoes,
        p.descontos,
        p.frete,
        p.forma_pagamento,
        p.enviado,
        p.total_geral,
        p.total_produtos, 
        p.total_servicos,
        p.data_cadastro,
        p.veiculo,
        strftime('%Y-%m-%d', p.data_cadastro) AS data_cadastro,
        strftime('%Y-%m-%d %H:%M:%S', p.data_recadastro) AS data_recadastro,
        p.vendedor,
        p.tipo_os,
        p.tipo
        FROM pedidos p
        JOIN  clientes c on c.codigo = p.cliente
        WHERE 
         p.tipo ='${tipo}'
          AND p.vendedor =  ${vendedor} 
          AND
           c.nome like '%${nome}%'
        `);
    //   console.log(result);
        return result;
        }catch(e){ console.log(` erro ao consultar os pedidos  do vendedor : ${vendedor}  `,e) }
  }
 


    async function selectCompleteOrderByCode( code:number )  {
      try{
          let dataOrder:any  = await  selectByCode(code)
          let order = dataOrder[0];

          let clientOrder  
          
          try{
          let dataClientOrder:any  = await queryClientes.selectByCode( order.codigo_cliente );
          clientOrder = dataClientOrder[0];
        }catch(e){console.log(e)}

        let producstOrder:any

          try{
            producstOrder   = await queryItems.selectByCodeOrder(code);
        }catch(e){console.log(e)}

        let servicesOrder:any

        try{
            servicesOrder  = await queryServicosPedido.selectByCodeOrder(code);
        }catch(e){console.log(e)}
        
        let parcelas:any

        try{
           parcelas  = await queryParcelas.selectByCodeOrder(code) 
        }catch(e){console.log(e)}
            
           order.produtos = producstOrder;
           order.parcelas = parcelas
           order.cliente = clientOrder
           order.servicos = servicesOrder
           return order

        }catch(e){ `erro ao consultar o pedido codigo: ${code}`}

        }

  async function selectLastId():Promise< [ { id:number } | any ] | unknown[] | undefined >{
    try{ 
      let result = await db.getAllAsync(`SELECT MAX(p.id) as id FROM pedidos p  `);
        return result;
        }catch(e){ console.log(' erro ao consultar os pedidos! ',e) }
   }

  async function selectLastCode():Promise< [ { codigo:number } | any ] | unknown[] | undefined >{
    try{ 
      let result = await db.getAllAsync(`SELECT MAX(p.codigo) as codigo FROM pedidos p  `);
        return result;
        }catch(e){ console.log(' erro ao consultar os pedidos! ',e) }
   }

   async function createOrderByCode( order:pedidoApi, code:number , id:string, id_externo:string, id_interno:any ){

    if(   !order.parcelas.length   ||  order.parcelas.length < 0 ){
      console.log(`nao foi informado os parcelas`)
      return;  
    } 
    let produtos:any = order.produtos;
    let parcelas: parcela[] = order.parcelas;
    let servicos: any = order.servicos;
       let codeOrder:any = await createByCode( order, code, id, id_externo, id_interno);

                   if( codeOrder > 0 || codeOrder !== undefined  ){
       
                          if(  produtos.length > 0    ){
                            produtos.forEach( async (prod:produto_pedido)=>{
                              await queryItems.create( prod, code )
                              })
                          } 

                          if( servicos.length > 0 ){
                            servicos.forEach( async ( s:servico_pedido )=>{
                              await queryServicosPedido.create( s,  code  )
                              })
                          }
                          
                          parcelas.forEach( async (par :parcela)=>{
                              await queryParcelas.create(par ,  code  )
                          })

                          return order.codigo ;
                  
                   }else{
                    console.log('ocorreu um erro ao tentar gravar o orcamento!')
               }
  //  }  

}


    async function createOrder( order:pedidoApi , code:number, id:string , id_externo:number,id_interno:any ){
          if(   !order.parcelas.length   ||  order.parcelas.length < 0 ){
            console.log(`nao foi informado os parcelas`)
            return;  
          } 
          let produtos:any = order.produtos;
          let parcelas: parcela[] = order.parcelas;
          let servicos: any = order.servicos;
             let codeOrder:any = await createByCode(order ,code , id, String(id_externo), id_interno);

                         if( codeOrder > 0 || codeOrder !== undefined  ){
             
                                if(  produtos.length > 0    ){
                                  produtos.forEach( async (prod:produto_pedido)=>{
                                    await queryItems.create( prod, code )
                                    })
                                } 

                                if( servicos.length > 0 ){
                                  servicos.forEach( async ( ser:servico_pedido )=>{
                                    await queryServicosPedido.create( ser, code  )
                                    })
                                }
                                
                                parcelas.forEach( async (par :parcela)=>{
                                    await queryParcelas.create(par , code   )
                                })

                                return code ;
                        
                         }else{
                          console.log('ocorreu um erro ao tentar gravar o orcamento!')
                     }
        //  }  

    }

    async function deleteOrder( code:number){
      let verifyOrder = await selectByCode(code);
      if( verifyOrder && verifyOrder?.length > 0 ){
        console.log(verifyOrder)
        console.log(`nao existe pedido com o codigo ${code} `)
      }else{
      }
      try{
          const result = await db.runAsync(` DELETE from pedidos where codigo = ${code}`)
          console.log(result);
          
          if( result.lastInsertRowId  ){

            let items = await  queryItems.selectByCodeOrder(code);
              if( items && items.length > 0 ){
                await queryItems.deleteByCodeOrder(code);
              }

              let parcelas = await queryParcelas.selectByCodeOrder(code);
              if( parcelas && parcelas?.length > 0 ){
                await queryParcelas.deleteByCodeOrder(code);
              }

              let servicos = await queryServicosPedido.selectByCodeOrder(code);
              
              if( servicos && servicos?.length > 0 ){
                await queryServicosPedido.deleteByCodeOrder(code);
              }
          }

       }catch(e){
        console.log(e)
      }
   }


   async function deleteAllOrder(  ){
      try{
          const result = await db.runAsync(` DELETE from pedidos  `)
      }catch(e){
        console.log(e)
      }
  }



///
/// efetua update no pedido caso exista
/// caso nao exista efetua o cadastro do pedido
   async function updateOrder(order:any, codigoOrcamento:any ){
       
    if( !order.codigo ){
      console.log('é necessario informar um orcamento com um codigo valido')
        return 
      }
    
      let verifyOrder:any = await selectByCode2(order.codigo);

      let codigoRgistrado ;

    if(verifyOrder?.length > 0 ){
       let aux:any =  await update(order);
       codigoRgistrado = aux 
      }else{
        
        console.log('nao foi encontrado orcamento com o codigo ', order.codigo)
        return;
      //  let aux:any =  await create(order);
        //codigoRgistrado = aux 
      }

             if( codigoRgistrado  > 0 ){

                if( order.produtos.length === 0 ){
                  let verifyProductsPedido:any = await  queryItems.selectByCodeOrder(codigoOrcamento);
                  if( verifyProductsPedido?.length > 0 ){
                    await queryItems.deleteByCodeOrder( codigoOrcamento )
                    }
                }

                  if( order.produtos.length > 0  ){
                      let verifyProductsPedido:any = await  queryItems.selectByCodeOrder(codigoOrcamento);
                    
                      if( verifyProductsPedido?.length > 0 ){
                         const produtosParaExcluir = verifyProductsPedido.filter((prodBd:any) => !order.produtos.some( (p:any) => p.codigo === prodBd.codigo));
                         for (const produto of produtosParaExcluir) {
                           await queryItems.deleteProductByCodeOrder(produto.codigo, codigoOrcamento);
                         }
                     } else{
                        console.log('nao foi encontrado produtos para este pedido')
                    } 

                    for( const p of order.produtos ){
                      let aux:any = await queryItems.selectProductByCodeOrder( p.codigo , codigoOrcamento );
                      console.log('')
                      console.log('produto ', p.codigo,' encontrado', aux)


                          if( aux?.length > 0    ){
                            await queryItems.update(p, codigoOrcamento)
                            console.log('atualizando produto', p.codigo )
                        }else{
                            await queryItems.create(p, codigoOrcamento);
                            console.log('inserindo produto', p.codigo )
                        }
                    }  
                }


               if( order.servicos.length === 0 ){
                let verifyServicesPedido:any = await   queryServicosPedido.selectByCodeOrder(codigoOrcamento);

                if( verifyServicesPedido?.length > 0 ){
                console.log("servicos encontrados" )
                console.log(  verifyServicesPedido)

                  await queryServicosPedido.deleteByCodeOrder( codigoOrcamento )
                  }
              }
                     if( order.servicos.length > 0  ){
                            let verifyServicesPedido:any = await   queryServicosPedido.selectByCodeOrder(codigoOrcamento);
                          
                            if( verifyServicesPedido?.length > 0 ){
                              const servicosParaExcluir = verifyServicesPedido.filter((servicoBd:any) => !order.servicos.some((servico:any) => servico.codigo === servicoBd.codigo));
                              for (const servico of servicosParaExcluir) {
                                await queryServicosPedido.deleteServiceByCodeOrder(servico.codigo, codigoOrcamento);
                              }
                          } else{
                              console.log('nao foi encontrado servicos para este pedido')
                          } 

                          for( const s of order.servicos ){
                            let aux = await queryServicosPedido.selectServiceByCodeOrder( s.codigo , codigoOrcamento   );
                            if( aux && aux?.length > 0    ){
                                await queryServicosPedido.update(s, codigoOrcamento)
                            }else{
                                await queryServicosPedido.create(s, codigoOrcamento );
                            }
                        }  

                     }
 
                      if( order.parcelas.length > 0 ){
                             await queryParcelas.deleteByCodeOrder( order.codigo );
                        order.parcelas.forEach( async (pa:any)=>{
                          await queryParcelas.create( pa, order.codigo);
                        })
                      }
                  
              } 

              return codigoRgistrado ;
    
  } 

  async function update( pedido:pedidoApi ){
    try{


      let result = await db.runAsync(
          ` UPDATE   pedidos SET
          situacao  =  '${ pedido.situacao}',
          situacao_separacao  =  '${pedido.situacao_separacao}',
          id_interno =  '${pedido.id_interno}',
          id_externo =  '${pedido.id_externo}',
          contato  =  '${ pedido.contato}', 
            frete  =  '${pedido.frete}', 
          descontos =  ${ pedido.descontos},
          forma_pagamento = ${pedido.forma_pagamento},
          enviado     = '${pedido.enviado}',
          observacoes = '${ pedido.observacoes}', 
          quantidade_parcelas = ${ pedido.quantidade_parcelas},
          total_geral  =  ${ pedido.total_geral},
          total_produtos =  ${ pedido.total_produtos}, 
          cliente  =  ${ pedido.cliente.codigo},
          data_cadastro = '${pedido.data_cadastro}',
          data_recadastro = '${pedido.data_recadastro}',
          veiculo = ${pedido.veiculo},
          tipo_os = ${pedido.tipo_os}
          WHERE codigo = ${ pedido.codigo}  
           ` 
      );

    console.log(' orcamento codigo : ' ,result.lastInsertRowId,' atualizado com sucesso !');
      return result.lastInsertRowId;
      }catch( e ){ 
    
        console.log(  ` UPDATE   pedidos SET
          situacao  =  '${ pedido.situacao}',
          id_interno =  '${pedido.id_interno}',
          id_externo =  '${pedido.id_externo}',
          contato  =  '${ pedido.contato}', 
          descontos =  ${ pedido.descontos},
          forma_pagamento = ${pedido.forma_pagamento},
          enviado     = '${pedido.enviado}',
          observacoes = '${ pedido.observacoes}', 
          quantidade_parcelas = ${ pedido.quantidade_parcelas},
          total_geral  =  ${ pedido.total_geral},
          total_produtos =  ${ pedido.total_produtos}, 
          cliente  =  ${ pedido.cliente.codigo},
          data_cadastro = '${pedido.data_cadastro}',
          data_recadastro = '${pedido.data_recadastro}',
          veiculo = ${pedido.veiculo},
          tipo_os = ${pedido.tipo_os}
          WHERE codigo = ${ pedido.codigo}  
           `  )
           console.log(` ocorreu um erro ao atualizar o orcamento `, e)

      }
    }
  

    async function updateByCode( pedido:pedidoApi, code:number ){
      try{
  
        let result = await db.runAsync(
            ` UPDATE   pedidos SET
            situacao  =  '${pedido.situacao}', 
            situacao_separacao  =  '${pedido.situacao_separacao}', 
            id_externo = '${pedido.id_externo}',
            id_interno = '${pedido.id_interno}',
            contato  =  '${pedido.contato}', 
            frete  =  '${pedido.frete}', 
            descontos =  ${pedido.descontos},
            forma_pagamento = ${pedido.forma_pagamento},
            enviado     = '${pedido.enviado}',
            observacoes = '${ pedido.observacoes}', 
            quantidade_parcelas = ${ pedido.quantidade_parcelas},
            total_geral  =  ${ pedido.total_geral},
            total_produtos =  ${ pedido.total_produtos}, 
            cliente  =  ${ pedido.cliente.codigo},
            data_cadastro = '${pedido.data_cadastro}',
            data_recadastro = '${pedido.data_recadastro}',
            veiculo = ${pedido.veiculo},
            tipo_os = ${pedido.tipo_os}
            WHERE codigo = ${ code}  
             ` 
        );

      console.log(' orcamento codigo : ' ,code,' atualizado com sucesso !');
      return result ;
        }catch( e ){ 

          console.log(` ocorreu um erro ao atualiza o orcamento `, e)
          console.log(
            ` UPDATE   pedidos SET
            situacao  =  '${pedido.situacao}', 
            situacao_separacao  =  '${pedido.situacao_separacao}', 
            id_externo = '${pedido.id_externo}',
            id_interno = '${pedido.id_interno}',
            contato  =  '${pedido.contato}', 
            descontos =  ${pedido.descontos},
            forma_pagamento = ${pedido.forma_pagamento},
            enviado     = '${pedido.enviado}',
            observacoes = '${ pedido.observacoes}', 
            quantidade_parcelas = ${ pedido.quantidade_parcelas},
            total_geral  =  ${ pedido.total_geral},
            total_produtos =  ${ pedido.total_produtos}, 
            cliente  =  ${ pedido.cliente.codigo},
            data_cadastro = '${pedido.data_cadastro}',
            data_recadastro = '${pedido.data_recadastro}',
            veiculo = ${pedido.veiculo},
            tipo_os = ${pedido.tipo_os}
            WHERE codigo = ${ code}  
             `
          )
        }
      }

        type newUpdateQuery  ={
        situacao:string
            id_externo  :string
            id_interno  :string
        contato:string
        descontos:number
        forma_pagamento:number
        enviado:string
        observacoes:string
        quantidade_parcelas:number
        total_geral:number
        total_produtos:number
        cliente:{ codigo:number}
        data_cadastro:string
        data_recadastro:string
        veiculo:number
        tipo_os:number
        situacao_separacao: 'N' | 'P' | 'I'
        }

        async function newUpdate( query:Partial<newUpdateQuery>, code:number ){
        try{

                let params =[]
                let values =[]
            let sql =  ` UPDATE   pedidos SET `;

            if(query.id_interno){
                params.push(' id_interno = ? ')
                values.push(query.id_interno);
              }

              if(query.id_externo){
                params.push(' id_externo = ? ')
                values.push(query.id_externo);
              }
                if(query.situacao){
                  params.push(' situacao = ? ');
                  values.push(  query.situacao )
                 }
                 if(query.situacao_separacao){
                  params.push(' situacao_separacao = ? ');
                  values.push( query.situacao_separacao);
                 }

                 if(query.contato){
                  params.push(' contato = ? ');
                  values.push( query.contato )
                 }
                 if(query.descontos){
                  params.push(' descontos = ? ');
                  values.push(  query.descontos )
                 }
                 if(query.forma_pagamento){
                  params.push(' forma_pagamento = ? ');
                  values.push( query.forma_pagamento )
                 }
                 if(query.enviado){
                  params.push(' enviado = ? ');
                  values.push(  query.enviado )
                 }
                 if(query.observacoes){
                  params.push(' observacoes = ? ');
                  values.push( query.observacoes )
                 }
                 if(query.quantidade_parcelas){
                  params.push(' quantidade_parcelas = ? ');
                  values.push( query.quantidade_parcelas )
                 }
                 if(query.total_geral){
                  params.push(' total_geral = ? ');
                  values.push( query.total_geral )
                 }
                 if(query.total_produtos){
                  params.push(' total_produtos = ? ');
                  values.push( query.total_produtos )
                 }
                 if(query.cliente){
                  params.push(' cliente = ? ');
                  values.push( query.cliente )
                 }
                 if(query.data_cadastro){
                  params.push(' data_cadastro = ? ');
                  values.push( query.data_cadastro )
                 }
                 if(query.data_recadastro){
                  params.push(' data_recadastro = ? ');
                  values.push(  query.data_recadastro  )
                 }
                 if(query.veiculo){
                  params.push(' veiculo = ? ');
                  values.push( query.veiculo )
                 }
                 if(query.tipo_os){
                  params.push(' tipo_os = ? ');
                  values.push(  query.tipo_os  )
                 }
                 let whereclauase = ' WHERE codigo = ? '
                  values.push( code  )

                 let finalSql = sql + params.join(' , ') + whereclauase;

           let result = await db.runAsync( finalSql, values as any);
  
        //console.log(' Atualizado a situação orcamento codigo : ' ,code );
         return result ;
          }catch( e ){ 
            console.log(` ocorreu um erro ao atualiza o orcamento `, e)
    
          }
        }
  
      async function updateSentOrderByCode( enviado:String, code:number ){
        try{

          let result = await db.runAsync(
              ` UPDATE   pedidos SET
              enviado  =  '${enviado}'  
              WHERE codigo = '${code}'  
               ` 
          );
  
        //console.log(' Atualizado a situação orcamento codigo : ' ,code );
        return result ;
          }catch( e ){ 
            console.log(` ocorreu um erro ao atualiza o orcamento `, e)
    
          }
        }
  



    return {
      update, newUpdate, findByParam,selectLastCode, newSelect,createOrderByCode,findByTipeAndDate,updateSentOrderByCode, findByTipeAndClient, updateByCode, selectLastId , findByTipe, deleteAllOrder, updateOrder , create , selectAll,selectByCode , createOrder, selectCompleteOrderByCode , deleteOrder}

}