import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert, Modal } from "react-native";
import { usePedidos } from "../../database/queryPedido/queryPedido";
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { CameraView } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useItemsPedido } from "../../database/queryPedido/queryItems";
import { configMoment } from "../../services/moment";

export interface Cliente {
  bairro: string;
  celular: string;
  cep: string;
  cidade: string;
  cnpj: string;
  codigo: number;
  data_cadastro: string; 
  data_recadastro: string;
  endereco: string;
  estado: string;
  ie: string;
  nome: string;
  numero: string;
  vendedor: number;
}

export interface Parcela {
  parcela: number;
  pedido: number;
  valor: number;
  vencimento: string;
}

export interface Produto {
  codigo: number;
  id:string
  desconto: number;
  descricao: string;
  pedido: number;
  preco: number;
  quantidade: number;
  total: number;
  num_fabricante: string;
  num_original: string;
  sku: string;
  quantidade_separada?: number; 
}

export interface Pedido {
  cliente: Cliente;
  codigo: number;
  codigo_cliente: number;
  contato: string;
  data_cadastro: string;
  data_recadastro: string;
  descontos: number;
  enviado: "S" | "N"; 
  forma_pagamento: number;
  id: string;
  id_externo: string;
  id_interno: string;
  nome: string;
  observacoes: string;
  parcelas: Parcela[];
  produtos: resultOrderItens[];
  quantidade_parcelas: number;
  servicos: any[]; 
  situacao: string;
  situacao_separacao: string;
  tipo: number;
  tipo_os: number;
  total_geral: number;
  total_produtos: number;
  total_servicos: number;
  veiculo: number;
  vendedor: number;
}

type resultOrderItens = {
    descricao: string
    num_fabricante: string
    num_original: string
    sku: string
    id: number
    quantidade_separada: number
    frete: number
    codigo: number
    pedido: number
    desconto: number
    preco: number
    quantidade: number
    total: number
    local_produto: string
    local1_produto: string
    local2_produto: string
    local3_produto: string
    local4_produto: string
}

