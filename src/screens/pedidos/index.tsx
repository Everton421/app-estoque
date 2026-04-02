import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Modal, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { AuthContext } from "../../contexts/auth";
import { ConnectedContext } from "../../contexts/conectedContext";
import { OrcamentoContext } from "../../contexts/orcamentoContext";
import { usePedidos } from "../../database/queryPedido/queryPedido";
import { receberPedidos } from "../../services/getOrders";
import { configMoment } from "../../services/moment";
import { enviaPedidos } from "../../services/sendOrders";
import { CameraView, useCameraPermissions } from "expo-camera";

import { ModalFilter } from "./components/modal-filter/modal-filter";
import { ModalPrint } from "./components/modal-print-pedido";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { CustomAlert } from "../../components/custom-alert/custom-alert";

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
    tipo: number,
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

export const Lista_pedidos = ({ navigation, tipo, to, route }: any) => {
    const [permission, requestPermission] = useCameraPermissions();

    const useQuerypedidos = usePedidos();
    const useMoment = configMoment();
    const { usuario }: any = useContext(AuthContext);

    const[orcamentosRegistrados, setOrcamentosRegistrados] = useState([]);
    const[visibleModal, setVisibleModal] = useState<boolean>(false);
    const[pesquisa, setPesquisa] = useState('');
    const[visible, setVisible] = useState(false);

    const[visiblePostPedido, setVisiblePostPedido] = useState(false);
    const[loadingPedidoId, setLoadingPedidoId] = useState<number>(0)
    
    const[data_cadastro, setData_cadastro] = useState(useMoment.dataAtual())
    const[statusPedido, setStatusPedido] = useState<string>('*');

    const[orcamentoModal, setOrcamentoModal] = useState();
    const usePostPedidos = enviaPedidos();
    const useGetPedidos =  receberPedidos();  
    const[ modalVisible, setModalvisible] = useState(false);
    const [ configLeitorPedido , setConfigLeitorPedido  ] = useState<'id_externo' | 'id_interno' | 'codigo'>('codigo');
    
    const [ visibleAlert , setVisibleAlert ] = useState(false);
    const [ messageAlert , setMessageAlert ] = useState<string>('');
    const [typeAlert, setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');

    const [refreshing, setRefreshing] = useState(false);

    const [ loading, setLoading ] = useState(false);

   async function getDefaultConfig() {
        try {
           const valuePedido:any = await  AsyncStorage.getItem('configPedido');
             if (valuePedido !== null) {
                setConfigLeitorPedido(valuePedido);
            } 
          
        } catch (e) {
            console.log('erro ao tentar obter a configuração no AsyncStorage');
        }
    }


    async function fyndBarcode(codeScanned: string) {

        if(!configLeitorPedido ) {
                 setMessageAlert(`É necessario configurar o leitor de busca dos pedidos.`)
                setVisibleAlert(true)
                setTypeAlert('warning')
            return
            }
            let resultOrder;
        try{  
            setLoading(true)
        resultOrder = await useQuerypedidos.findByParam({ chave: configLeitorPedido , value: String(codeScanned) })
        }catch(e){ 
        }finally{
            setLoading(false)
        }
        if (resultOrder && resultOrder?.length > 0) {
            if(resultOrder[0].situacao === 'FI'){
                setMessageAlert(`O Pedido ${codeScanned} já foi faturado.`)
                setVisibleAlert(true)
                setTypeAlert('warning')
            }else{

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

       async function fyndOrderBycode(code: number) {
        try{
            setLoading(true)
        const resultOrder = await useQuerypedidos.findByParam({  chave: 'codigo', value: code })
        if (resultOrder && resultOrder?.length > 0) {
            navigation.navigate('separacao', {
                codigo_pedido: resultOrder[0].codigo,
            });

        } else {
            return Alert.alert("Erro", `Não foi possivel localizar o pedido codigo: ${code}.`)
        }
            setLoading(false)
        }catch(e){

        }finally{
            setLoading(false)
        }

    }

    function handleCodeRead(data: string) {
        setModalvisible(false);
        fyndBarcode(data);
    }

    const getFitroPedidos = async () => {
        try {

            const value = await AsyncStorage.getItem('filtroPedidos');
            if (value !== null) {
                setStatusPedido(value) ;
            } else {
                await AsyncStorage.setItem('filtroPedidos', statusPedido)
            }

            const valueDataCadastro = await AsyncStorage.getItem('dataPedidos');
                if(valueDataCadastro !== null ){
                    setData_cadastro(valueDataCadastro);
                }else{
                   await AsyncStorage.setItem('dataPedidos', data_cadastro);
                }
           return { data_cadastro:data_cadastro, filtoStatus: statusPedido } 
        } catch (e) {
            console.log("erro ao consultar AsyncStorage")
        }
    }

   

    async function busca() {
        let filtroStatus = await getFitroPedidos();
     try{
                setLoading(true)
                let situacao =  statusPedido;
                let data = data_cadastro;
                if(filtroStatus ){
                    situacao = filtroStatus.filtoStatus;
                    data = filtroStatus.data_cadastro;
                }
            let queryOrder = { tipo: tipo,  data: data, situacao: situacao, input: '' }
            if (pesquisa !== null && pesquisa !== '') queryOrder.input = pesquisa
            let aux: any = await useQuerypedidos.newSelect(queryOrder);
            setOrcamentosRegistrados(aux);
            setVisiblePostPedido(false);
            }catch(e){
            }finally{
                setLoading(false)
            }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await busca();
        setRefreshing(false);
    };

    useEffect(() => {
        busca()
    },[data_cadastro, statusPedido, pesquisa])

    useFocusEffect(
        useCallback(() => {
            busca();
       getDefaultConfig();

        }, [navigation])
    );
 


    async function selecionaOrcamentoModal(item: any) {
        let aux = await useQuerypedidos.selectCompleteOrderByCode(item.codigo);
        setOrcamentoModal(aux);
        setVisibleModal(true)
    }

    const getStatusParams = (situacao: string) => {
        switch (situacao) {
            case 'EA': return { color: '#1E9C43', label: 'Orçamento' };
            case 'AI': return { color: '#307CEB', label: 'Pedido' };
            case 'FI': return { color: '#FF7F27', label: 'Faturado' };
            case 'RE': return { color: '#9C0404', label: 'Reprovado' };
            case 'FP': return { color: '#0023F5', label: 'Parcial' };
            default: return { color: '#999999', label: 'Desconhecido' };
        }
    }

    const getSeparacaoParams = (situacao_separacao: string, situacao:string) => {
        if(situacao === 'FI'){
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
        } catch (e) {
            console.log(e);
            Alert.alert('', `Algo de inesperado ocorreu ao processar o pedido: ${item.id}!`,[
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

                <Text style={{ fontSize: 16, fontWeight: "bold", color: '#333', marginBottom: 2 }} numberOfLines={1}>
                    {item?.nome}
                </Text>

                {item.contato ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialCommunityIcons name="storefront-outline" size={16} color="#757575" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: '#757575', fontWeight: '500' }}>{item.contato}</Text>
                    </View>
                ) : <View style={{ marginBottom: 8 }} />}

                <Text style={{ fontSize: 18, fontWeight: "bold", color: '#185FED', marginBottom: 10 }}>
                    Total: R$ {item?.total_geral.toFixed(2)}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Criado: {new Date(item?.data_cadastro).toLocaleDateString("pt-br", { timeZone: 'UTC'})}
                    </Text>

                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Modificado: {new Date(item?.data_recadastro).toLocaleTimeString("pt-br", { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {/* --- RODAPÉ DE AÇÕES --- */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 }}>

                    {/* Ações da Esquerda (Visualizar / Separar) */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                            <Feather name="eye" size={20} color="#185FED" />
                        </TouchableOpacity>

                        {item.situacao === 'AI' && (
                            <TouchableOpacity onPress={() => fyndOrderBycode(Number(pedido.codigo))} style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                                <Feather name="package" size={20} color="#185FED" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Status de Envio & Botão Sincronizar (Direita) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        
                        {/* Status Icon & Text */}
                        {item.enviado === 'S' ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 11, color: '#4CAF50', fontWeight: 'bold' }}>Enviado</Text>
                                <Ionicons name="checkmark-done-circle" size={22} color="#4CAF50" />
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 11, color: '#FF9800', fontWeight: 'bold' }}>Pendente</Text>
                                <Ionicons name="time" size={22} color="#FF9800" />
                            </View>
                        )}

                        {/* Botão de Sincronização */}
                       {// !connected ? (
                        //    <View style={{ padding: 8, backgroundColor: '#F5F5F5', borderRadius: 8 }}>
                        //        <MaterialIcons name="sync-disabled" size={20} color="#BDBDBD" />
                        //    </View>
                        //) : (
                            <TouchableOpacity 
                                onPress={() => postPedido(item)}
                                disabled={isSyncing}
                                style={{ 
                                    padding: 8, 
                                    backgroundColor: isSyncing ? '#E3F2FD' : '#E8F5E9', 
                                    borderRadius: 8,
                                    minWidth: 36, // Garante que o tamanho não encolha quando mudar pro ActivityIndicator
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {isSyncing ? (
                                    <ActivityIndicator size="small" color="#185FED" />
                                ) : (
                                    <Ionicons name="sync-sharp" size={20} color="#4CAF50" />
                                )}
                            </TouchableOpacity>
                        //)
                        }
                    </View>

                </View>
            </View>
        )
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
                  onConfirm={()=>setVisibleAlert(false)}
                  title=""
                  type={typeAlert}
                  />
            <CustomHeader
                title={"Pedidos"}
                onBack={() => navigation.goBack()}
                showSearch={true}
                searchValue={pesquisa}
                onSearchChange={(value) => setPesquisa(value)}
                searchPlaceholder="Pesquisar..."
                showFilter={true}
                onFilterPress={() => setVisible(true)}
            />

          

           <ModalFilter 
                visible={visible} 
                setVisible={setVisible} 
                statusAtual={statusPedido}       
                setStatus={setStatusPedido} 
                dataAtual={data_cadastro}         
                setDate={setData_cadastro}   
            />
            <ModalPrint visible={visibleModal} orcamento={orcamentoModal} setVisible={setVisibleModal} />
               {
                    loading ? 
                    ( 
                        <View style={{ flex:1, alignItems:"center", justifyContent:'center'}}>
                         <ActivityIndicator color='#185FED' size={50}/>
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