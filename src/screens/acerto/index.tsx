import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from "react";
import { useMovimentos } from "../../database/queryMovimentos/queryMovimentos";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ModalFilter } from "./components/modal-filter";
import { configMoment } from "../../services/moment";

type resultQueryMov = {
    data_recadastro: string
    codigo_produto: number
    descricao_produto: string
    quantidade_movimento: number
    codigo_setor: number
    historico_movimento: string
    codigo_movimento: number
    descricao_setor: string
    entrada_saida: 'E' | 'S'
    unidade_medida: string
}

export const Acertos = ({ navigation }: any) => {
    const moment = configMoment();
    const useQueryMovimentos = useMovimentos();

    const [loadingData, setLoadinData] = useState(false);
    const [dataMovimet, setDataMoviment] = useState<resultQueryMov[] | []>([]);
    const [pesquisa, setPesquisa] = useState<string>('');
    const [visibleFilter, setVisibleFilter] = useState(false);
    const [tipoMovimento, setTipoMovimento] = useState<'S' | 'E' | '*'>('*');
    const [dateFilter, setDateFilter] = useState(moment.dataAtual());

    async function buscaPorDescricao(value: any) {
        try {
            setLoadinData(true);
            let result = await useQueryMovimentos.selectQuery(value, { data: dateFilter, tipo: tipoMovimento });
            setDataMoviment(result);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadinData(false);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            buscaPorDescricao(pesquisa);
            return () => { };
        }, [])
    );

    useEffect(() => {
        buscaPorDescricao(pesquisa);
    }, [pesquisa, tipoMovimento, dateFilter]);

    const getStatusColor = (tipo: string) => {
        return tipo === 'E' ? '#4CAF50' : '#E53935';
    };

    const getStatusIcon = (tipo: string) => {
        return tipo === 'E' ? 'arrow-up-circle' : 'arrow-down-circle';
    };

    // --- RENDER ITEM (MANTIDO E ADAPTADO AO ESTILO INLINE) ---
    function renderItem({ item }: { item: resultQueryMov }) {
        const isEntrada = item.entrada_saida === 'E';
        const colorStatus = getStatusColor(item.entrada_saida);

        return (
            <TouchableOpacity style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 10,
                marginVertical: 6,
                padding: 12,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                borderLeftWidth: 5,
                borderLeftColor: colorStatus
            }}>
                {/* Cabeçalho do Card: ID e Data */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#9E9E9E', fontWeight: 'bold' }}>#{item.codigo_movimento}</Text>
                    <Text style={{ fontSize: 12, color: '#757575' }}>
                        {new Date(item.data_recadastro).toLocaleDateString('pt-BR')}
                    </Text>
                </View>

                {/* Corpo Principal: Ícone, Produto e Qtd */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Ícone Indicador Esquerda */}
                    <View style={{
                        width: 45,
                        height: 45,
                        borderRadius: 22.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                        backgroundColor: isEntrada ? '#E8F5E9' : '#FFEBEE'
                    }}>
                        <Ionicons
                            name={getStatusIcon(item.entrada_saida)}
                            size={28}
                            color={colorStatus}
                        />
                    </View>

                    {/* Informações do Produto */}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 }} numberOfLines={2}>
                            {item.descricao_produto}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#757575' }}>Cód. Prod: {item.codigo_produto}</Text>
                    </View>

                    {/* Quantidade em Destaque */}
                    <View style={{ alignItems: 'flex-end', minWidth: 60 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colorStatus }}> {isEntrada ? '+' : '-'}{item.quantidade_movimento} </Text>
                        <Text style={{ fontSize: 10, color: '#9E9E9E', textTransform: 'uppercase' }}>{item.unidade_medida}</Text>
                    </View>
                </View>

                {/* Divisor Sutil */}
                <View style={{ height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 }} />

                {/* Rodapé: Setor e Histórico */}
                <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialIcons name="store" size={16} color="#757575" />
                        <Text style={{ fontSize: 13, color: '#616161', flex: 1 }} numberOfLines={1}>
                            {item.descricao_setor} <Text style={{ fontSize: 10 }}>({item.codigo_setor})</Text>
                        </Text>
                    </View>

                    {item.historico_movimento ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <MaterialIcons name="history" size={16} color="#757575" />
                            <Text style={{ fontSize: 13, color: '#616161', flex: 1 }} numberOfLines={2}>
                                {item.historico_movimento}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Badge de Tipo */}
                <View style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    borderTopRightRadius: 12,
                    borderBottomLeftRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: colorStatus
                }}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>
                        {isEntrada ? 'ENTRADA' : 'SAÍDA'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            
            {/* --- HEADER --- */}
            <View style={{
                backgroundColor: '#185FED',
                paddingTop: 10,
                paddingBottom: 20,
                paddingHorizontal: 15,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                elevation: 5
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Acertos</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#FFF',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        height: 45
                    }}>
                        <Ionicons name="search" size={20} color="#185FED" style={{ marginRight: 8 }} />
                        <TextInput
                            style={{ flex: 1, color: '#333', fontWeight: '500' }}
                            onChangeText={(value) => setPesquisa(value)}
                            placeholder="Pesquisar movimento..."
                            placeholderTextColor="#999"
                            value={pesquisa}
                        />
                    </View>
                    
                    <TouchableOpacity onPress={() => setVisibleFilter(true)}>
                        <AntDesign name="filter" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- LISTA --- */}
            {loadingData ? (
                <ActivityIndicator size="large" color="#185FED" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={dataMovimet}
                    renderItem={(i) => renderItem(i)}
                    keyExtractor={(i: resultQueryMov) => i.codigo_movimento.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                         <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: '#999', fontSize: 16 }}>Nenhum movimento encontrado.</Text>
                        </View>
                    )}
                />
            )}

            {/* --- FAB --- */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 30,
                    right: 30,
                    backgroundColor: '#185FED',
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 6,
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowOffset: { width: 0, height: 3 },
                    zIndex: 999
                }}
                onPress={() => {
                    navigation.navigate('novo_acerto')
                }}
            >
                <MaterialIcons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

            <ModalFilter
                setDate={setDateFilter}
                setTipo={setTipoMovimento}
                setVisible={setVisibleFilter}
                visible={visibleFilter}
            />
        </View>
    );
}