import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { use, useContext } from "react";
import { AuthContext } from "../contexts/auth";
import NetInfo from '@react-native-community/netinfo';
 
const useApi = () => {
    const  { usuario } :any    = useContext(AuthContext);
 

     const baseUrl = "https://dev.intersig.com.br:3000" ;
    //const baseUrl = "http://192.168.100.115:3000" ;
          
    const api = axios.create({
        baseURL: baseUrl, 
        timeout: 10000, // 10 segundos de limite
    });

    api.interceptors.request.use(
        async (config) => {
            if (usuario && usuario.token && !config.headers["token"]) {
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
