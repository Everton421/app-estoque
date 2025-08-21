import { useCallback, useState } from "react";
import { useProdutoSetores } from "../../database/queryProdutoSetor/queryProdutoSetor";
import { configMoment } from "../../services/moment";
import useApi from "../../services/api";

  type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<String | undefined>>
setProgress: React.Dispatch<React.SetStateAction<number>>
}

  export const useSyncProdSector =   ()  =>    {
    
          const useQueryProdutoSetores = useProdutoSetores();
            const api = useApi();
            const useMoment = configMoment();


    const syncData = useCallback ( async( { data,setIsLoading, setProgress,   setItem }: propsSyncData ) =>{

          setProgress(0);
          setItem('Produtos nos Setores');
          setIsLoading(true)
          try {

            const aux = await api.get('/offline/produto_setor',
              { params :{ data_recadastro : data}}
            );
            const dados = aux.data;
            let totalProduto_setor = dados.length
            if( totalProduto_setor > 0 ){
              for (let i = 0; i < dados.length; i++ ) {
                const verifi:any = await useQueryProdutoSetores.selectByCodeProductAndCodeSector(dados[i].produto,dados[i].setor );
                if (verifi.length > 0) {
                  let data_recadastro =  useMoment.formatarDataHora( dados[i].data_recadastro);
                  console.log(`categoria: ${data_recadastro } > ${verifi[0].data_recadastro}` )
                  if (data_recadastro > verifi[0].data_recadastro ) {
                    await useQueryProdutoSetores.update( dados[i] );
                  }
                } else {
                  await useQueryProdutoSetores.create(dados[i]);
                }
                const progressPercentage = Math.floor(((i + 1) / totalProduto_setor) * 100);
                setProgress(progressPercentage); // Atualiza progresso
              }        
            } 
       
          const dataProdSector   = await useQueryProdutoSetores.selectAll();
                //  console.log('Produtos_setor: ' ,dataProdSector)
                const dataPost =[]
                  
                  if(dataProdSector && dataProdSector?.length > 0 ){
                      for(let i of dataProdSector ){
                          if( new Date(i.data_recadastro) > new Date(data) ){
                            dataPost.push(i)
                          }
                      }
                        
                        if(dataPost.length > 0 ){
                        console.log('enviando:', dataPost)
                        const resultApi = await api.post('/offline/produto_setor' ,dataPost );
                            console.log(" resposta backend produto_setor :  ",resultApi.data)
                           
                          }else{
                        console.log('nenhum produto nos setores pronto para envio' )
                          }
                      
                      }else{
                    console.log('nenhum produto nos setores pronto para envio' )
                      }
                    
             } catch (e:any) {
            console.log(" ocorreu um erro ao processar   Produto_setor", e);
          }finally{
          setIsLoading(false)

          }
          },[api, useMoment, useQueryProdutoSetores]);

  
return { syncData  }
  };