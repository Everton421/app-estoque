import { useContext, useEffect, useReducer, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Modal } from "react-native";
import useApi from "../../services/api";
import { AuthContext } from "../../contexts/auth";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { ConnectedContext } from "../../contexts/conectedContext"
import { LodingComponent } from "../../components/loading";
import { configMoment } from "../../services/moment";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";
import { verifyUserPermission } from "../../services/verify-user-permissions";

export type PayloadFornecedor = {
    codigo: number;
    id: string;
    celular: string;
    nome: string;
    cep: string;
    endereco: string;
    ie: string;
    numero: string;
    cnpj: string;
    cidade: string;
    vendedor: number;
    estado: string;
    bairro: string;
    ativo: "S" | "N";
}

type ActionFornecedor =
    | { type: 'set_codigo'; payload: number }
    | { type: 'set_id'; payload: string }
    | { type: 'set_celular'; payload: string }
    | { type: 'set_nome'; payload: string }
    | { type: 'set_cep'; payload: string }
    | { type: 'set_endereco'; payload: string }
    | { type: 'set_ie'; payload: string }
    | { type: 'set_numero'; payload: string }
    | { type: 'set_cnpj'; payload: string }
    | { type: 'set_cidade'; payload: string }
    | { type: 'set_vendedor'; payload: number }
    | { type: 'set_estado'; payload: string }
    | { type: 'set_bairro'; payload: string }
    | { type: 'set_ativo'; payload: "S" | "N" }
    | { type: 'load_fornecedor'; payload: PayloadFornecedor };

function handleFornecedor(state: PayloadFornecedor, action: ActionFornecedor): PayloadFornecedor {
    switch (action.type) {
        case 'set_codigo':      return { ...state, codigo: action.payload };
        case 'set_id':          return { ...state, id: action.payload };
        case 'set_celular':     return { ...state, celular: action.payload };
        case 'set_nome':        return { ...state, nome: action.payload };
        case 'set_cep':         return { ...state, cep: action.payload };
        case 'set_endereco':    return { ...state, endereco: action.payload };
        case 'set_ie':          return { ...state, ie: action.payload };
        case 'set_numero':      return { ...state, numero: action.payload };
        case 'set_cnpj':        return { ...state, cnpj: action.payload };
        case 'set_cidade':      return { ...state, cidade: action.payload };
        case 'set_vendedor':    return { ...state, vendedor: action.payload };
        case 'set_estado':      return { ...state, estado: action.payload };
        case 'set_bairro':      return { ...state, bairro: action.payload };
        case 'set_ativo':       return { ...state, ativo: action.payload };
        case 'load_fornecedor': return { ...action.payload };
        default:                return state;
    }
}

