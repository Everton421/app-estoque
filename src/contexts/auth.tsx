import { createContext, useState } from "react";

type user = {
     codigo : number 
     email :  string 
     lembrar : "S" | "N"  
     nome : string   
     senha : string  
     token :string
}

export type Permissao = {
     id : string
}

export const AuthContext = createContext({});


    function AuthProvider({children}:any){
        const [usuario, setUsuario] = useState<user>();
        const [ logado, setLogado ] = useState<boolean>(false);
        const [ permissoes, setPermissoes ] = useState<Permissao[]>([]);

        return(
            <AuthContext.Provider value={ {logado, setLogado ,usuario, setUsuario, permissoes, setPermissoes}}>
                {children}
            </AuthContext.Provider>
        )
    }

    export default AuthProvider; 