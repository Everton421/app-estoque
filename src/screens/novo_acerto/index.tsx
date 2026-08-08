import { CameraView, useCameraPermissions } from "expo-camera";
import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { ListaProdutos } from "./components/produtos_";
import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { FlatList } from "react-native-gesture-handler";
import { configMoment } from "../../services/moment";
import { Setores } from "./components/setores";
import { Locais } from "./components/locais";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useApi from "../../services/api";
import { AuthContext } from "../../contexts/auth";
import { CustomAlert, AlertType } from "../../components/custom-alert/custom-alert";
import {   ModalSeriesAcerto } from "./components/modal-series-acerto/modal-series-acerto";

type filterBarcodeOption = {
    chave: 'codigo' | 'num_fabricante' | 'num_original' | 'sku'
}
type historico = { historico: string }

type unidade_medida = {
    unidade_medida: string
}
type dataProdMov = {
    setor: number
    produto: number
    estoque: number
    local_produto: string
    local1_produto: string
    local2_produto: string
    local3_produto: string
    local4_produto: string
    data_recadastro: string
    id_produto: string
    id_setor: string
    historico:string
}


type type_lote_serie_setor = {
    serie: string | null 
    quantidade:number 
    produto:number,
    setor:number
    };

type type_lote_serie_setor_api = {
    serie: string | null 
    quantidade:number 
    produto:number,
    setor:number,
    estoque:number
     lote_serie:number
};

