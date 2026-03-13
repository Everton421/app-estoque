import { useContext } from "react";
import { useParcelas } from "../database/queryParcelas/queryParcelas";
import { useItemsPedido } from "../database/queryPedido/queryItems";
import { usePedidos } from "../database/queryPedido/queryPedido";
import { useServicosPedido } from "../database/queryPedido/queryServicosPedido";
import { configMoment } from "./moment";
import { AuthContext } from "../contexts/auth";
import useApi from "./api";



export const receberPedidos = ()=>{

    const useQuerypedidos = usePedidos();
    const useQueryItemsPedido = useItemsPedido();
    const usequeryServicosPedido = useServicosPedido();
    const useQueryParcelas = useParcelas();

    const useMoment = configMoment();  

  const { usuario }:any = useContext(AuthContext);
  const api = useApi();


    async function getPedidos(data:any){
        let orcamentosSistema:any
    
           let dataAtual = data+' 00:00:00'
           
           try{
                orcamentosSistema = await api.get(`/pedidos`,
               { 
                   params:{
                   data:dataAtual,
                   vendedor:usuario.codigo
                   }
               }
               )
    
               if( orcamentosSistema.data.length > 0 ){

                let aux = useQuerypedidos.newUpdate({ contato:'0'}, 1 );
                    
                   orcamentosSistema.data.forEach( async ( i:any )=>{

                     const codigo_pedido = parseInt(i.codigo)
                   let pedidoMobile:any = await useQuerypedidos.selectByCode(codigo_pedido)
             
                       if(pedidoMobile?.length > 0 ){
                                let dataRecadMobile = pedidoMobile[0].data_recadastro;
        
                                if ( i.data_recadastro  >  dataRecadMobile  ){
                                    await useQuerypedidos.updateByCode(i, codigo_pedido)
                                
                                let verifyProductsPedido:any
                                    let verifyServicesPedido:any;
                                    let verifyparcelasPedido:any;
    
                                    if( i.produtos.length > 0 ){
                                        verifyProductsPedido = await  useQueryItemsPedido.selectByCodeOrder(codigo_pedido);
                                            if( verifyProductsPedido?.length > 0 ){
                                                await useQueryItemsPedido.deleteByCodeOrder( codigo_pedido);
                                                console.log('excluido items do pedido ' , codigo_pedido )
                                            }
                                        }
            
                                        if( i.produtos.length > 0  ){
                                        for( const p of i.produtos ){
                                            let aux:any = await useQueryItemsPedido.selectProductByCodeOrder( p.codigo , codigo_pedido );
                                            console.log('')
                                            console.log('produto ', p.codigo,' encontrado', aux)
                        
                                                if( aux?.length > 0    ){
                                                    await useQueryItemsPedido.update(p, codigo_pedido)
                                                    console.log('atualizando produto', p.codigo )
                                                }else{
                                                    await useQueryItemsPedido.create(p, codigo_pedido);
                                                    console.log('inserindo produto', p.codigo )
                                                }
                                            }  
                                        }
        
        
                                    if( i.servicos.length > 0 ){
                                        verifyServicesPedido = await  usequeryServicosPedido.selectByCodeOrder(codigo_pedido);
                                        if( verifyServicesPedido?.length > 0 ){
                                        await usequeryServicosPedido.deleteByCodeOrder( codigo_pedido);
                                        console.log('excluido servicos do pedido ' , codigo_pedido )
        
                                        }else{
                                            console.log('nenhum servico encontrado no Orcamento: ',codigo_pedido)
                                        }
                                    }
        
        
                                    if( i.servicos.length > 0  ){
                                        for( const s of i.servicos ){
                                            let aux:any = await usequeryServicosPedido.selectServiceByCodeOrder( s.codigo , codigo_pedido );
                                            console.log('')
                                            console.log('servico ', s.codigo,' encontrado', aux)
                    
                                                if( aux?.length > 0    ){
                                                await usequeryServicosPedido.update(s, codigo_pedido)
                                                console.log('atualizando servico', s.codigo )
                                            }else{
                                                await usequeryServicosPedido.create(s, codigo_pedido);
                                                console.log('inserindo servico', s.codigo )
                                            }
                                        }  
                                        }
        
                                        
                                    if( i.parcelas.length > 0 ){
                                        verifyparcelasPedido = await useQueryParcelas.selectByCodeOrder(codigo_pedido);
                                                if( verifyparcelasPedido.length > 0 ){
                                                    console.log("atualizando parcelas!");
                                                    await useQueryParcelas.deleteByCodeOrder( codigo_pedido );
                                                    i.parcelas.forEach( async ( p:any )=>{
                                                    await useQueryParcelas.create( p, codigo_pedido);
                                                    })
                                                }else{
                                                console.log('nao foram encontradas parcelas para o orcamento', codigo_pedido )
                                                }
                                    }
                                      
                                    
                               }else{
                                
                                if(i.tipo != pedidoMobile[0].tipo || i.situacao != pedidoMobile[0].situacao ){
                                    console.log(`atualizando status do pedido ${codigo_pedido}  `)
                                    await useQuerypedidos.updateByCode(i, codigo_pedido)
                                }else{
                                
                                console.log(  ` Não ouve nehuma alteracao no  orcamento ${codigo_pedido}  `, i.data_recadastro  ,'  >  ', dataRecadMobile )
                                console.log('')
                            } 
                                console.log(  ` Não ouve nehuma alteracao no  orcamento ${codigo_pedido}  `, i.data_recadastro  ,'  >  ', dataRecadMobile )

                               }
                       }else{
                        console.log('')
                        console.log(i)
                        console.log('')
                           await useQuerypedidos.createOrderByCode(i , codigo_pedido,  i.id, i.id_externo, i.id_externo);
                       } 
    
                   })
    
                   }else{
                   console.log("nenhum orcamento a ser validado")
                   return;
                   }
    
               }catch(e){
               console.log(`ocorreu um erro ao consultar os orcamentos `, e )
           }
    
       }


        /**
         * 
         * @param codigopedido consulta um pedido pelo codigo interno 
         */
       async function getPedido( codigopedido:number){
        let orcamentosSistema:any
           
           try{
                orcamentosSistema = await api.get(`/pedido`,
               { 
                   params:{
                     codigo: codigopedido
                   }
               }
               )
    
               if( orcamentosSistema.data.length > 0 ){

                let aux = useQuerypedidos.newUpdate({ contato:'0'}, 1 );
                    
                   orcamentosSistema.data.forEach( async ( i:any )=>{

                     const codigo_pedido = parseInt(i.codigo)
                   let pedidoMobile:any = await useQuerypedidos.selectByCode(codigo_pedido)
             
                       if(pedidoMobile?.length > 0 ){
                                let dataRecadMobile = pedidoMobile[0].data_recadastro;
        
                                if ( i.data_recadastro  >  dataRecadMobile  ){
                                    await useQuerypedidos.updateByCode(i, codigo_pedido)
                                
                                let verifyProductsPedido:any
                                    let verifyServicesPedido:any;
                                    let verifyparcelasPedido:any;
    
                                    if( i.produtos.length > 0 ){
                                        verifyProductsPedido = await  useQueryItemsPedido.selectByCodeOrder(codigo_pedido);
                                            if( verifyProductsPedido?.length > 0 ){
                                                await useQueryItemsPedido.deleteByCodeOrder( codigo_pedido);
                                                console.log('excluido items do pedido ' , codigo_pedido )
                                            }
                                        }
            
                                        if( i.produtos.length > 0  ){
                                        for( const p of i.produtos ){
                                            let aux:any = await useQueryItemsPedido.selectProductByCodeOrder( p.codigo , codigo_pedido );
                                            console.log('')
                                            console.log('produto ', p.codigo,' encontrado', aux)
                        
                                                if( aux?.length > 0    ){
                                                    await useQueryItemsPedido.update(p, codigo_pedido)
                                                    console.log('atualizando produto', p.codigo )
                                                }else{
                                                    await useQueryItemsPedido.create(p, codigo_pedido);
                                                    console.log('inserindo produto', p.codigo )
                                                }
                                            }  
                                        }
        
        
                                    if( i.servicos.length > 0 ){
                                        verifyServicesPedido = await  usequeryServicosPedido.selectByCodeOrder(codigo_pedido);
                                        if( verifyServicesPedido?.length > 0 ){
                                        await usequeryServicosPedido.deleteByCodeOrder( codigo_pedido);
                                        console.log('excluido servicos do pedido ' , codigo_pedido )
        
                                        }else{
                                            console.log('nenhum servico encontrado no Orcamento: ',codigo_pedido)
                                        }
                                    }
        
        
                                    if( i.servicos.length > 0  ){
                                        for( const s of i.servicos ){
                                            let aux:any = await usequeryServicosPedido.selectServiceByCodeOrder( s.codigo , codigo_pedido );
                                            console.log('')
                                            console.log('servico ', s.codigo,' encontrado', aux)
                    
                                                if( aux?.length > 0    ){
                                                await usequeryServicosPedido.update(s, codigo_pedido)
                                                console.log('atualizando servico', s.codigo )
                                            }else{
                                                await usequeryServicosPedido.create(s, codigo_pedido);
                                                console.log('inserindo servico', s.codigo )
                                            }
                                        }  
                                        }
        
                                        
                                    if( i.parcelas.length > 0 ){
                                        verifyparcelasPedido = await useQueryParcelas.selectByCodeOrder(codigo_pedido);
                                                if( verifyparcelasPedido.length > 0 ){
                                                    console.log("atualizando parcelas!");
                                                    await useQueryParcelas.deleteByCodeOrder( codigo_pedido );
                                                    i.parcelas.forEach( async ( p:any )=>{
                                                    await useQueryParcelas.create( p, codigo_pedido);
                                                    })
                                                }else{
                                                console.log('nao foram encontradas parcelas para o orcamento', codigo_pedido )
                                                }
                                    }
                                      
                                    
                               }else{
                                
                                if(i.tipo != pedidoMobile[0].tipo || i.situacao != pedidoMobile[0].situacao || i.id != pedidoMobile[0].id){
                                    console.log(`atualizando status do pedido ${codigo_pedido}  `)
                                    await useQuerypedidos.updateByCode(i, codigo_pedido)
                                }else{
                                
                                console.log(  ` Não ouve nehuma alteracao no  orcamento ${codigo_pedido}  `, i.data_recadastro  ,'  >  ', dataRecadMobile )
                                console.log('')
                            } 
                                console.log(  ` Não ouve nehuma alteracao no  orcamento ${codigo_pedido}  `, i.data_recadastro  ,'  >  ', dataRecadMobile )

                               }
                       }else{
                        console.log('')
                        console.log(i)
                        console.log('')
                           await useQuerypedidos.createOrderByCode(i , codigo_pedido,  i.id, i.id_externo, i.id_interno);
                       } 
    
                   })
    
                   }else{
                   console.log("nenhum orcamento a ser validado")
                   return;
                   }
    
               }catch(e){
               console.log(`ocorreu um erro ao consultar os orcamentos `, e )
           }

        }

     

    return  { getPedidos ,getPedido } 
}