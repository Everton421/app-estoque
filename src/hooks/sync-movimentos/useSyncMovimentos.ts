import { useCallback, useContext, useState } from "react";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import {   useMovimentos } from "../../database/queryMovimentos/queryMovimentos";
import { AuthContext } from "../../contexts/auth";

  type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<String | undefined>>
setProgress: React.Dispatch<React.SetStateAction<number>>
}

export const useSyncMovimentos = ()=>{
    
                  const { usuario }:any = useContext(AuthContext);
 
            const api = useApi();
            const useMoment = configMoment();
            const useQueryMovimentos = useMovimentos();

          const syncData = useCallback (  async( { data,setIsLoading, setProgress,   setItem }: propsSyncData ) =>{
                 setProgress(0);
                 setItem('Movimento dos Produtos');
                 setIsLoading(true)

                try {
                const aux = await api.get('/offline/movimentos_produtos',
                    { params :{ 
                    data_recadastro : data,
                    usuario:usuario.codigo
                    }}
                );
                const dados = aux.data;
                const totalMovimentos = dados.length

                if( totalMovimentos > 0 ){
                    for (let i = 0; i < dados.length; i++ ) {
                    
                    const verifi = await useQueryMovimentos.findByCodeMoviment(dados[i].codigo);

                    if (verifi && verifi.length > 0) {
                    let data_recadastro =  useMoment.formatarDataHora( dados[i].data_recadastro);
                    if (data_recadastro > verifi[0].data_recadastro ) {
                        await useQueryMovimentos.update( dados[i] );
                    }
                    } else {
                    await useQueryMovimentos.createByCode(dados[i]);
                    }

                    const progressPercentage = Math.floor(((i + 1) / totalMovimentos) * 100);
                    setProgress(progressPercentage); // Atualiza progresso
            
                    } 
                }else{
                    console.log("movimentos produtos: ", dados)
                }
            
                            const dataMoviments:any   = await useQueryMovimentos.selectAll();
                        const dataPost =[]
                        
                        if(dataMoviments && dataMoviments?.length > 0 ){
                            for(let i  of dataMoviments ){
                                if( new Date(i.data_recadastro) > new Date(data) ){

                                    i.usuario = usuario.codigo
                                    dataPost.push(i);
                                }
                            }
                                if( dataPost.length > 0 ){
                                console.log('enviando movimentos: ' ,dataPost)
                                const resultApi = await api.post('/offline/movimentos_produtos' ,dataPost );
                                console.log(" resposta backend movimentos_produtos: ",resultApi.data)
                                if( resultApi.status === 200 ){
                                }
                                }else{
                                console.log('nenhum movimento a ser enviado! ' )

                                }
                                
                            }
                            
                    }catch(e){
                         console.log("Ocorreu um erro ao tentar fazer o envio dos movimentos dos produtos ",e )
                    }finally{
                         setIsLoading(false)
                    }
                
                  },[])

    return { syncData  }
}