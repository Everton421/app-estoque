import { Alert, Text, TouchableOpacity, View, TextInput, ScrollView } from "react-native"
import useApi from "../../services/api"
import { useContext, useEffect, useState } from "react"
import { useCategoria } from "../../database/queryCategorias/queryCategorias"
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { ConnectedContext } from "../../contexts/conectedContext"
import { LodingComponent } from "../../components/loading"
import { CustomHeader } from "../../components/custom-header/custom-header";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";

export const Cadastro_Categorias = ({navigation}:any) => {

    const [ input , setInput ] = useState('');
    const [ categoriaApi, setCategoriaApi ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState(false); 

    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert,   setTitleAlert] = useState('');
    const [typeAlert,    setTypeAlert] = useState<AlertType>('info');


    const api = useApi();
    const useQueryCategoria = useCategoria();
       const { connected, setConnected } = useContext<any>(ConnectedContext)
   
   const [ newId, setNewId ] = useState<string>();


      async function findLastCode(){
          const resultRequestlastCode = await api.get("/categorias/last-codigo");
          if(resultRequestlastCode.status == 200){
              setNewId(`#${resultRequestlastCode.data.codigo + 1}`);
          }
      }

 function setConexao() {
            const unsubscribe = NetInfo.addEventListener((state) => {
                setConnected(state.isConnected as any);
            });
            return () => {
                unsubscribe();
            };
        }

   

        async function gravar (){

          if (connected === false)  {
              setTitleAlert(`Erro`);
              setTypeAlert('error');
              setMessageAlert('É necessario estabelecer conexão com a internet para efetuar o cadastro !');
              setVisibleAlert(true)
                return
            }
            if(!input || input === "") return Alert.alert("é necessario informar a descricao!") 

                try{
                    setLoading(true)
                    let resposta = await api.post('/categorias', {  descricao : input, id: newId});
                        
                        if(resposta.status === 201 && resposta.data.codigo > 0 ){
                            
                            setVisibleAlert(true)
                            setMessageAlert(`Categoria ${input} registrada com sucesso! `)
                            setTitleAlert('Sucesso!')
                            setTypeAlert('success')
                          return;
                        }
                    }catch(e:any){
                        if( e.status === 400 ){
                               setVisibleAlert(true)
                            setMessageAlert( `${e.response.data.msg}`)
                            setTitleAlert('Erro')
                            setTypeAlert('error')
                            return  
                          }
                    }finally{
                    setLoading(false)
                    }

        } 
 
        useEffect(()=>{
            findLastCode()
        setConexao();

            },[])

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
          <LodingComponent isLoading={loading} />
          <CustomHeader
            title="Nova Categoria"
            showSearch={false}
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
              <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Id:  {newId}</Text>
              <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Descrição da Categoria</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#F9F9F9' }}
                placeholder="Ex: Filtros"
                placeholderTextColor="#999"
                onChangeText={(v) => setInput(v)}
              />
          
            </View>

            <TouchableOpacity
              style={{ backgroundColor: '#185FED', borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24, elevation: 4, shadowColor: '#185FED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 }}
              onPress={() => gravar()}
            >
              <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 18 }}>Gravar Categoria</Text>
            </TouchableOpacity>
          </ScrollView>
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
        </View>
    )
}