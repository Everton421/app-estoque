import { useCallback, useContext, useState } from "react";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { AuthContext } from "../../contexts/auth";
import { cliente, useClients } from "../../database/queryClientes/queryCliente";

type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<string | undefined>>

setProgress: React.Dispatch<React.SetStateAction<number>>
}

   export  type servico = {
        codigo:number,
        valor?:number,
        aplicacao:string,
        tipo_serv?:number,
        data_cadastro:string,
        data_recadastro:string 
    }

export const useSyncClients = ()=>{
          const useQueryClientes = useClients();
          const { usuario }:any = useContext(AuthContext);

             const api = useApi();
             const useMoment = configMoment();
         
              /**
               * data: data a ser consultado na api.
               * setIsLoading: seta loading como true, ideal para conponente que exibe carregamento
               * setProgress: seta o valor em porcentagem do progresso de carregamento 
               * setItem: seta o item que esta carregando no momento
               */
             const syncData = useCallback ( async( { data,setIsLoading, setProgress,   setItem }: propsSyncData ) =>{
                 
                  //setErrorProcess(null);
                setProgress(0);
                setItem('Clientes');
                setIsLoading(true)
                
                try {
                    
                        const resultApiData = await api.get('/offline/clientes',  { 
                            params :{
                                 data_recadastro : data,
                                }
                        } );

                        console.log("Data consulta clientes: ", data)
                        console.log(" clientes api : ", resultApiData.data)
                        const dados:cliente[] = resultApiData.data;

                        const totalClientes = dados.length;
                        
                        if(totalClientes > 0 ){
                            for (let v = 0; v < totalClientes; v++) {
                            const verifyClient  = await useQueryClientes.selectByCode(dados[v].codigo);
                            if (verifyClient && verifyClient.length > 0) {
                                let data_recadastro = useMoment.formatarDataHora( dados[v].data_recadastro ); // Ajuste se necessário
                        
                                console.log(`Cliente : ${data_recadastro } > ${verifyClient[0].data_recadastro}` )

                                if (data_recadastro > verifyClient[0].data_recadastro ) {

                                await useQueryClientes.update(dados[v], dados[v].codigo );
                                }
                            } else {
                                await useQueryClientes.createByCode(dados[v] );
                            }
                            const progressPercentage = Math.floor(((v + 1) / totalClientes) * 100);
                            setProgress(progressPercentage); // Atualiza progresso
                            }
                        }else{
                            console.log("Clientes: ", dados);        
                        }

                        } catch (e) {
                        console.log(e);
                         }finally{
                          setIsLoading(false)
                        }

                  },[])

                  
    return { syncData }
}