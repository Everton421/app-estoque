import { useCallback, useState } from "react";
import { useProducts } from "../../database/queryProdutos/queryProdutos";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";

type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<String | undefined>>
setProgress: React.Dispatch<React.SetStateAction<number>>
}

export const useSyncProdutos = ()=>{
         const useQueryProdutos = useProducts();

          

             const api = useApi();
             const useMoment = configMoment();
         
              /**
               * data: data a ser consultado na api.
               * setIsLoading: seta loding como true, ideal para conponente que exibe carregamento
               * setProgress: seta o valor em porcentagem do progresso de carregamento 
               * setItem: seta o item que esta carregando no momento
               */
             const syncData = useCallback ( async( { data,setIsLoading, setProgress,   setItem }: propsSyncData ) =>{
                 
                  //setErrorProcess(null);
                setProgress(0);
                setItem('Produtos');
                setIsLoading(true)
                
                try {
                    
                        const aux = await api.get('/offline/produtos',  { 
                            params :{ data_recadastro : data}
                        } );
                        const dados = aux.data;
                        const totalProdutos = dados.length;
                        if(totalProdutos > 0 ){
                            for (let v = 0; v < totalProdutos; v++) {
                            const verifyProduct:any = await useQueryProdutos.selectByCode(dados[v].codigo);
                            if (verifyProduct.length > 0) {
                                let data_recadastro = useMoment.formatarDataHora( dados[v].data_recadastro ); // Ajuste se necessário
                        
                                console.log(`produtos : ${data_recadastro } > ${verifyProduct[0].data_recadastro}` )

                                if (data_recadastro > verifyProduct[0].data_recadastro ) {

                                await useQueryProdutos.update(dados[v], dados[v].codigo);
                                }
                            } else {
                                await useQueryProdutos.createByCode(dados[v], dados[v].codigo );
                            }
                            const progressPercentage = Math.floor(((v + 1) / totalProdutos) * 100);
                            setProgress(progressPercentage); // Atualiza progresso
                            }
                        }else{
                            console.log("Produtos: ", dados);        
                        }

                        } catch (e) {
                        console.log(e);
                         }finally{
                          setIsLoading(false)
                        }

                  },[])

                  
    return { syncData }
}