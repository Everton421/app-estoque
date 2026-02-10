import { useCallback, useState } from "react";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { useCategoria } from "../../database/queryCategorias/queryCategorias";
import { useSetores } from "../../database/querySetores/querySetores";


type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<string | undefined>>
setProgress: React.Dispatch<React.SetStateAction<number>>
}

export const useSyncSetores = ()=>{
    const useQuerySetores = useSetores();


             const api = useApi();
             const useMoment = configMoment();
         
             const syncData = useCallback (  async( { data,setIsLoading, setProgress,   setItem }: propsSyncData )  =>{
                    setProgress(0);
                    setItem('Setores');
                   setIsLoading(true)


                      try {
                        const aux = await api.get('/offline/setores',
                            { params :{ data_recadastro : data}}
                        );
                        const dados = aux.data;

                        const totalSetores = dados.length
                        if( totalSetores > 0 ){
                            for (let i = 0; i < dados.length; i++ ) {
                            const verifiVeic:any = await useQuerySetores.selectByCode(dados[i].codigo);
                            if (verifiVeic.length > 0) {
                            let data_recadastro =  useMoment.formatarDataHora( dados[i].data_recadastro);
                            console.log(`Setores: ${data_recadastro } > ${verifiVeic[i].data_recadastro}` )
                            if (data_recadastro > verifiVeic[0].data_recadastro ) {
                                await useQuerySetores.update( dados[i] );
                            }
                            } else {
                            await useQuerySetores.create(dados[i]);
                            }

                            const progressPercentage = Math.floor(((i + 1) / totalSetores) * 100);
                            setProgress(progressPercentage); // Atualiza progresso
                        
                            } 
                        }else{
                            console.log("Setores: ", dados)
                        }
                        } catch (e:any) {
                        console.log(e);
                        console.log(e.response.data.msg);
                        }finally{
                            setIsLoading(false)

                            }
                  },[])

                  
    return { syncData  }
}