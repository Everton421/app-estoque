import { createContext, useState } from "react";


export const ClienteContext = createContext({});


    function ClienteProvider({ children }:any){
            const [ cliente , setCliente ]  = useState <any> ([]);
            const dataC = {"value":'teste'};

            return (
                <ClienteContext.Provider value={ {dataC, cliente, setCliente}}>
                    {children}
                </ClienteContext.Provider>
            )
    }
export default ClienteProvider;
