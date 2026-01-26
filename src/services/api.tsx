import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../contexts/auth";
 
const useApi = () => {
    const { usuario }:any = useContext(AuthContext);

    const api = axios.create({
        // TENTE ESTAS OPÇÕES UMA DE CADA VEZ:
        
        // OPÇÃO 1: Se o servidor tem SSL válido na porta 3000
        baseURL: "https://server.intersig.com.br:3000/v1/", 
        
        // OPÇÃO 2: Se for HTTP comum (sem cadeado)
        // baseURL: "http://server.intersig.com.br:3000/v1/", 

        timeout: 10000, // 10 segundos de limite
    });

    api.interceptors.request.use(
        async (config) => {
            if (usuario && usuario.token) {
               config.headers["token"] = usuario.token;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return api;
};
export default useApi;
