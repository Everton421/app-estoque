import { Fontisto, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { DotIndicatorLoadingData } from "../../components/dotIndicator";
import { LodingComponent } from "../../components/loading";
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
import { receberPedidos } from "../../hooks/sync-pedidos/getOrders";
import { configMoment } from "../../services/moment";
import { restartDatabaseService } from "../../services/restartDatabase";
import { enviaPedidos } from "../../hooks/sync-pedidos/sendOrders";
import { ConfigLeitor    } from "./components/configLeitor";
import { useSyncClients } from "../../hooks/sync-clientes/useSyncClientes";
import { CustomAlert } from "../../components/custom-alert/custom-alert";


type ApiConfig = {
        codigo?:number
        url: string,
        porta: number,
        token: string
        data_sinc:string,
        data_env:string,
        offline: 'S' | 'N'
    }


export const Configurações = ({ navigation }: any) => {

    const api = useApi();
    const { connected, setConnected, internetConnected }: any = useContext(ConnectedContext);


     const [ visibleAlert , setVisibleAlert ] = useState(false);
     const [ messageAlert , setMessageAlert ] = useState<string>('');
     const [ typeAlert,      setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
     const [ titleAlert, setTitleAlert ] = useState<string>('');

     const [ visibleAlertUpdateConfigApi , setVisibleAlertUpdateConfigApi  ] = useState(false);


    const syncprodSector = useSyncProdSector();
    const syncMovimentos = useSyncMovimentos();
    const syncProdutos = useSyncProdutos();
    const syncCategorias = useSyncCategorias();
    const syncFotos = useSyncFotos();
    const syncMarcas = useSyncMarcas();
    const syncSetores = useSyncSetores();

     const syncClients = useSyncClients();

    const useRestartService = restartDatabaseService();
    const useMoment = configMoment();
    const useQueryConfigApi = queryConfig_api();

    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const[item, setItem] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [conectado, setConectado] = useState<boolean>();
    const [msgApi, setMsgApi] = useState('');

    const [ restartDb, setRestartDb ] = useState(false);

    const [ cancelText, setCancelText ] = useState<string |  undefined>();
    const [ confirmText, setConfirmText ] = useState<string | undefined>();
    
    const [ confirmAlertFunction, setConfirmAlertFunction ] = useState<()=>void>(()=>{});
    const [ cancelAlertFunction, setAlertCancelFunction] = useState<()=>void>(()=>{});

    // Estados do Picker de Data
    const [showPicker, setShowPicker] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState();
    const [date, setDate] = useState(new Date());
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [isLoadingPedidos, setIsLoadingPedidos] = useState(false);
    const [pedidoMessage, setPedidoMessage] = useState<string>('');

    const [ configMobileApi , setConfigMobileApi ] = useState<ApiConfig>();
    const [ isloadingApiConfigurationQuery, setIsloadingApiConfigurationQuery ] = useState(false);


    const useGetOrders = receberPedidos();
    const useSendOrders = enviaPedidos();

    const formatDate = (date: any) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (dateToFormat: any) => {
        const day = String(dateToFormat.getDate()).padStart(2, '0');
        const month = String(dateToFormat.getMonth() + 1).padStart(2, '0');
        const year = dateToFormat.getFullYear();
        return `${day}/${month}/${year}`;
    };

    async function connect() {
        try {
            setLoading(true);
            const response = await api.get('/health');
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
            if (err.status === 400){
                   setVisibleAlert(true)
                    setMessageAlert(err.response.data.msg)
                    setTypeAlert('error') 
                    setTitleAlert("Erro")
                    return
            }  
            setError(err.response?.data?.msg || "Erro desconhecido");
              if (err.status !== 400){
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

    const handleEvent = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || date;
        setShowPicker(false);
        setDate(currentDate);
        const dataaux: any = formatDate(currentDate);
        setDataSelecionada(dataaux);
    };

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
            await syncClients.syncData({ data, setIsLoading, setProgress, setItem });
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleSync = () => {
          if (loading){
            setVisibleAlert(true)
            setMessageAlert("Estabelecendo conexão...")
            setTypeAlert('info') 
            setTitleAlert("Aguarde!")
            return
          }

        if(!internetConnected){
            setVisibleAlert(true)
            setMessageAlert("Sem conexão com a internet!")
            setTypeAlert('error') 
            setTitleAlert("Erro")
            return
        }
        if (!connected) {
              setVisibleAlert(true)
            setMessageAlert("Falha ao se conectar com o servidor!")
            setTypeAlert('error') 
            setTitleAlert("Erro")
            return
        }
        if (!conectado) {
              setVisibleAlert(true)
            setMessageAlert(msgApi)
            setTypeAlert('error') 
            setTitleAlert("Erro")
            return
        }
        syncDataProcess();
    };

    async function getConfigMobileApi(){
        try{
            setIsloadingApiConfigurationQuery(true)
        const resultConfigMobileApi  = await useQueryConfigApi.select(1);
        if(resultConfigMobileApi && resultConfigMobileApi.length >  0 ){
            setConfigMobileApi(resultConfigMobileApi[0]);
        }
        }catch(e){
        }finally{
            setIsloadingApiConfigurationQuery(false);
        }
    }

    useEffect(() => {
        connect();
       getConfigMobileApi()
    },[]);

    function restart() {
        setRestartDb(true)
        setVisibleAlert(true)
        setTitleAlert('Atenção');
        setTypeAlert('warning');
        setCancelText('cancel');
        setConfirmText('Sim');
        setMessageAlert(`Será necessario uma nova sincronização, deseja concluir esta operação ?`);
     
    }

    async function  partialUpdateConfigMobileApi( { isOffline }:{ isOffline: "S" | "N"} ){
         await useQueryConfigApi.updateByParam({ offline: isOffline, codigo: 1});   
            setVisibleAlertUpdateConfigApi(false)
    }


        function enableOfflineConfig(){
            setVisibleAlertUpdateConfigApi(true)
        }

    async function syncOrders() {
        try {
            setIsLoadingOrder(true);
            setPedidoMessage('Recebendo pedidos...');
            setIsLoadingPedidos(true);
            
            let data: any = formatDate(date);

            await useGetOrders.getPedidos({ data, setIsLoading: () => {}, setProgress: () => {}, setItem: () => {} });
            
            setPedidoMessage('Enviando pedidos...');
            data = data + ' 00:00:00';     
            await useSendOrders.postPedidos({ data, setIsLoading: () => {}, setItem: () => {}});
            
            setVisibleAlert(true);
            setMessageAlert("Pedidos sincronizados com sucesso!");
            setTypeAlert('success');
            setTitleAlert('Sucesso');

        } catch (e) {
            console.log(e);
            Alert.alert('Erro', 'Falha ao sincronizar pedidos.');
        } finally {
            setIsLoadingOrder(false);
            setIsLoadingPedidos(false);
        }
    }

    const openUrl = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else Alert.alert(`Não foi possível abrir esta URL: ${url}`);
    };

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
            {isLoadingPedidos && <LodingComponent isLoading={isLoadingPedidos} message={pedidoMessage} />}

            <CustomAlert 
                          visible={visibleAlert}
                          message={messageAlert}
                          onConfirm={  ()=> confirmAlertFunction()}
                          onCancel={()=>cancelAlertFunction()}
                          title={titleAlert}
                          type={typeAlert}
                          cancelText={cancelText}
                          confirmText={confirmText}

                          />
                   <CustomAlert 
                          visible={visibleAlertUpdateConfigApi}
                          message={"Ao selecionar esta opção será necessario fazer um sincronização dos dados, confirma esta operação ? "}
                          onConfirm={  ()=> partialUpdateConfigMobileApi({ isOffline: 'S' })}
                          onCancel={()=> partialUpdateConfigMobileApi({ isOffline: 'S' })}
                          title={"Atenção"}
                          type={"warning"}
                          cancelText={"Não"}
                          confirmText={"Sim"}

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

                {/* --- AÇÕES GERAIS --- */}
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginLeft: 5 }}>Sincronização</Text>

                <MenuCard
                    icon={<MaterialCommunityIcons name="database-sync" size={24} color="#185FED" />}
                    title="Sincronizar Cadastros"
                    subtitle="Atualizar produtos, setores e categorias"
                    onPress={handleSync}
                />

                {/* --- NOVO CARD DE PEDIDOS ESTILIZADO --- */}
                <View style={{
                    backgroundColor: '#FFF',
                    borderRadius: 12,
                    padding: 15,
                    marginBottom: 10,
                    elevation: 2,
                }}>
                    {/* Header do Card */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ width: 45, height: 45, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                            <MaterialCommunityIcons name="clipboard-text-play" size={24} color="#185FED" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Pedidos</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>Enviar e receber pendências</Text>
                        </View>
                    </View>

                    {/* Seletor de Data */}
                    <Text style={{ fontSize: 14, color: '#555', marginBottom: 5, fontWeight: '600' }}>A partir da data:</Text>
                    <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#F5F7FA',
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            height: 45,
                            marginBottom: 15
                        }}
                    >
                        <Fontisto name="date" size={20} color="#185FED" style={{ marginRight: 10 }} />
                        <Text style={{ flex: 1, fontSize: 16, color: '#333', fontWeight: '500' }}>
                            {formatDisplayDate(date)}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#BDBDBD" />
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            display="calendar"
                            mode="date"
                            onChange={handleEvent}
                        />
                    )}

                    {/* Botão de Ação */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: isLoadingOrder ? '#B0C4DE' : '#185FED',
                            borderRadius: 10,
                            paddingVertical: 12,
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                        onPress={syncOrders}
                        disabled={isLoadingOrder}
                    >
                        {isLoadingOrder ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <MaterialCommunityIcons name="folder-sync" size={22} color='#FFF' />
                        )}
                        <Text style={{ color: '#FFF', fontWeight: "bold", fontSize: 16 }}>
                            {isLoadingOrder ? 'Sincronizando...' : 'Sincronizar Pedidos'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 10, marginLeft: 5 }}>Preferências</Text>

                <ConfigLeitor />


                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 10, marginLeft: 5 }}>Manutenção</Text>
                <MenuCard
                    icon={
                            configMobileApi && configMobileApi.offline === 'S' ? 
                                  <Ionicons name="cloud-offline-sharp" size={24} color="#4CAF50" /> :
                              <Ionicons name="cloud-offline-sharp" size={24} color="#D32F2F" /> 
                            }
                    title="Trabalhar Offline"
                    subtitle={ configMobileApi && configMobileApi.offline === 'S' ? "Offline" : 'Não habilitado' }
                    danger={configMobileApi && configMobileApi.offline != 'S' && 'danger'}
                    onPress={enableOfflineConfig}
                />
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