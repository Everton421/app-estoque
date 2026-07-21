import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Modal, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../contexts/auth";
import { usePedidos } from "../../database/queryPedido/queryPedido";
import { receberPedidos } from "../../hooks/sync-pedidos/getOrders";
import { enviaPedidos } from "../../hooks/sync-pedidos/sendOrders";
import { configMoment } from "../../services/moment";

import { CustomAlert } from "../../components/custom-alert/custom-alert";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import useApi from "../../services/api";
import { ApiConfig } from "../../types/type-config-api";
import { ModalFilter } from "./components/modal-filter/modal-filter";
import { ModalPrint } from "./components/modal-print-pedido";

export type pedido = {
    codigo?: number,
    id: number,
    id_externo: number,
    situacao: string,
    situacao_separacao: 'N' | 'P' | 'I', // i= integralmente separado, p= parcialmente separado, n= não separado
    descontos: number,
    vendedor: number,
    forma_pagamento: number,
    enviado: string,
    observacoes: string,
    quantidade_parcelas: number,
    total_geral: number,
    total_produtos: number,
    total_servicos: number,
    cliente: number,
    produtos: produto_pedido[],
    parcelas: parcela[],
    data_cadastro: string,
    data_recadastro: string,
    veiculo: number,
    tipo_os: number,
    tipo: 1 | 2 | 3 | 4 | 5 | 6, // 6 = (pedido de compra );  1 = Orçamento (gerado no sistema); 2 = Orçamento (gerado fora do sistema); 3 = Ordem de Serviço; 4 = Contrato de Prestação de Serviços; 5 = Devolução
    contato: string
}

export type produto_pedido = {
    codigo: number,
    sequencia: number,
    desconto: number,
    quantidade: number,
    preco: number,
    total: number,
    quantidade_separada: number,
    quantidade_faturada: number
}
export type parcela = {
    pedido: number,
    parcela: number,
    valor: number,
    vencimento: string
}
export type servico_pedido = {
    codigo: number,
    desconto: number,
    quantidade: number,
    valor: number,
    total: number
}

export type seller = {
      codigo: number,
      nome:  string ,
      email: string ,
      cnpj:  string ,
      responsavel:  string ,
      ativo:  string 
}

export type branch = {
     codigo: number,
     nome_fantasia:  string ,
     razao_social:  string ,
     cnpj:  string ,
     ativo: 'S' | 'N'
}



export type filterOrdersituation = '*' | 'EA' | 'AI' | 'FI' | 'FP' | 'RE'  

export type typefilterOrders = { 
    tipo: number, 
    data_inicial: string, 
    data_final: string, 
    situacao: filterOrdersituation, 
    filial: branch | null, 
    limit: number, 
    search: string 
    vendedor:seller | null
}


export type actionsFilterOrder = 
    | { type: 'switch_status', paylod: filterOrdersituation }
    | { type: 'switch_data_init', paylod: string }
    | { type: 'switch_branch', paylod: branch | null }
    | { type: 'switch_seller', paylod: seller | null }
    | { type: 'switch_all', paylod: typefilterOrders }
    | { type: 'switch_search', paylod: string }
    


