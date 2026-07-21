import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useContext, useEffect, useReducer, useState } from "react";
import { Button, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";
import { AuthContext } from "../../contexts/auth";
import useApi from "../../services/api";
import { configMoment } from '../../services/moment';
import { ModalSeletorSeriesRequerimento } from './components/modal-seletor-series-requerimento/modal-seletor-series-requerimento';
import { ModalSetoresRequerimento } from './components/modal-setores-requerimento/modal-setores-requerimento';
import { ListaProdutosRequerimento, prodSectorGroupedRequest } from './components/produtos_requerimento';
import { RenderProduto } from './components/render-produto';


type setor = {
    codigo: number,
    data_cadastro: string,
    data_recadastro: string,
    descricao: string
}

export type payloadRequirement = {
    data_requerimento: string,
    requerente: number,
    data_efetuacao: string,
    responsavel: number,
    pedido: null | number,
    setor_origem: number,
    setor_destino: number,
    historico: string,
    situacao: "A" | "C" | 'E',
    itens: itensPayloadRequirement[] | []
}

export type itensPayloadRequirement = {
    produto: number,
    controle_lote_serie: 'S' | 'N'
    descricao: string,
    quantidade: number,
    custo: null | number,
    lotes_series: loteSerieRequirement[]
    quantidade_disponivel:number
}

type loteSerieRequirement = {
    lote_serie: number,
    quantidade: number
}

export type actionsRequirement =
    { type: 'switch_origin_sector', payload: setor }
    | { type: 'switch_destination_sector', payload: setor }
    | { type: 'switch_history', payload: string }
    | { type: 'add_item', payload: itensPayloadRequirement }
    | { type: 'remove_item', payload: number }
    | { type: 'update_item_qtd', payload: { codigo: number, quantidade: number } }
    | { type: 'update_lotes', payload: { indexItem: number, lotes_series: loteSerieRequirement[] } }
    | { type: 'load_requirement', payload: payloadRequirement }
    | { type: 'reset' }


export const NovoRequerimento = ({ navigation, route }: any) => {
    const useMoment = configMoment();
    const { usuario }: any = useContext(AuthContext);

    const codigoEdicao = route?.params?.codigo || null;
    const isEdicao = !!codigoEdicao;
    const [loadingEdicao, setLoadingEdicao] = useState(false);


    function handleEditRequirement(state: payloadRequirement, action: actionsRequirement) {
        switch (action.type) {
            case 'switch_origin_sector':
                return { ...state, setor_origem: action.payload.codigo }
            case 'switch_destination_sector':
                return { ...state, setor_destino: action.payload.codigo }
            case 'switch_history':
                return { ...state, historico: action.payload }
            case 'add_item': {
                const exists = state.itens.findIndex(i => i.produto === action.payload.produto)
                if (exists >= 0) {
                    const updated = [...state.itens]
                //    updated[exists] = { ...updated[exists], quantidade: updated[exists].quantidade + action.payload.quantidade }
                    return { ...state, itens: updated }
                }
                return { ...state, itens: [...state.itens, action.payload] }
            }
            case 'remove_item':
                return { ...state, itens: state.itens.filter((i)=> i.produto != action.payload) }
            case 'update_item_qtd':
                return {
                    ...state,
                    itens: state.itens.map((item) =>
                        item.produto == action.payload.codigo ? { ...item, quantidade: action.payload.quantidade } : item
                    )
                }
            case 'update_lotes':
                return {
                    ...state,
                    itens: state.itens.map((item, i) =>
                        i === action.payload.indexItem
                            ? { ...item, lotes_series: action.payload.lotes_series }
                            : item
                    )
                }
            case 'load_requirement':
                return { ...action.payload }
            case 'reset':
                return { ...initialState }
            default:
                return state
        }
    }

    const initialState: payloadRequirement = {
        data_efetuacao: '0000-00-00',
        data_requerimento: useMoment.dataAtual(),
        historico: '',
        itens: [],
        pedido: null,
        requerente: usuario.codigo,
        responsavel: usuario.codigo,
        setor_destino: 0,
        setor_origem: 0,
        situacao: 'A'
    }


    const [modalVisible, setModalvisible] = useState(false);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [typeAlert, setTypeAlert] = useState<AlertType>('info');

    const [permission, requestPermission] = useCameraPermissions();
    const [prodSeletor, setProdSeletor] = useState<any>();

    const [dataSetores, setDataSetores] = useState<any>();
    const [searchTextSector, setSearchTextSector] = useState();

    const [defaultConfigFilter, setDefaultConfigFilter] = useState<'codigo' | 'num_fabricante' | 'num_original' | 'sku'>('num_fabricante');
    const [loadingDataProd, setLoadingDataProd] = useState(false);

    const [sectorOrigin, setSectorOrigin] = useState<setor>();

    const [sectorDestinattion, setSectorDestinattion] = useState<setor>();

    const [isVisibleSectorDestinattion, setIsVisibleSectorDestinattion] = useState(false);
    const [isVisibleSectorOrigin, setIsVisibleSectorOrigin] = useState(false);

    const [selectedItemForSeries, setSelectedItemForSeries] = useState<{ index: number, item: itensPayloadRequirement } | null>(null);

    const [requirement, dispatch] = useReducer(handleEditRequirement, initialState)

    const api = useApi();

    async function getDefaultConfig() {
        try {
            let value: any = await AsyncStorage.getItem('configProduto');
            if (value !== null) {
                setDefaultConfigFilter(value);
            }
        } catch (e) {
            console.log('erro ao tentar obter a configuração no AsyncStorage');
        }
    }

    function handleCodeRead(data: string) {
        setModalvisible(false);
        fyndBarcode(data);
    }

    async function fyndBarcode(codeScanned: string) {
        try {
            setLoadingDataProd(true);
             const responseProduct = await api.get('/produtos-setor/search-grouped', 
                                    {
                                        params: { 
                                            setor: requirement.setor_origem,
                                            [defaultConfigFilter]: defaultConfigFilter == "codigo" ? Number(codeScanned) : codeScanned,
                                            limit: 1
                                        }
                                    }
                                );
           

            if (responseProduct.status == 200) {
                if (responseProduct.data.length > 0) {
                    const dataProductApi = responseProduct.data[0] as prodSectorGroupedRequest; 

                    const verifyProduct = requirement.itens.filter((i)=>{ i.produto == dataProductApi.produto.codigo })
                    for( const i of requirement.itens ){
                        if(i.produto == dataProductApi.produto.codigo){
                            setTitleAlert(`Atenção!`);
                            setTypeAlert('warning');
                            setMessageAlert(`Produto ${dataProductApi.produto.descricao} já foi adicionado!`);
                            setVisibleAlert(true)
                            return;
                        }  
                    }
                    dispatch({
                        type: 'add_item', payload: {
                            produto: dataProductApi.produto.codigo,
                            descricao: dataProductApi.produto.descricao,
                            controle_lote_serie: dataProductApi.produto.controle_lote_serie,
                            quantidade: 1,
                            quantidade_disponivel: dataProductApi.setor[0].estoque,    
                            custo: 0,
                            lotes_series: []
                        }
                    })

                    if (dataProductApi.produto.controle_lote_serie === 'S') {
                        setTitleAlert('Atenção');
                        setTypeAlert('info');
                        setMessageAlert(`Produto controlado por série. Selecione as séries no card do produto.`);
                        setVisibleAlert(true);
                    }

                } else {
                    setTitleAlert('Produto não encontrado!');
                    setTypeAlert('warning');
                    setMessageAlert(`Nenhum produto encontrado para o código: ${codeScanned}`);
                    setVisibleAlert(true)
                }
                setLoadingDataProd(false);
            } else {
                setTitleAlert('Produto não encontrado!');
                setTypeAlert('warning');
                setMessageAlert(`Produto não encontrado, ${defaultConfigFilter}: ${codeScanned}`);
                setVisibleAlert(true);
                setLoadingDataProd(false);
            }
        } catch (e) {
            setLoadingDataProd(false);
            console.log(`ocorreu um erro ao tentar buscar o produto pelo ${defaultConfigFilter}`, e);
        } finally {
            setLoadingDataProd(false);
        }
    }

    async function findSetores() {
        const resultDataSector = await api.get('/setores/search', {
            params: {
                search: searchTextSector
            }
        }
        );

        if (resultDataSector && resultDataSector?.status == 200) {
            setDataSetores(resultDataSector.data);
        }
    }

    useEffect(() => {
        if (prodSeletor && prodSeletor.codigo) {
            findSetores();
        }
    }, [prodSeletor, searchTextSector]);


    useEffect(() => {
        getDefaultConfig();
    }, []);

    useEffect(() => {
        if (isEdicao) {
            carregarRequerimento();
        }
    }, [codigoEdicao]);

    async function carregarRequerimento() {
        setLoadingEdicao(true);
        try {
            const response = await api.get(`/requirements/${codigoEdicao}`);
            if (response.status === 200) {
                const data = response.data;

                if (data.setor_origem) {
                    const respSetorOrigem = await api.get('/setores/search', { params: { search: data.setor_origem } });
                    if (respSetorOrigem.status === 200 && respSetorOrigem.data.length > 0) {
                        setSectorOrigin(respSetorOrigem.data[0]);
                    }
                }
                if (data.setor_destino) {
                    const respSetorDestino = await api.get('/setores/search', { params: { search: data.setor_destino } });
                    if (respSetorDestino.status === 200 && respSetorDestino.data.length > 0) {
                        setSectorDestinattion(respSetorDestino.data[0]);
                    }
                }

                const itensMapeados: itensPayloadRequirement[] = [];
                for (const item of (data.itens || [])) {
                    let descricao = '';
                    let controle_lote_serie: 'S' | 'N' = 'N';
                    let quantidade_disponivel = 0;
                    try {
                        const respProduto = await api.get(`/produtos/${item.produto}`);
                        if (respProduto.status === 200 && respProduto.data) {
                            descricao = respProduto.data.descricao || '';
                            controle_lote_serie = respProduto.data.controle_lote_serie || 'N';
                        }
                    } catch (_) {}
                    try {
                        const respEstoque = await api.get('/produtos-setor/search-grouped', {
                            params: { setor: data.setor_origem, codigo: item.produto, limit: 1 }
                        });
                        if (respEstoque.status === 200 && respEstoque.data.length > 0) {
                            quantidade_disponivel = respEstoque.data[0].setor[0]?.estoque || 0;
                        }
                    } catch (_) {}

                    itensMapeados.push({
                        produto: item.produto,
                        descricao,
                        controle_lote_serie,
                        quantidade: item.quantidade,
                        custo: item.custo || null,
                        lotes_series: item.lotes_series || [],
                        quantidade_disponivel
                    });
                }

                dispatch({
                    type: 'load_requirement',
                    payload: {
                        data_requerimento: data.data_requerimento,
                        requerente: data.requerente,
                        data_efetuacao: data.data_efetuacao || '0000-00-00',
                        responsavel: data.responsavel,
                        pedido: data.pedido,
                        setor_origem: data.setor_origem,
                        setor_destino: data.setor_destino,
                        historico: data.historico || '',
                        situacao: data.situacao,
                        itens: itensMapeados
                    }
                });
            }
        } catch (e: any) {
            console.log('[X] Erro ao carregar requerimento:', e?.response?.data || e);
            setTitleAlert('Erro');
            setTypeAlert('error');
            setMessageAlert('Erro ao carregar dados do requerimento.');
            setVisibleAlert(true);
        } finally {
            setLoadingEdicao(false);
        }
    }

    async function handleSubmit() {
        if (!requirement.setor_origem || !requirement.setor_destino) {
            setTitleAlert('Atenção');
            setTypeAlert('warning');
            setMessageAlert('Selecione o setor de origem e destino.');
            setVisibleAlert(true);
            return;
        }
        if (requirement.setor_origem === requirement.setor_destino) {
            setTitleAlert('Atenção');
            setTypeAlert('warning');
            setMessageAlert('Os setores de origem e destino devem ser diferentes.');
            setVisibleAlert(true);
            return;
        }
        if (requirement.itens.length === 0) {
            setTitleAlert('Atenção');
            setTypeAlert('warning');
            setMessageAlert('Adicione pelo menos um item ao requerimento.');
            setVisibleAlert(true);
            return;
        }

        let payload = requirement as any;

        let itens = requirement.itens.map((i) => {
            return {
                lotes_series: i.lotes_series ? i.lotes_series : [],
                produto: i.produto,
                quantidade: i.quantidade
            }
        })
        payload.itens = itens;

        try {
            let response;
            if (isEdicao) {
                payload.codigo = codigoEdicao;
                response = await api.put(`/requirements/${payload.codigo}`, payload);
            } else {
                response = await api.post(`/requirements`, payload);
            }

            if (response.status === 200 || response.status === 201) {
                setTitleAlert('Sucesso');
                setTypeAlert('success');
                setMessageAlert(isEdicao ? 'Requerimento atualizado com sucesso.' : 'Requerimento criado com sucesso.');
                setVisibleAlert(true);
                dispatch({ type: 'reset' });
                setSectorOrigin(undefined);
                setSectorDestinattion(undefined);
                navigation.goBack();
            }
        } catch (e: any) {
            console.log(`[X] Erro ao ${isEdicao ? 'atualizar' : 'criar'} requerimento:`, e.response.data);
            setTitleAlert('Erro');
            setTypeAlert('error');
            setMessageAlert(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} requerimento. ${e.response.data}`);
            setVisibleAlert(true);
        } 
    }   

    if (!permission) return null;

    if (modalVisible && !permission.granted) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold", margin: 10, color: "#89898fff", fontSize: 17 }}>
                    Você precisa liberar o acesso a camera para continuar!
                </Text>
                <Button onPress={requestPermission} title="Liberar acesso" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>


            {/* --- HEADER --- */}
            <View style={{
                backgroundColor: '#185FED',paddingTop: 10,paddingBottom: 20,paddingHorizontal: 15,borderBottomLeftRadius: 20,borderBottomRightRadius: 20,elevation: 5,marginBottom: 10
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>
                        {isEdicao ? `Editar Requerimento #${codigoEdicao}` : 'Novo Requerimento'}
                    </Text>
                </View>
            </View>

                {/** SELETOR SETORES */}
                <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 10 }} >

                    {/** SELETOR SETOR DE ORIGEM */}
                    <TouchableOpacity
                        style={{
                            flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 15, justifyContent: "center", alignItems: "center", elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, borderLeftWidth: 5, borderLeftColor: sectorOrigin ? '#1E9C43' : '#185FED', minHeight: 90
                        }}
                        onPress={() => setIsVisibleSectorOrigin(true)} >

                        <Text style={{ color: sectorOrigin ? '#1E9C43' : '#999', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                            {sectorOrigin ? sectorOrigin.descricao : 'Selecionar'}
                        </Text>
                        <Text style={{ color: '#333', fontSize: 12, fontWeight: 'bold', marginTop: 6 }}>
                            Setor de Origem
                        </Text>
                        <Entypo name="location" size={28} color={sectorOrigin ? '#1E9C43' : '#185FED'} />
                        {sectorOrigin && (
                            <View style={{ position: 'absolute', top: 8, right: 8 }}>
                                <Ionicons name="checkmark-circle" size={20} color="#1E9C43" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/** SELETOR SETOR DE DESTINO */}
                    <TouchableOpacity
                        style={{
                            flex: 1,backgroundColor: "#FFF",borderRadius: 12,padding: 15,justifyContent: "center",alignItems: "center",elevation: 3,shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.1,shadowRadius: 3,borderLeftWidth: 5,borderLeftColor: sectorDestinattion ? '#1E9C43' : '#185FED',minHeight: 90 }}
                        onPress={() => setIsVisibleSectorDestinattion(true)}>
                        <Text style={{ color: sectorDestinattion ? '#1E9C43' : '#999', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                            {sectorDestinattion ? sectorDestinattion.descricao : 'Selecionar'}
                        </Text>
                        <Text style={{ color: '#333', fontSize: 12, fontWeight: 'bold', marginTop: 6 }}>
                            Setor de Destino
                        </Text>

                        {sectorDestinattion && (
                            <View style={{ position: 'absolute', top: 8, right: 8 }}>
                                <Ionicons name="checkmark-circle" size={20} color="#1E9C43" />
                            </View>
                        )}
                        <Entypo name="location" size={28} color={sectorDestinattion ? '#1E9C43' : '#185FED'} />
                    </TouchableOpacity>
                </View>

                {/** SEPARADOR */}
             <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 }} />

                {/* --- SEÇÃO DE BUSCA E SCAN --- */}
                <View style={{ flexDirection: "row", marginHorizontal: 15, marginBottom: 15, gap: 10 }}>
                    
                    { /** SELETOR PRODUTOS */}
                    { !!requirement.setor_origem &&  
                    <View style={{ flex: 1 }}>
                        <ListaProdutosRequerimento requirement={requirement} dispatch={dispatch} />
                    </View> } 

                    {/** ABRE A CAMERA PARA LEITURA */}
                {!!requirement.setor_origem &&   
                    <TouchableOpacity
                        style={{backgroundColor: "#185FED",width: 50,height:40,justifyContent: "center",alignItems: "center",borderRadius: 8,elevation: 2
                        }}
                        onPress={() => { setModalvisible(true) }}
                    >
                        <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
                    </TouchableOpacity> 
                    }

                </View>

                {/* --- LISTA DE ITENS --- */}
                <View style={{ backgroundColor: '#FFF', marginTop: 20, borderRadius: 5, padding: 4 , margin:2}}>
                    <View style={{ backgroundColor: '#e8eff5', marginTop: 6, marginBottom: 5, width: 70, borderRadius: 10, alignItems: 'center',     marginLeft:10 }} >
                        <Text style={{ color: '#185FED', fontSize: 12, textAlign:'center', marginBottom: 10, fontWeight: 'bold'  }}>
                            Qtd Itens: {requirement.itens.length}
                        </Text>
                    </View>
                    <FlatList
                        data={requirement.itens}
                        renderItem={ ({ item, index }) => <RenderProduto 
                                                            item={item} indexItem={index} 
                                                            onOpenSeries={(idx) => setSelectedItemForSeries({ index: idx, item: requirement.itens[idx] })}
                                                            dispatch={dispatch}
                                                            />
                                                        }
                        keyExtractor={ item=> item.produto.toString()}                                                        
                        horizontal={true}
                    />
                </View>


                {/* --- HISTÓRICO --- */}
                <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 6 }}>Histórico</Text>
                    <TextInput
                        style={{
                            backgroundColor: '#FFF',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            minHeight: 60,
                            textAlignVertical: 'top'
                        }}
                        placeholder="Descrição do requerimento..."
                        multiline
                        value={requirement.historico}
                        onChangeText={(text) => dispatch({ type: 'switch_history', payload: text })}
                    />
                </View> 

                { /** ----- BOTAO GRAVAR ----- */}
                <View style={{ marginHorizontal: 15, marginBottom: 15 }}>

                    <TouchableOpacity
                        style={{ backgroundColor: "#185FED", borderRadius: 12, paddingVertical: 15, alignItems: "center", elevation: 4, marginBottom: 30, flexDirection: 'row', justifyContent: 'center', gap: 10 }}
                        onPress={handleSubmit}
                    >

                        <MaterialIcons name="save" size={24} color="#FFF" />
                        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
                            {isEdicao ? 'Atualizar' : 'Gravar'}
                        </Text>
                    </TouchableOpacity>
                </View>


            {/* --- MODAL CÂMERA PARA LER CODIGO DE BARRAS DO PRODUTO--- */}
            <Modal visible={modalVisible} animationType="slide">
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    onBarcodeScanned={({ data }) => {
                        if (data) handleCodeRead(data);
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 280, height: 280, borderWidth: 2, borderColor: '#FFF', borderRadius: 20 }} />
                        <Text style={{ color: '#FFF', marginTop: 20, fontWeight: 'bold' }}>Posicione o código de barras na área</Text>

                        <TouchableOpacity
                            onPress={() => setModalvisible(false)}
                            style={{ position: 'absolute', bottom: 50, backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
                        >
                            <Text style={{ color: '#000', fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </Modal>

            { /** MODAL SELETOR SETOR ORIGEM */}
            {isVisibleSectorOrigin &&
               <ModalSetoresRequerimento
                    selectSector={(setor) => { setSectorOrigin(setor); dispatch({ type: 'switch_origin_sector', payload: setor }) }}
                    setVisible={setIsVisibleSectorOrigin}
                    isSelected={sectorOrigin ? sectorOrigin.codigo : null}
                    visible={true}
                    title='Setor de Origem'
                />}


            { /** MODAL SELETOR SETOR DESTINO */}
            {isVisibleSectorDestinattion &&
                <ModalSetoresRequerimento
                    selectSector={(setor) => { setSectorDestinattion(setor); dispatch({ type: 'switch_destination_sector', payload: setor }) }}
                    setVisible={setIsVisibleSectorDestinattion}
                    isSelected={sectorDestinattion ? sectorDestinattion.codigo : null}
                    visible={true}
                    title='Setor de Destino'
                />}

            {/** --- Modal Para selecionar series -- */}
            <ModalSeletorSeriesRequerimento
                visible={!!selectedItemForSeries}
                setVisible={() => setSelectedItemForSeries(null)}
                produto={selectedItemForSeries?.item.produto ?? 0}
                setor_origem={requirement.setor_origem}
                lotes_series={selectedItemForSeries?.item.lotes_series ?? []}
                onConfirm={(lotes) => {
                    if (selectedItemForSeries) {
                        dispatch({ type: 'update_lotes', payload: { indexItem: selectedItemForSeries.index, lotes_series: lotes } });
                        const totalSeries = lotes.reduce((sum, s) => sum + s.quantidade, 0);
                        dispatch({ type: 'update_item_qtd', payload: { codigo: selectedItemForSeries.item.produto, quantidade: totalSeries } });
                    }
                    setSelectedItemForSeries(null);
                }}
            />
            {/** --- Alerta -- */}
            <CustomAlert
                visible={visibleAlert}
                onConfirm={() => setVisibleAlert(false)}
                title={titleAlert}
                message={messageAlert}
                type={typeAlert}
            />

        </View>
    )
}