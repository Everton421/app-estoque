import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"; // Adicionei MaterialIcons
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { DotIndicatorLoadingData } from "../../components/dotIndicator";
import { ConnectedContext } from "../../contexts/conectedContext";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import { useSyncCategorias } from "../../hooks/sync-categorias/useSyncCategorias";
import { useSyncFotos } from "../../hooks/sync-fotos/useSyncFotos";
import { useSyncMarcas } from "../../hooks/sync-marcas/useSyncMarcas";
import { useSyncMovimentos } from "../../hooks/sync-movimentos/useSyncMovimentos";
import { useSyncProdSector } from "../../hooks/sync-produto-setor/useSyncProdutosSetor";
import { useSyncProdutos } from "../../hooks/sync-produtos/useSyncProdutos";
import { useSyncSetores } from "../../hooks/sync-setores/useSyncSetores";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { restartDatabaseService } from "../../services/restartDatabase";
import { ConfigProdSeletor } from "./components/configProdSeletor";

export const Configurações = ({ navigation }: any) => { // Adicionei navigation props caso precise voltar

    const api = useApi();
    const { connected, setConnected, internetConnected }: any = useContext(ConnectedContext);

    // Hooks de Sincronização (Mantidos)
    const syncprodSector = useSyncProdSector();
    const syncMovimentos = useSyncMovimentos();
    const syncProdutos = useSyncProdutos();
    const syncCategorias = useSyncCategorias();
    const syncFotos = useSyncFotos();
    const syncMarcas = useSyncMarcas();
    const syncSetores = useSyncSetores();

    const useRestartService = restartDatabaseService();
    const useMoment = configMoment();
    const useQueryConfigApi = queryConfig_api();

    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [item, setItem] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [conectado, setConectado] = useState<boolean>();
    const [msgApi, setMsgApi] = useState('');

    async function connect() {
        try {
            setLoading(true);
            const response = await api.get('/');
            if (response.status === 200) {
                setConectado(true);
                setConnected(true);
                setMsgApi('');
            } else {
                setConectado(false);
                setConnected(false);
            }
            setError(undefined);
        } catch (err: any) {
            setConectado(false);
            setMsgApi(err.response?.data?.msg || "Erro");
            if (err.status === 400) Alert.alert("Erro!", err.response.data.msg);
            setError(err.response?.data?.msg || "Erro desconhecido");
            if (err.status !== 400) Alert.alert("Erro!", "Erro desconhecido!");
        } finally {
            setLoading(false);
        }
    }

    const verifyDateSinc = async () => {
        let validConfig = await useQueryConfigApi.select(1);
        let dataUltSinc: string;
        let data = {
            codigo: 1,
            url: '',
            porta: 3306,
            token: '',
            data_sinc: useMoment.dataHoraAtual(),
            data_env: '0000-00-00 00:00:00'
        };

        if (validConfig && validConfig?.length > 0) {
            dataUltSinc = validConfig[0].data_sinc;
            useQueryConfigApi.updateByParam(data);
        } else {
            let aux = await useQueryConfigApi.create(data);
            dataUltSinc = '';
        }
       // console.log("dataUltSinc : ", dataUltSinc)
        return dataUltSinc;
    }

    const syncDataProcess = async () => {
        let data = await verifyDateSinc();
        setIsLoading(true);
        setProgress(0);

        try {
            await syncProdutos.syncData({ data, setIsLoading, setProgress, setItem });
            await syncCategorias.syncData({ data, setIsLoading, setProgress, setItem });
            await syncFotos.syncData({ data, setIsLoading, setProgress, setItem });
            await syncprodSector.syncData({ data, setIsLoading, setProgress, setItem });
            await syncMarcas.syncData({ data, setIsLoading, setProgress, setItem });
            await syncMovimentos.syncData({ data, setIsLoading, setProgress, setItem });
            await syncSetores.syncData({ data, setIsLoading, setProgress, setItem });
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleSync = () => {
        if (loading) return Alert.alert('Aguarde!', 'Estabelecendo conexão...');
        if (!internetConnected) Alert.alert('Erro', 'Sem conexão com a internet!');
        if (!connected) {
            Alert.alert('', 'Falha ao se conectar com o servidor!');
            return;
        }
        if (!conectado) {
            Alert.alert(msgApi);
            return;
        }
        syncDataProcess();
    };

    useEffect(() => {
        connect();
    }, []);

    function restart() {
        Alert.alert('Atenção', `Será necessario uma nova sincronização, deseja concluir esta operação ?`, [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim', onPress: async () => { 
                await useRestartService.restart()
            } }
        ]);
    }

    const openUrl = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else Alert.alert(`Não foi possível abrir esta URL: ${url}`);
    };

    // Componente interno para Renderizar um "Botão de Menu"
    const MenuCard = ({ icon, title, subtitle, onPress, color = "#185FED", danger = false }: any) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                padding: 15,
                marginBottom: 10,
                elevation: 2,
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: danger ? 4 : 0,
                borderLeftColor: danger ? 'red' : 'transparent'
            }}
        >
            <View style={{
                width: 45, height: 45, borderRadius: 25,
                backgroundColor: danger ? '#FFEBEE' : '#E3F2FD',
                justifyContent: 'center', alignItems: 'center', marginRight: 15
            }}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: danger ? '#D32F2F' : '#333' }}>{title}</Text>
                {subtitle && <Text style={{ fontSize: 12, color: '#666' }}>{subtitle}</Text>}
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            {item && <DotIndicatorLoadingData isLoading={isLoading} item={item} progress={progress} />}

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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Configurações</Text>
                    <View style={{ width: 24 }} />
                </View>


            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}>

                {/* --- CARD DE STATUS --- */}
                <View style={{
                    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 20, elevation: 3,
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
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: connected ? 'green' : 'red' }} />
                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: connected ? 'green' : 'red' }}>
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

                {/* --- AÇÕES GERAIS --- */}
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginLeft: 5 }}>Sincronização</Text>

                <MenuCard
                    icon={<MaterialCommunityIcons name="database-sync" size={24} color="#185FED" />}
                    title="Sincronizar Dados"
                    subtitle="Atualizar produtos e cadastros"
                    onPress={handleSync}
                />

                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 10, marginLeft: 5 }}>Preferências</Text>

                {/* Aqui renderizamos o componente de seleção, mas ele agora vai renderizar um card igual aos outros */}
                <ConfigProdSeletor />

                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 10, marginLeft: 5 }}>Manutenção</Text>

                <MenuCard
                    icon={<MaterialCommunityIcons name="database-remove" size={24} color="#D32F2F" />}
                    title="Limpar Base de Dados"
                    subtitle="Apaga todos os dados locais"
                    danger={true}
                    onPress={restart}
                />

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