import { usePedidos } from "../database/queryPedido/queryPedido";
import useApi from "./api";

export const enviaPedidos = () => {

    const useQuerypedidos = usePedidos();

    const api = useApi();



    async function postItem(dados) {
        let resultApi:any
        let aux = await api.post('/pedidos', dados);
        if(aux.data ){
            resultApi   = aux.data;
            resultApi.results.forEach(  async ( i:any )=>{
                if( i !== null ){
                    await useQuerypedidos.updateSentOrderByCode('S',i.codigo)
                }
            })  
            console.log(aux.data);
        }
        return aux;
    }
 
    async function postPedidos() {
        let orders:any = await useQuerypedidos.selectAll();

        if (orders?.length > 0) {

            const obj:any = []; // Inicializando como array
            const promises = orders.map(async (i) => {
                let aux = await useQuerypedidos.selectCompleteOrderByCode(i.codigo);
                obj.push(aux); // Adicionando ao array
            });

            await Promise.all(promises);  
            
              postItem(obj)  
           // console.log(obj[0]);
        } else {
            console.log('nenhum orcamento pronto para o envio');
          //  Alert.alert('nenhum orcamento pronto para o envio');
        }
    }


async function postPedido(codigo:number){
    const obj:any = [];  
    let aux = await useQuerypedidos.selectCompleteOrderByCode( codigo);
    obj.push(aux); // Adicionando ao array
    
    let resultPedido;
     if(obj.length > 0 ){
        resultPedido =   postItem(obj)  
 
     }

}


    return { postPedidos ,postPedido , postItem};
}