export const NovoAcerto = ({ navigation }: any) => {
    const [modalVisible, setModalvisible] = useState(false);
    const [visibleModalSetores, setVisibleModalSetores] = useState(false);
    const [visibleLocais, setVisibleLocais] = useState(false);
               const [visibleAlert, setVisibleAlert ] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [typeAlert, setTypeAlert] = useState<AlertType>('info');

    const [permission, requestPermission] = useCameraPermissions();
    const [prodSeletor, setProdSeletor] = useState<any>();
    const [loadingInsertItem, setLoadingInsertItem] = useState(false);

    const [dataProd, setDataProd] = useState<dataProdMov[]>([]);
    const [dataSetores, setDataSetores] = useState<any>();
    const [setorSelecionado, setSetorSelecionado] = useState<any>();
    const [loadingDataProd, setLoadingDataProd] = useState(false);
    const [ent_sai, setEnt_sai] = useState<'E' | 'S'>('E');
    const [novoSaldo, setNovoSaldo] = useState(0);
    const [ searchTextSector , setSearchTextSector] = useState();
    const [ isVisibleModalSeries, setIsVisibleModalSeries ] = useState(false);

    const [defaultConfigFilter, setDefaultConfigFilter] = useState<'codigo' | 'num_fabricante' | 'num_original' | 'sku'>('num_fabricante');

    const [ seriesToUpdate, setSeriesToUpdate ] = useState<type_lote_serie_setor[]>();


    const moment = configMoment();
    const api = useApi();

    const {  usuario } = useContext(AuthContext) as any;

    useEffect(()=>{
        console.log(usuario.codigo)
    },[])

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
        const cleanCode = data.replace(/^0+/, '') || '0';
        fyndBarcode(cleanCode);
    }

    async function fyndBarcode(codeScanned: string) {
        try {
            setLoadingDataProd(true);

            const responseProduct = await api.get('/produtos/search',
                {
                    params: {
                        [defaultConfigFilter]: defaultConfigFilter == "codigo" ? Number(codeScanned) : codeScanned,
                        limit: 1,
                        ativo: 'S'
                    }
                }
            );


            if (responseProduct.status == 200) {
                if(responseProduct.data.length > 0 ){
                    handleSelectProduct(responseProduct.data[0]);
                }else{
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
                setDataProd([]);
                setLoadingDataProd(false);
            }
        } catch (e) {
            setLoadingDataProd(false);
            console.log(`ocorreu um erro ao tentar buscar o produto pelo ${defaultConfigFilter}`, e);
        } finally {
            setLoadingDataProd(false);
        }
    }

    const handleUpdateField = (fieldName: keyof dataProdMov, value: string) => {
        setDataProd(prev => {
            if (!prev || prev.length === 0) return prev;
            return prev.map((item) => ({ ...item, [fieldName]: value }));
        });
    };

    function handleSetores() {
        if (!prodSeletor || prodSeletor === undefined) {
            Alert.alert('', "É necessario selecionar um produto");
        } else {
            setVisibleModalSetores(true);
        }
    }

    function selectSetor(item: any) {
        setSetorSelecionado(item);
        setNovoSaldo(0);
        setVisibleModalSetores(false);
    }

    function handleSelectProduct(item: any) {
        setProdSeletor(item);
        setNovoSaldo(0);
        setSetorSelecionado(null);
    }

    async function findProdSectorByCode(codigo: number, setor: number) {
        try {
            setLoadingDataProd(true);

            const resultDataProd = await api.get('/produtos-setor/search',
                {
                    params: {
                        produto: codigo,
                        setor: setor,
                    }
                }
            );

            if (resultDataProd.status == 200 && resultDataProd.data.length > 0) {
                setDataProd(resultDataProd.data);
            } else {
                let aux: any = {
                    data_recadastro: moment.dataHoraAtual(),
                    estoque: '0',
                    local1_produto: "",
                    local2_produto: "",
                    local3_produto: "",
                    local4_produto: "",
                    local_produto: "",
                    produto: String(codigo),
                    setor: String(setor)
                };
                setDataProd([aux]);
            }
        } catch (e) {
            console.log("Ocorreu um erro ao tentar consultar os produtos no setor");
            console.log(e);
        } finally {
            setLoadingDataProd(false);
        }
    }

    async function findSetores() {
        const resultDataSector = await api.get('/setores/search',{
            params:{
                    search:searchTextSector
            }
        }
        );

        if (resultDataSector && resultDataSector?.status == 200) {
            setDataSetores(resultDataSector.data);
        }
    }

    async function gravar(data: dataProdMov[]) {


                 if(prodSeletor.controle_lote_serie == 'S' && !seriesToUpdate || seriesToUpdate?.length == 0 ){
                        setTitleAlert('Produto controlado por lote/serie');
                        setMessageAlert('É necessário informar as series referente ao(s) produto(s) !');
                        setTypeAlert('info');
                        setVisibleAlert(true);
                        return;
                 }
        if (ent_sai === 'E') {
            let aux = Number(data[0].estoque) + novoSaldo;
            data[0].estoque = Number(aux);
        }
        if (ent_sai === 'S') {
            let aux = Number(data[0].estoque) - novoSaldo;
            data[0].estoque = Number(aux);
        }
        data[0].data_recadastro = moment.dataHoraAtual();
        //  data[0].unidade_medida = prodSeletor.unidade_medida;

        try {

            setLoadingInsertItem(true);
            const { estoque, produto, setor, local1_produto, local2_produto, local3_produto, local4_produto, local_produto } = data[0]
            const payload = {
                estoque: Number(estoque),
                produto: Number(produto),
                setor: Number(setor),
                local1_produto: local1_produto ? local1_produto : '',
                local2_produto: local2_produto? local2_produto : '',
                local3_produto: local3_produto ? local3_produto : '',
                local4_produto: local4_produto ? local4_produto : '',
                local_produto: local_produto ? local_produto : '' 
            }

                
              
                 const  resultUpdateProdSetor = await api.put('/produtos-setor', payload) 

              if (resultUpdateProdSetor.status == 200  ) {
 
                 const payloadMovimentos  =  {
                      unidade_medida: 'und' ,
                      tipo: 'A',
                      data_recadastro: moment.dataHoraAtual(),
                      historico: data[0].historico ? data[0].historico : '',
                      produto: Number(data[0].produto),
                      quantidade: novoSaldo,
                      setor: Number(data[0].setor),
                      usuario:usuario.codigo,
                      ent_sai: ent_sai
                    }
                 try{

                    const resultUpdateMoviment = await api.post('movimentos_produtos',payloadMovimentos   )
                        if(prodSeletor.controle_lote_serie == 'S' && seriesToUpdate ){
                                await postSeries(seriesToUpdate)
                        }
                 }catch(e:any){
                    console.log(e.response.data)
                 }

             }

             setLoadingInsertItem(false);
             setDataProd([]);
             setProdSeletor(undefined);
             setSetorSelecionado(undefined);
             setTitleAlert('Sucesso!');
             setMessageAlert('Acerto registrado com sucesso!');
             setTypeAlert('success');
             setVisibleAlert(true);
             return;

        } catch (e:any) {
            console.log("Erro ao registrar produto no setor", e?.response?.data);
            Alert.alert('Atenção!', `Ocorreu um erro ao tentar registrar o item no setor! `);
            setLoadingInsertItem(false);
        } finally {
            setLoadingInsertItem(false);
            setNovoSaldo(0);
            setEnt_sai('E');
        }
    }


    async function postSeries (  series : type_lote_serie_setor[]) {
        for(const serie of series ){
        const verifySeries = await api.get(`/lote-serie-setor/search`, {
                params: { 
                    produto: prodSeletor.codigo,
                    setor: setorSelecionado.codigo, 
                    serie: serie.serie
                }    
            })  
 
            if(verifySeries.data.length > 0  ){
                const [{ lote_serie, estoque }]   = verifySeries.data as type_lote_serie_setor_api[];

               const resultputApiLoteSerieSetor  = await api.put(`/lote-serie-setor`, { 
                    setor:serie.setor,
                    produto: serie.produto,
                    lote_serie: lote_serie,
                    estoque: ent_sai == "S" ? estoque - serie.quantidade  : serie.quantidade + estoque 
                })
                console.log(`[V] Resultado request PUT lote-serie-setor `,resultputApiLoteSerieSetor.data)
            } else{
              const resultpostApiLoteSerieSetor  =   await api.post('/lotes-series',{
                    produto: serie.produto,
                    lote: null,
                    serie: serie.serie
                })
                    console.log('[V] resultado request POST lote-serie' ,resultpostApiLoteSerieSetor.data );

                if(resultpostApiLoteSerieSetor.status == 201){

                    const lote_serie = resultpostApiLoteSerieSetor.data.codigo;
                    const resultPutLoteSerieSetor = await api.put('/lote-serie-setor',{
                        setor: serie.setor,
                        produto: serie.produto,
                        lote_serie: lote_serie,
                        estoque: serie.quantidade
                    })
                    console.log('[V] resultado request PUT lote-serie-setor' ,resultPutLoteSerieSetor.data );

                }
            }
        }
                                                     
    }

    useEffect(() => {
        if (prodSeletor && prodSeletor.codigo) {
            findSetores();
        }
    }, [prodSeletor, searchTextSector]);

    useEffect(() => {
        if (setorSelecionado && setorSelecionado.codigo > 0 && prodSeletor.codigo > 0) {
            findProdSectorByCode(prodSeletor.codigo, setorSelecionado.codigo);
        }
    }, [setorSelecionado]);

    useEffect(() => {
        getDefaultConfig();
    }, []);

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
            {loadingInsertItem && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 999 }}>
                    <ActivityIndicator size="large" color="#185FED" />
                </View>
            )}

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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Novo Acerto</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }}>

                {/* --- SEÇÃO DE BUSCA E SCAN --- */}
                <View style={{ flexDirection: "row", marginHorizontal: 15, marginBottom: 15, gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <ListaProdutos produto={prodSeletor} setProduto={handleSelectProduct} />
                    </View>
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#185FED",
                            width: 50,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 8,
                            elevation: 2
                        }}
                        onPress={() => { setModalvisible(true) }}
                    >
                        <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* --- CONTEÚDO PRINCIPAL --- */}
                {prodSeletor ? (
                    <View>
                        {/* Card do Produto */}
                        <View style={{
                            backgroundColor: '#FFF',
                            borderRadius: 12,
                            marginHorizontal: 15,
                            padding: 15,
                            elevation: 3,
                            marginBottom: 15
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Cód: {prodSeletor.codigo}</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>{prodSeletor.unidade_medida}</Text>
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                                {prodSeletor.descricao}
                            </Text>

                            {/* Botão de Selecionar Setor */}
                            <TouchableOpacity
                                style={{
                                    marginTop: 15,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#E3F2FD',
                                    padding: 12,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: '#185FED'
                                }}
                                onPress={() => handleSetores()}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <MaterialIcons name="store" size={24} color="#185FED" />
                                    <Text style={{ fontWeight: "bold", color: "#185FED", fontSize: 15 }}>
                                        {setorSelecionado ? `${setorSelecionado.descricao} (Cód: ${setorSelecionado.codigo})` : "Selecionar Setor..."}
                                    </Text>
                                </View>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#185FED" />
                            </TouchableOpacity>
                        </View>

                        {/* Detalhes do Acerto (Só aparece se setor selecionado) */}
                        {loadingDataProd ? (
                            <ActivityIndicator size="large" color="#185FED" style={{ marginTop: 20 }} />
                        ) : (
                            dataProd && setorSelecionado ? dataProd.map((i, index) => (
                                <View key={index} style={{ marginHorizontal: 15 }}>

                                    {/* Card de Operação */}
                                    <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 15, elevation: 3, marginBottom: 15 }}>

                                        <Text style={{ textAlign: "center", fontSize: 14, color: "#999", marginBottom: 5 }}>Saldo Atual: <Text style={{ fontWeight: 'bold', color: '#333' }}>{i.estoque}</Text></Text>

                                        {/* Seletor Entrada / Saída */}
                                        <View style={{ flexDirection: "row", backgroundColor: '#F5F5F5', borderRadius: 8, padding: 4, marginBottom: 20 }}>
                                            <TouchableOpacity
                                                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6, backgroundColor: ent_sai === 'E' ? '#4CAF50' : 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 5 }}
                                                onPress={() => setEnt_sai('E')}
                                            >
                                                <AntDesign name="arrow-down" size={18} color={ent_sai === 'E' ? "#FFF" : "#666"} />
                                                <Text style={{ fontWeight: "bold", color: ent_sai === 'E' ? "#FFF" : "#666" }}>ENTRADA</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6, backgroundColor: ent_sai === 'S' ? '#E53935' : 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 5 }}
                                                onPress={() => setEnt_sai('S')}
                                            >
                                                <AntDesign name="arrow-up" size={18} color={ent_sai === 'S' ? "#FFF" : "#666"} />
                                                <Text style={{ fontWeight: "bold", color: ent_sai === 'S' ? "#FFF" : "#666" }}>SAÍDA</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Controle de Quantidade */}
                                        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 10 }}>Quantidade do Acerto</Text>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 15 }}>
                                            <TouchableOpacity
                                                style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center" }}
                                                onPress={() => setNovoSaldo(Math.max(0, novoSaldo - 1))}
                                            >
                                                <AntDesign name="minus" size={24} color="#333" />
                                            </TouchableOpacity>

                                            <View style={{ minWidth: 80, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#185FED' }}>
                                                <TextInput
                                                    style={{ fontSize: 24, fontWeight: 'bold', color: '#185FED', textAlign: 'center', paddingVertical: 5 }}
                                                    value={String(novoSaldo)}
                                                    onChangeText={(text) => {
                                                        const numericValue = text.replace(/[^0-9]/g, '');
                                                        setNovoSaldo(Number(numericValue));
                                                    }}
                                                    keyboardType="numeric"
                                                />
                                            </View>

                                            <TouchableOpacity
                                                style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#185FED", justifyContent: "center", alignItems: "center", elevation: 3 }}
                                                onPress={() => setNovoSaldo(novoSaldo + 1)}
                                            >
                                                <AntDesign name="plus" size={24} color="#FFF" />
                                            </TouchableOpacity>
                                        </View>
                                        {
                                                prodSeletor && prodSeletor.controle_lote_serie == 'S' && novoSaldo > 0 &&  (
                                                    <>
                                         

                                       <TouchableOpacity
                                          style={{ 
                                            backgroundColor: '#FFF', 
                                            borderRadius: 12, 
                                            paddingVertical: 15, 
                                            flexDirection: 'row', 
                                            justifyContent: 'space-around', 
                                            alignItems: 'center', 
                                            gap: 10, 
                                            marginTop:10,
                                            elevation:10
                                        }}    
                                             onPress={() => setIsVisibleModalSeries(true) }
                                        >   
                                              <Ionicons name="barcode" size={35} color="#185FED" />
                                                <Text style={{fontWeight: 'bold', color:'#555'}}>{ ent_sai =='E' ? 'Registrar Série' : 'Separar Série'} </Text>
                                            <MaterialCommunityIcons name="cursor-pointer" size={35} color="#185FED" />
                                        </TouchableOpacity>
                                        { seriesToUpdate && seriesToUpdate?.length > 0 && 
                                                      <Text style={{fontSize:10, fontWeight: 'bold', top:5,color:'#555'}}> {seriesToUpdate && seriesToUpdate?.length > 1 ? ' Séries separadas' : 'Série  separada'}: {seriesToUpdate?.length}</Text> 
                                                }
                                                    
                                                    <ModalSeriesAcerto
                                                        maxQuantity={novoSaldo}
                                                        produto={prodSeletor.codigo}
                                                        setVisible={setIsVisibleModalSeries}
                                                        setor={setorSelecionado.codigo}
                                                        visible={isVisibleModalSeries}
                                                        ent_sai={ent_sai}
                                                        setSeriesToUpdate={setSeriesToUpdate}
                                                    />
                                                    
                                                    </>
                                                    
                                                )
                                        }
                                    </View>

                                    {/* Card de Informações Adicionais */}
                                    <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 0, elevation: 3, marginBottom: 20, overflow: 'hidden' }}>

                                        {/* Botão Locais */}
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                                            onPress={() => setVisibleLocais(true)}
                                        >
                                            <View style={{ width: 40, alignItems: 'center' }}>
                                                <FontAwesome6 name="map-location-dot" size={20} color="#185FED" />
                                            </View>
                                            <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: '#333' }}>Definir Locais</Text>
                                            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
                                        </TouchableOpacity>

                                        {/* Input Histórico */}
                                        <View style={{ padding: 15 }}>
                                            <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Histórico / Observação</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#F5F7FA',
                                                    borderRadius: 8,
                                                    padding: 10,
                                                    height: 80,
                                                    textAlignVertical: 'top',
                                                    borderWidth: 1,
                                                    borderColor: '#E0E0E0'
                                                }}
                                                placeholder="Digite uma observação..."
                                                multiline={true}
                                                numberOfLines={3}
                                                onChangeText={(text) => handleUpdateField('historico', text)}
                                            />
                                        </View>
                                    </View>

                                    {/* Botão Gravar */}
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: "#185FED",
                                            borderRadius: 12,
                                            paddingVertical: 15,
                                            alignItems: "center",
                                            elevation: 4,
                                            marginBottom: 30,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            gap: 10
                                        }}
                                        onPress={() => gravar(dataProd)}
                                    >
                                        <MaterialIcons name="save" size={24} color="#FFF" />
                                        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>Registrar Acerto</Text>
                                    </TouchableOpacity>

 

                                {/***************************************  */}

                                 {/** componente para ajustar os locais */}
                                    <Locais
                                        item={i}
                                        setVisible={setVisibleLocais}
                                        visible={visibleLocais}
                                        onUpdateField={handleUpdateField as any}
                                    />
                                </View>
                            )) : (
                                <View style={{ alignItems: 'center', marginTop: 30 }}>
                                    <MaterialCommunityIcons name="arrow-up-bold" size={30} color="#BDBDBD" />
                                    <Text style={{ fontWeight: "bold", color: "#89898fff", fontSize: 16, marginTop: 5 }}>
                                        Selecione um setor acima para continuar.
                                    </Text>
                                </View>
                            )
                        )}
                    </View>
                ) : (
                    // Estado Vazio (Nenhum produto selecionado)
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80, opacity: 0.6 }}>
                        <MaterialCommunityIcons name="barcode-scan" size={80} color="#BDBDBD" />
                        <Text style={{ fontWeight: "bold", margin: 10, textAlign: "center", color: "#89898fff", fontSize: 18 }}>
                            Selecione ou escaneie um produto para começar!
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* --- MODAL CÂMERA --- */}
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

            {/* --- MODAL SETORES (Padronizado) --- */}
            <Modal visible={visibleModalSetores} transparent={true} animationType="fade" onRequestClose={() => setVisibleModalSetores(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '95%', height: '90%', backgroundColor: "#FFF", borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                        
                        

             <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FFF',
                                borderRadius: 8,
                                paddingHorizontal: 10,
                                height: 40,
                                marginRight: 10
                            }}>
                                <Ionicons name="search" size={20} color="#999" style={{ marginRight: 5 }} />
                                <TextInput
                                    style={{ flex: 1, color: '#333' }}
                                    placeholder="Digite para buscar..."
                                    placeholderTextColor="#999"
                                onChangeText={(v:any)=>setSearchTextSector(v)}

                                    autoFocus={true}
                                />
                            </View>
                            <TouchableOpacity onPress={() => setVisibleModalSetores(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                  </View>


                        <FlatList
                            data={dataSetores}
                            renderItem={({ item }) => <Setores setor={item} selectSetor={selectSetor} />}
                            contentContainerStyle={{ paddingVertical: 10 }}
                        />
                    </View>
                </View>
            </Modal>
            
                  <CustomAlert
                        visible={visibleAlert}
                        onConfirm={ ()=>setVisibleAlert(false)}
                        title={titleAlert}
                        message={messageAlert}
                        type={typeAlert}
                        />

        </View>
    )
}