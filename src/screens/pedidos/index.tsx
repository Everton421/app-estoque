import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../contexts/auth";
import { ConnectedContext } from "../../contexts/conectedContext";
import { OrcamentoContext } from "../../contexts/orcamentoContext";
import { usePedidos } from "../../database/queryPedido/queryPedido";
import { receberPedidos } from "../../services/getOrders";
import { configMoment } from "../../services/moment";
import { enviaPedidos } from "../../services/sendOrders";
import { CameraView, useCameraPermissions } from "expo-camera";

// Importe o CustomHeader que acabamos de criar (Ajuste o caminho conforme a sua pasta)

import { ModalFilter } from "./components/modal-filter/modal-filter";
import { ModalPrint } from "./components/modal-print-pedido";
import { CustomHeader } from "../../components/custom-header/custom-header";

export type pedido = {
    codigo?: number,
    id: number,
    id_externo: number,
    situacao: string,
    situacao_separacao: 'N' | 'P' | 'I',
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
    const { setOrcamento } = useContext(OrcamentoContext);
    const { usuario }: any = useContext(AuthContext);
    const { connected }: any = useContext(ConnectedContext);

    const[orcamentosRegistrados, setOrcamentosRegistrados] = useState([]);
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [selecionado, setSelecionado] = useState<pedido>();
    const[pesquisa, setPesquisa] = useState('');
    const [visible, setVisible] = useState(false);

    const[visiblePostPedido, setVisiblePostPedido] = useState(false);
    const [loadingPedidoId, setLoadingPedidoId] = useState<number>(0)
    const [loadingEditOrder, setLoadingEditOrder] = useState(false);
    const [data_cadastro, setData_cadastro] = useState(useMoment.primeiroDiaMes())
    const[orcamentoModal, setOrcamentoModal] = useState();
    const [statusPedido, setStatusPedido] = useState<string>('*');

    async function fyndBarcode(codeScanned: string) {

            const resultOrder = await useQuerypedidos.findByParam({ id_interno: codeScanned})
            if( resultOrder && resultOrder?.length > 0 ){
                      navigation.navigate('separacao',{
                     codigo_pedido: resultOrder[0].codigo,
                  });
            }else{
                 return Alert.alert("Erro", `Não foi possivel localizar o pedido ${codeScanned}.`)
            }

    }

       const [modalVisible, setModalvisible] = useState(false);

    function handleCodeRead(data: string) {
        setModalvisible(false);
        fyndBarcode(data);
    }

    const getFitroPedidos = async () => {
        try {
            const value = await AsyncStorage.getItem('filtroPedidos');
            if (value !== null) {
                return value;
            } else {
                await AsyncStorage.setItem('filtroPedidos', statusPedido)
            }
        } catch (e) {
            console.log("erro ao consultar AsyncStorage")
        }
    }

    const getDataFiltroPedido = async () => {
        try {
            const value = await AsyncStorage.getItem('dataPedidos');
            if (value !== null) {
                return value;
            }
        } catch (e) {
            console.log("erro ao consultar data do filtro dos pedidos AsyncStorage")
        }
    }

    async function busca() {
        let filtroStatus = await getFitroPedidos();
        let dataFiltroPedidos = await getDataFiltroPedido();

        if (!usuario.codigo || usuario.codigo === 0) {
            console.log("usuario invalido!")
            return
        }
        let queryOrder = { tipo: tipo, vendedor: usuario.codigo, data: dataFiltroPedidos, situacao: filtroStatus, input: '' }

        if (pesquisa !== null && pesquisa !== '') queryOrder.input = pesquisa
        let aux: any = await useQuerypedidos.newSelect(queryOrder);
        setOrcamentosRegistrados(aux);
        setVisiblePostPedido(false);
    }

    useEffect(() => {
        busca()
    }, [data_cadastro, statusPedido, pesquisa])

    useFocusEffect(
        useCallback(() => {
            busca();
        }, [navigation])
    );

    useEffect(() => {
        async function busca() {
            if (selecionado !== undefined) {
                let aux = await useQuerypedidos.selectCompleteOrderByCode(selecionado?.codigo);
                setOrcamento(aux);
            } else { return }
        }
        busca()
    },[selecionado])

   

    async function selecionaOrcamentoModal( item:any ){
        let aux = await useQuerypedidos.selectCompleteOrderByCode(item.codigo);
        console.log(aux  )
        setOrcamentoModal( aux );
        setVisibleModal( true )
    }

    // --- FUNÇÕES AUXILIARES DE STATUS PARA O NOVO DESIGN ---
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

    // --- RENDER ITEM TOTALMENTE REFATORADO ---
    const ItemOrcamento = ({ item }: { item: any }) => {
        const status = getStatusParams(item.situacao);
        const podeEditar = item.situacao !== 'RE' && item.situacao !== 'FI';
        const podeExcluir = item.situacao !== 'RE' && item.situacao !== 'FI' && item.situacao !== 'AI' && item.situacao !== "FP";

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
                {/* --- HEADER DO CARD (IDs e Status) --- */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 13, color: '#666', fontWeight: 'bold' }}>
                        ID: {item.id || item.codigo} {item.id_externo ? ` | Ext: ${item.id_externo}` : ''}
                    </Text>
                    
                    <View style={{ backgroundColor: status.color + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ color: status.color, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {status.label}
                        </Text>
                    </View>
                </View>

                {/* --- CORPO DO CARD (Cliente e Valor) --- */}
                <Text style={{ fontSize: 16, fontWeight: "bold", color: '#333', marginBottom: 5 }} numberOfLines={1}>
                    {item?.nome}
                </Text>

                <Text style={{ fontSize: 18, fontWeight: "bold", color: '#185FED', marginBottom: 10 }}>
                    Total: R$ {item?.total_geral.toFixed(2)}
                </Text>

                {/* --- DATAS --- */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Criado: {new Date(item?.data_cadastro).toLocaleDateString("pt-br")}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Modificado: {new Date(item?.data_recadastro).toLocaleTimeString("pt-br", { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {/* --- RODAPÉ DE AÇÕES (Botões) --- */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 }}>
                    
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {/* Visualizar */}
                        <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 6, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                            <Feather name="eye" size={20} color="#185FED" />
                        </TouchableOpacity>

                        {/* Editar
                        {podeEditar && (
                            <TouchableOpacity onPress={() => selecionaOrcamento(item)} style={{ padding: 6, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                                <Feather name="edit" size={20} color="#185FED" />
                            </TouchableOpacity>
                        )} */}

               

                        {/* Excluir 
                        {podeExcluir ? (
                            <TouchableOpacity onPress={() => deleteOrder(item)} style={{ padding: 6, backgroundColor: '#FFEBEE', borderRadius: 8 }}>
                                <MaterialCommunityIcons name="delete" size={20} color="#D32F2F" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => Alert.alert('Aviso', 'Não é possível excluir um pedido processado/faturado.')} style={{ padding: 6, backgroundColor: '#F5F5F5', borderRadius: 8 }}>
                                <MaterialCommunityIcons name="delete-off" size={20} color="#BDBDBD" />
                            </TouchableOpacity>
                        )}*/}
                    </View>

                    {/* Sincronização / API */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {item.enviado === 'S' ? (
                            <Ionicons name="checkmark-done-circle" size={24} color="#4CAF50" />
                        ) : (
                            <Ionicons name="time" size={24} color="#FFC107" />
                        )}

                        {!connected ? (
                            <TouchableOpacity style={{ padding: 6, backgroundColor: '#F5F5F5', borderRadius: 8 }}>
                                <MaterialIcons name="sync-disabled" size={20} color="#BDBDBD" />
                            </TouchableOpacity>
                        ) : visiblePostPedido && loadingPedidoId === item.codigo ? (
                            <View style={{ padding: 6, width: 32, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#185FED" />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => postPedido(item)} style={{ padding: 6, backgroundColor: '#E8F5E9', borderRadius: 8 }}>
                                <Ionicons name="sync-sharp" size={20} color="#4CAF50" />
                            </TouchableOpacity>
                        )}
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
            
            {/* --- CUSTOM HEADER (Usando o novo componente) --- */}
            <CustomHeader 
                title={tipo === 1 ? "Pedidos" : "Orçamentos"}
                onBack={() => navigation.goBack()}
                showSearch={true}
                searchValue={pesquisa}
                onSearchChange={(value) => setPesquisa(value)}
                searchPlaceholder="Pesquisar..."
                showFilter={true}
                onFilterPress={() => setVisible(true)}
            />

            {/* --- MODAL LOADING --- */}
            <Modal visible={loadingEditOrder} transparent={true}>
                <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 10 }}>
                        <ActivityIndicator size={40} color="#185FED" />
                        <Text style={{ marginTop: 10, color: '#333', fontWeight: 'bold' }}>Carregando...</Text>
                    </View>
                </View>
            </Modal>

            {/* --- MODAIS EXTERNOS --- */}
            <ModalFilter visible={visible} setVisible={setVisible} setStatus={setStatusPedido} setDate={setData_cadastro} />
            <ModalPrint visible={visibleModal} orcamento={orcamentoModal} setVisible={setVisibleModal} />

            {/* --- LISTA --- */}
            <FlatList
                data={orcamentosRegistrados}
                renderItem={({ item }) => <ItemOrcamento item={item} />}
                keyExtractor={(item: any) => item.codigo.toString()}
                contentContainerStyle={{ paddingBottom: 100 }} // Espaço para a legenda e o FAB
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: '#999', fontSize: 16 }}>Nenhum registro encontrado.</Text>
                    </View>
                )}
            />

            {/* --- FAB (Botão Ler codigo do pedido) --- */}
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
                    bottom: 80, // Fica acima da legenda
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 99
                }}
            >
                        <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />

            </TouchableOpacity>

            {/* --- LEGENDA INFERIOR (Status) --- */}
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
  {/* --- MODAL CÂMERA --- */}
 
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