import { useCallback, useState } from "react";
import { useProducts } from "../../database/queryProdutos/queryProdutos";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { useMarcas } from "../../database/queryMarcas/queryMarcas";

type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<String | undefined>>
setProgress: React.Dispatch<React.SetStateAction<number>>
}
export const useSyncMarcas = ()=>{
         const useQueryMarcas = useMarcas();

        

             const api = useApi();
             const useMoment = configMoment();
         
             const syncData = useCallback (  async( { data,setIsLoading, setProgress,   setItem }: propsSyncData )  =>{
                    setProgress(0);
                    setItem('Marcas');
                   setIsLoading(true)

                        try {
                        const aux = await api.get('/offline/marcas',
                            { params :{ data_recadastro : data}}

                        );
                        const dados = aux.data;
                        let TotalMarcas = dados.length
                        if(TotalMarcas > 0 ){
                            for (let i = 0; i < dados.length; i++ ) {
                                const verifiMarca:any = await useQueryMarcas.selectByCode(dados[i].codigo);
                                
                                if (verifiMarca.length > 0) {
                                let data_recadastro =  useMoment.formatarDataHora( dados[i].data_recadastro);
                                    console.log(`marca: ${data_recadastro } > ${verifiMarca[0].data_recadastro}` )
                                
                                if (data_recadastro > verifiMarca[0].data_recadastro ) {
                                    await useQueryMarcas.update( dados[i], dados[i].codigo);
                                
                                }
                                } else {
                                await useQueryMarcas.create(dados[i]);
                                }
                                const progressPercentage = Math.floor(((i + 1) / TotalMarcas) * 100);
                                setProgress(progressPercentage); // Atualiza progresso
                            }     
                        }else{
                        console.log("Marcas: ", dados);
                        }   
                        } catch (e:any) {
                        console.log(" ocorreu um erro ao processar as marcas", e);
                         }finally{
                            setIsLoading(false)
                            }
                  },[])

                  
    return { syncData }
}