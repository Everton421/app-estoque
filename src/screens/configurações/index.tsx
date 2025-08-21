import { View, Text, Button, Alert, Modal, ActivityIndicator, StyleSheet,Animated, TouchableOpacity, Linking, ScrollView } from "react-native"
import useApi from "../../services/api"
import { useContext,   useEffect,   useState } from "react"
import { ConnectedContext } from "../../contexts/conectedContext"
import { restartDatabaseService } from "../../services/restartDatabase"
import { configMoment } from "../../services/moment"
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api"
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ConfigProdSeletor } from "./components/configProdSeletor"
import { useSyncProdSector   } from "../../hooks/sync-produto-setor/useSyncProdutosSetor"
import { useSyncMovimentos } from "../../hooks/sync-movimentos/useSyncMovimentos"
import { useSyncProdutos } from "../../hooks/sync-produtos/useSyncProdutos"
import { useSyncFotos } from "../../hooks/sync-fotos/useSyncFotos"
import { useSyncMarcas } from "../../hooks/sync-marcas/useSyncMarcas"
import { useSyncCategorias } from "../../hooks/sync-categorias/useSyncCategorias"
import { useSyncSetores } from "../../hooks/sync-setores/useSyncSetores"
import { DotIndicatorLoadingData } from "../../components/dotIndicator"


