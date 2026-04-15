import { usePedidos } from "../../database/queryPedido/queryPedido";
import useApi from "../../services/api";


type propsSyncData = 
{
data:string,
setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
setItem: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const enviaPedidos = () => {

    const useQuerypedidos = usePedidos();

    const api = useApi();



    async function postItem(dados: any) {
        let resultApi:any
        let aux = await api.post('/pedidos', dados);
        if(aux.data ){
            resultApi   = aux.data;
            resultApi.results.forEach(  async ( i:any )=>{
                if( i !== null ){
                    await useQuerypedidos.updateSentOrderByCode('S',i.codigo)
                }
            })  
            console.log(aux.status);
        }
        return aux;
    }
 
    
    async function postPedidos( { data ,setIsLoading,   setItem } : propsSyncData ) {
         try{

                let orders:any = await useQuerypedidos.selectAllCode(data);
                    console.log(`[V] ${orders?.length} pedido encontrados.`);

                        setItem('Enviando pedidos...');
                        setIsLoading(true)
                        

                if (orders?.length > 0) {
                    const obj:any = []; // Inicializando como array
                    const promises = orders.map(async (i: any) => {
                        let aux = await useQuerypedidos.selectCompleteOrderByCode(i.codigo);
                        obj.push(aux); // Adicionando ao array
                        
                    });

                    await Promise.all(promises);  
                    
                    await postItem(obj)  
                } else {
                    console.log('nenhum orcamento pronto para o envio');
                //  Alert.alert('nenhum orcamento pronto para o envio');
                }
            
        }catch(e){

            }finally{
                        setIsLoading(false)
            
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
