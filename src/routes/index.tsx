

import { NavigationContainer, useNavigation } from "@react-navigation/native"
import * as React from 'react';
 

import { useContext } from "react"
import { AuthContext } from "../contexts/auth"
import ProdutosProvider from "../contexts/produtosDoOrcamento";
import OrcamentoProvider from "../contexts/orcamentoContext";
import ConnectedProvider, { ConnectedContext } from "../contexts/conectedContext";
import NetInfo from '@react-native-community/netinfo';
import { AuthStack } from "./stack/authStack";
import { Stack } from "./stack/stack";
import { OfflineBanner } from "../components/oflline-banner/oflline-banner";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useApi from "../services/api";
import { AxiosError } from "axios";

export const Routes = ( )=>{
    const { logado, setLogado, usuario , setUsuario }:any = useContext(AuthContext)
 
    const {connected,  setConnected, internetConnected, setInternetConnected } = useContext(ConnectedContext)
  
      const api = useApi();
    
        async function connect() {
      
          try {
            const response = await api.get('/' );
            console.log(response)
              if (response.status === 200  ) {
                  setConnected && setConnected(true)
           
              } else {
                  setConnected && setConnected(true)
                
                  console.log({"err":"erro ao conectar"})
              }
          } catch (err:any) {
                  setConnected && setConnected(false)
          } finally {
      
          }
      }

    React.useEffect(() => {
     function setConexao(){
        const unsubscribe = NetInfo.addEventListener(state => {
                setInternetConnected && state.isConnected && setInternetConnected(state.isConnected);
                console.log('conexao com a internet :', state.isConnected);
           });
        return () => {
            unsubscribe();
        };
    }
     connect() 
    setConexao();
    }, []);


   

    return(
        <SafeAreaProvider>
        <NavigationContainer>
          { 
             logado ?
                         <OrcamentoProvider>
                                    <Stack/> 
                       </OrcamentoProvider>
               :
               <AuthStack/>
          }  

        </NavigationContainer> 
          {
          ///  <OfflineBanner/>
           }
        </SafeAreaProvider>    
    )
}