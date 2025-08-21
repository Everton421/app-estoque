import { createContext, useState } from "react";


export const ProdutosContext = createContext({});


    function ProdutosProvider({ children }:any){
            const [ produtos , setProdutos ]  = useState <any> ([]);
            const dataC = {"value":'teste'};

            return (
                <ProdutosContext.Provider value={ {dataC, produtos, setProdutos}}>
                    {children}
                </ProdutosContext.Provider>
            )
    }
export default ProdutosProvider;