export const Separacao = ({ navigation, route }: any) => {
    
    const useQuerypedidos = usePedidos();
    const { codigo_pedido } = route.params;

    const[data, setData] = useState<Pedido>();
    const useQueryItems = useItemsPedido();

    const[listaSeparacao, setListaSeparacao] = useState<resultOrderItens[]>([]);
    const[modalVisible, setModalvisible] = useState(false);
    const [defaultConfigFilter, setDefaultConfigFilter] = useState<'codigo' | 'num_fabricante' | 'num_original' | 'sku'>('num_fabricante');
    const useMoment = configMoment();

    function handleCodeRead(data: string) {
        setModalvisible(false);
        fyndBarcode(data);
    }

    async function fyndBarcode(codigo: string) {
        handleUpdateQuantityByCodeRead(Number(codigo), 1, 9999);
    }

    async function getDefaultConfig() {
        try {
            let value: any = await AsyncStorage.getItem('configProduto');
            if (value !== null) {
                setDefaultConfigFilter(value);
            }
        } catch (e) {
            console.log('erro ao tentar obter a configuração no AsyncStorage');
        }
    }

    useEffect(() => {
        getDefaultConfig();

        async function busca() {
            if (codigo_pedido !== undefined) {
                let orderData = await useQuerypedidos.selectCompleteOrderByCode(codigo_pedido) as Pedido;
                if (!orderData) {
                    return Alert.alert("Erro", `Não foi possivel localizar o pedido ${codigo_pedido}.`);
                }
                setData(orderData);

                if (orderData.produtos) {
                    const produtosIniciais = orderData.produtos.map(p => ({
                        ...p,
                        quantidade_separada: p.quantidade_separada || 0 
                    }));
                    setListaSeparacao(produtosIniciais);
                }
            }
        }
        busca();
    }, [codigo_pedido, navigation]);

    const handleUpdateQuantity = (codigo: number, newQuantity: number, maxQuantity: number) => {
        if (newQuantity < 0) newQuantity = 0;
        if (newQuantity > maxQuantity) newQuantity = maxQuantity; 

        setListaSeparacao(prev => prev.map(p => 
            p.codigo === codigo ? { ...p, quantidade_separada: newQuantity } : p
        ));
    };
    
    const handleUpdateQuantityByCodeRead = (codigo: number, newQuantity: number, maxQuantity: number) => {
        if (newQuantity < 0) newQuantity = 0;
        
        let targetProduct = listaSeparacao.find(p => {
            if (defaultConfigFilter === 'codigo') return p.codigo === codigo;
            if (defaultConfigFilter === 'num_fabricante') return p.num_fabricante === String(codigo);
            if (defaultConfigFilter === 'sku') return p.sku === String(codigo);
            if (defaultConfigFilter === 'num_original') return p.num_original === String(codigo);
        });

        if (targetProduct) {
            // Se já tiver algo separado, soma 1. Senão, inicia com 1.
            let qtdAtual = targetProduct.quantidade_separada || 0;
            let novaQtd = qtdAtual + 1;

            if (novaQtd > targetProduct.quantidade) novaQtd = targetProduct.quantidade; // Limita à quantidade do pedido

            setListaSeparacao(prev => prev.map(p => 
                p.codigo === targetProduct!.codigo ? { ...p, quantidade_separada: novaQtd } : p
            ));
        }
    };

    // --- NOVA LÓGICA DE SALVAMENTO ---
    async function saveOrder() {
        let qtdTotalPedida = 0;
        let qtdTotalSeparada = 0;

        try {
            // Primeiro salvamos cada item e acumulamos os totais
            for (const p of listaSeparacao) {
                const quantity = p.quantidade_separada !== undefined ? p.quantidade_separada : 0;
                
                qtdTotalPedida += p.quantidade;
                qtdTotalSeparada += quantity;

                await useQueryItems.updatByParam({ quantidade_separada: quantity }, p.codigo, codigo_pedido);
            }

            // Calculamos a situação com base nas somas de forma segura
            let situacao_separacao: 'I' | 'N' | 'P' = 'N';
            
            if (qtdTotalSeparada === 0) {
                situacao_separacao = 'N'; // Nada separado
            } else if (qtdTotalSeparada === qtdTotalPedida) {
                situacao_separacao = 'I'; // Tudo separado
            } else {
                situacao_separacao = 'P'; // Algo no meio (Parcial)
            }

            const resultUpdate = await useQuerypedidos.newUpdate({ enviado: 'N', situacao_separacao: situacao_separacao, data_recadastro: useMoment.dataHoraAtual() }, codigo_pedido);
            
            if (resultUpdate && resultUpdate.changes > 0) {
                Alert.alert("Sucesso", "Separação salva com sucesso!");
                navigation.goBack();
            }
        } catch (e) {
            console.log("erro ao salvar a separação", e);
            Alert.alert("Erro", "Ocorreu um problema ao salvar a separação.");
        }
    }

    const renderProduto = ({ item }: { item: resultOrderItens }) => {
        const quantidadeSeparada = item.quantidade_separada || 0;
        const concluido = quantidadeSeparada === item.quantidade; 

        return (
            <View style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 15,
                marginBottom: 12,
                padding: 15,
                elevation: 3,
                borderLeftWidth: 5,
                borderLeftColor: concluido ? '#4CAF50' : '#FFC107' 
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Cód: {item.codigo}</Text>
                    <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Id: {item.id}</Text>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Qtd. Pedida: {item.quantidade}</Text>
                </View>
                    <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>ean: {item.num_fabricante}</Text>

                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                    {item.descricao || "Produto sem descrição"}
                </Text>

                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    backgroundColor: concluido ? '#E8F5E9' : '#F5F7FA', 
                    padding: 10, 
                    borderRadius: 8 
                }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>Qtd. Separada:</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center" }}
                            onPress={() => handleUpdateQuantity(item.codigo, quantidadeSeparada - 1, item.quantidade)}
                        >
                            <AntDesign name="minus" size={20} color="#333" />
                        </TouchableOpacity>

                        <View style={{ minWidth: 40, borderBottomWidth: 2, borderBottomColor: concluido ? '#4CAF50' : '#185FED', alignItems: 'center' }}>
                            <TextInput
                                style={{ fontSize: 20, fontWeight: 'bold', color: concluido ? '#4CAF50' : '#185FED', textAlign: 'center', paddingVertical: 0 }}
                                value={String(quantidadeSeparada)}
                                onChangeText={(text) => {
                                    const num = Number(text.replace(/[^0-9]/g, ''));
                                    handleUpdateQuantity(item.codigo, num, item.quantidade);
                                }}
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: concluido ? '#4CAF50' : "#185FED", justifyContent: "center", alignItems: "center", elevation: 2 }}
                            onPress={() => handleUpdateQuantity(item.codigo, quantidadeSeparada + 1, item.quantidade)}
                        >
                            <AntDesign name="plus" size={20} color="#FFF" />
                        </TouchableOpacity>
                        
                    </View>
                    
                </View>
                    <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Locais: </Text>
                     {item.local1_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local1_produto }</Text> }
                     {item.local2_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local2_produto }</Text> }
                     {item.local3_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local3_produto }</Text> }
                     {item.local4_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local4_produto }</Text> }

            </View>
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            
            <CustomHeader 
                title="Separação" 
                onBack={() => navigation.goBack()} 
            />

            {data && (
                <View style={{ backgroundColor: '#FFF', borderRadius: 12, marginHorizontal: 15, marginBottom: 15, padding: 15, elevation: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialIcons name="receipt-long" size={24} color="#185FED" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                            Pedido #{data.id || data.codigo}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 15, color: '#555', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold' }}>Cliente:</Text> {data.nome}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666' }}>
                        <Text style={{ fontWeight: 'bold' }}>Total de itens na lista:</Text> {listaSeparacao.length}
                    </Text>
                </View>
            )}

            <FlatList
                data={listaSeparacao}
                renderItem={renderProduto}
                keyExtractor={(item) => item.codigo.toString()}
                contentContainerStyle={{ paddingBottom: 100 }} 
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <MaterialCommunityIcons name="package-variant-closed" size={50} color="#BDBDBD" />
                        <Text style={{ color: '#999', fontSize: 16, marginTop: 10 }}>Nenhum produto neste pedido.</Text>
                    </View>
                )}
            />

            {/* BOTÃO FIXO NO RODAPÉ */}
            <View style={{ 
                position: 'absolute', 
                bottom: 0, left: 0, right: 0, 
                backgroundColor: '#FFF', 
                padding: 15, 
                elevation: 10, 
                borderTopWidth: 1, 
                borderTopColor: '#E0E0E0' 
            }}>
                <TouchableOpacity
                    style={{ 
                        backgroundColor: '#185FED', 
                        borderRadius: 12, 
                        paddingVertical: 15, 
                        flexDirection: 'row', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 10 
                    }}
                    onPress={saveOrder}
                >
                    <MaterialCommunityIcons name="check-all" size={24} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Concluir Separação</Text>
                </TouchableOpacity>
            </View>

            {/* BOTÃO FLUTUANTE DE LEITURA (acima do rodapé) */}
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
                    right: 20,
                    bottom: 90, 
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 99
                }}
            >
                <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
            </TouchableOpacity>

            {/* MODAL CÂMERA */}
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
 
        </KeyboardAvoidingView>
    );
}