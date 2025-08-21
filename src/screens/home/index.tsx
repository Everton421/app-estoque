import React, { useEffect, useContext, useState } from "react";
import { View, FlatList, Text, Alert, BackHandler, TouchableOpacity, StatusBar, Image, ActivityIndicator, ScrollView } from "react-native";
import { AuthContext } from "../../contexts/auth";
import { AntDesign, Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { restartDatabaseService } from "../../services/restartDatabase";
import { queryEmpresas } from "../../database/queryEmpresas/queryEmpresas";
import useApi from "../../services/api";
import DataSyncScreen from "../data-sync-screen";
import { InitialLoadingData } from "../../components/initialloadingData";
import { useSyncProdSector } from "../../hooks/sync-produto-setor/useSyncProdutosSetor";
import { useSyncMovimentos } from "../../hooks/sync-movimentos/useSyncMovimentos";
import { useSyncProdutos } from "../../hooks/sync-produtos/useSyncProdutos";
import { useSyncCategorias } from "../../hooks/sync-categorias/useSyncCategorias";
import { useSyncFotos } from "../../hooks/sync-fotos/useSyncFotos";
import { useSyncMarcas } from "../../hooks/sync-marcas/useSyncMarcas";
import { useSyncSetores } from "../../hooks/sync-setores/useSyncSetores";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import { configMoment } from "../../services/moment";
import { ConnectedContext } from "../../contexts/conectedContext";

type cadEmpre =
  {
    cnpj: string,
    email_empresa: string,
    telefone_empresa: string,
    nome: string,
    codigo: number,
    responsavel: number
  }

export const Home = ({ navigation }: any) => {

    const {connected, setConnected }:any = useContext(ConnectedContext);
  const { setLogado, setUsuario, usuario }: any = useContext(AuthContext);
     const api = useApi();
  const syncprodSector = useSyncProdSector();
  const syncMovimentos = useSyncMovimentos();
  const syncProdutos = useSyncProdutos();
  const syncCategorias = useSyncCategorias();
  const syncFotos = useSyncFotos();
  const syncMarcas = useSyncMarcas();
  const syncSetores = useSyncSetores();
  const useQueryConfigApi = queryConfig_api();
  const useMoment = configMoment();

      const [isLoading, setIsLoading] = useState(false);
      const [progress, setProgress] = useState(0);
      const [loading, setLoading] = useState(false);
      const [conectado, setConectado] = useState<boolean>()
      const [error, setError] = useState<string>()
      const [msgApi , setMsgApi ] = useState('');
      const [ item , setItem ] = useState<String>();
     

  const [sair, setSair] = useState<boolean>(false)
  const [cadEmpresa, setCadEmpresa] = useState<cadEmpre>()
  const [loaidngEmpr, setLoadingEmpr] = useState(false);

  let useQueryEmpresa = queryEmpresas();
  let restartDB = restartDatabaseService();



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
        } catch (e) {
          console.log(e);
        } finally {
          setIsLoading(false);
          setTimeout(() => setProgress(0), 1000); // Reseta o progresso após 1 segundo

        }
  };




