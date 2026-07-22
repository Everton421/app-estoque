import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import NetInfo from '@react-native-community/netinfo';
import React, { useContext, useEffect, useReducer, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { ConnectedContext } from "../../contexts/conectedContext";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { RenderModalCategorias } from "./_components/modal-categorias";
import { RenderModalMarcas } from "./_components/modal-marcas";
import { typeFotoProduto } from "./types/fotos";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";
import { isAxiosError } from "axios";


type ApiConfig = {
    codigo?: number
    url: string,
    porta: number,
    token: string
    data_sinc: string,
    data_env: string,
    offline: 'S' | 'N'
}

  export   type typePayloadProduct = {
             codigo?: number,
             id?: string,
             estoque: number,
             preco:  string ,
             unidade_medida:  string ,
             grupo:  number,
             origem:   string,
             descricao: string,
             num_fabricante: string,
             num_original: string,
             sku:  string,
             marca: number,
             ativo: "S" | "N",
             class_fiscal: string,
             cst:  string,
             caracteristica:   number,
             data_cadastro: string,
             data_recadastro: string,
             observacoes1: string,
             observacoes2: string,
             observacoes3: string,
             tipo: number,
             controle_lote_serie: "N" | "S",
             fotos:  photoPayloadProduct[]
        }
 
        type photoPayloadProduct = {
                 produto: number,
                 sequencia: number,
                 descricao: string,
                 link: string,
                 foto: string,
                 data_cadastro: string,
                 data_recadastro: string
        }

        export    type actionEditPayloadProduct = 
        { type:'switch_codigo', payload: number | undefined} 
        | { type: 'switch_id', payload: string }
        | { type: 'switch_estoque', payload: number}
        | { type: 'switch_preco', payload: string}
        | { type: 'switch_unidade_medida', payload: string}
        | { type: 'switch_grupo', payload: number}
        | { type: 'switch_origem', payload:   string}
        | { type: 'switch_descricao', payload: string}
        | { type: 'switch_num_fabricante', payload: string}
        | { type: 'switch_num_original', payload: string}
        | { type: 'switch_sku', payload:   string}
        | { type: 'switch_marca', payload: number}
        | { type: 'switch_ativo', payload: "S" | "N"}
        | { type: 'switch_class_fiscal', payload: string}
        | { type: 'switch_cst', payload:  string}
        | { type: 'switch_caracteristica', payload:  number}
        | { type: 'switch_data_cadastro', payload: string}
        | { type: 'switch_data_recadastro', payload: string}
        | { type: 'switch_observacoes1', payload:  string}
        | { type: 'switch_observacoes2', payload:  string}
        | { type: 'switch_observacoes3', payload:   string }
        | { type: 'switch_tipo', payload: number}
        | { type: 'switch_controle_lote_serie', payload: "S" | "N"}
        | { type: 'switch_fotos', payload: photoPayloadProduct[]}
        | { type: 'switch_all_fields' , payload: typePayloadProduct}
        ;

export const Cadastro_produto: React.FC = ({ route, navigation }: any) => {
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [typeAlert, setTypeAlert] = useState<AlertType>('info');

    const useQueryConfigApi = queryConfig_api();

    const [visible, setVisible] = useState<Boolean>(false);
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const api = useApi();
    const { connected, setConnected } = useContext<any>(ConnectedContext)
    const [configMobileApi, setConfigMobileApi] = useState<ApiConfig>();

    const useMoment = configMoment();
    
    
        function handleEditPayloadProduct(state:typePayloadProduct, action:actionEditPayloadProduct ){
             switch (action.type) {

                    case  'switch_codigo' :
                        return { ...state, codigo:action.payload }  
                    case  'switch_id' :
                        return { ...state, id:action.payload }   
                    case  'switch_estoque' :
                        return { ...state, estoque:action.payload }   
                    case  'switch_preco' :
                        return { ...state, preco:action.payload }   
                    case  'switch_unidade_medida' :
                        return { ...state, unidade_medida:action.payload }   
                    case  'switch_grupo' :
                        return { ...state, grupo:action.payload }   
                    case  'switch_origem' :
                        return { ...state, origem:action.payload }   
                    case  'switch_descricao' :
                        return { ...state, descricao:action.payload }   
                    case  'switch_num_fabricante' :
                        return { ...state, num_fabricante:action.payload }  
                    case  'switch_num_original' :
                        return { ...state, num_original:action.payload }   
                    case  'switch_sku' :
                        return { ...state, sku:action.payload }   
                    case  'switch_marca' :
                        return { ...state, marca:action.payload }   
                    case  'switch_ativo' :
                        return { ...state, ativo:action.payload }   
                    case  'switch_class_fiscal' :
                        return { ...state, class_fiscal:action.payload }   
                    case  'switch_cst' :
                        return { ...state, cst:action.payload }   
                    case  'switch_caracteristica' :
                        return { ...state, caracteristica:action.payload }  
                    case  'switch_data_cadastro' :
                        return { ...state, data_cadastro:action.payload }   
                    case  'switch_data_recadastro' :
                        return { ...state, data_recadastro:action.payload }   
                    case  'switch_observacoes1' :
                        return { ...state, observacoes1:action.payload }   
                    case  'switch_observacoes2' :
                        return { ...state, observacoes2:action.payload } 
                    case  'switch_observacoes3' :
                        return { ...state, observacoes3:action.payload }   
                    case  'switch_tipo' :
                        return { ...state, tipo:action.payload }; 
                    case  'switch_controle_lote_serie' :
                        return { ...state, controle_lote_serie:action.payload } ; 
                    case  'switch_fotos' :
                        return { ...state, fotos:action.payload } ;
                    case  'switch_all_fields' :
                        return   state = action.payload  

            }
        }

            const initialState:typePayloadProduct ={
                    estoque: 0,
                    preco:  '0.00' ,
                    unidade_medida: 'UND' ,
                    grupo:  0,
                    origem:  '' ,
                    descricao: '',
                    num_fabricante:  '',
                    num_original:  '',
                    sku:  ''  ,
                    marca: 0,
                    ativo: "S"  ,
                    class_fiscal: '',
                    cst: ''  ,
                    caracteristica: 0  ,
                    data_cadastro: useMoment.dataAtual(),
                    data_recadastro: useMoment.dataHoraAtual(),
                    observacoes1: '',
                    observacoes2: '' ,
                    observacoes3: '' ,
                    tipo: 1,
                    controle_lote_serie: "N"   ,
                    fotos: []
            } 

    const [ payloadProduct , dispatch ] = useReducer(handleEditPayloadProduct, initialState);


    let { codigo_produto } = route.params || { codigo_produto: 0 };


    async function getConfigMobileApi() {
        try {
            setLoading(true)
            const resultConfigMobileApi = await useQueryConfigApi.select(1);
            if (resultConfigMobileApi && resultConfigMobileApi.length > 0) {
                setConfigMobileApi(resultConfigMobileApi[0]);
            }
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getConfigMobileApi();
    }, [])

    async function carregarProduto() {
        if(codigo_produto){
            try {
                setLoading(true)
                const responseProduct = await api.get(`/produtos/${codigo_produto}`);
                const productRequest = responseProduct.data;
                console.log(productRequest)
                dispatch({ type: 'switch_all_fields', payload: productRequest})
                dispatch({ type: 'switch_descricao', payload:productRequest.descricao })

            } catch (e) {
                console.log(`[X] Erro ao buscar ${codigo_produto} na api `, e)
            } finally {
                setLoading(false)
            }
       }else{
                const responseLastCodeProduct = await api.get(`/produtos/last-codigo`);
                const ObjectlastCode = responseLastCodeProduct.data as { codigo:number};
                dispatch({ type:'switch_id', payload:  `#${ObjectlastCode.codigo + 1}` })
       }

    }
    useEffect(() => {
        function setConexao() {
            const unsubscribe = NetInfo.addEventListener((state) => {
                setConnected(state.isConnected as any);
            });
            return () => {
                unsubscribe();
            };
        }
        setConexao();
        carregarProduto();
    }, []);


    useEffect(() => {
        carregarProduto();

    }, [configMobileApi]);

    async function gravar(){
        if (connected === false) return Alert.alert('Erro', 'É necessario estabelecer conexão com a internet para efetuar o cadastro !');
        if(codigo_produto){
            try{
                const resultPutProduct = await api.put(`/produtos`,payloadProduct )
                        if(resultPutProduct.status == 200 ){
                            setTitleAlert(`Sucesso!`);
                            setTypeAlert('success');
                            setMessageAlert(`Produto ${payloadProduct.descricao} atualizado com sucesso !`);
                            setVisibleAlert(true)
                            return;
                        }
                        
                    }catch(e){
                        if(isAxiosError(e)){
                            setTitleAlert(`Erro`);
                                setTypeAlert('error');
                                setMessageAlert(`Não foi possivel cadastrar o produto ${payloadProduct.descricao} ${e.response?.data?.message} `);
                                setVisibleAlert(true)
                                return;
                        }
                    }
        }else{
            console.log("[V] Gravando novo produto ", payloadProduct);
            try{

            const resultPutProduct = await api.post(`/produtos`,payloadProduct )
                if(resultPutProduct.status == 201 ){
                    setTitleAlert(`Sucesso!`);
                    setTypeAlert('success');
                    setMessageAlert(`Produto ${payloadProduct.descricao} cadastrado com sucesso !`);
                    setVisibleAlert(true)
                }

            }catch(e){
                if(isAxiosError(e)){
                       setTitleAlert(`Erro`);
                        setTypeAlert('error');
                        setMessageAlert(`Não foi possivel cadastrar o produto ${payloadProduct.descricao} ${e.response?.data?.message} `);
                        setVisibleAlert(true)
                }
            }
          

        }
    }
 
    const renderImgs = ({ item }: { item: typeFotoProduto }) => {
        return (
            <View style={ styles.modalImageItem  }>
                <TouchableOpacity style={ styles.modalDeleteButton  } onPress={() => deleteItemListImgs(item)}>
                    <AntDesign name="close-circle" size={22} color="#E53935" />
                </TouchableOpacity>
                {item.foto && item.link && (
                    <Image
                        source={{ uri: `${item.link}` }}
                        style={styles.modalImageThumbnail}
                        resizeMode="contain"
                    />
                )}
            </View>
        );
    };

    const deleteItemListImgs = (item: typeFotoProduto) => {
        const updatedImgs = payloadProduct.fotos.filter((i) => i.sequencia !== item.sequencia);
        dispatch({ type: 'switch_fotos', payload: updatedImgs });
    };

    const gravarImgs = () => {
        if (link === "") return;

        const sequencia = payloadProduct.fotos.length > 0
            ? Math.max(...payloadProduct.fotos.map((i) => i.sequencia)) + 1
            : 1;

        const newImage: photoPayloadProduct = {
            produto: codigo_produto || 0,
            sequencia,
            descricao: link,
            link,
            foto: link,
            data_cadastro: useMoment.dataAtual(),
            data_recadastro: useMoment.dataHoraAtual(),
        };

        dispatch({ type: 'switch_fotos', payload: [...payloadProduct.fotos, newImage] });
        setLink('');
    };


   
    return (
        <View style={styles.mainContainer}>
            {
                loading ?
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator size={50} color="#185FED" />
                    </View>

                    :
                    <ScrollView contentContainerStyle={styles.scrollView}>
                        {/* --- CARD CABEÇALHO: IMAGEM E INFOS BÁSICAS --- */}
                        <View style={styles.headerCard}>
                            <TouchableOpacity onPress={() => setVisible(true)}>
                                <View style={styles.imagePicker}>
                                    {payloadProduct.fotos && payloadProduct.fotos.length > 0 ? (
                                        <Image
                                            source={{ uri: `${payloadProduct.fotos[0].link}` }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <MaterialIcons name="add-a-photo" size={40} color={colors.textSecondary} />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.headerInfoContainer}>
                               
                                {
                                    codigo_produto ? (
                                         <View style={styles.infoBox}>
                                            <Text style={styles.infoBoxLabel}>Código:</Text>
                                            <Text style={styles.infoBoxValue}>{codigo_produto || 'Novo'}</Text>
                                        </View>
                                    ) : null
                                }
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoBoxLabel}>id:</Text>
                                    <Text style={styles.infoBoxValue} numberOfLines={1}>{payloadProduct.id || null}</Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoBoxLabel}>R$</Text>
                                    <TextInput
                                        onChangeText={(v) => dispatch({ type:'switch_preco' ,payload: v} ) }
                                        style={styles.numericInput}
                                        keyboardType="numeric"
                                        defaultValue={ payloadProduct.preco || "0.00" }
                                        placeholder="0,00"
                                        placeholderTextColor={colors.placeholder}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* --- CARD FORMULÁRIO: DEMAIS CAMPOS --- */}
                        <View style={styles.formCard}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Descrição do Produto</Text>
                                <TextInput
                                    onChangeText={(value) => dispatch  ({type:'switch_descricao', payload:value})}
                                    style={styles.textInput}
                                    placeholder="Ex: Roda de Liga Leve Aro 15"
                                    placeholderTextColor={colors.placeholder}
                                    value={String(payloadProduct.descricao)}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Unidade de medida</Text>
                                <TextInput
                                    onChangeText={(value) => dispatch({ payload:value, type:'switch_unidade_medida'}) }
                                    style={styles.textInput}
                                    placeholder="Unidade de medida do produto"
                                    placeholderTextColor={colors.placeholder}
                                    value={String(payloadProduct.unidade_medida)}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>SKU</Text>
                                <TextInput
                                    onChangeText={(value) => dispatch({ type:'switch_sku', payload: value})}
                                    style={styles.textInput}
                                    placeholder="Código SKU do produto"
                                    placeholderTextColor={colors.placeholder}
                                    value={ payloadProduct.sku  || ''}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Código de Barras (GTIN)</Text>
                                <TextInput
                                    onChangeText={(value) => dispatch({ type: 'switch_num_fabricante', payload: value} )}
                                    style={styles.textInput}
                                    placeholder="789..."
                                    placeholderTextColor={colors.placeholder}
                                    value={ payloadProduct.num_fabricante || ''}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Referência</Text>
                                <TextInput

                                    onChangeText={(value) => dispatch({type:'switch_num_original', payload: value}) }
                                    style={styles.textInput}
                                    placeholder="Código do fabricante"
                                    placeholderTextColor={colors.placeholder}
                                    value={payloadProduct.num_original || ''}
                                />
                            </View>
                        </View>

                        {/* --- SELETORES DE MARCA E CATEGORIA --- */}
                        <View style={styles.formCard}>
                            <View>
                                <Text style={styles.inputLabel}>Marca</Text>
                                <RenderModalMarcas
                                    dispatch={dispatch}
                                    payloadProduct={payloadProduct}
                                />
                            </View>
                            <View>
                                <Text style={styles.inputLabel}>Categoria</Text>
                                <RenderModalCategorias 
                                  dispatch={dispatch}
                                  payloadProduct={payloadProduct} 
                                />
                            </View>
                        </View>

                        {/* --- BOTÃO DE GRAVAR --- */}
                        <TouchableOpacity
                            style={styles.saveButton}
                         onPress={() => gravar()}
                        >
                            <Text style={styles.saveButtonText}>Gravar Produto</Text>
                        </TouchableOpacity>

                    </ScrollView>
            }



            {/* --- MODAL DE IMAGENS --- */}
            <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Fotos do Produto</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Lista de fotos */}
                        <View style={styles.modalImageListContainer}>
                            {payloadProduct.fotos && payloadProduct.fotos.length > 0 ? (
                                <FlatList
                                    data={payloadProduct.fotos}
                                    keyExtractor={(item) => String(item.sequencia)}
                                    renderItem={renderImgs}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.modalImageListContent}
                                />
                            ) : (
                                <View style={styles.modalEmptyContainer}>
                                    <MaterialIcons name="photo-library" size={48} color={colors.textSecondary} />
                                    <Text style={styles.modalEmptyText}>Nenhuma imagem adicionada.</Text>
                                </View>
                            )}
                        </View>

                        {/* Adicionar imagem */}
                        <View style={styles.modalAddImageContainer}>
                            <View style={styles.modalPreviewContainer}>
                                {link !== "" ? (
                                    <Image style={styles.modalImagePreview} source={{ uri: link }} resizeMode="cover" />
                                ) : (
                                    <Entypo name="image" size={54} color={colors.primary} />
                                )}
                            </View>
                            <TextInput
                                style={styles.modalTextInput}
                                placeholder="Cole o link da imagem aqui"
                                placeholderTextColor={colors.placeholder}
                                onChangeText={(v) => setLink(v)}
                                value={link}
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                            <TouchableOpacity
                                style={[styles.modalAddButton, link === "" && styles.modalAddButtonDisabled]}
                                onPress={gravarImgs}
                                disabled={link === ""}
                            >
                                <MaterialIcons name="add-circle" size={24} color="#FFF" />
                                <Text style={styles.modalAddButtonText}>Adicionar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

                 {/** --- Alerta -- */}
                        <CustomAlert
                            visible={visibleAlert}
                            onConfirm={() => { 
                                setVisibleAlert(false)
                                navigation.goBack()
                             }}
                            title={titleAlert}
                            message={messageAlert}
                            type={typeAlert}
                        />

        </View>
    );
}
 // ===================================================================================
    // ESTILOS CENTRALIZADOS - AQUI FICA TODA A ESTILIZAÇÃO
    // ===================================================================================
    const colors = {
        primary: '#185FED',
        background: '#F0F4F8',
        card: '#FFFFFF',
        text: '#333333',
        textSecondary: '#6c757d',
        placeholder: '#adb5bd',
        border: '#DEE2E6',
        danger: '#E53935',
    };

    const styles = {
        // --- Containers Principais ---
        mainContainer: { flex: 1, backgroundColor: colors.background },
        scrollView: { paddingHorizontal: 16, paddingTop: 16 },

        // --- Card do Cabeçalho (Imagem e Infos) ---
        headerCard: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            gap: 16,
        },
        imagePicker: {
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        productImage: { width: '100%', height: '100%', borderRadius: 8 },
        headerInfoContainer: { flex: 1, justifyContent: 'space-between' },

        // --- Card do Formulário Principal ---
        formCard: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            gap: 16, // Espaçamento entre os campos do formulário
        },

        // --- Estilos de Formulário (Labels e Inputs) ---
        inputGroup: { width: '100%' },
        inputLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 6,
        },
        textInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            color: colors.text,
            backgroundColor: '#F9F9F9'
        },
        infoBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9F9F9',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border
        },
        infoBoxLabel: {
            fontWeight: 'bold',
            color: colors.textSecondary,
            fontSize: 16,
        },
        infoBoxValue: {
            fontSize: 16,
            color: colors.text,
            marginLeft: 4,
            flex: 1
        },
        numericInput: { fontSize: 16, color: colors.text, flex: 1, marginLeft: 4 },

        // --- Botões ---
        saveButton: {
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 20,
            elevation: 2,
        },
        saveButtonText: {
            color: colors.card,
            fontSize: 18,
            fontWeight: 'bold',
        },

        // --- Estilos do Modal de Imagens ---
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
        },
        modalContainer: {
            width: '90%',
            height: '80%',
            backgroundColor: '#F5F7FA',
            borderRadius: 16,
            overflow: 'hidden',
            elevation: 10
        },
        modalHeader: {
            backgroundColor: colors.primary,
            padding: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        modalHeaderText: {
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold'
        },
        modalImageListContainer: {
            paddingVertical: 20,
        },
        modalImageListContent: {
            paddingHorizontal: 15,
            gap: 12
        },
        modalEmptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8
        },
        modalEmptyText: {
            color: colors.textSecondary,
            fontSize: 14
        },
        modalImageItem: {
            padding: 4,
            marginVertical: 4,
            borderRadius: 12,
            backgroundColor: '#FFF',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            alignItems: 'center',
            maxHeight:150
        },
        modalDeleteButton: {
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1,
            backgroundColor: '#FFF',
            borderRadius: 12
        },
        modalImageThumbnail: {
            width: 120,
            height: 120,
            borderRadius: 8
        },
        modalAddImageContainer: {
            backgroundColor: '#FFF',
            padding: 15,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            alignItems: 'center',
            gap: 12
        },
        modalPreviewContainer: {
            width: 100,
            height: 100,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9F9F9'
        },
        modalImagePreview: {
            width: '100%',
            height: '100%',
            borderRadius: 8
        },
        modalTextInput: {
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            color: colors.text,
            backgroundColor: '#F9F9F9'
        },
        modalAddButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 20,
            gap: 8,
            elevation: 2
        },
        modalAddButtonDisabled: {
            backgroundColor: colors.textSecondary,
            elevation: 0
        },
        modalAddButtonText: {
            color: '#FFF',
            fontSize: 14,
            fontWeight: 'bold'
        },
    };
    // ===================================================================================
