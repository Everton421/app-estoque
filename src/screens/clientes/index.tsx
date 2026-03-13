import { useEffect, useState } from "react";
import { Text, FlatList, Image, Modal, TextInput, TouchableOpacity, View } from "react-native";
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

    const useQueryClients = useClients();

    useEffect(() => {
        async function filtrar() {
            if (pesquisa !== '') {
                let response: any = await useQueryClients.selectByDescription(pesquisa, 25);
                if (response.length > 0) {
                    setDados(response)
                } else {
                    setDados([]) // Limpa se não achar nada
                }
            } else {
                const response: any = await useQueryClients.selectAllLimit(25);
                if (response.length > 0) {
                    setDados(response)
                }
            }
        }
        filtrar();
    }, [pesquisa])

    function handleSelect(item: client) {
        // Se quiser usar o Modal no futuro, descomente abaixo:
        // setcSelecionado(item);
        // setVisible(true);
        navigation.navigate('cadastro_cliente', { codigo_cliente: item.codigo })
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
                onFilterPress={() => setVisible(true)} // Abre seu modal
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

            {/* --- LISTA DE CLIENTES --- */}
            <FlatList
                data={dados}
                renderItem={({ item }) => <RenderItensClients item={item}   />}
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