import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderConfigSeletor } from "../render-config-seletor"; // Ajuste o caminho se necessário

type propsSeletor = { tipo: string, value: string }

export const ModalConfigBuscaPedidos = () => {
    const [visible, setVisible] = useState(false);
    const [defaultConfigPedido, setDefaultConfigPedido] = useState<'id_externo' | 'id_interno' | 'codigo' >('codigo');

   
        const [ tiposBuscaPedido ] = useState<propsSeletor[]>([
            { tipo:'Código externo', value: "id_externo"},
            { tipo:'Código interno', value: "id_interno"},
            { tipo:'Id ', value: "id"},
            { tipo:'Código mobile', value: "codigo"},
        ])


    async function getDefaultConfigLeitor() {
        try {

            const valuePedido:any = await  AsyncStorage.getItem('configPedido');
             if (valuePedido !== null) {
                setDefaultConfigPedido(valuePedido);
            }else{
                setDefaultConfigPedido('codigo');
            }
        } catch (e) {
            console.log('erro ao tentar obter a configuração no AsyncStorage');
        }
    }
    
 
 
        async function setConfigPedido(value:'id_externo' | 'id_interno' | 'codigo') {
        try {
            await AsyncStorage.setItem('configPedido', value);
            setDefaultConfigPedido(value);
            // setVisible(false); // Opcional: fechar ao selecionar
        } catch (error) {
            console.log('erro ao tentar salvar a configuração no AsyncStorage');
        }
    }

    useEffect(() => {
        getDefaultConfigLeitor();
    }, []);

    return (
        <View   >
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
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>Configuração de busca de pedidos</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Padrão de busca:  {defaultConfigPedido} </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
            </TouchableOpacity>

            {/* Modal Estilizado */}
              <Modal visible={visible}   transparent={true} animationType="slide" onRequestClose={() => setVisible(false)}>
                <View style={{ flex: 1, height:'auto', backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center'  }}>
                    <TouchableOpacity style={{ flex: 1, width: '100%' }} activeOpacity={1} onPress={() => setVisible(false)} />
                    
                    <View style={{
                        width: '100%',height:'80%',backgroundColor: "#FFF",borderTopRightRadius:16,borderTopLeftRadius:16,elevation: 10,overflow: 'hidden' }}>
                        {/* Header do Modal */}
                        <View style={{
                            backgroundColor: '#185FED',
                            padding: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>

                        </View>

                        <View style={{ padding: 10  }}>
                          

                             <Text style={{ fontSize: 15, color: '#666', marginBottom: 15 }}>
                                Selecione qual campo será priorizado na leitura para busca de pedidos:
                            </Text>

                            
                            <FlatList
                                data={tiposBuscaPedido}
                                renderItem={({ item }) => (
                                    <RenderConfigSeletor
                                        tipo={item.tipo}
                                        value={item.value}
                                        setDefaultConfig={setConfigPedido}
                                        defaultConfig={defaultConfigPedido}
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