export const Lista_pedidos = ({ navigation, tipo, to, route }: any) => {
    const useMoment = configMoment();

    const initialStateFilter: typefilterOrders = { 
        tipo: tipo, 
        data_inicial: useMoment.dataAtual(), 
        data_final: useMoment.dataAtual(), 
        situacao: '*', 
        filial: null, 
        limit: 1000000, 
        search: '', 
        vendedor: null
    }   
    
    function hadleEditFilter(state: typefilterOrders, action: actionsFilterOrder) {
        switch (action.type) {
            case 'switch_branch':
                return { ...state, filial: action.paylod }
            case 'switch_search':
                return { ...state, search: action.paylod }
            case 'switch_data_init':
                return { ...state, data_inicial: action.paylod }
            case 'switch_status':
                return { ...state, situacao: action.paylod }
            case 'switch_seller':
                return { ...state, vendedor: action.paylod }
            case 'switch_all': 
            return action.paylod
                default:
                return state
        }
    }


    const [permission, requestPermission] = useCameraPermissions();

    const useQuerypedidos = usePedidos();
    const { usuario }: any = useContext(AuthContext);

    const [orcamentosRegistrados, setOrcamentosRegistrados] = useState([]);
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [pesquisa, setPesquisa] = useState('');
    const [visible, setVisible] = useState(false);

    const [visiblePostPedido, setVisiblePostPedido] = useState(false);
    const [loadingPedidoId, setLoadingPedidoId] = useState<number>(0)

    const [orcamentoModal, setOrcamentoModal] = useState();
    const usePostPedidos = enviaPedidos();
    const useGetPedidos = receberPedidos();
    const [modalVisible, setModalvisible] = useState(false);
    const [configLeitorPedido, setConfigLeitorPedido] = useState<'id_externo' | 'id_interno' | 'codigo'>('codigo');

    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState<string>('');
    const [typeAlert, setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
    const [configMobileApi, setConfigMobileApi] = useState<ApiConfig>();
    const [refreshing, setRefreshing] = useState(false);
    
    const [ filterSearchOrders , dispatch] = useReducer( hadleEditFilter, initialStateFilter )

    const [isloadingOrderData, setIsLoadingOrderData] = useState(false);

    const api = useApi();

    const useQueryConfigApi = queryConfig_api();

    async function getConfigMobileApi() {
        try {
            setIsLoadingOrderData(true)
            const resultConfigMobileApi = await useQueryConfigApi.select(1);
            if (resultConfigMobileApi && resultConfigMobileApi.length > 0) {
                setConfigMobileApi(resultConfigMobileApi[0]);
            }
        } catch (e) {
        } finally {
            setIsLoadingOrderData(false)
        }
    }


    async function getDefaultConfig() {
        try {
            const valuePedido: any = await AsyncStorage.getItem('configPedido');
            if (valuePedido !== null) {
                setConfigLeitorPedido(valuePedido);
            }

        } catch (e) {
            console.log('erro ao tentar obter a configuração no AsyncStorage');
        }
    }

    useEffect(() => {
        getConfigMobileApi();
    }, [])


    async function fyndOrderByBarcode(codeScanned: string) {
        if (!configLeitorPedido) {
            setMessageAlert(`É necessario configurar o leitor de busca dos pedidos.`)
            setVisibleAlert(true)
            setTypeAlert('warning')
            return
        }
        console.log(codeScanned)
     //   if (configMobileApi && configMobileApi.offline === 'N') {
            try {
                setIsLoadingOrderData(true)
                const responseApiOrder = await api.get('/pedidos',
                    {
                        params: {
                            [configLeitorPedido]: configLeitorPedido == 'codigo' ? Number(codeScanned) : codeScanned ,
                            tipo,
                            situacao: filterSearchOrders.situacao,
                            orderBy:'id'
                        }
                    }
                );
                if (responseApiOrder.status === 200 && responseApiOrder.data?.length > 0) {
                    let order = responseApiOrder.data[0];
                    if (order.situacao === 'FI') {
                        setMessageAlert(`O Pedido ${codeScanned} já foi faturado.`)
                        setVisibleAlert(true)
                        setTypeAlert('warning')
                    } else {
                        navigation.navigate('separacao', {
                            codigo_pedido: order.codigo,
                        });
                    }
                } else {
                    setMessageAlert(`Não foi possivel localizar o pedido ${codeScanned}.`)
                    setVisibleAlert(true)
                    setTypeAlert('error')
                }
            } catch (e) {
                console.log("[X] Erro ao buscar pedido por código de barras na api ", e)
                setMessageAlert(`Erro ao buscar pedido ${codeScanned} na API.`)
                setVisibleAlert(true)
                setTypeAlert('error')
            } finally {
                setIsLoadingOrderData(false)
            }
       /* } else {
            let resultOrder;
            try {
                setIsLoadingOrderData(true)
                resultOrder = await useQuerypedidos.findByParam({ chave: configLeitorPedido, value: String(codeScanned) })
            } catch (e) {
            } finally {
                setIsLoadingOrderData(false)
            }
            if (resultOrder && resultOrder?.length > 0) {
                if (resultOrder[0].situacao === 'FI') {
                    setMessageAlert(`O Pedido ${codeScanned} já foi faturado.`)
                    setVisibleAlert(true)
                    setTypeAlert('warning')
                } else {

                    navigation.navigate('separacao', {
                        codigo_pedido: resultOrder[0].codigo,
                    });
                }

            } else {
                setMessageAlert(`Não foi possivel localizar o pedido ${codeScanned}.`)
                setVisibleAlert(true)
                setTypeAlert('error')
                return
            }
        }
        */
    }

    async function fyndOrderBycode(code: number) {
            try {
                setIsLoadingOrderData(true)
                const responseApiOrder = await api.get(`/pedidos/${code}`,
                 
                );
                
                if(responseApiOrder.status === 200 ){
                      navigation.navigate('separacao', {
                        codigo_pedido: code,
                    });
                }

            } catch (e) {
                console.log("[X] Erro ao buscar pedidos na api ", e)
            } finally {
                setIsLoadingOrderData(false)
            }
    } 

    function handleCodeRead(data: string) {
        setModalvisible(false);
        fyndOrderByBarcode(data);
    }
        
    
    
    const carregarFiltros = async () => {
            try {
                const filtro = await AsyncStorage.getItem('filtroPedidos');
                if(filtro){
                    let aux = JSON.parse(filtro);
                    aux.tipo = tipo;
                    dispatch({type:'switch_all',paylod: aux })
                }

            } catch (e) {
                console.log("Erro ao carregar filtros do AsyncStorage", e)
            }
        };

    useEffect(() => {
        carregarFiltros();
    }, [])

 
     useEffect(() => {
        AsyncStorage.setItem('filtroPedidos', JSON.stringify(filterSearchOrders));
    }, [ filterSearchOrders ])
 


    async function busca() {
        setIsLoadingOrderData(true)
        try {
            let queryOrder = { 
                ...filterSearchOrders, 
                data_final: useMoment.dataAtual() 
            }
            if (pesquisa) queryOrder.search = pesquisa
            const responseApiOrder = await api.get('/pedidos', { params: queryOrder });
            setOrcamentosRegistrados(responseApiOrder.data);
            setVisiblePostPedido(false);
        } catch (e) {
            console.log("[X] Erro ao buscar pedidos na api ", e)
        } finally {
            setIsLoadingOrderData(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await busca();
        setRefreshing(false);
    };

    useEffect(() => {
        busca()
    }, [filterSearchOrders, navigation, configMobileApi])

    const buscaRef = useRef(busca);
    buscaRef.current = busca;
    const getDefaultConfigRef = useRef(getDefaultConfig);
    getDefaultConfigRef.current = getDefaultConfig;

    useFocusEffect(
        useCallback(() => {
            buscaRef.current();
            getDefaultConfigRef.current();
        }, [])
    );



    async function selecionaOrcamentoModal(item: any) {
           if (configMobileApi && configMobileApi.offline === 'N') {
              try {
                     setIsLoadingOrderData(true)
                    const responseApiOrder = await api.get(`/pedidos/${item.codigo}`,
                    );
                 
                       setOrcamentoModal(responseApiOrder.data);
             
                } catch (e) {
                    console.log("[X] Erro ao buscar pedidos na api ", e)
                } finally {
                     setIsLoadingOrderData(false)
                }

           }else{
              let resultCompleteOrder = await useQuerypedidos.selectCompleteOrderByCode(item.codigo);
                 setOrcamentoModal(resultCompleteOrder);
           }
    
        setVisibleModal(true)
    }



    const getStatusParams = (situacao: string) => {
        switch (situacao) {
            case 'EA': return { color: '#1E9C43', label: 'Orçamento' };
            case 'AI': return { color: '#307CEB', label: 'Pedido' };
            case 'FI': return { color: '#FF7F27', label: 'Faturado' };
            case 'RE': return { color: '#9C0404', label: 'Reprovado' };
            case 'FP': return { color: '#0023F5', label: 'Parcial' };
            case 'BM': return { color: '#474747', label: 'Baixa Manual' };
            default: return { color: '#999999', label: 'Desconhecido' };
        }
    }

    const getSeparacaoParams = (situacao_separacao: string, situacao: string) => {
        if (situacao === 'FI') {
            return { color: '#FF9800', label: 'Fat. Integral' };
        }
        switch (situacao_separacao) {
            case 'I': return { color: '#4CAF50', label: 'Separado' };
            case 'P': return { color: '#FF9800', label: 'Sep. Parcial' };
            case 'N':
            default: return { color: '#F44336', label: 'Não Separado' };
        }
    }

    async function postPedido(item: any) {
        try {
            if(configMobileApi && configMobileApi.offline === 'S'){
                setVisiblePostPedido(true);
                setLoadingPedidoId(item.codigo);
                let aux = await useQuerypedidos.selectCompleteOrderByCode(item.codigo);
                useGetPedidos.getPedido(item.codigo);
                let resultPostApi = await usePostPedidos.postItem([aux]);

                if (resultPostApi.status === 200 && resultPostApi.data.results && resultPostApi.data.results.length > 0) {
                    setLoadingPedidoId(0);
                    setVisiblePostPedido(false);
                    busca();
                }
            }  

        } catch (e) {
            console.log(e);
            Alert.alert('', `Algo de inesperado ocorreu ao processar o pedido: ${item.id}!`, [
                {
                    text: 'ok', onPress: () => {
                        setLoadingPedidoId(0);
                        setVisiblePostPedido(false);
                        busca();
                    }
                }
            ])
        }
    }

    const ItemOrcamento = ({ item, pedido }: { item: any, pedido: any }) => {
        const status = getStatusParams(item.situacao);
        const separacao = getSeparacaoParams(item.situacao_separacao, item.situacao);

        // Variável auxiliar para verificar se este pedido específico está carregando
        const isSyncing = visiblePostPedido && loadingPedidoId === item.codigo;

        return (
            <View style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 15,
                marginVertical: 8,
                padding: 15,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                borderLeftWidth: 5,
                borderLeftColor: status.color
            }}>


                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: 10 }}>
                    <Text style={{ fontSize: 13, color: '#666', fontWeight: 'bold', flex: 1 }}>
                        ID: {item.id || item.codigo} {item.id_externo ? `\nExt: ${item.id_externo}` : ''}
                    </Text>

                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <View style={{ backgroundColor: status.color + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: status.color, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {status.label}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: separacao.color + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: separacao.color, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {separacao.label}
                            </Text>
                        </View>
                    </View>
                </View>
                {
                    pedido.operacao == 'V' ? 
                    (
                <Text style={{ fontSize: 16, fontWeight: "bold", color: '#333', marginBottom: 2 }} numberOfLines={1}>
                    {item?.cliente?.nome }
                </Text>
                    ):(
                <Text style={{ fontSize: 16, fontWeight: "bold", color: '#333', marginBottom: 2 }} numberOfLines={1}>
                    {item?.fornecedor?.nome  }
                </Text>
                    )
                }
              

                {item.contato ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialCommunityIcons name="storefront-outline" size={16} color="#757575" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: '#757575', fontWeight: '500' }}>{item.contato}</Text>
                    </View>
                ) : <View style={{ marginBottom: 8 }} />}

                <Text style={{ fontSize: 18, fontWeight: "bold", color: '#185FED', marginBottom: 10 }}>
                    Total: R$ {Number(item?.total_geral).toFixed(2)}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Criado: {new Date(item?.data_cadastro).toLocaleDateString("pt-br", { timeZone: 'UTC' })}
                    </Text>
             

                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Modificado: {new Date(item?.data_recadastro).toLocaleTimeString("pt-br", { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                   {
                    item.tipo == 3 ?
                    <Text style={{ fontSize: 10, color: '#185FED' }}>
                      Os <FontAwesome5 name="tools" size={20} color="#185FED" />
                    </Text>
                  
                    :
                    <Text style={{ fontSize: 10, fontWeight:"bold",color: '#185FED' }}>
                     Venda <MaterialCommunityIcons name="cart-check" size={20} color="#185FED" />
                    </Text>
                }

                {/* --- RODAPÉ DE AÇÕES --- */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 }}>
                   
                    <View style={{ flexDirection: 'row' , gap: 10,  }}>
                        <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                            <Feather name="eye" size={20} color="#185FED" />
                        </TouchableOpacity>

                        {item.situacao === 'AI' && (
                            <TouchableOpacity onPress={() => fyndOrderBycode(pedido.codigo)} style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                                <Feather name="package" size={20} color="#185FED" />
                            </TouchableOpacity>
                        )}
                    </View>
                
                </View>
            </View>
        )
    }

    function switchTipoOrder(tipo:number){
        switch ( tipo ) {
            case 1:
                 return 'Pedidos';       
             break;
            case 2: 
                return 'Pedidos';       
             break;
             case 3 : 
                return 'OS';
             break;
            case 4 : 
               return 'Contratos';
            break;
            case 5 : 
               return 'Devolução';
            break;
            case 6 : 
               return 'Ordem de Compra';
            break;

            default: return 'Pedidos'
                break;
        }
    }

    if (!permission) return null;

    if (modalVisible && !permission.granted) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold", margin: 10, color: "#89898fff", fontSize: 17 }}>
                    Você precisa liberar o acesso a camera para continuar!
                </Text>
                <Button onPress={requestPermission} title="Liberar acesso" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }} >

            <CustomAlert
                visible={visibleAlert}
                message={messageAlert}
                onConfirm={() => setVisibleAlert(false)}
                title=""
                type={typeAlert}
            />
            <CustomHeader
                title={switchTipoOrder(tipo)}
                onBack={() => navigation.goBack()}
                showSearch={true}
                searchValue={filterSearchOrders.search}
                onSearchChange={(value) => dispatch({ type:'switch_search', paylod: value})}
                searchPlaceholder="Pesquisar..."
                showFilter={true}
                onFilterPress={() => setVisible(true)}
            />



            <ModalFilter
                setFilter={dispatch}
                filter={filterSearchOrders}
                visible={visible}
                setVisible={setVisible}
            
            />

            <ModalPrint visible={visibleModal} orcamento={orcamentoModal} setVisible={setVisibleModal} />
            {
                isloadingOrderData ?
                    (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
                            <ActivityIndicator color='#185FED' size={50} />
                        </View>
                    ) :
                    (
                        <>
                            <FlatList
                                data={orcamentosRegistrados}
                                renderItem={({ item }) => <ItemOrcamento item={item} pedido={item} />}
                                keyExtractor={(item: any) => item.codigo.toString()}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={['#185FED']}
                                        tintColor="#185FED"
                                    />
                                }
                                ListEmptyComponent={() => (
                                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                                        <Text style={{ color: '#999', fontSize: 16 }}>Nenhum registro encontrado.</Text>
                                    </View>
                                )}
                            />

                            <TouchableOpacity
                                onPress={() => { setModalvisible(true) }}
                                style={{
                                    backgroundColor: '#185FED',
                                    width: 56, height: 56,
                                    borderRadius: 28,
                                    position: "absolute",
                                    elevation: 6,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.3,
                                    right: 30,
                                    bottom: 80,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 99
                                }}
                            >
                                <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
                            </TouchableOpacity>

                            <View style={{
                                backgroundColor: '#FFF',
                                padding: 10,
                                borderTopWidth: 1,
                                borderTopColor: '#E0E0E0',
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                elevation: 10
                            }}>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#1E9C43', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Orçamento</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#307CEB', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Pedido</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#FF7F27', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Faturado</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#0023F5', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Parcial</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#9C0404', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Reprovado</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#474747', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Baixa Manual</Text>
                                </View>


                            </View>
                        </>
                    )
            }
            <Modal visible={modalVisible} animationType="slide">
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    onBarcodeScanned={({ data }) => {
                        if (data) handleCodeRead(data);
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 280, height: 280, borderWidth: 2, borderColor: '#FFF', borderRadius: 20 }} />
                        <Text style={{ color: '#FFF', marginTop: 20, fontWeight: 'bold' }}>Posicione o código de barras na área</Text>

                        <TouchableOpacity
                            onPress={() => setModalvisible(false)}
                            style={{ position: 'absolute', bottom: 50, backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
                        >
                            <Text style={{ color: '#000', fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </Modal>

        </View>
    )
}