export const Cadastro_fornecedores = ({ route, navigation }: any) => {
    const [visibleEndereco, setVisibleEndereco] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [typeAlert, setTypeAlert] = useState<AlertType>('info');

    const api = useApi();
    const { usuario, permissoes }: any = useContext(AuthContext);
    const useMoment = configMoment();

    const { codigo_fornecedor } = route.params || { codigo_fornecedor: 0 };

    const [ isEnabledEditSuplier] =useState( verifyUserPermission('fornecedores','editar',permissoes));

    const initialState: PayloadFornecedor = {
        codigo: 0,
        id: '',
        celular: '',
        nome: '',
        cep: '',
        endereco: '',
        ie: '',
        numero: '',
        cnpj: '',
        cidade: '',
        vendedor: usuario?.codigo || 0,
        estado: '',
        bairro: '',
        ativo: 'S',
    };

    const [state, dispatch] = useReducer(handleFornecedor, initialState);

    useEffect(() => {
        if (codigo_fornecedor > 0) {
            carregarFornecedor();
        } else {
            findLastCode();
        }
    }, []);

    async function findLastCode() {
        try {
            const result = await api.get("/fornecedores/last-codigo");
            if (result.status === 200) {
                dispatch({ type: 'set_id', payload: `#${result.data.codigo + 1}` });
            }
        } catch (e) {
            console.log('[X] Erro ao buscar ultimo codigo', e);
        }
    }

    async function carregarFornecedor() {
        try {
            setLoading(true);
            const response = await api.get(`/fornecedores/${codigo_fornecedor}`);
            if (response.status === 200) {
                const data = response.data;
                dispatch({
                    type: 'load_fornecedor',
                    payload: {
                        codigo: data.codigo || codigo_fornecedor,
                        id: data.id || '',
                        celular: data.celular || '',
                        nome: data.nome || '',
                        cep: data.cep || '',
                        endereco: data.endereco || '',
                        ie: data.ie || '',
                        numero: data.numero || '',
                        cnpj: data.cnpj || '',
                        cidade: data.cidade || '',
                        vendedor: data.vendedor || usuario.codigo,
                        estado: data.estado || '',
                        bairro: data.bairro || '',
                        ativo: data.ativo || 'S',
                    }
                });
            }
        } catch (e: any) {
            console.log('[X] Erro ao carregar fornecedor', e);
            setTitleAlert('Erro');
            setTypeAlert('error');
            setMessageAlert('Nao foi possivel carregar os dados do fornecedor.');
            setVisibleAlert(true);
        } finally {
            setLoading(false);
        }
    }

    async function gravar() {
        if(!isEnabledEditSuplier){
                setTitleAlert('Atenção!');
                    setTypeAlert('warning');
                    setMessageAlert('Você não tem permisssão para editar Fornecedores!');
                    setVisibleAlert(true);
                return;
        }


        if (!state.cnpj || state.cnpj === '') {
            setTitleAlert('Atenção');
            setTypeAlert('warning');
            setMessageAlert('É necessário informar o CNPJ/CPF para gravar!');
            setVisibleAlert(true);
            return;
        }
        if (!state.ie || state.ie === '') {
            setTitleAlert('Atenção');
            setTypeAlert('warning');
            setMessageAlert('É necessário informar a IE/RG para gravar!');
            setVisibleAlert(true);
            return;
        }
        if (!state.nome || state.nome === '') {
            setTitleAlert('Atenção');
            setTypeAlert('warning');
            setMessageAlert('É necessário informar a razão/nome para gravar!');
            setVisibleAlert(true);
            return;
        }

        if (codigo_fornecedor > 0) {
            const putFornecedor = {
                ...state,
                codigo: codigo_fornecedor,
                data_recadastro: useMoment.dataHoraAtual(),
            };

            try {
                setLoading(true);
                const result: any = await api.put('/fornecedores', putFornecedor);

                if (result.status === 200 && result.data.codigo > 0) {
                    setTitleAlert('Sucesso!');
                    setTypeAlert('success');
                    setMessageAlert('Fornecedor alterado com sucesso!');
                    setVisibleAlert(true);
                }
            } catch (e: any) {
                if (e.status === 400) {
                    setTitleAlert('Erro');
                    setTypeAlert('error');
                    setMessageAlert(e.response.data.msg);
                    setVisibleAlert(true);
                } else {
                    setTitleAlert('Erro');
                    setTypeAlert('error');
                    setMessageAlert('Erro desconhecido ao alterar fornecedor.');
                    setVisibleAlert(true);
                }
            } finally {
                setLoading(false);
            }
        } else {
            const novoFornecedor = {
                ...state,
                id: state.id || '',
            };

            try {
                setLoading(true);
                const result: any = await api.post('/fornecedores', novoFornecedor);

                if (result.status === 201 && result.data.codigo > 0) {
                    setTitleAlert('Sucesso!');
                    setTypeAlert('success');
                    setMessageAlert('Fornecedor registrado com sucesso!');
                    setVisibleAlert(true);
                }
            } catch (e: any) {
                if (e.status === 400) {
                    setTitleAlert('Erro');
                    setTypeAlert('error');
                    setMessageAlert(e.response.data.msg);
                    setVisibleAlert(true);
                } else {
                    setTitleAlert('Erro');
                    setTypeAlert('error');
                    setMessageAlert('Erro desconhecido ao cadastrar fornecedor.');
                    setVisibleAlert(true);
                }
            } finally {
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
                title={codigo_fornecedor > 0 ? `Fornecedor #${codigo_fornecedor}` : 'Novo Fornecedor'}
                showSearch={false}
                onBack={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
                <View style={{ flex: 1, backgroundColor: '#F0F4F8', alignItems: "center", width: '100%' }}>

                    <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: '#6C757D', marginBottom: 6 }}>Id:  {state.id}</Text>
                    </View>

                    <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>CPF/CNPJ</Text>
                        <TextInput
                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                            placeholder="00.000.000/0000-00"
                            placeholderTextColor="#999"
                            onChangeText={(value) => dispatch({ type: 'set_cnpj', payload: value })}
                            value={state.cnpj}
                        />
                    </View>
                    <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>IE/RG</Text>
                        <TextInput
                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                            placeholder="Inscricao Estadual"
                            placeholderTextColor="#999"
                            onChangeText={(value) => dispatch({ type: 'set_ie', payload: value })}
                            value={state.ie}
                        />
                    </View>

                    <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Razao Social</Text>
                        <TextInput
                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                            placeholder="Nome do fornecedor"
                            placeholderTextColor="#999"
                            onChangeText={(value) => dispatch({ type: 'set_nome', payload: value })}
                            value={state.nome}
                        />
                    </View>

                    <View style={{ width: '100%', marginBottom: 10, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Celular</Text>
                        <TextInput
                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                            placeholder="(41) 99999-9999"
                            placeholderTextColor="#999"
                            onChangeText={(value) => dispatch({ type: 'set_celular', payload: value })}
                            value={state.celular}
                        />
                    </View>

                    <TouchableOpacity
                        style={{ backgroundColor: '#185FED', paddingVertical: 12, paddingHorizontal: 16, width: '100%', alignItems: "center", marginBottom: 10, justifyContent: "space-between", borderRadius: 10, flexDirection: "row", elevation: 4, shadowColor: '#185FED', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 }}
                        onPress={() => { setVisibleEndereco(true) }}
                    >
                        <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 17 }}>Endereco</Text>
                        <AntDesign name="caret-down" size={22} color="#FFF" />
                    </TouchableOpacity>

                    <Modal visible={visibleEndereco} transparent={true} animationType="slide">
                        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'flex-end' }}>
                            <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", height: "90%", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 5 }}>
                                <View style={{ backgroundColor: '#185FED', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Endereco</Text>
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
                                            onChangeText={(value) => dispatch({ type: 'set_cep', payload: value })}
                                            value={state.cep}
                                        />
                                    </View>
                                    <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Estado</Text>
                                        <TextInput
                                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                            placeholder="PR"
                                            placeholderTextColor="#999"
                                            onChangeText={(value) => dispatch({ type: 'set_estado', payload: value })}
                                            value={state.estado}
                                        />
                                    </View>
                                    <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Cidade</Text>
                                        <TextInput
                                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                            placeholder="Curitiba"
                                            placeholderTextColor="#999"
                                            onChangeText={(value) => dispatch({ type: 'set_cidade', payload: value })}
                                            value={state.cidade}
                                        />
                                    </View>
                                    <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Endereco</Text>
                                        <TextInput
                                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                            placeholder="Avenida..."
                                            placeholderTextColor="#999"
                                            multiline
                                            value={state.endereco}
                                            onChangeText={(value) => dispatch({ type: 'set_endereco', payload: value })}
                                        />
                                    </View>
                                    <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Bairro</Text>
                                        <TextInput
                                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                            placeholder="Centro"
                                            placeholderTextColor="#999"
                                            onChangeText={(value) => dispatch({ type: 'set_bairro', payload: value })}
                                            value={state.bairro}
                                        />
                                    </View>
                                    <View style={{ marginBottom: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                                        <Text style={{ fontWeight: "600", fontSize: 14, color: '#6C757D', marginBottom: 4 }}>Numero</Text>
                                        <TextInput
                                            style={{ paddingVertical: 8, fontWeight: "500", fontSize: 16, color: '#333' }}
                                            placeholder="123"
                                            placeholderTextColor="#999"
                                            keyboardType="number-pad"
                                            onChangeText={(value) => dispatch({ type: 'set_numero', payload: value })}
                                            value={state.numero}
                                        />
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    <View style={{ flexDirection: "row", marginVertical: 30, width: '100%', alignItems: "center", justifyContent: "center" }}>
                        <TouchableOpacity
                            style={{ backgroundColor: '#185FED', width: '85%', alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 14, elevation: 4, shadowColor: '#185FED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 }}
                            onPress={() => gravar()}
                        >
                            <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 18 }}>{codigo_fornecedor > 0 ? 'Atualizar Fornecedor' : 'Gravar Fornecedor'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <CustomAlert
                visible={visibleAlert}
                onConfirm={() => {
                    setVisibleAlert(false);
                    if (typeAlert === 'success') {
                        navigation.goBack();
                    }
                }}
                title={titleAlert}
                message={messageAlert}
                type={typeAlert}
            />
        </KeyboardAvoidingView>
    )
}
