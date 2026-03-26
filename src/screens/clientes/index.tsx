import { useEffect, useState } from "react";
import { Text, FlatList, Image, Modal, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { useClients } from "../../database/queryClientes/queryCliente";
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { RenderItensClients } from "./components/renderItemsClients/RenderItensClients";
import { FontAwesome5 } from "@expo/vector-icons";
import { CustomHeader } from "../../components/custom-header/custom-header";
// import { defaultColors } from "../../styles/global"; // Pode remover se não for usar em outros lugares

export type client = {
    codigo: number,
    id:string
    cnpj: string,
    nome: string,
    ie: string,
    cep: string,
    cidade: string,
    endereco: string,
    numero: string
}

export function Clientes({ navigation }: any) {

    const [pesquisa, setPesquisa] = useState('');
    const [dados, setDados] = useState<client[]>([]);
    const[cSelecionado, setcSelecionado] = useState<client>();
    const [visible, setVisible] = useState(false);
    const [limitQuery, setLimitQuery] = useState(25); // Valor padrão inicial
            const [ visibleModalFilter, setVisibleModalFilter] = useState(false);

    const useQueryClients = useClients();

    useEffect(() => {
        async function filtrar() {
            if (pesquisa !== '') {
                let response: any = await useQueryClients.selectByDescription(pesquisa, limitQuery);
                if (response.length > 0) {
                    setDados(response)
                } else {
                    setDados([]) // Limpa se não achar nada
                }
            } else {
                const response: any = await useQueryClients.selectAllLimit(limitQuery);
                if (response.length > 0) {
                    setDados(response)
                }
            }
        }
        filtrar();
    }, [pesquisa, limitQuery])

    function handleSelect(item: client) {
          setcSelecionado(item);
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
                title="Clientes"
                onBack={() => navigation.goBack()}
                
                showSearch={true}
                searchValue={pesquisa}
                onSearchChange={(value) => setPesquisa(value)}
                searchPlaceholder="Pesquisar cliente..."
                
                showFilter={true}
                onFilterPress={() => setVisibleModalFilter(true)} // Abre seu modal
            />

            {/* --- MODAL DE DETALHES (Estilizado para o novo padrão) --- */}
            <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={{ width: '100%', height: '100%', alignItems: "center", justifyContent: "center", backgroundColor: 'rgba(0,0,0, 0.5)' }}>
                    
                    <View style={{ width: '90%', backgroundColor: '#F5F7FA', borderRadius: 16, overflow: 'hidden', elevation: 10, maxHeight: '80%' }}>
                        
                        {/* Header do Modal */}
                        <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Detalhes do Cliente</Text>
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
                                    <Text style={{ fontWeight: "bold", fontSize: 18, color: '#333' }}>{cSelecionado?.nome}</Text>
                                    <Text style={{ color: '#185FED', fontWeight: 'bold', fontSize: 14 }}>Cód: {cSelecionado?.codigo}</Text>
                                    <Text style={{ color: '#185FED', fontWeight: 'bold', fontSize: 14 }}>id: {cSelecionado?.id}</Text>
                                </View>
                            </View>

                            <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}>
                                <Text style={{ fontSize: 12, color: '#666' }}>CNPJ / CPF</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{cSelecionado?.cnpj || 'N/A'}</Text>
                            </View>

                            <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}>
                                <Text style={{ fontSize: 12, color: '#666' }}>Inscrição Estadual (IE)</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{cSelecionado?.ie || 'N/A'}</Text>
                            </View>

                            <View style={{ height: 1, backgroundColor: '#D0D0D0', marginVertical: 10 }} />

                            <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}>
                                <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Endereço Completo</Text>
                                <Text style={{ fontSize: 15, color: '#444' }}>{cSelecionado?.endereco}, Nº {cSelecionado?.numero}</Text>
                                <Text style={{ fontSize: 15, color: '#444' }}>{cSelecionado?.cidade} - CEP: {cSelecionado?.cep}</Text>
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
                        style={{flex:1, width:'100%'}} 
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
                            <FilterOption value={10} label="10 Clientes" />
                            <FilterOption value={25} label="25 Clientes" />
                            <FilterOption value={50} label="50 Clientes" />
                            <FilterOption value={100} label="100 Clientes" />
                            <FilterOption value={250} label="250 Clientes" />

                        </View>
                    </View>
                </View>
            </Modal>
            {/* --- LISTA DE CLIENTES --- */}
            <FlatList
                data={dados}
                renderItem={({ item }) => <RenderItensClients item={item}   handleSelect={handleSelect}/>}
                keyExtractor={(i) => i.codigo.toString()}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: '#999', fontSize: 16 }}>Nenhum cliente encontrado.</Text>
                    </View>
                )}
            />

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