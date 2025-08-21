import { useContext } from "react";
import { configMoment } from "./moment";
import { AuthContext } from "../contexts/auth";

const useMoment = configMoment();  
const { usuario } = useContext(AuthContext);



export const generator =  ()=>{

    async function generatorSecret(){
        let data = useMoment.generatorDate();
        let secret = data + usuario.codigo
        console.log(secret); 
        return secret
    }
    

    return { generatorSecret }   
}