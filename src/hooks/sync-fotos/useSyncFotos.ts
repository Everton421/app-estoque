import { useCallback, useState } from "react";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { useFotosProdutos } from "../../database/queryFotosProdutos/queryFotosProdutos";

type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<String | undefined>>
setProgress: React.Dispatch<React.SetStateAction<number>>
}
export const useSyncFotos = ()=>{
         const useQueryFotos = useFotosProdutos();

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
                   setItem('Fotos Produtos');
                   setIsLoading(true)

                        try {
                        const aux = await api.get('/offline/fotos',
                            { params :{ data_recadastro : data}}
                        );
                        const dados = aux.data;

                        const totalimgs = dados.length
                        if ( totalimgs > 0 ){
                            for (let i = 0; i < dados.length; i++ ) {
                            const verifiImg:any = await useQueryFotos.selectByCodeAndSequenci(dados[i].produto, dados[i].sequencia);
                            if (verifiImg.length > 0) {
                                let data_recadastro =  useMoment.formatarDataHora( dados[i].data_recadastro);
                                console.log(`foto: ${data_recadastro } > ${verifiImg[i].data_recadastro}` )
                                if (data_recadastro > verifiImg[0].data_recadastro ) {
                                await useQueryFotos.update( dados[i], dados[i].produto );
                                }
                            } else {
                                await useQueryFotos.create(dados[i]);
                            }
                            const progressPercentage = Math.floor(((i + 1) / totalimgs) * 100);
                            setProgress(progressPercentage); // Atualiza progresso
                            }
                        }else{
                            console.log("Imagens: ", dados)
                        }

                        } catch (e:any) {
                        console.log( "erro : ",e);
                        if(e.status === 400){
                        console.log( "erro : ",e.response.data.msg);
                        }
                        } finally{
                                    setIsLoading(false)
                                }

                  },[])

                  
    return { syncData }
}