import  React, { createContext, useState  } from "react";

interface typeConnectedContext { 
    connected:boolean
    setConnected?: React.Dispatch<React.SetStateAction<boolean>> 
    internetConnected:boolean  
    setInternetConnected?: React.Dispatch<React.SetStateAction<boolean>>  
}

export const ConnectedContext = createContext<typeConnectedContext>({
   connected:false,
    internetConnected:false,
});
  

    function ConnectedProvider({ children }:any){
            const [ connected , setConnected ]  = useState<boolean>( false );
            const [ internetConnected , setInternetConnected ]  = useState<boolean>( false );

            return (
                <ConnectedContext.Provider value={ { connected , setConnected ,internetConnected ,setInternetConnected } }>
                    {children}
                </ConnectedContext.Provider>
            )
    }
export default ConnectedProvider;







