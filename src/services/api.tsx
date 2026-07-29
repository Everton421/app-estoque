import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { use, useContext } from "react";
import { AuthContext } from "../contexts/auth";
import NetInfo from '@react-native-community/netinfo';
 
const useApi = () => {
    const  { usuario } :any    = useContext(AuthContext);

    let internetType: null | string = null;
        let isWifiEnabled:  boolean = false;
        let ipAddress :string | null = null;

      const unsubscribe = NetInfo.addEventListener((state:any) => {
                internetType = state.type;
                isWifiEnabled = state.isWifiEnabled != undefined  && state.isWifiEnabled;
                ipAddress = state?.details?.ipAddress || null;
            });



    let baseUrl = "https://dev.intersig.com.br:3000" ;
            if(usuario && usuario.email && usuario.email.includes('syma')){
                baseUrl= "http://10.1.1.222:3030";
            }

            

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
