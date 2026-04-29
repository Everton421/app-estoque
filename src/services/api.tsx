import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../contexts/auth";
 
const useApi = () => {
    const { usuario }:any = useContext(AuthContext);

    const api = axios.create({
        
        baseURL: "http://192.168.237.142:3000", 

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
