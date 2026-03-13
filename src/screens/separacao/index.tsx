import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { usePedidos } from "../../database/queryPedido/queryPedido";
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CustomHeader } from "../../components/custom-header/custom-header";


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
  desconto: number;
  descricao: string;
  pedido: number;
  preco: number;
  quantidade: number;
  total: number;
  // Propriedade extra opcional caso já venha do banco
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
  produtos: Produto[];
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

export const Separacao = ({ navigation, route }: any) => {
    
    const useQuerypedidos = usePedidos();
    const { codigo_pedido } = route.params;

    const [data, setData] = useState<Pedido>();
    
    // Estado apenas VISUAL para controlar as quantidades sendo separadas na tela
    const [listaSeparacao, setListaSeparacao] = useState<Produto[]>([]);

    useEffect(() => {
        async function busca() {
            if (codigo_pedido !== undefined) {
                let orderData = await useQuerypedidos.selectCompleteOrderByCode(codigo_pedido) as Pedido;
                if (!orderData) {
                    return Alert.alert("Erro", `Não foi possivel localizar o pedido ${codigo_pedido}.`);
                }
                setData(orderData);

                // Copiando os produtos para o estado visual
                if (orderData.produtos) {
                    const produtosIniciais = orderData.produtos.map(p => ({
                        ...p,
                        // Se já existir quantidade separada no banco ele usa, senão inicia zerado na tela
                        quantidade_separada: p.quantidade_separada || 0 
                    }));
                    setListaSeparacao(produtosIniciais);
                }
            }
        }
        busca();
    }, [codigo_pedido, navigation]);

    // Função que atualiza a quantidade na tela
    const handleUpdateQuantity = (codigo: number, newQuantity: number, maxQuantity: number) => {
        // Regras de negócio visuais: não pode ser menor que 0 e (opcionalmente) não pode ser maior que o pedido
        if (newQuantity < 0) newQuantity = 0;
        if (newQuantity > maxQuantity) newQuantity = maxQuantity; 

        setListaSeparacao(prev => prev.map(p => 
            p.codigo === codigo ? { ...p, quantidade_separada: newQuantity } : p
        ));
    };

    // Componente interno para renderizar cada Produto
    const renderProduto = ({ item }: { item: Produto }) => {
        const quantidadeSeparada = item.quantidade_separada || 0;
        const concluido = quantidadeSeparada === item.quantidade; // Checa se separou tudo

        return (
            <View style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 15,
                marginBottom: 12,
                padding: 15,
                elevation: 3,
                borderLeftWidth: 5,
                borderLeftColor: concluido ? '#4CAF50' : '#FFC107' // Verde se OK, Amarelo se pendente
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Cód: {item.codigo}</Text>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Qtd. Pedida: {item.quantidade}</Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                    {item.descricao || "Produto sem descrição"}
                </Text>

                {/* --- CONTROLE DE QUANTIDADE --- */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    backgroundColor: concluido ? '#E8F5E9' : '#F5F7FA', // Muda levemente o fundo se concluído
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
            </View>
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            
            <CustomHeader 
                title="Separação" 
                onBack={() => navigation.goBack()} 
            />

            {/* --- CARD RESUMO DO PEDIDO --- */}
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

            {/* --- LISTA DE PRODUTOS --- */}
            <FlatList
                data={listaSeparacao}
                renderItem={renderProduto}
                keyExtractor={(item) => item.codigo.toString()}
                contentContainerStyle={{ paddingBottom: 100 }} // Espaço para não esconder atrás do botão
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <MaterialCommunityIcons name="package-variant-closed" size={50} color="#BDBDBD" />
                        <Text style={{ color: '#999', fontSize: 16, marginTop: 10 }}>Nenhum produto neste pedido.</Text>
                    </View>
                )}
            />

            {/* --- BOTÃO FIXO NO RODAPÉ --- */}
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
                    onPress={() => Alert.alert("Sucesso", "Separação visualizada! A lógica de salvar no banco será implementada depois.")}
                >
                    <MaterialCommunityIcons name="check-all" size={24} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Concluir Separação</Text>
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    );
}