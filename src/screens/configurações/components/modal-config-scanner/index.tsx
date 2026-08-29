import { FlatList, Modal, Switch, Text, TouchableOpacity, View } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderConfigSeletor } from "../render-config-seletor"; // Ajuste o caminho se necessário

type propsSeletor = { tipo: string, value: string }

export const ModalConfigScanner = () => {

    const [visible, setVisible] = useState(false);
    const [defaultConfigScanner, setDefaultConfigScanner] = useState<'camera' | 'leitor'  >('camera');
    const [removeZeros, setRemoveZeros] = useState(true);

   
        const [ tiposBuscaPedido ] = useState<propsSeletor[]>([
            { tipo:'Coletor de dados', value: "leitor"},
            { tipo:'Câmera', value: "camera"},
        ])


    async function getDefaultConfigLeitor() {
        try {

            const valuesScanner:any = await  AsyncStorage.getItem('configLeitor');
             if (valuesScanner !== null) {
                setDefaultConfigScanner(valuesScanner);
            }else{
                setDefaultConfigScanner('camera');
            }

            const stripZerosValue = await AsyncStorage.getItem('configRemoveLeadingZeros');
            setRemoveZeros(stripZerosValue !== 'N');
        } catch (e) {
            console.log('erro ao tentar obter a configuração do leitor no AsyncStorage');
        }
    }
    
 
 
        async function setConfigScanner(value:'camera' | 'leitor') {
        try {
            await AsyncStorage.setItem('configLeitor', value);
            setDefaultConfigScanner(value);
        } catch (error) {
            console.log('erro ao tentar salvar a configuração do leitor no AsyncStorage');
        }
    }

    async function setConfigRemoveZeros(value: boolean) {
        try {
            await AsyncStorage.setItem('configRemoveLeadingZeros', value ? 'S' : 'N');
            setRemoveZeros(value);
        } catch (error) {
            console.log('erro ao tentar salvar a configuração de remover zeros no AsyncStorage');
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
                <MaterialIcons name="barcode-reader" size={24} color="#185FED" />

                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>Configuração do coletor de dados</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Padrão de busca:  {defaultConfigScanner} </Text>
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
                                Selecione o método usado para coletar informações:
                            </Text>

                            
                            <FlatList
                                data={tiposBuscaPedido}
                                renderItem={({ item }) => (
                                    <RenderConfigSeletor
                                        tipo={item.tipo}
                                        value={item.value}
                                        setDefaultConfig={setConfigScanner}
                                        defaultConfig={defaultConfigScanner}
                                    />
                                )}
                                keyExtractor={(item) => item.value}
                            />

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 20,
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                                backgroundColor: '#F5F7FA',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#E0E0E0'
                            }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>Remover zeros à esquerda</Text>
                                    <Text style={{ fontSize: 12, color: '#666' }}>Ex: 00001 {'→'} 1</Text>
                                </View>
                                <Switch
                                    value={removeZeros}
                                    onValueChange={setConfigRemoveZeros}
                                    trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
                                    thumbColor={removeZeros ? '#185FED' : '#F5F5F5'}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}