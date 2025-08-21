import { useCallback, useState } from "react";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { useCategoria } from "../../database/queryCategorias/queryCategorias";

type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<String | undefined>>
setProgress: React.Dispatch<React.SetStateAction<number>>
}
export const useSyncCategorias = ()=>{
         const useQueryCategorias = useCategoria();

             const api = useApi();
             const useMoment = configMoment();
         
              /**
               * data: data a ser consultado na api.
               * setIsLoading: seta loding como true, ideal para conponente que exibe carregamento
               * setProgress: seta o valor em porcentagem do progresso de carregamento 
               * setItem: seta o item que esta carregando no momento
               */
             const syncData = useCallback ( async( { data,setIsLoading, setProgress,   setItem }: propsSyncData ) =>{
                    setProgress(0);
                    setItem('Categorias');
                   setIsLoading(true)

                      try {
                                const aux = await api.get('/offline/categorias',
                                    { params :{ data_recadastro : data}}
                                );
                                //console.log("request categorias ", aux.data )
                                const dados = aux.data;
                                let TotalCategorias = dados.length
                                if( TotalCategorias > 0 ){
                                    for (let i = 0; i < dados.length; i++ ) {
                                    const verifiCategoria:any = await useQueryCategorias.selectByCode(dados[i].codigo);
                                    if (verifiCategoria.length > 0) {
                                        let data_recadastro =  useMoment.formatarDataHora( dados[i].data_recadastro);
                                        console.log(`categoria: ${data_recadastro } > ${verifiCategoria[0].data_recadastro}` )
                                        if (data_recadastro > verifiCategoria[0].data_recadastro ) {
                                        await useQueryCategorias.update( dados[i], dados[i].codigo);
                                        }
                                    } else {
                                        await useQueryCategorias.create(dados[i]);
                                    }
                                    const progressPercentage = Math.floor(((i + 1) / TotalCategorias) * 100);
                                    setProgress(progressPercentage); // Atualiza progresso
                                    }        
                                }else{
                                    console.log("Categorias: ", dados);
                                }
                                } catch (e) {
                                console.log(" ocorreu um erro ao processar as categorias", e);
                                }finally{
                                   setIsLoading(false)
                            }
                  },[])

                  
    return { syncData  }
}