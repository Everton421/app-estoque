import { createContext, useState } from "react";

type user = {
     codigo : number 
     email :  string 
     lembrar : "S" | "N"  
     nome : string   
     senha : string  
     token :string
}

export const AuthContext = createContext({});


    function AuthProvider({children}:any){
        const [usuario, setUsuario] = useState<user>();
        const [ logado, setLogado ] = useState<boolean>(false);

        return(
            <AuthContext.Provider value={ {logado, setLogado ,usuario, setUsuario}}>
                {children}
            </AuthContext.Provider>
        )
    }

    export default AuthProvider; 