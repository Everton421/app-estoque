import React ,{ createContext, useState,Dispatch } from "react";


export const ConnectedContext = createContext({
    connected: false,
    setConnected: React.Dispatch<React.SetStateAction<boolean>> 
  });
  

    function ConnectedProvider({ children }:any){
            const [ connected , setConnected ]  = useState <boolean> ( false );

            return (
                <ConnectedContext.Provider value={ { connected , setConnected } }>
                    {children}
                </ConnectedContext.Provider>
            )
    }
export default ConnectedProvider;







