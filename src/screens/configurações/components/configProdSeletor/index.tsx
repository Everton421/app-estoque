import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderConfigSeletor } from "../RenderConfigSeletor"; // Ajuste o caminho se necessário

type propsSeletor = { tipo: string, value: string }

export const ConfigProdSeletor = () => {
    const [visible, setVisible] = useState(false);
    const [defaultConfig, setDefaultConfig] = useState<'codigo' | 'num_fabricante' | 'num_original' | 'sku'>('num_fabricante');

    const [tipos] = useState<propsSeletor[]>([
        { tipo: "Código de barras", value: 'num_fabricante' },
        { tipo: "Referência", value: 'num_original' },
        { tipo: "SKU", value: 'sku' }
    ]);

    async function getDefaultConfig() {
        try {
            let value: any = await AsyncStorage.getItem('configProduto');
            if (value !== null) {
                setDefaultConfig(value);
            }
        } catch (e) {
            console.log('erro ao tentar obter a configuração no AsyncStorage');
        }
    }

    async function setConfig(value: 'codigo' | 'num_fabricante' | 'num_original' | 'sku') {
        try {
            await AsyncStorage.setItem('configProduto', value);
            setDefaultConfig(value);
            // setVisible(false); // Opcional: fechar ao selecionar
        } catch (error) {
            console.log('erro ao tentar salvar a configuração no AsyncStorage');
        }
    }

    useEffect(() => {
        getDefaultConfig();
    }, []);

    return (
        <View>
            {/* Botão Card que aparece na tela de configurações */}
            <TouchableOpacity
                onPress={() => setVisible(true)}
                style={{
                    backgroundColor: '#FFF',
                    borderRadius: 12,
                    padding: 15,
                    marginBottom: 10,
                    elevation: 2,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                <View style={{
                    width: 45, height: 45, borderRadius: 25,
                    backgroundColor: '#E3F2FD',
                    justifyContent: 'center', alignItems: 'center', marginRight: 15
                }}>
                    <FontAwesome name="gear" size={24} color="#185FED" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Configurar Leitor</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Padrão de busca: {defaultConfig}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
            </TouchableOpacity>

            {/* Modal Estilizado */}
            <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ flex: 1, width: '100%' }} activeOpacity={1} onPress={() => setVisible(false)} />
                    
                    <View style={{
                        width: '90%',
                        backgroundColor: "#FFF",
                        borderRadius: 16,
                        position: 'absolute',
                        elevation: 10,
                        overflow: 'hidden',
                        maxHeight: '70%'
                    }}>
                        {/* Header do Modal */}
                        <View style={{
                            backgroundColor: '#185FED',
                            padding: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Configuração de Busca</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ padding: 20 }}>
                            <Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
                                Selecione qual campo será priorizado na leitura ou busca de produtos:
                            </Text>

                            <FlatList
                                data={tipos}
                                renderItem={({ item }) => (
                                    <RenderConfigSeletor
                                        tipo={item.tipo}
                                        value={item.value}
                                        setDefaultConfig={setConfig}
                                        defaultConfig={defaultConfig}
                                    />
                                )}
                                keyExtractor={(item) => item.value}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}