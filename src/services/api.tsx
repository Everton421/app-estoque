import axios from "axios";
import {  useContext } from "react";
import { AuthContext } from "../contexts/auth";
 
const useApi = () => {
    const  { usuario } :any    = useContext(AuthContext);
 

      const baseUrl = __DEV__ ? "http://100.120.164.10:3000" : "https://dev.intersig.com.br:3000" ;
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
