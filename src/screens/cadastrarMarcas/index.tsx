import { useContext, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View, TextInput, ScrollView } from "react-native"
import useApi from "../../services/api";
import { useMarcas } from "../../database/queryMarcas/queryMarcas";
import NetInfo from '@react-native-community/netinfo';
import { ConnectedContext } from "../../contexts/conectedContext"
import { LodingComponent } from "../../components/loading";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";
import { CustomHeader } from "../../components/custom-header/custom-header";

export const Cadastro_Marcas = ( {navigation}:any ) => {


    const [ input , setInput ] = useState('');
    const [ loading, setLoading ] = useState(false); 
     
    const api = useApi();

     const [isVisibleAlert,  setIsVisibleAlert] = useState(false);
    const [titleAlert,      setTitleAlert ] = useState('');
    const [messageAlert,    setMessageAlert] =useState('');
    const [typeAlert,       setTypeAlert] = useState<AlertType>('success');
    const [cancelText,      setCancelText] = useState<string | undefined>();
    const [confirmText,     setConfirmText] = useState<string | undefined>();
   const [ newId, setNewId ] = useState<string>();


    const {connected,  setConnected} = useContext<any>(ConnectedContext)

       async function findLastCode(){
          const resultRequestlastCode = await api.get("/marcas/last-codigo");
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
    useEffect(() => {
        findLastCode()
       setConexao();
       }, []);

    
    async function gravar (){

        if( connected === false ){ 
                setIsVisibleAlert(true)
                setTitleAlert("Atenção!")
                setMessageAlert("É necessario estabelecer conexão com a internet para efetuar o cadastro !");
                setTypeAlert('warning')
                setCancelText(undefined)
                setConfirmText('ok')
                return 
        } 
        
        if(!input || input === "") {
                setIsVisibleAlert(true)
                setTitleAlert("Atenção!")
                setMessageAlert("É necessario informar com a descrição da marca")
                setTypeAlert('warning')
                setCancelText(undefined)
                setConfirmText('ok')
                return 
            }
 
       try{
              setLoading(true)
    
            let resposta = await api.post('/marcas', { "descricao": input, id: newId});
            
            if(resposta.status === 201 && resposta.data.codigo > 0 ){

                setIsVisibleAlert(true)
                setTitleAlert("Sucesso")
                setMessageAlert(`Marca ${input} registrada com sucesso! `)
                setTypeAlert('success')
                setCancelText(undefined)
                setConfirmText('ok')
                return 

                }
          }catch(e:any){
                
              setIsVisibleAlert(true)
                setTitleAlert("Erro")
                setMessageAlert(`${e.response.data.message}`)
                setTypeAlert('error')
                setCancelText(undefined)
                setConfirmText('ok')
                return 
          }finally{
            setLoading(false)
          }
        } 


    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
          <LodingComponent isLoading={loading} />
          <CustomHeader
            title="Nova Marca"
            showSearch={false}
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
              <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Id:  {newId}</Text>
              <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Descrição da Marca</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#F9F9F9' }}
                placeholder="Ex: Bosch"
                placeholderTextColor="#999"
                onChangeText={(v) => setInput(v)}
              />
             
            </View>

            <TouchableOpacity
              style={{ backgroundColor: '#185FED', borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24, elevation: 4, shadowColor: '#185FED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 }}
              onPress={() => gravar()}
            >
              <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 18 }}>Gravar Marca</Text>
            </TouchableOpacity>

    
            <CustomAlert
                    visible={isVisibleAlert}
                    message={messageAlert}
                    onConfirm={() => {
                      setIsVisibleAlert(false)
                      navigation.goBack()
                    }}
                    onCancel={() => setIsVisibleAlert(false)}
                    title={titleAlert}
                    type={typeAlert}
                    cancelText={cancelText}
                    confirmText={confirmText}
                  />

          </ScrollView>
        </View>
    )
}