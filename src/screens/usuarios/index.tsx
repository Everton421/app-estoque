import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from "@expo/vector-icons/AntDesign";
import useApi from "../../services/api";
import { useUsuario } from "../../database/queryUsuario/queryUsuario";

export const Usuarios = ({ navigation }: any) => {

    const [dados, setDados] = useState([]);
    const [pesquisa, setPesquisa] = useState('');
    const [loading, setLoading] = useState(false);

    const useQueryUsuario = useUsuario();
    const api = useApi();

    useEffect(() => {
        async function busca() {
            try {
                // setLoading(true); // Opcional: Ativar loading se desejar
                let data: any = await useQueryUsuario.selectAll();
                if (data) {
                    setDados(data);
                }
            } catch (error) {
                console.log("Erro ao buscar usuários", error);
            } finally {
                // setLoading(false);
            }
        }
        busca();
    }, []);

    // --- RENDER ITEM (CARD DE USUÁRIO) ---
    function renderItem({ item }: any) {
        return (
            <TouchableOpacity
                onPress={() => {
                    // Navegação ou seleção aqui
                    // navigation.navigate('editar_usuario', { id: item.codigo })
                }}
                style={{
                    backgroundColor: '#FFF',
                    borderRadius: 12,
                    marginHorizontal: 10,
                    marginVertical: 6,
                    padding: 12,
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                {/* Ícone / Avatar do Usuário */}
                <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#E3F2FD',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 15
                }}>
                    <Ionicons name="person" size={24} color="#185FED" />
                </View>

                {/* Informações de Texto */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                            {item.nome}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold', backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            ID: {item.codigo}
                        </Text>
                    </View>

                    <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
                        {item.email}
                    </Text>
                </View>

                {/* Ícone de seta indicando ação */}
                <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
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
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Usuários</Text>
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
                            placeholder="Pesquisar usuário..."
                            placeholderTextColor="#999"
                            value={pesquisa}
                        />
                    </View>
                    
                    <TouchableOpacity>
                        <AntDesign name="filter" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- LISTA --- */}
            <FlatList
                data={dados}
                renderItem={(item) => renderItem(item)}
                keyExtractor={(i: any) => i.codigo.toString()}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: '#999', fontSize: 16 }}>Nenhum usuário encontrado.</Text>
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
                onPress={() => {
                   // navigation.navigate("cadastro_usuario");
                }}
            >
                <MaterialIcons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

        </View>
    );
}