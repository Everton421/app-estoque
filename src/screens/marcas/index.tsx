import { Text, View ,TouchableOpacity, TextInput, FlatList, Modal, Image, Alert, ActivityIndicator} from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from "react";
import { useMarcas } from "../../database/queryMarcas/queryMarcas";
import { useFocusEffect } from "@react-navigation/native";
import useApi from "../../services/api";
import { LodingComponent } from "../../components/loading";
import { configMoment } from "../../services/moment";
import { RenderItensMarcas } from "./renderItem";
import { EmptyState } from "../../components/empty-state";
import { Fab } from "../../components/fab";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { delay } from "../../utils/delay";

type marca= { codigo:number, descricao:string}

export const Marcas = ({navigation}:any)=>{
    const [ press, setPress ] = useState(false);
    const [ dados, setDados ] = useState<marca[]>();
    const [ pesquisa, setPesquisa ] = useState<string | undefined>();
    const [ visible, setVisible ] = useState<boolean>(false);
    const [ marcaSelecionada, setMarcaSelecionada ] = useState<any>();
    const [ loading , setLoading ] = useState(false);

    const [isVisibleAlert,  setIsVisibleAlert] = useState(false);
    const [titleAlert,      setTitleAlert ] = useState('');
    const [messageAlert,    setMessageAlert] =useState('');
    const [typeAlert,       setTypeAlert] = useState<AlertType>('success');
    const [cancelText,      setCancelText] = useState<string | undefined>();
    const [confirmText,     setConfirmText] = useState<string | undefined>();

    const [ isLoadingData, setIsloadingData ] = useState(false)

     const api = useApi();
     const dateService = configMoment();

     async function searchMarcasRequest(){
            try{
              setIsloadingData(true)
                          await delay(700, 'Busca das marcas')
                        const resultRequest = await api.get('/marcas/search', {
                            params:{
                                search: pesquisa
                            }
                        })
                        if(resultRequest.status == 200){
                            setDados(resultRequest.data)
                        }
                    }catch(e){
                    }finally{
                      setIsloadingData(false)
                    }
     }
     
    
     useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
                searchMarcasRequest()
        });
        return unsubscribe;
     }, [navigation, pesquisa    ]); 


            useEffect(
                ()=>{   
                  searchMarcasRequest()
                },[  pesquisa ]  )



        function handleSelect(item:any){
            setVisible(true);
            setMarcaSelecionada(item)
        }


async function gravar(){
  if( !marcaSelecionada?.descricao )   {
            setIsVisibleAlert(true)
            setTitleAlert("Atenção!")
            setMessageAlert(`É necessario informar a descrição para poder gravar!`)
            setTypeAlert('info')
            setCancelText(undefined)
            setConfirmText('ok')
            return
       }
    try{
        
        setLoading(true);
        let objmarca:any = {
                    "codigo": marcaSelecionada && marcaSelecionada.codigo,
                    "descricao": marcaSelecionada.descricao,
                    "data_cadastro": marcaSelecionada.data_cadastro,
                    "data_recadastro": dateService.dataHoraAtual(),
                    "id": String(marcaSelecionada.id)
                    }
        let result = await api.put('/marcas', objmarca);
        
        if(result.status === 200 ){
           
            setVisible(false)
            setIsVisibleAlert(true)
            setTitleAlert("Sucesso!")
            setMessageAlert(` Marca: ${marcaSelecionada?.descricao} Alterado Com Sucesso! `)
            setTypeAlert('success')
            setCancelText(undefined)
            setConfirmText('ok')
        }


    }catch(e:any){
        if(e.status === 400 ){
            setIsVisibleAlert(true)
            setTitleAlert("Erro!")
            setMessageAlert(` ${e.response.data.message} `)
            setTypeAlert('error')
            setCancelText(undefined)
            setConfirmText('ok')
            return 
        } else{
            
             setIsVisibleAlert(true)
            setTitleAlert("Erro!")
            setMessageAlert(` ${e.response.data.message} `)
            setTypeAlert('error')
            setCancelText(undefined)
            setConfirmText('ok')
            return 

        }  
    }finally{
        setLoading(false);
    }
}

    return(

        <View style={{   flex:1,  backgroundColor:'#EAF4FE'}} >
                   <LodingComponent isLoading={loading} />
       
      <CustomHeader
        title="Marcas"
        onBack={() => navigation.goBack()}
        showSearch
        searchValue={pesquisa}
        onSearchChange={(v) => setPesquisa(v)}
        showFilter
      />
                  

 
            <Modal transparent={true} visible={visible} animationType="fade">
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '85%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                  <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Editar Marca</Text>
                    <TouchableOpacity onPress={() => setVisible(false)}>
                      <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Código
                     <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>  {marcaSelecionada?.codigo}  </Text>
                    </Text>
                     <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Id <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                      {marcaSelecionada?.id}
                    </Text></Text>

                    <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Descrição</Text>
                    <TextInput
                      style={{ backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, height: 47, fontSize: 15, color: '#333' }}
                      defaultValue={marcaSelecionada?.descricao}
                      onChangeText={(v) => setMarcaSelecionada((prev: any) => ({ ...prev, descricao: v }))}
                    />

                    <TouchableOpacity
                      style={{ backgroundColor: '#185FED', borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 25, elevation: 3 }}
                      onPress={() => gravar()}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Gravar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
               <CustomAlert
                    visible={isVisibleAlert}
                    message={messageAlert}
                    onConfirm={() => setIsVisibleAlert(false)}
                    onCancel={() => setIsVisibleAlert(false)}
                    title={titleAlert}
                    type={typeAlert}
                    cancelText={cancelText}
                    confirmText={confirmText}
                  />
            

                 {/**  */}

          { isLoadingData ? 
                                  <View style={{flex:1, alignItems:"center", justifyContent:"center" }}>
                                      <ActivityIndicator size={50} color="#185FED" /> 
                                  </View> :

                <View style={{  marginBottom: 10}}> 
                      <FlatList
                          data={ dados || [] }
                          renderItem = {( { item } )=>  <RenderItensMarcas item={item} handleSelect={handleSelect} />  }
                          keyExtractor={(i)=> i.codigo.toString()}
                          ListEmptyComponent={() => <EmptyState icon="bookmark" message="Nenhuma marca encontrada" />}
                      />
                  </View>
            }
        {/**  */}
            <Fab onPress={() => navigation.navigate('cadastro_marcas')} />

        </View>
    )
}