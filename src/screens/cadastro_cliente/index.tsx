import { useContext, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Modal } from "react-native";
import useApi from "../../services/api";
import { useClients } from "../../database/queryClientes/queryCliente";
import { AuthContext } from "../../contexts/auth";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { ConnectedContext } from "../../contexts/conectedContext"
import { LodingComponent } from "../../components/loading";
import { configMoment } from "../../services/moment";
import { CustomHeader } from "../../components/custom-header/custom-header";

export const Cadastro_cliente = ({ route, navigation }: any) => {
    const [cnpj, setCnpj] = useState<string>();
    const [ie, setIe] = useState<string>();
    const [nome, setNome] = useState<string>();
    const [celular, setCelular] = useState<string>();
    const [cep, setCep] = useState<string>();
    const [cidade, setCidade] = useState<string>();
    const [estado, setEstado] = useState<string>();
    const [endereco, setEndereco] = useState<string>();
    const [bairro, setBairro] = useState<string>();
    const [numero, setNumero] = useState<string>();
    const [data_cadastro, setData_cadastro] = useState<string>();
    const [ codigo, setCodigo ] = useState(0);
    const [ visibleEndereco, setVisibleEndereco] = useState<boolean>(false); 
    const [ loading, setLoading] = useState<boolean>(false);
    const [ newId, setNewId ] = useState<string>();

    const api = useApi();
    const useQueryClient = useClients();
    
    const { usuario }: any = useContext(AuthContext);
    const useMoment = configMoment();

    const {connected,  setConnected} = useContext<any>(ConnectedContext)
    let { codigo_cliente } =   route.params || { codigo_cliente : 0};

    async function findLastCode() {
        const resultRequestlastCode = await api.get("/cliente/last-codigo");
        if (resultRequestlastCode.status == 200) {
            setNewId(`#${resultRequestlastCode.data.codigo + 1}`);
        }
    }

    type client = {
        codigo?:number
        cnpj: string | undefined
        ie: string | undefined
        nome: string | undefined
        celular: string | undefined
        cep: string | undefined
        cidade: string | undefined
        estado: string | undefined
        bairro: string | undefined
        numero: string | undefined
        endereco: string | undefined
        vendedor: number
        data_cadastro?:string
        data_recadastro?:string
        id:string
    }

    useEffect(()=>{
            findLastCode()
    },[])

    async function gravar() {
        if( connected === false ) return Alert.alert('Erro', 'É necessario estabelecer conexão com a internet para efetuar o cadastro !');

        if (!cnpj || cnpj === '') return Alert.alert("",'É necessario informar o cpnj/cpf para gravar!');
        if (!ie || ie === '') return Alert.alert("",'É necessario informar a ie/rg para gravar!');
        if (!nome || nome === '') return Alert.alert("",'É necessario informar a razao/nome da empresa para gravar!');
        if (!celular || celular === '') return Alert.alert("",'É necessario informar o celular para gravar!');
        if (!cep || cep === '') return Alert.alert("",'É necessario informar o cep para gravar!');
        if (!cidade || cidade === '') return Alert.alert("",'É necessario informar a cidade para gravar!');
        if (!endereco || endereco === '') return Alert.alert("",'É necessario informar o endereco para gravar!');

        if (!estado || estado === '') return Alert.alert("",'É necessario informar o estado para gravar!');
        if (!bairro || bairro === '') return Alert.alert("",'É necessario informar o bairro para gravar!');
        if (!numero || numero === '') return Alert.alert("",'É necessario informar o numero para gravar!');
        let novoCliente: client =
        {
            cnpj: cnpj,
            bairro: bairro,
            celular: celular,
            cep: cep,
            cidade: cidade,
            estado: estado,
            numero: numero,
            endereco:endereco,
            nome: nome,
            ie: ie,
            vendedor: usuario.codigo,
            id: newId
        }

          if(codigo_cliente > 0 ){
         
            let putCliente    =
            {
                codigo: codigo_cliente,
                cnpj: cnpj,
                bairro: bairro,
                celular: celular,
                cep: cep,
                cidade: cidade,
                estado: estado,
                numero: numero,
                endereco:endereco,
                nome: nome,
                ie: ie,
                vendedor: usuario.codigo,
                data_cadastro: usuario.data_cadastro,
                data_recadastro:  useMoment.dataHoraAtual()
            }
            try{
                 
                setLoading(true);

                let result: any = await api.put('/cliente', putCliente)
                //console.log("resultado api:", result.data);

                if (  result.status ===200 && result.data.codigo > 0  ) {
                    let resultSqlite: any = await useQueryClient.update(putCliente, codigo_cliente);
                    Alert.alert('',"Cliente Alterado Com Sucesso!")
                    setTimeout(() => { }, 2000)
                    navigation.goBack()
                }

            } catch(e:any){
                    if(e.status === 400) {
                    return Alert.alert( " Erro!",e.response.data.msg)
                    }else{
                    return Alert.alert('Erro!',"erro desconhecido" )
                    }
            }finally{
                setLoading(false);
            }  
            }else{
            try{
                setLoading(true);

                let result: any = await api.post('/cliente', novoCliente)
                //console.log("resultado api:", result.data);

                if (  result.status ===200 && result.data.codigo > 0  ) {
                    let resultSqlite: any = await useQueryClient.createByCode(result.data);
                    Alert.alert('',"Cliente Registrado Com Sucesso!")
                    setTimeout(() => { }, 2000)
                    navigation.goBack()
                }

            } catch(e:any){
                    if(e.status === 400) {
                    return Alert.alert( " Erro!",e.response.data.msg)
                    }else{
                    return Alert.alert('Erro!',"erro desconhecido" )
                    }
            }finally{
                setLoading(false);
            }     
        }
       
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LodingComponent isLoading={loading} />
            <CustomHeader
              title={codigo ? `Cliente #${codigo}` : 'Novo Cliente'}
              showSearch={false}
              onBack={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
            <View style={{ flex: 1, backgroundColor: '#F0F4F8', alignItems: "center", width: '100%' }}>

  
                <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Id:  {newId}</Text>
                </View>

                <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                    <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }} >CPF/CNPJ</Text>
                    <TextInput
                        style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                        placeholder="00.000.000/0000-00"
                        placeholderTextColor="#999"
                        onChangeText={(value) => setCnpj(value)}
                        defaultValue={cnpj}
                    />
                </View>
                <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                     <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }} >IE/RG</Text>
                    <TextInput
                        style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                        placeholder="Inscrição Estadual"
                        placeholderTextColor="#999"
                        onChangeText={(value) => setIe(value)}
                        defaultValue={ie}
                    />
                </View>

                <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                     <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }} >Razão Social</Text>
                    <TextInput
                        style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                        placeholder="Nome do cliente"
                        placeholderTextColor="#999"
                        onChangeText={(value) => setNome(value)}
                        defaultValue={nome}
                    />
                </View>

                <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                     <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }} >Celular</Text>
                    <TextInput
                        style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                        placeholder="(41) 99999-9999"
                        placeholderTextColor="#999"
                        onChangeText={(value) => setCelular(value)}
                        defaultValue={celular}
                    />
                </View>

                    <TouchableOpacity
                        style={{ backgroundColor: '#185FED', paddingVertical: 12, paddingHorizontal: 16, width: '100%', alignItems: "center", marginBottom: 10, justifyContent: "space-between", borderRadius: 10, flexDirection: "row", elevation: 4, shadowColor: '#185FED', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 }}
                        onPress={()=> {setVisibleEndereco(true) }}
                    >
                        <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 17 }}>Endereço</Text>
                        <AntDesign name="caret-down" size={22} color="#FFF" />
                    </TouchableOpacity>
                
                {/********* */}
                    <Modal visible={visibleEndereco} transparent={true} animationType="slide">
                      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", height: "90%", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 5 }}>
                          <View style={{ backgroundColor: '#185FED', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Endereço</Text>
                            <TouchableOpacity onPress={() => setVisibleEndereco(false)} style={{ padding: 4 }}>
                              <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                          <ScrollView style={{ padding: 16 }}>
                            <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                              <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>CEP</Text>
                              <TextInput
                                style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                placeholder="00.000-000"
                                placeholderTextColor="#999"
                                onChangeText={(value) => setCep(value)}
                                defaultValue={cep}
                              />
                            </View>
                            <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                              <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Estado</Text>
                              <TextInput
                                style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                placeholder="PR"
                                placeholderTextColor="#999"
                                onChangeText={(value) => setEstado(value)}
                                defaultValue={estado}
                              />
                            </View>
                            <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                              <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Cidade</Text>
                              <TextInput
                                style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                placeholder="Curitiba"
                                placeholderTextColor="#999"
                                onChangeText={(value) => setCidade(value)}
                                defaultValue={cidade}
                              />
                            </View>
                            <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                              <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Endereço</Text>
                              <TextInput
                                style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                placeholder="Avenida..."
                                placeholderTextColor="#999"
                                multiline
                                defaultValue={endereco}
                              />
                            </View>
                            <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                              <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Bairro</Text>
                              <TextInput
                                style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                placeholder="Centro"
                                placeholderTextColor="#999"
                                onChangeText={(value) => setBairro(value)}
                                defaultValue={bairro}
                              />
                            </View>
                            <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                              <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Número</Text>
                              <TextInput
                                style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                placeholder="123"
                                placeholderTextColor="#999"
                                onChangeText={(value) => setNumero(value)}
                                defaultValue={numero}
                              />
                            </View>
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>

               

                <View style={{ flexDirection: "row", marginVertical: 30, width: '100%', alignItems: "center", justifyContent: "center" }} >
                    <TouchableOpacity
                        style={{ backgroundColor: '#185FED', width: '85%', alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 14, elevation: 4, shadowColor: '#185FED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 }}
                        onPress={() => gravar()}
                    >
                        <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 18 }}>Gravar Cliente</Text>
                    </TouchableOpacity>
                </View>
            </View>
             </ScrollView>
        </KeyboardAvoidingView>
    )
}