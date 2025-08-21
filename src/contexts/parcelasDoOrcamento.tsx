import { createContext, useState } from "react";


export const ParcelasContext = createContext({});


    function ParcelasProvider({ children }:any){
            const [ parcelas , setParcelas ]  = useState <any> ([]);
            const dataC = {"value":'teste'};

            return (
                <ParcelasContext.Provider value={ {  parcelas, setParcelas}}>
                    {children}
                </ParcelasContext.Provider>
            )
    }
export default ParcelasProvider;