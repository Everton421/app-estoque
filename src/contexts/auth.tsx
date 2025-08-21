import { createContext, useState } from "react";


export const AuthContext = createContext({});


    function AuthProvider({children}:any){
        const [usuario, setUsuario] = useState();
        const [ logado, setLogado ] = useState<boolean>(false);

        return(
            <AuthContext.Provider value={ {logado, setLogado ,usuario, setUsuario}}>
                {children}
            </AuthContext.Provider>
        )
    }

    export default AuthProvider; 