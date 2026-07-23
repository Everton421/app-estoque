import { ActivityIndicator, Alert, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext, useEffect, useState } from "react";
import { useCategoria } from "../../database/queryCategorias/queryCategorias";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { LodingComponent } from "../../components/loading";
import { configMoment } from "../../services/moment";
import useApi from "../../services/api";
import { Fab } from "../../components/fab";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { EmptyState } from "../../components/empty-state";
import { RenderItemsCategory } from "./renderItensCategory/RenderItensCategory";
import { delay } from "../../utils/delay";
import { ConnectedContext } from "../../contexts/conectedContext";
import NetInfo from '@react-native-community/netinfo';
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";

type category = {
  codigo: number;
  descricao: string;
  data_cadastro:string 
  data_recadastro:string 
 id:string
};

export const Categoria = ({ navigation }: any) => {

  const [dados, setDados] = useState<category[]>([]);
  const [pesquisa, setPesquisa] = useState<string>("");
  const [ categoriaSelecionada , setCategoriaSelecionada ] = useState<any>();
  const [ loading , setLoading ] = useState(false);
  const [ visible, setVisible ] = useState(false); 
  const [ isLoadingData, setIsloadingData ] = useState(false)
  const { connected, setConnected } = useContext<any>(ConnectedContext)


      const [visibleAlert, setVisibleAlert] = useState(false);
      const [messageAlert, setMessageAlert] = useState('');
      const [titleAlert,   setTitleAlert] = useState('');
      const [typeAlert,    setTypeAlert] = useState<AlertType>('info');
  
  

         const dateService = configMoment();
         const api = useApi();

  async function searchCategoryRequest() {
   
          try{
                      setIsloadingData(true)
                  await delay(700, 'busca categorias')
                        const resultRequest = await api.get('/categorias/search', {
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
                searchCategoryRequest()
        });
        return unsubscribe;
     }, [navigation, pesquisa    ]); 


         
 function setConexao() {
            const unsubscribe = NetInfo.addEventListener((state) => {
                setConnected(state.isConnected as any);
            });
            return () => {
                unsubscribe();
            };
        }


  useEffect(() => {
    setConexao()
     searchCategoryRequest();
  }, [pesquisa]);


async function gravar(){
  if( !categoriaSelecionada?.descricao ) {
          setTitleAlert(`Erro`);
              setTypeAlert('error');
              setMessageAlert("É necessario informar a descrição para poder gravar!");
              setVisibleAlert(true)
              return;
  }
    
     if (connected === false)  {
              setTitleAlert(`Erro`);
              setTypeAlert('error');
              setMessageAlert('É necessario estabelecer conexão com a internet para efetuar o cadastro !');
              setVisibleAlert(true)
                return
            }

    
    try{
        
        setLoading(true);
        let objCategoria:any= {
                     codigo: categoriaSelecionada && categoriaSelecionada.codigo,
                     descricao: categoriaSelecionada && categoriaSelecionada.descricao,
                     data_cadastro: categoriaSelecionada && categoriaSelecionada.data_cadastro,
                     data_recadastro: dateService.dataHoraAtual(),
                     id: categoriaSelecionada && categoriaSelecionada.id,
                     ativo: categoriaSelecionada &&    categoriaSelecionada.ativo || 'S'
                    }
        let result = await api.put('/categorias', objCategoria);
                    

        if(result.status == 200 ){  

              setVisibleAlert(true)
              setMessageAlert(`Categoria ${categoriaSelecionada?.descricao} Alterada com sucesso! `)
              setTitleAlert('Sucesso!')
              setTypeAlert('success')
              return 
        }

    }catch(e:any){
        if(e.status === 400 || e.status === 500){
            
             setVisibleAlert(true)
                   setMessageAlert(e.response.data.msg)
                   setTitleAlert('Erro!')
                   setTypeAlert('error')
          return  

        } else{
            console.log(e)
              setVisibleAlert(true)
                   setMessageAlert('Erro desconhecido!')
                   setTitleAlert('Erro!')
                   setTypeAlert('error')
            return  
        }  
    }finally{
        setLoading(false);
        setVisible(false)
    }
}

  function handleSelect(item:category){
      setVisible(true);
      setCategoriaSelecionada(item)
      console.log(item)
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#EAF4FE" }}>
                         <LodingComponent isLoading={loading} />
      
      <CustomHeader
        title="Categorias"
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
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Editar Categoria</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Código: 
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}> {categoriaSelecionada?.codigo}
              </Text></Text>

      {categoriaSelecionada?.id ? 
              <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Id: 
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}> {categoriaSelecionada?.id}
              </Text></Text>
              : null }

              <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Descrição</Text>
              <TextInput
                style={{ backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, height: 47, fontSize: 15, color: '#333' }}
                defaultValue={categoriaSelecionada?.descricao}
                onChangeText={(v) => setCategoriaSelecionada((prev: any) => ({ ...prev, descricao: v }))}
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
 
      {/**  */}
              { isLoadingData ? 
                          <View style={{flex:1, alignItems:"center", justifyContent:"center" }}>
                              <ActivityIndicator size={50} color="#185FED" /> 
                          </View> :
          <View style={{ marginTop: 10 }}>
            <FlatList
                      data={dados}
                      renderItem={( {item} ) => ( <RenderItemsCategory  handleSelect={handleSelect} item={item} />) }
                      keyExtractor={(i) => i.codigo.toString()}
                      ListEmptyComponent={() => <EmptyState icon="category" message="Nenhuma categoria encontrada" />}
                    />
            </View>
            }
          <CustomAlert
                                           visible={visibleAlert}
                                           onConfirm={() => { 
                                               setVisibleAlert(false)
                                               navigation.goBack()
                                            }}
                                           title={titleAlert}
                                           message={messageAlert}
                                           type={typeAlert}
                                       />
      {/**  */}
      <Fab onPress={() => navigation.navigate('cadastro_categorias')} />
    </View>
  );
};
