import { Text, View, TouchableOpacity, TextInput, FlatList, Modal, Alert, ActivityIndicator } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import useApi from "../../services/api";
import { LodingComponent } from "../../components/loading";
import { configMoment } from "../../services/moment";
import { useSetores } from "../../database/querySetores/querySetores";

type sector = {
    codigo: number;
    descricao: string;
    data_cadastro: string;
    data_recadastro: string;
}

export const Setores = ({ navigation }: any) => {
    const [dados, setDados] = useState([]);
    const [pesquisa, setPesquisa] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [setorSelecionado, setSetorSelecionado] = useState<sector>();
    const [loading, setLoading] = useState(false);

    const useQuerySetores = useSetores();
    const api = useApi();
    const dateService = configMoment();

    useFocusEffect(() => {
        async function busca() {
            let data: any = await useQuerySetores.selectAll();
            if (data?.length > 0) {
                setDados(data);
            }
        }

        if (pesquisa === '' || pesquisa === undefined) {
            busca();
        }
    });

    useEffect(() => {
        async function busca() {
            let data: any = await useQuerySetores.selectByDescription(pesquisa);
            if (data?.length > 0) {
                setDados(data);
            }
        }
        if (pesquisa !== '' || pesquisa !== undefined) {
            busca();
        }
    }, [pesquisa]);

    function handleSelect(item: sector) {
        setSetorSelecionado(item);
        setVisible(true);
    }

    // --- RENDER ITEM ESTILIZADO IGUAL PRODUTOS ---
    function renderItem({ item }: any) {
        return (
            <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={{
                    backgroundColor: '#FFF',
                    borderRadius: 12,
                    marginHorizontal: 10,
                    marginVertical: 6,
                    padding: 15,
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: '#757575', marginRight: 5 }}>Cód.</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#185FED' }}>{item.codigo}</Text>
                    </View>
                    <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                        {item.descricao}
                    </Text>
                </View>
                <MaterialIcons name="edit" size={24} color="#BDBDBD" />
            </TouchableOpacity>
        );
    }

    async function gravar() {
        if (!setorSelecionado?.descricao) return Alert.alert("Erro!", "É necessario informar a descrição para poder gravar!");

        try {
            setLoading(true);
            let objSetor: any = {
                "codigo": setorSelecionado && setorSelecionado.codigo,
                "descricao": setorSelecionado.descricao,
                "data_cadastro": setorSelecionado.data_cadastro,
                "data_recadastro": dateService.dataHoraAtual(),
            }
            let result = await api.put('/setores', objSetor);

            if (result.status === 200) {
                try {
                    await useQuerySetores.update(objSetor);
                } catch (e) {
                    return Alert.alert('Erro!', 'Erro ao Tentar registrar setor no banco local!');
                }
                setVisible(false);
                return Alert.alert('', `Setor: ${setorSelecionado?.descricao} alterado com sucesso!`);
            }
        } catch (e: any) {
            if (e.status === 400) {
                return Alert.alert('Erro!', e.response.data.msg);
            } else {
                console.log(e);
                return Alert.alert('Erro!', 'Erro desconhecido!');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            <LodingComponent isLoading={loading} />

            {/* --- HEADER ESTILIZADO --- */}
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
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Setores</Text>
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
                            placeholder="Pesquisar setor..."
                            placeholderTextColor="#999"
                            value={pesquisa}
                        />
                    </View>
                    {/* Botão de filtro visual (sem ação definida no original, mantido layout) */}
                    <TouchableOpacity>
                        <AntDesign name="filter" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- LISTA --- */}
            <FlatList
                data={dados}
                renderItem={(i) => renderItem(i)}
                keyExtractor={(i: any) => i.codigo.toString()}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            />

            {/* --- MODAL EDITAR --- */}
            <Modal
                transparent={true}
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        width: '90%',
                        backgroundColor: '#FFF',
                        borderRadius: 15,
                        overflow: 'hidden',
                        elevation: 10
                    }}>
                        {/* Header do Modal */}
                        <View style={{
                            backgroundColor: '#185FED',
                            padding: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Editar Setor</Text>
                            <TouchableOpacity onPress={() => setVisible(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Corpo do Modal */}
                        <View style={{ padding: 20 }}>
                            
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Código</Text>
                                <View style={{ backgroundColor: '#F0F0F0', borderRadius: 8, padding: 12 }}>
                                    <Text style={{ fontWeight: "bold", color: "#333" }}>{setorSelecionado?.codigo}</Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Descrição</Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#F5F7FA',
                                        borderWidth: 1,
                                        borderColor: '#E0E0E0',
                                        borderRadius: 8,
                                        padding: 12,
                                        fontSize: 16,
                                        color: '#333'
                                    }}
                                    onChangeText={(v) => setSetorSelecionado((prev: any) => { return { ...prev, descricao: v } })}
                                    value={setorSelecionado?.descricao}
                                    placeholder="Nome do setor"
                                />
                            </View>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#185FED',
                                    borderRadius: 10,
                                    paddingVertical: 14,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    gap: 8
                                }}
                              //  onPress={() => gravar()}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#FFF" />
                                        <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 16 }}>Salvar Alterações</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- FAB (BOTÃO FLUTUANTE) --- */}
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
                    navigation.navigate('cadastro_setores')
                }}
            >
                <MaterialIcons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

        </View>
    );
}