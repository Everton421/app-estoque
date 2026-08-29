import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CustomAlert } from "../../components/custom-alert/custom-alert";
import { ConnectedContext } from "../../contexts/conectedContext";
import useApi from "../../services/api";
import { ModalConfigBuscaPedidos } from "./components/modal-config-busca-pedidos";
import { ModalConfigBuscaProdutos } from "./components/modal-config-busca-produtos";
import { ModalConfigScanner } from "./components/modal-config-scanner";
 

export const Configurações = ({ navigation }: any) => {

    const api = useApi();
    const { connected, setConnected }: any = useContext(ConnectedContext);


    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState<string>('');
    const [typeAlert, setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
    const [titleAlert, setTitleAlert] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(true);



    async function connect() {
        try {
            setLoading(true);
            const response = await api.get('/health');
            if (response.status === 200) {
                setConnected(true);
            } else {
                setConnected(false);
            }
        } catch (err: any) {
            if (err.status === 400) {
                setVisibleAlert(true)
                setMessageAlert(err.response.data.msg)
                setTypeAlert('error')
                setTitleAlert("Erro")
                return
            }
            if (err.status !== 400) {
                setVisibleAlert(true)
                setMessageAlert("Erro desconhecido!")
                setTypeAlert('error')
                setTitleAlert("Erro")
                return
            }

        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        connect();
    }, []);



    const openUrl = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else Alert.alert(`Não foi possível abrir esta URL: ${url}`);
    };


    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>

                    
            <CustomAlert
                visible={visibleAlert}
                message={messageAlert}
                onConfirm={() => setVisibleAlert(false)}
                onCancel={() => setVisibleAlert(false)}
                title={titleAlert}
                type={typeAlert}
            />


            {/* --- HEADER --- */}
            <View style={{
                backgroundColor: '#185FED',
                paddingTop: 10,
                paddingBottom: 20,
                paddingHorizontal: 15,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                elevation: 5,
                marginBottom: 10
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Configurações</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

           
                {/* --- CARD DE STATUS --- */}
                <View style={{
                    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 20, elevation: 2,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <View>
                        <Text style={{ fontSize: 14, color: '#777', marginBottom: 4 }}>Status da API</Text>
                        {loading ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <ActivityIndicator size="small" color="#185FED" />
                                <Text style={{ fontWeight: 'bold', color: '#185FED' }}>Verificando...</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: connected ? '#4CAF50' : '#F44336' }} />
                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: connected ? '#4CAF50' : '#F44336' }}>
                                    {connected ? "Conectado" : "Desconectado"}
                                </Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => connect()}
                        style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}
                    >
                        <MaterialCommunityIcons name="refresh" size={24} color="#185FED" />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 10, marginLeft: 5 }}>Configuração de coleta de dados</Text>
                { /***   MODAL SELETOR DE CONFIGURAÇÃO DO LEITOR */}
               <ModalConfigScanner/>

                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 10, marginLeft: 5 }}>Preferências</Text>
                { /***  MODAL CONFIGURAÇÃO DE BUSCA DE PEDIDOS */}
                <ModalConfigBuscaPedidos />

                { /*** MODAL CONFIGURAÇÃO DE BUSCA DE PRODUTOS */}                        
               <ModalConfigBuscaProdutos/>

                {/* --- FOOTER DE LINKS --- */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 30, opacity: 0.7 }}>
                    <TouchableOpacity onPress={() => openUrl("https://www.intersig.com.br/termos-de-uso-app/")}>
                        <Text style={{ color: '#185FED', textDecorationLine: 'underline' }}>Termos de uso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openUrl("https://intersig.com.br/politicas-privacidade-app/")}>
                        <Text style={{ color: '#185FED', textDecorationLine: 'underline' }}>Políticas de Privacidade</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

