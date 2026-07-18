import React, { useEffect, useState } from "react";
import {
    View, FlatList, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator, Image,
} from "react-native";

import { Ionicons, MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import useApi from "../../../../services/api";
import { actionsRequirement, itensPayloadRequirement, payloadRequirement } from "../..";



type sectorProdSectorGroupedRequest =   {
         codigo: number,
         descricao: string,
         ativo: string,
         id: string,
         estoque: number,
         local_produto:  string,
         local1_produto: string,
         local2_produto: string,
         local3_produto: string,
         local4_produto: string
      }

type productProdSectorGroupedRequest =   {
    codigo : number,
       descricao :  string,
        id : string
        controle_lote_serie: 'S' | 'N'
}

  export  type prodSectorGroupedRequest = {
     produto :  productProdSectorGroupedRequest,
     setor :   sectorProdSectorGroupedRequest[]
  }


export const ListaProdutosRequerimento = ({ requirement, dispatch }: { requirement: payloadRequirement, dispatch: React.ActionDispatch<[action: actionsRequirement]> }) => {

    const [pesquisa, setPesquisa] = useState<any>("a"); // Inicia vazio para não buscar tudo de cara se não quiser
    const [data, setData] = useState<prodSectorGroupedRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [visibleProdutos, setVisibleProdutos] = useState(false);
    const api = useApi();

  

    useEffect(() => {
        const busca = async () => {
            setLoading(true); // Ativar loading
            try {
                
          const responseProduct = await api.get('/produtos-setor/search-grouped', 
                        {
                            params: { 
                                limit: 20,
                                setor: requirement.setor_origem,
                                search: pesquisa,
                                ativo: 'S'
                            }
                        }
                    );
                      setData(responseProduct?.data as prodSectorGroupedRequest[]);

           
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


    const renderItem = ({ item }: {item: prodSectorGroupedRequest}) => {
        const isSelected = requirement && requirement.itens.some( ( i )=> i.produto == item.produto.codigo );
        const index =  requirement.itens && requirement.itens.findIndex( ( i )=> i.produto == item.produto.codigo);
        return (
            <TouchableOpacity
                style={{
                    backgroundColor: isSelected ? "#f9fff9e8" : "#FFF",
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
                    alignItems: 'center',
                    borderStartWidth: 3,
                    borderStartColor: isSelected ? "#4CAF50" : "#185FED"
                }}
                onPress={() =>{
                    if( isSelected){
                         dispatch({ type:'remove_item', payload:  index })
                    }else{
                        dispatch({ type:'add_item', payload:{ 
                            custo: 0,
                            descricao: item.produto.descricao,
                           controle_lote_serie: item.produto.controle_lote_serie   , 
                            produto: item.produto.codigo,
                            quantidade_disponivel: item.setor[0].estoque,
                            quantidade: 0,
                            lotes_series:[]
                        }})
                    }

                }  }
            >
         
                {/* Dados */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Cód: {item.produto.codigo}</Text>
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Id: {item.produto.id}</Text>
                    </View>
                    
                    <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '600', color: '#333', marginVertical: 2 }}>
                        {item.produto.descricao}
                    </Text>
                    {
                        item.setor.map( (i)=>(
                           <>  
                            <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '600', color: '#333', marginVertical: 2 }}>
                                    <Entypo name="location" size={15} color="#185FED" /> Setor: {i.codigo} - { i.descricao}  
                            </Text>
                            <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '600', color: '#333', marginVertical: 2 }}>
                                    Qtd disponivel: {i.estoque}
                            </Text>
                          </>
                        ) )
                    }
                    
                    { /**   <Text style={{ fontSize: 12, color: '#757575' }}>Estoque: {item.estoque}</Text>*/ } 
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Botão de abrir modal estilizado como Input Search */}
            <TouchableOpacity
                onPress={() => setVisibleProdutos(true)}
                style={{flexDirection: "row",alignItems: "center",backgroundColor: "#FFF",borderRadius: 8,borderWidth: 1,borderColor: '#E0E0E0',paddingHorizontal: 15,height: 47,elevation: 2
                }}
            >
                <FontAwesome name="search" size={18} color="#185FED" style={{ marginRight: 10 }} />
                <Text style={{ color: "#757575", fontSize: 16 }}>
                    {  "Pesquisar produto..."}
                </Text>
            </TouchableOpacity>

            <Modal visible={visibleProdutos} animationType="fade" transparent={true} onRequestClose={() => setVisibleProdutos(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{
                        width: "95%",
                        height: "90%",
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
                                    keyExtractor={(item:any) => item.produto.codigo.toString()}
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