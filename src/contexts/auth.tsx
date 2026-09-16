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

export type filiaisUsuario = {
         codigo: number,
         nome_fantasia: string,
         razao_social: string,
         cnpj: string,
         ativo: 'S' | 'N'
}
export const AuthContext = createContext({});


    function AuthProvider({children}:any){
        const [usuario, setUsuario] = useState<user>();
        const [ logado, setLogado ] = useState<boolean>(false);
        const [ permissoes, setPermissoes ] = useState<Permissao[]>([]);
        const [filiais, setFiliais ] = useState<filiaisUsuario[]>([])

        return(
            <AuthContext.Provider value={ {logado, setLogado ,usuario, setUsuario, permissoes, setPermissoes , filiais, setFiliais}}>
                {children}
            </AuthContext.Provider>
        )
    }

    export default AuthProvider; 