export const Configurações = () => {

  const api = useApi();

  const {connected, setConnected }:any = useContext(ConnectedContext);
          
  const syncprodSector = useSyncProdSector();
  const syncMovimentos = useSyncMovimentos();
  const syncProdutos = useSyncProdutos();
  const syncCategorias = useSyncCategorias();
  const syncFotos = useSyncFotos();
  const syncMarcas = useSyncMarcas();
  const syncSetores = useSyncSetores();


  const useRestartService = restartDatabaseService();
  const useMoment = configMoment();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [ item , setItem ] = useState<String>();
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>()
  const [conectado, setConectado] = useState<boolean>()
  const [msgApi , setMsgApi ] = useState('');

    const useQueryConfigApi = queryConfig_api();
 

  async function connect() {

    try {
      setLoading(true)
      const response = await api.get('/', {
      });
        if (response.status === 200 && response.data.ok) {
            setConectado(true)
            setConnected(true)
        console.log(response.data);
setMsgApi('')
        } else {
            setConectado(false)
            setConnected(false)
            console.log({"err":"erro ao conectar"})
        }
        setError(undefined)
    } catch (err:any) {
      setConectado(false)
        setMsgApi(err.response.data.msg);
        if(err.status === 400 ) Alert.alert("Erro!", err.response.data.msg);
          setError(err.response.data.msg)

        if(err.status !== 400 )
          Alert.alert("Erro!", "Erro desconhecido!");
        setError("Erro desconhecido!")

    } finally {
      setLoading(false)

    }
}

 const verifyDateSinc = async ()=>{
    let validConfig = await useQueryConfigApi.select(1)
    let dataUltSinc:string;
    let data =
    {
     codigo:1,
     url:'',
     porta:3306,
     token:'',
     data_sinc: useMoment.dataHoraAtual(),
      data_env:'0000-00-00 00:00:00'
   }

      if( validConfig && validConfig?.length > 0   ){
          dataUltSinc = validConfig[0].data_sinc
          console.log("Ultima Sincronizacao : ", validConfig[0].data_sinc )
          useQueryConfigApi.updateByParam(data)
      }else{
       let aux = await useQueryConfigApi.create(data);
       dataUltSinc ='';
       console.log("Executando primeira sincronizacao")
      }
        return dataUltSinc;
  }

  
 
   const syncDataProcess = async () => {
    let data =  await verifyDateSinc();
        setIsLoading(true);
        setProgress(0);
        
        try {
            await syncProdutos.syncData( { data, setIsLoading, setProgress, setItem } );
            await syncCategorias.syncData( { data, setIsLoading, setProgress, setItem } );
            await syncFotos.syncData( { data, setIsLoading, setProgress, setItem } );
            await syncprodSector.syncData( { data, setIsLoading, setProgress, setItem } );
            await syncMarcas.syncData( { data, setIsLoading, setProgress, setItem } );
            await syncMovimentos.syncData( { data, setIsLoading, setProgress, setItem } );
            await syncSetores.syncData( { data, setIsLoading, setProgress, setItem } );


    console.log('Fim do processo')

          setData([]); // Atualiza o estado para mostrar dados após a sincronização
        } catch (e) {
          console.log(e);
        } finally {
          setIsLoading(false);
          setTimeout(() => setProgress(0), 1000); // Reseta o progresso após 1 segundo
        }
  };
 

  const handleSync = () => {
    if(loading){
      return Alert.alert('Aguarde!','Estabelecendo conexão...');
    }

    if (!connected) {
      Alert.alert('É necessário estabelecer conexão com a internet para efetuar o sincronismo dos dados!');
      return;
    }
    if (!conectado) {
      Alert.alert(msgApi );
      return;
    }
     syncDataProcess();
  };


 useEffect(  () => {
        connect();
       }, []);

      function restart(){
          Alert.alert('Atenção', `Será necessario uma nova sincronização, deseja concluir esta operação ?`,[
              { text:'Não',
                  onPress: ()=> console.log('nao excluido o item'),
                  style:'cancel',
              },
              {
                  text: 'Sim', onPress: async ()=>{ 
                    await  useRestartService.restart()
                  }
              }
          ] )

      }

 const openUrl = async (url:string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Não foi possível abrir esta URL: ${url}`);
    }
  };
   

  return (
    <View style={{ flex: 1 , backgroundColor:'#EAF4FE', alignItems:"center",   width:'100%' }}>
        <View style={{flexDirection:"row" ,marginTop:10 }}>
          {loading ? (
                 <View>
                     <Text>   Testando conexão... <ActivityIndicator size={20} color="#185FED" /></Text>
                  </View>
                        ) : (
                            <>
                                {error ? (
                                    <Text style={{ fontWeight:"bold" }}> status api: {error}</Text>
                                ) : (
                                    <View  >
                                      
                                    {connected ? <Text style={{ color:'green', fontWeight:"bold" }}> status api:  Conectado! <Feather name="wifi" size={24} color="green" /> </Text> 
                                    : <Text style={{ color:'red',width:'100%',fontWeight:"bold" }}>status api:   Não conectado! <Feather name="wifi-off" size={24} color="red" /> </Text>}
                                    </View>

                                )}
                            </>
                        )}
        </View>
          <TouchableOpacity  style={ { alignItems:"center",marginTop:3,elevation:3,padding:5,borderRadius: 5,backgroundColor:'#185FED', justifyContent:"center" }} onPress={()=>{ connect()}}>
            <Text style={{ color:'#FFF' , fontWeight:"bold"}} > testar conexão </Text>
          </TouchableOpacity>

 
          {/**

          <LoadingData isLoading={isLoading} item={item} progress={progress} /> */}
        <DotIndicatorLoadingData isLoading={isLoading} item={item} progress={progress}   />
      
            {/***** enviar cadastros  */}
            <View style={{ marginTop:15, margin:5,borderRadius:5, padding:10, backgroundColor:'#FFF', elevation:3, width:' 98%', alignItems:"center", justifyContent:"center"  }} >
                  <View style={{ flexDirection:"row", gap:5}}>
                     <Text style={{ color:'#185FED', fontWeight:"bold", fontSize:17, flex:1,  textAlign:"center"}} >Sincronizar Dados</Text>
                  </View>         
                  
                  <TouchableOpacity  style={ { flexDirection:"row",alignItems:"center", margin:15, elevation:5,padding:5,borderRadius: 5,backgroundColor:'#185FED' }} onPress={()=>{ handleSync()}}>
                     <MaterialCommunityIcons name="database-sync" size={35} color="#FFF"  />
                    <Text style={{ color:'#FFF', fontWeight:"bold"}} > Sincronizar dados </Text>
                  </TouchableOpacity>
            </View >

        <View style={{ marginTop:15, margin:5,borderRadius:5, padding:10, backgroundColor:'#FFF', elevation:3, width:' 98%', alignItems:"center", justifyContent:"center"  }} >
                
                       <Text style={{ color:'#89898fff', textAlign:"center",fontWeight:"bold", fontSize:15 }} > 
                           Configurar busca por código de barras 
                         </Text>
                  <ConfigProdSeletor/>
              </View >

          
              <TouchableOpacity  style={ { marginTop:50, alignItems:"center", elevation:3,padding:5, flexDirection:"row", borderRadius: 5,backgroundColor:'red' }}  onPress={() =>   restart() } >
                <MaterialCommunityIcons name="database-remove" size={35} color="#FFF" />
                  <Text style={{ color:'#FFF',fontWeight:"bold" }} > limpar base de dados</Text>
              </TouchableOpacity>
      <ScrollView style={styles.contentArea}>

     </ScrollView>

             <View style={styles.footer}>
                <TouchableOpacity   style={styles.linkButton}
                    onPress={()=> openUrl("https://www.intersig.com.br/termos-de-uso-app/")}
                  >
                    <Text style={styles.linkText} > 
                        Termos de uso
                      </Text>
                </TouchableOpacity>

                  <TouchableOpacity   style={styles.linkButton}
                    onPress={()=> openUrl("https://intersig.com.br/politicas-privacidade-app/")} >
                    <Text style={styles.linkText} > 
                        Políticas de Privacidade
                      </Text>
                </TouchableOpacity>
              </View>
  
    </View>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    fontSize: 18,
    marginBottom: 10,
    color:'#FFF',
     width:'100%',
     textAlign:'center'
  },
    contentArea: {
    flex: 1, // Faz a área de conteúdo expandir para preencher o espaço disponível, empurrando o footer para baixo
    paddingHorizontal: 20,
    paddingTop: 20, // Adiciona um pouco de espaço no topo do conteúdo
  },
    footer: {
    flexDirection: 'row',  
    justifyContent: 'space-around',  
    alignItems: 'center',  
    paddingVertical: 15,  
    borderTopColor: '#ccc',
    backgroundColor: 'white',
    elevation:3,
    borderRadius:5,
    paddingHorizontal:15
    
  },
  progressBar: {
    height: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    width: '90%', // Garantir que a barra de progresso tenha uma largura inicial
 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Cor de fundo com opacidade
  },
    linkButton: {
    paddingHorizontal: 10, // Espaçamento para o toque ser mais fácil
  },
   linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
