import { useContext, useEffect, useState } from "react"
import { Alert, Text, TouchableOpacity, View, TextInput, ScrollView } from "react-native"
import useApi from "../../services/api"
import { ConnectedContext } from "../../contexts/conectedContext"
import NetInfo from '@react-native-community/netinfo';
import { LodingComponent } from "../../components/loading"
import Ionicons from '@expo/vector-icons/Ionicons';
import { CustomHeader } from "../../components/custom-header/custom-header";





export const Cadastro_caracteristicas = ({navigation}:any) => {

    const [ descricao , setDescricao ] = useState();

    const [ unidade, setUnidade ] = useState<string>()

    const api = useApi();
    const [ loading, setLoading] = useState(false);

    const {connected,  setConnected} = useContext(ConnectedContext)



    useEffect(() => {
        function setConexao(){
           const unsubscribe = NetInfo.addEventListener(state => {
                   setConnected(state.isConnected!);
                   console.log('conexao com a internet :', state.isConnected);
           
              });
           // Remove o listener quando o componente for desmontado
           return () => {
               unsubscribe();
           };
       }
       setConexao();
       }, []);

        
    async function gravar (){
            if( connected === false ) return Alert.alert('Erro', 'É necessario estabelecer conexão com a internet para efetuar o cadastro !');

            if(!descricao) return Alert.alert('','É necessario informar a descrição para gravar a característica!');
            if(!unidade) return Alert.alert('','É necessario informar a unidade para gravar a característica !');

            

        let data =   { 
                    "descricao":descricao,
                    "unidade":unidade,
                }

            //    try{
            //        setLoading(true)
//
            //    let response =   await api.post('/caracteristica', data)
            //    console.log(response.data) 
            //    if(response.data.codigo > 0 ){
//
            //         try{
            //          await useQueryServices.createByCode(response.data, response.data.codigo)
            //          Alert.alert(`Serviço ${aplicacao} registrado com sucesso!`)
            //          setTimeout(()=>{},1000)
            //          navigation.goBack()
            //        return Alert.alert('', `Serviço ${data.aplicacao} registrado com Sucesso!`)
//
            //         }catch(e){
            //             console.log(" ocorreu um erro ao cadastrar o Serviço ",e)
            //         }
            //        }
            //    }catch(e:any){
            //        if(e.status === 400 ){
            //            return Alert.alert('Erro!', e.response.data.msg);
            //        }
            //    }finally{
            //setLoading(false)
            //    }
 
            
        }
      



    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
          <LodingComponent isLoading={loading} />
          <CustomHeader
            title="Nova Característica"
            showSearch={false}
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Unidade</Text>
                <TextInput
                  onChangeText={(value) => setUnidade(value)}
                  style={{ borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#F9F9F9' }}
                  placeholder="Ex: Und"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Descrição</Text>
                <TextInput
                  onChangeText={(value) => setDescricao(value)}
                  style={{ borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#F9F9F9' }}
                  placeholder="Ex: Metros"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: '#185FED', borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24, elevation: 4, shadowColor: '#185FED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 }}
              onPress={() => gravar()}
            >
              <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 18 }}>Gravar Característica</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
    )
}