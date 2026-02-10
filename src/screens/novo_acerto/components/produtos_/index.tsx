import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Image,
} from "react-native";

import { useProducts } from "../../../../database/queryProdutos/queryProdutos";
import { useFotosProdutos } from "../../../../database/queryFotosProdutos/queryFotosProdutos";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

export const ListaProdutos = ({ produto, setProduto }: { produto: any, setProduto: React.Dispatch<React.SetStateAction<any>> }) => {

    const [pesquisa, setPesquisa] = useState<any>("a"); // Inicia vazio para não buscar tudo de cara se não quiser
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleProdutos, setVisibleProdutos] = useState(false);

    const useQueryProdutos = useProducts();
    const useQueryFotos = useFotosProdutos();

    useEffect(() => {
        const busca = async () => {
            setLoading(true); // Ativar loading
            try {
                let aux: any = await useQueryProdutos.selectByDescription(pesquisa, 20);
                for (let p of aux) {
                    let dadosFoto: any = await useQueryFotos.selectByCode(p.codigo)
                    if (dadosFoto?.length > 0) {
                        p.fotos = dadosFoto
                    } else {
                        p.fotos = []
                    }
                }
                setData(aux);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };

        if (pesquisa.trim() !== "") {
            busca();
        } else {
            // Se quiser carregar algo padrão ao limpar, chame busca() aqui também ou limpe
             setData([]); 
             // Se quiser buscar todos ao abrir o modal sem digitar nada, descomente a busca() no useEffect da abertura do modal ou aqui.
        }
    }, [pesquisa]);

    function selecionarItem(item: any) {
        setProduto(item);
        setVisibleProdutos(false);
    }

    const renderItem = ({ item }: any) => {
        const hasImage = item.fotos && item.fotos.length > 0 && item.fotos[0].link;

        return (
            <TouchableOpacity
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: 12,
                    marginHorizontal: 15,
                    marginVertical: 6,
                    padding: 10,
                    elevation: 3,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                onPress={() => selecionarItem(item)}
            >
                {/* Imagem */}
                <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' }}>
                    {hasImage ? (
                        <Image source={{ uri: `${item.fotos[0].link}` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <MaterialIcons name="image-not-supported" size={24} color="#BDBDBD" />
                    )}
                </View>

                {/* Dados */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Cód: {item.codigo}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4CAF50' }}>R$ {item.preco ? item.preco.toFixed(2) : '0.00'}</Text>
                    </View>
                    
                    <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '600', color: '#333', marginVertical: 2 }}>
                        {item.descricao}
                    </Text>
                    
                    <Text style={{ fontSize: 12, color: '#757575' }}>Estoque: {item.estoque}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Botão de abrir modal estilizado como Input Search */}
            <TouchableOpacity
                onPress={() => setVisibleProdutos(true)}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FFF",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    paddingHorizontal: 15,
                    height: 47,
                    elevation: 2
                }}
            >
                <FontAwesome name="search" size={18} color="#185FED" style={{ marginRight: 10 }} />
                <Text style={{ color: "#757575", fontSize: 16 }}>
                    {produto?.descricao ? "Alterar produto..." : "Pesquisar produto..."}
                </Text>
            </TouchableOpacity>

            <Modal visible={visibleProdutos} animationType="fade" transparent={true} onRequestClose={() => setVisibleProdutos(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{
                        width: "90%",
                        height: "80%",
                        backgroundColor: "#F5F7FA",
                        borderRadius: 16,
                        overflow: 'hidden',
                        elevation: 10
                    }}>
                        {/* Header Modal */}
                        <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FFF',
                                borderRadius: 8,
                                paddingHorizontal: 10,
                                height: 40,
                                marginRight: 10
                            }}>
                                <Ionicons name="search" size={20} color="#999" style={{ marginRight: 5 }} />
                                <TextInput
                                    style={{ flex: 1, color: '#333' }}
                                    placeholder="Digite para buscar..."
                                    placeholderTextColor="#999"
                                    onChangeText={(text) => setPesquisa(text)}
                                    autoFocus={true}
                                />
                            </View>
                            <TouchableOpacity onPress={() => setVisibleProdutos(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Lista */}
                        <View style={{ flex: 1, paddingVertical: 10 }}>
                            {loading ? (
                                <ActivityIndicator size="large" color="#185FED" style={{ marginTop: 20 }} />
                            ) : (
                                <FlatList
                                    data={data}
                                    renderItem={renderItem}
                                    keyExtractor={(item:any) => item.codigo.toString()}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    ListEmptyComponent={() => (
                                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                                            <Text style={{ color: '#999' }}>Nenhum produto encontrado.</Text>
                                        </View>
                                    )}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};