

import { NavigationContainer } from "@react-navigation/native";
import * as React from 'react';
 

import NetInfo from '@react-native-community/netinfo';
import { useContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthContext } from "../contexts/auth";
import { ConnectedContext } from "../contexts/conectedContext";
import useApi from "../services/api";
import { AuthStack } from "./stack/authStack";
import { Stack } from "./stack/stack";

export const Routes = ( )=>{
    const { logado, setLogado, usuario , setUsuario }:any = useContext(AuthContext)
 
    const {connected,  setConnected, internetConnected, setInternetConnected } = useContext(ConnectedContext)
  
      const api = useApi();
      
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

 

    return(
        <SafeAreaProvider>
        <NavigationContainer>
          { 
             logado ?
                                    <Stack/> 
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