async function buscaEmpresa (){
  setLoadingEmpr(true)
  let validEmpr:any  = await useQueryEmpresa.selectAll();
  if(validEmpr?.length > 0 ){
    setCadEmpresa(validEmpr[0]);
  setLoadingEmpr(false)
  }else{
    try{
      let validEmpresa = await api.post("/empresa/validacao" ,
        { Headers:{
          token: usuario.token
          }
        }  );
  
      if (validEmpresa.data.status.cadastrada) {
        let objEmpr = {
          codigo_empresa: validEmpresa.data.data.codigo,
          nome: validEmpresa.data.data.nome,
          cnpj: validEmpresa.data.data.cnpj,
          email: validEmpresa.data.data.email_empresa,
          responsavel: validEmpresa.data.data.responsavel,
        };
      let aux = await useQueryEmpresa.createByCode(objEmpr);
        setCadEmpresa(validEmpresa.data.data)
      }
    }catch(e:any){
      console.log( 'Ocorreu um erro ao tentar validar a empresa ',  e.response.data.msg )
    } finally{
      setLoadingEmpr(false)
    }
  }

 
}

  useEffect(
    () => {
      buscaEmpresa()
      syncDataProcess()
       
    }, [usuario.token]
  )


  function alertSair() {
    Alert.alert('Sair', 'Ao sair serão excluidos os dados do aplicativo, será necessario efetuar uma nova sincronização',
      [
        {
          text: 'Cancelar',
          onPress: () => setSair(false),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => setSair(true) }
      ]);

  }

  useEffect(() => {
    async function logout() {
      if (sair === true) {
        setLogado(false)
        setUsuario({})
        await restartDB.restart();
        navigation.navigate('inicio')
      }
    }
    logout()
  }, [sair])

 


  const data = [
    {
      "nome": "acertos",
        "icon": <MaterialCommunityIcons name="barcode-scan" size={30} color="#185FED" />
    },
  
    {
      "nome": "usuarios",
      "icon": <FontAwesome name="users" size={24} color="#185FED" />
    },
    {
      "nome": "ajustes",
      "icon": <FontAwesome5 name="sync-alt" size={24} color="#185FED" />
    } 
  ];

  const Item = ({ value }: any) => {
    return (
      <TouchableOpacity style={{ margin: 6  }} onPress={() => navigation.navigate(value.nome)}    >
        <View
          style={{ backgroundColor: "#FFF", margin: 10, borderRadius: 100, width: 55, height: 55, alignItems: "center", justifyContent: "center", elevation: 5 }} >
          {value.icon}
        </View>
        <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center", maxWidth: 150, color:'#FFF' }}> {value.nome}</Text>
      </TouchableOpacity>

    );
  };

  
  return (

    <View style={{ flex: 1, backgroundColor: "#EAF4FE" , height:'auto'}}>

     <InitialLoadingData 
       isLoading={isLoading}
       item={item}
       progress={progress}  />

      <View style={{  backgroundColor: '#185FED', elevation: 7, padding: 5,height:200,borderBottomEndRadius:50, borderStartEndRadius:50}}>
         <View  >
            < View style={{ width:'100%' ,alignItems: "center",    flexDirection: "row", justifyContent:"space-between"}} >
                    <View style={{ backgroundColor: '#FFF', borderRadius: 55, padding: 3, margin: 3 }}>
                          <Image
                            style={{ width: 45, height: 45, resizeMode: 'stretch', }}
                            source={
                              require('../../imgs/intersig120x120.png')
                            }
                          />
                    </View>

                    {
                      loaidngEmpr ? (
                        <ActivityIndicator size={20} color={'#FFF'} />
                      ) : (
                        <Text style={{ fontWeight: "bold", color: '#FFF', margin: 7 }}>
                          {cadEmpresa?.nome}
                        </Text>
                      )
                    }
            </View>
            <View style={{ margin: 10, alignItems: "center"   }}>
                <FlatList
                  horizontal={true}
                  data={data}
                  renderItem={({ item }) => <Item value={item} />}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
          </View>
      </View>

      <ScrollView style={{ flex:1}}>
     
          <View style={{  width: '100%', alignItems: "center", justifyContent: "center"  }}>

   
            <TouchableOpacity 
              style={{ flexDirection: "row", padding: 10 ,marginTop: 15, margin: 10, backgroundColor: '#FFF', width: '80%', height:80, borderRadius: 10, elevation: 2,  justifyContent:"space-around", alignItems: "center" }}
               onPress={() => { navigation.navigate('produtos') }} >
               <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
                   <FontAwesome name="cubes" size={24} color="#185FED" />
               </View>
              <Text style={{ fontWeight: "bold", fontSize: 17, color: '#5f666dff',  flex:1, textAlign: 'center' }} > Produtos </Text>
              <AntDesign name="caretdown" size={24} color="#185FED" />
            </TouchableOpacity>

          <TouchableOpacity 
                style={{ flexDirection: "row", padding: 10,marginTop: 15, margin: 10, backgroundColor: '#FFF', width: '80%', height:80, borderRadius: 10, elevation: 2 ,  justifyContent:"space-around", alignItems: "center" }}
                onPress={() => { navigation.navigate('setores') }} >
                <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
                <Entypo name="archive" size={24} color="#185FED" />
                </View>
                <Text style={{ fontWeight: "bold", fontSize: 17, color: '#5f666dff',  flex:1, textAlign: 'center' }} >Setores</Text>
                <AntDesign name="caretdown" size={24} color="#185FED" />
             </TouchableOpacity>
    
        </View>
     </ScrollView> 

      <View style={{  flexDirection: "row", position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#185FED', padding: 10, justifyContent: "space-between", }}>
        <Text style={{ color: '#FFF', fontSize: 20, fontWeight: "bold", width: '50%' }}>
          {usuario && usuario.nome}
        </Text>

        <TouchableOpacity onPress={() => alertSair()} style={{ flexDirection: "row" }}>
          <Text style={{ color: '#FFF', fontWeight: "bold" }} >Sair</Text>
          <MaterialCommunityIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
 
      </View>

    </View>
  );
};
