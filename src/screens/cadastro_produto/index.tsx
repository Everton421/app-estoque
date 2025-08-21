import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, Modal, Text, TouchableOpacity, View, ScrollView, StyleSheet } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { RenderModalCategorias } from "./modalCategorias";
import { RenderModalMarcas } from "./modalMarcas";
import useApi from "../../services/api";
import NetInfo from '@react-native-community/netinfo';
import Entypo from "@expo/vector-icons/Entypo";
import { ConnectedContext } from "../../contexts/conectedContext";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useProducts } from "../../database/queryProdutos/queryProdutos";
import { useFotosProdutos } from "../../database/queryFotosProdutos/queryFotosProdutos";
import { typeFotoProduto } from "./types/fotos";
import { LodingComponent } from "../../components/loading";
import { configMoment } from "../../services/moment";

type produtoBancoLocal = { 
    unidade_medida:string,ativo : string, class_fiscal : string, codigo : number, cst: string, data_cadastro:  string, data_recadastro: string, descricao :string, estoque: number, grupo: number, marca: number, num_fabricante: string, num_original : string, observacoes1: string, observacoes2 : string, observacoes3 : string, origem : string, preco : number, sku : string, tipo : string
};

export const Cadastro_produto: React.FC = ({ route, navigation }: any) => {

    // ... (toda a sua lógica de state, useEffect e funções como 'carregarProduto', 'gravar', etc., permanece a mesma)
    const [ marcaSelecionada, setMarcaSelecionada ] = useState<{ codigo:number }>(); 
    const [ categoriaSelecionada, setCategoriaSelecionada ] = useState(0); 
    const [ estoque, setEstoque ] = useState<any>(0);
    const [ preco, setPreco ] = useState<any>(0);
    const [ unidade, setUnidade ] = useState( 'UND')

    const [ sku, setSku ] = useState<string>('');
    const [ descricao, setDescricao] = useState<string>('');
    const [ gtim, setGtim ] = useState<string>('');
    const [ referencia, setReferencia ] = useState<string>('');


    const [visible, setVisible] = useState<Boolean>(false);
    const [link, setLink] = useState("");
    const [fotos, setFotos] = useState<typeFotoProduto[]>([]);

    const [produto, setProduto] = useState<produtoBancoLocal>();
    const [ imgs, setImgs] = useState<typeFotoProduto[]>();
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ dados , setDados ] = useState('');
    const api = useApi();
    const {connected,  setConnected} = useContext(ConnectedContext)
    const useQueryFotos = useFotosProdutos();
    const useQueryProdutos = useProducts();
    const useMoment = configMoment();

    const [ loading2, setLoading2 ] = useState(false);

    let { codigo_produto } =   route.params || { codigo_produto : 0};
    
 
    async function carregarProduto(){
        try{
            setLoading(true)

            if( codigo_produto && codigo_produto > 0 ){
            let dataProd:any= await useQueryProdutos.selectByCode(codigo_produto);
                
                let dadosFoto:any = await useQueryFotos.selectByCode(codigo_produto)   
                dataProd[0].fotos = dadosFoto;
                
                setDados(dataProd);

                setImgs(dadosFoto)
            let prod:produtoBancoLocal = dataProd[0]  
            setProduto(prod)
            if(dataProd.length > 0 ){
                    setUnidade(prod.unidade_medida)
                    setCategoriaSelecionada(prod.grupo);
                    setMarcaSelecionada(prod.marca);
                    setReferencia(prod.num_original)
                    setEstoque(prod.estoque);
                    setPreco( Number(prod.preco));
                    setSku(prod.sku);
                    setDescricao(prod.descricao)
                    setGtim(prod.num_fabricante)
                }
            } 
        }catch(e) {
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        function setConexao(){
            const unsubscribe = NetInfo.addEventListener((state) => {
                setConnected(state.isConnected);
            });
            return () => {
                unsubscribe();
            };
        }
        setConexao();
        carregarProduto();
    }, []);

    async function gravar (){
        if( connected === false ) return Alert.alert('Erro', 'É necessario estabelecer conexão com a internet para efetuar o cadastro !');
        if(!preco) setPreco(0);
        if(!estoque) setEstoque(0);
        if(!sku) setSku('');
        if(!referencia) setReferencia('');
        if(!marcaSelecionada) return Alert.alert('É necessario informar uma marca para gravar o produto!');
        if(!categoriaSelecionada) return Alert.alert('É necessario informar uma categoria para gravar o produto!');

        setLoading(true);
        if( codigo_produto && codigo_produto > 0   ){
            let data =   { "unidade_medida":unidade,"codigo":codigo_produto, "preco":preco, "estoque":estoque, "descricao":descricao,
                 "sku":sku,"num_original ":referencia, "num_fabricante":gtim, "marca":  {codigo: marcaSelecionada.codigo} , "grupo": {codigo:categoriaSelecionada } };
                console.log(data)
 
            try{
                
                if (imgs && imgs.length > 0) {
                    let obj = { produto: codigo_produto, fotos: imgs  };
                      imgs.forEach(async (f:typeFotoProduto) => {
                        f.data_cadastro = useMoment.dataAtual();
                        f.data_recadastro = useMoment.dataHoraAtual()
                     } );
                     console.log(obj)
                       await api.post('/offline/fotos', obj);
                      await useQueryFotos.deleteByCodeProduct(codigo_produto);
                      
                      imgs.forEach(async (f:typeFotoProduto) => {
                         await useQueryFotos.create(f)
                      } );
                } 
                 
                 let responseProdutoApi = await api.put('/produto', data);
                 if(responseProdutoApi.status === 200 && responseProdutoApi.data.codigo > 0 ){
                 let dataRecad = responseProdutoApi.data.data_recadastro
                         let dadosUpdateLocal =  { "unidade_medida":unidade ,"codigo":codigo_produto, "preco":preco, "estoque":estoque, "descricao":descricao, 
                             "sku":sku,"num_original ":referencia, "num_fabricante":gtim, "marca":  marcaSelecionada.codigo, "grupo": categoriaSelecionada , data_recadastro:dataRecad};
                         await useQueryProdutos.update(dadosUpdateLocal, data.codigo)
                     navigation.goBack();
                     return Alert.alert('', `Produto ${responseProdutoApi.data.codigo} Alterado Com Sucesso! `)     
                 }

            }catch(e:any){
                if(e.status === 400 ){ Alert.alert("Erro!" , e.response.data.msg ); }
            } finally{ setLoading(false) } 
           
        } else {
            let data =   { "preco":preco, "estoque":estoque, "descricao":descricao, "sku":sku, "num_fabricante":gtim, "num_original ":referencia, "marca":  { codigo:marcaSelecionada.codigo} , "grupo":{ codigo:categoriaSelecionada} };
 
          
            try{
                let response = await api.post('/produto', data)
                if(response.status === 200 && response.data.codigo > 0 ){
                    // ... seu código de sucesso de criação
                   let dadosInsertLocal =
                     { "codigo":codigo_produto,
                        "preco":preco,
                        "estoque":estoque,
                        "descricao":descricao,
                        "sku":sku,
                        "num_original":referencia,
                        "marca":  marcaSelecionada.codigo,
                         "grupo": categoriaSelecionada,
                        "origem":'0',
                        "ativo":'S',
                        "class_fiscal":'0000.00.00',
                        "cst":'00',
                        "num_fabricante":gtim,
                        "data_cadastro":useMoment.dataAtual(),
                        "data_recadastro": useMoment.dataHoraAtual(),
                        "observacoes1":'',
                        "observacoes2":'',
                        "observacoes3":'',
                        "tipo":'0',
                        };
                    
                  await useQueryProdutos.createByCode(dadosInsertLocal, response.data.codigo)
                    Alert.alert('',`Produto ${descricao} registrado com sucesso!`);
                    navigation.goBack();
                }
            }catch(e:any){
                if(e.status === 400 ){ Alert.alert('Erro!',` ${e.response.data.msg}`) }
            }finally{ setLoading(false) }
     
        }
    }

    const renderImgs = ({ item }: { item: typeFotoProduto }) => {
        return (
          <View style={styles.modalImageItem}>
            <TouchableOpacity style={styles.modalDeleteButton} onPress={() => deleteItemListImgs(item)}>
              <AntDesign name="closecircle" size={24} color="#E53935" />
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
      
    const deleteItemListImgs = (item:typeFotoProduto) => {
        const updatedImgs = imgs?.filter((i: typeFotoProduto) => i.sequencia !== item.sequencia) || [];
        setImgs(updatedImgs);
        setFotos(updatedImgs);
    };

    const gravarImgs = () => {
        if (link === "") return;
        const maxSequencia = imgs && imgs.length > 0 ? Math.max(...imgs.map((i) => i.sequencia)) : 0;
        const newImage: typeFotoProduto = {
          produto: codigo_produto,
          data_cadastro: "0000-00-00",
          data_recadastro: "0000-00-00 00:00:00",
          descricao: link, foto: link, link: link,
          sequencia: maxSequencia + 1,
        };
        const updatedImgs = [...(imgs || []), newImage];
        setImgs(updatedImgs);
        setFotos(updatedImgs);
        setLink('');
    };
    
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
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
        modalContainer: { width: '90%', height: '80%', backgroundColor: colors.card, borderRadius: 15, padding: 15 },
        modalHeader: { flexDirection: 'row', justifyContent: 'flex-start' },
        modalBackButton: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, elevation: 2 },
        modalBackButtonText: { color: colors.card, fontWeight: 'bold' },
        modalImageListContainer: { alignItems: 'center', paddingVertical: 15, minHeight: 150 },
        modalImageItem: { margin: 5, padding: 4, borderRadius: 10, backgroundColor: "#FFF", elevation: 3, alignItems: 'center' },
        modalDeleteButton: { position: 'absolute', top: -5, right: -5, zIndex: 1 },
        modalImageThumbnail: { width: 120, height: 120, borderRadius: 5 },
        modalAddImageContainer: { alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 15, marginTop: 10, gap: 10 },
        modalImagePreview: { width: 100, height: 100, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
        modalAddButton: { alignItems: 'center' },
    };
    // ===================================================================================

    return (
        <View style={styles.mainContainer}>
            <LodingComponent isLoading={loading} />
            
            <ScrollView contentContainerStyle={styles.scrollView}>
                {/* --- CARD CABEÇALHO: IMAGEM E INFOS BÁSICAS --- */}
                <View style={styles.headerCard}>
                    <TouchableOpacity onPress={() => setVisible(true)}>
                        <View style={styles.imagePicker}>
                            {imgs && imgs.length > 0 ? (
                                <Image
                                    source={{ uri: `${imgs[0].link}` }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <MaterialIcons name="add-a-photo" size={40} color={colors.textSecondary} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerInfoContainer}>
                         <View style={styles.infoBox}>
                            <Text style={styles.infoBoxLabel}>Código:</Text>
                            <Text style={styles.infoBoxValue}>{codigo_produto || 'Novo'}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxLabel}>R$</Text>
                            <TextInput
                                onChangeText={(v) => setPreco(v.replace(/[^0-9,.]/g, ''))}
                                style={styles.numericInput}
                                keyboardType="numeric"
                                defaultValue={String(preco)}
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
                            onChangeText={(value) => setDescricao(value)}
                            style={styles.textInput}
                            placeholder="Ex: Roda de Liga Leve Aro 15"
                            placeholderTextColor={colors.placeholder}
                            value={String(descricao)}
                        />
                    </View>
                      <View style={styles.inputGroup}>
                               <Text style={styles.inputLabel}>Unidade de medida</Text>
                               <TextInput
                                 onChangeText={(value) => setUnidade(value)}
                                 style={styles.textInput}
                                 placeholder="Unidade de medida do produto"
                                 placeholderTextColor={colors.placeholder}
                                 value={String(unidade)}
                             />
                         </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>SKU</Text>
                        <TextInput
                            onChangeText={(value) => setSku(value)}
                            style={styles.textInput}
                            placeholder="Código SKU do produto"
                            placeholderTextColor={colors.placeholder}
                            value={String(sku)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Código de Barras (GTIN)</Text>
                        <TextInput
                            onChangeText={(value) => setGtim(value)}
                            style={styles.textInput}
                            placeholder="789..."
                            placeholderTextColor={colors.placeholder}
                            value={String(gtim)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Referência</Text>
                        <TextInput
                                
                            onChangeText={(value) =>  setReferencia(value) } 
                            style={styles.textInput}
                            placeholder="Código do fabricante"
                            placeholderTextColor={colors.placeholder}
                            value={referencia ? String(referencia) : ''}
                        />
                    </View>
                </View>

                {/* --- SELETORES DE MARCA E CATEGORIA --- */}
                <View style={styles.formCard}>
                    <View>
                        <Text style={styles.inputLabel}>Marca</Text>
                        <RenderModalMarcas codigoMarca={marcaSelecionada} setMarca={setMarcaSelecionada} />
                    </View>
                    <View>
                        <Text style={styles.inputLabel}>Categoria</Text>
                        <RenderModalCategorias codigoCategoria={categoriaSelecionada} setCategoria={setCategoriaSelecionada} />
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

            {/* --- MODAL DE IMAGENS --- */}
            <Modal visible={visible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setVisible(false)} style={styles.modalBackButton}>
                                <Text style={styles.modalBackButtonText}>Voltar</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalImageListContainer}>
                            {imgs && imgs.length > 0 ? (
                                <FlatList
                                    data={imgs}
                                    keyExtractor={(item) => String(item.sequencia)}
                                    renderItem={renderImgs}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                />
                            ) : (
                                <Text style={{color: colors.textSecondary}}>Nenhuma imagem adicionada.</Text>
                            )}
                        </View>

                        <View style={styles.modalAddImageContainer}>
                            {link !== "" ? (
                                <Image style={styles.modalImagePreview} source={{ uri: link }} />
                            ) : (
                                <Entypo name="image" size={54} color={colors.primary} />
                            )}
                            <TextInput
                                style={[styles.textInput, { width: '100%' }]}
                                placeholder="Cole o link da imagem aqui"
                                placeholderTextColor={colors.placeholder}
                                onChangeText={(v) => setLink(v)}
                                value={link}
                            />
                            <TouchableOpacity style={styles.modalAddButton} onPress={gravarImgs}>
                                <Entypo name="arrow-with-circle-up" size={40} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}