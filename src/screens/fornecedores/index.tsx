import { FontAwesome5 } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { useClients } from "../../database/queryClientes/queryCliente";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import useApi from "../../services/api";
import { ApiConfig } from "../../types/type-config-api";
import { RenderItensSuplier } from "./components/render-item/render-item";

export type fornecedor = {
    codigo: number,
    id: string
    cnpj: string,
    nome: string,
    ie: string,
    cep: string,
    cidade: string,
    endereco: string,
    numero: string
}

export function Fornecedores({ navigation }: any) {

    const [pesquisa, setPesquisa] = useState('');
    const [dados, setDados] = useState<fornecedor[]>([]);
    const [fSelecionado, setfSelecionado] = useState<fornecedor>();
    const [visible, setVisible] = useState(false);
    const [limitQuery, setLimitQuery] = useState(25); // Valor padrão inicial
    const [visibleModalFilter, setVisibleModalFilter] = useState(false);
    const [configMobileApi, setConfigMobileApi] = useState<ApiConfig>();
    const [isloadingDataSupplier, setIsLoadingDataSupplier] = useState(false);
    const api = useApi();
     const [refreshing, setRefreshing] = useState(false);
    

    const useQueryConfigApi = queryConfig_api();

    const useQueryClients = useClients();

    async function getConfigMobileApi() {
        try {
            setIsLoadingDataSupplier(true)
            const resultConfigMobileApi = await useQueryConfigApi.select(1);
            if (resultConfigMobileApi && resultConfigMobileApi.length > 0) {
                setConfigMobileApi(resultConfigMobileApi[0]);
            }
        } catch (e) {
        } finally {
            setIsLoadingDataSupplier(false)
        }
    }

    useEffect(() => {
        getConfigMobileApi();
    }, [])
 

    async function getRequestSupplier(){

        try{
                    setIsLoadingDataSupplier(true)
                    const responseSupplier = await api.get('/fornecedores/search', 
                        {
                            params: { 
                                limit: 25,
                                search: pesquisa,
                                ativo: 'S'
                            }
                        }
                    );
                      setDados(responseSupplier?.data);
                }catch(e){
                    console.log( "[X] Erro ao buscar fornecedores na api ",e )
                }finally{
                    setIsLoadingDataSupplier(false)
                }
    }


    
     const onRefresh = async () => {
        setRefreshing(true);
        getRequestSupplier()

        setRefreshing(false);
    };

    useEffect(() => {
            getRequestSupplier()
    }, [pesquisa,configMobileApi, limitQuery])


    function handleSelect(item: fornecedor) {
        setfSelecionado(item);
        setVisible(true);
        //navigation.navigate('cadastro_cliente', { codigo_cliente: item.codigo })
    }

    const FilterOption = ({ value, label }: { value: number, label: string }) => {
        const isSelected = limitQuery === value;
        return (
            <TouchableOpacity
                style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
                onPress={() => {
                    setLimitQuery(value);
                    setVisibleModalFilter(false);
                }}
            >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                    {label}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#185FED" />}
            </TouchableOpacity>
        )
    }


    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE', width: "100%" }}>

            <CustomHeader
                title="Fornecedores"
                onBack={() => navigation.goBack()}

                showSearch={true}
                searchValue={pesquisa}
                onSearchChange={(value) => setPesquisa(value)}
                searchPlaceholder="Pesquisar ..."

                showFilter={true}
                onFilterPress={() => setVisibleModalFilter(true)} // Abre seu modal
            />

            {/* --- MODAL DE DETALHES (Estilizado para o novo padrão) --- */}
            <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={{ width: '100%', height: '100%', alignItems: "center", justifyContent: "center", backgroundColor: 'rgba(0,0,0, 0.5)' }}>

                    <View style={{ width: '90%', backgroundColor: '#F5F7FA', borderRadius: 16, overflow: 'hidden', elevation: 10, maxHeight: '80%' }}>

                        {/* Header do Modal */}
                        <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Detalhes do Fornecedor</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Corpo do Modal */}
                        <View style={{ padding: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: 'center', marginBottom: 20, gap: 15 }}>
                                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' }}>
                                    <FontAwesome5 name="user" size={30} color="#185FED" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 18, color: '#333' }}>{fSelecionado?.nome}</Text>
                                    <Text style={{ color: '#185FED', fontWeight: 'bold', fontSize: 14 }}>Cód: {fSelecionado?.codigo}</Text>
                                    <Text style={{ color: '#185FED', fontWeight: 'bold', fontSize: 14, flex:1 }} numberOfLines={1} >id: {fSelecionado?.id}</Text>
                                </View>
                            </View>

                            <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}>
                                <Text style={{ fontSize: 12, color: '#666' }}>CNPJ / CPF</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{fSelecionado?.cnpj || 'N/A'}</Text>
                            </View>

                            <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}>
                                <Text style={{ fontSize: 12, color: '#666' }}>Inscrição Estadual (IE)</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{fSelecionado?.ie || 'N/A'}</Text>
                            </View>

                            <View style={{ height: 1, backgroundColor: '#D0D0D0', marginVertical: 10 }} />

                            <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}>
                                <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Endereço Completo</Text>
                                <Text style={{ fontSize: 15, color: '#444' }}>{fSelecionado?.endereco}, Nº {fSelecionado?.numero}</Text>
                                <Text style={{ fontSize: 15, color: '#444' }}>{fSelecionado?.cidade} - CEP: {fSelecionado?.cep}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* ======================================================= */}
            {/* --- NOVO MODAL DE FILTRO (LIMITE) --- */}
            {/* ======================================================= */}

            <Modal
                visible={visibleModalFilter}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisibleModalFilter(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={{ flex: 1, width: '100%' }}
                        activeOpacity={1}
                        onPress={() => setVisibleModalFilter(false)}
                    />

                    <View style={styles.filterModalContent}>
                        <View style={styles.filterHeader}>
                            <Text style={styles.filterTitle}>Limite de Busca</Text>
                            <TouchableOpacity onPress={() => setVisibleModalFilter(false)}>
                                <Ionicons name="close" size={24} color="#555" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.filterSubtitle}>
                            Selecione quantos produtos exibir por vez:
                        </Text>

                        <View style={styles.filterOptionsContainer}>
                            <FilterOption value={10}  label="10 Fornecedores" />
                            <FilterOption value={25}  label="25 Fornecedores" />
                            <FilterOption value={50}  label="50 Fornecedores" />
                            <FilterOption value={100} label="100 Fornecedores" />
                            <FilterOption value={250} label="250 Fornecedores" />

                        </View>
                    </View>
                </View>
            </Modal>
            {
                isloadingDataSupplier ? 
                <ActivityIndicator  size={50} color="#185FED" />
            :
                <FlatList
                    data={dados}
                    renderItem={({ item }) => <RenderItensSuplier item={item} handleSelect={handleSelect} />}
                    keyExtractor={(i) => i.codigo.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: '#999', fontSize: 16 }}>Nenhum fornecedor encontrado.</Text>
                        </View>
                    )}

                        refreshControl={
                                                         <RefreshControl
                                                          refreshing={refreshing}
                                                          onRefresh={onRefresh}
                                                          colors={['#185FED']}
                                                          tintColor="#185FED"
                                                      />
                                                }

                />
            }
           

            {/* --- BOTÃO FLUTUANTE (FAB) --- */}
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
            //   onPress={() => {
            //       navigation.navigate('cadastro_cliente')
            //   }}
            >
                <MaterialIcons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

        </View>
    )
}
const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    filterOptionsContainer: {
        gap: 10,
    },
    filterSubtitle: {
        fontSize: 13,
        color: '#777',
        marginBottom: 15,
    },
    filterModalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
        // Centralizar na tela (já feito pelo modalOverlay, mas isso garante o card)
        position: 'absolute',
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    filterText: {
        fontSize: 15,
        color: '#555',
        fontWeight: '500',
    },
    filterTextSelected: {
        color: '#185FED',
        fontWeight: 'bold',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterOptionSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#185FED',
    },
})