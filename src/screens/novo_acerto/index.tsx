import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { ListaProdutos } from "./components/produtos_";
import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { prod_setor, useProdutoSetores } from "../../database/queryProdutoSetor/queryProdutoSetor";
import { FlatList } from "react-native-gesture-handler";
import { useSetores } from "../../database/querySetores/querySetores";
import { configMoment } from "../../services/moment";
import { Setores } from "./components/setores";
import { Locais } from "./components/locais";
import { useMovimentos } from "../../database/queryMovimentos/queryMovimentos";
import { useProducts } from "../../database/queryProdutos/queryProdutos";
import AsyncStorage from "@react-native-async-storage/async-storage";

type filterBarcodeOption = {
    chave: 'codigo' | 'num_fabricante' | 'num_original' | 'sku'
}
type historico = { historico: string }

type unidade_medida = {
    unidade_medida: string
}
type dataProdMov = prod_setor & historico & unidade_medida


export const NovoAcerto = ({ navigation }: any) => {
    const [modalVisible, setModalvisible] = useState(false);
    const [visibleModalSetores, setVisibleModalSetores] = useState(false);
    const [visibleLocais, setVisibleLocais] = useState(false);

    const [permission, requestPermission] = useCameraPermissions();
    const [prodSeletor, setProdSeletor] = useState<any>();
    const [loadingInsertItem, setLoadingInsertItem] = useState(false);

    const [dataProd, setDataProd] = useState<dataProdMov[]>([]);
    const [dataSetores, setDataSetores] = useState<any>();
    const [setorSelecionado, setSetorSelecionado] = useState<any>();
    const [loadingDataProd, setLoadingDataProd] = useState(false);
    const [ent_sai, setEnt_sai] = useState('E');
    const [novoSaldo, setNovoSaldo] = useState(0);

    const [defaultConfigFilter, setDefaultConfigFilter] = useState<'codigo' | 'num_fabricante' | 'num_original' | 'sku'>('num_fabricante');

    const useQueryMovimento = useMovimentos();
    const useQueryProdutos = useProducts();
    const useQuerySetores = useSetores();
    const useQueryProdutoSetores = useProdutoSetores();
    const moment = configMoment();

    const qrcodeLock = useRef(false);

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
            let resultDataProd = await useQueryProdutos.findByParam({ chave: defaultConfigFilter, value: String(codeScanned) });
            if (resultDataProd.length > 0) {
                handleSelectProduct(resultDataProd[0]);
                setLoadingDataProd(false);
            } else {
                setLoadingDataProd(false);
                console.log("produto nao foi encontrado!");
                setDataProd([]);
                return Alert.alert('Atenção!', `Produto não encontrado, ${defaultConfigFilter}: ${codeScanned}`);
            }
        } catch (e) {
            setLoadingDataProd(false);
            console.log(`ocorreu um erro ao tentar buscar o produto pelo ${defaultConfigFilter}`, e);
        } finally {
            setLoadingDataProd(false);
        }
    }

    const handleUpdateField = (fieldName: keyof dataProdMov, value: string) => {
        if (!dataProd || dataProd.length === 0) return;
        const updatedData = dataProd.map((item) => {
            return { ...item, [fieldName]: value };
        });
        setDataProd(updatedData);
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
            let resultDataProd: any = await useQueryProdutoSetores.selectByCodeProductAndCodeSector(codigo, setor);

            if (resultDataProd && resultDataProd?.length > 0) {
                setDataProd(resultDataProd);
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
        } finally {
            setLoadingDataProd(false);
        }
    }

    async function findSetores() {
        let resultDataSetores = await useQuerySetores.selectAll();
        if (resultDataSetores && resultDataSetores?.length > 0) {
            setDataSetores(resultDataSetores);
        }
    }

    async function gravar(data: dataProdMov[]) {
        if (ent_sai === 'E') {
            let aux = Number(data[0].estoque) + novoSaldo;
            data[0].estoque = aux;
        }
        if (ent_sai === 'S') {
            let aux = Number(data[0].estoque) - novoSaldo;
            data[0].estoque = aux;
        }
        data[0].data_recadastro = moment.dataHoraAtual();
        data[0].unidade_medida = prodSeletor.unidade_medida;

        try {
            setLoadingInsertItem(true);
            let verifi = await useQueryProdutoSetores.selectByCodeProductAndCodeSector(Number(data[0].produto), Number(data[0].setor));

            if (verifi && verifi.length > 0) {
                let resultUpdate = await useQueryProdutoSetores.update(data[0]);
            } else {
                let resultInsert = await useQueryProdutoSetores.create(data[0]);
            }

            await useQueryMovimento.create({
                unidade_medida: data[0].unidade_medida,
                tipo: 'A',
                data_recadastro: moment.dataHoraAtual(),
                historico: data[0].historico ? data[0].historico : '',
                produto: Number(data[0].produto),
                quantidade: novoSaldo,
                setor: Number(data[0].setor),
                ent_sai: ent_sai
            });

            setLoadingInsertItem(false);
            setDataProd([]);
            setProdSeletor(undefined);
            setSetorSelecionado(undefined);
            return Alert.alert('OK!', `Acerto registrado com sucesso!`);

        } catch (e) {
            console.log("Erro ao registrar produto no setor", e);
            Alert.alert('Atenção!', 'Ocorreu um erro ao tentar registrar o item no setor!');
            setLoadingInsertItem(false);
        } finally {
            setLoadingInsertItem(false);
            setNovoSaldo(0);
            setEnt_sai('E');
        }
    }

    useEffect(() => {
        if (prodSeletor && prodSeletor.codigo) {
            findSetores();
        }
    }, [prodSeletor]);

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
                                        
                                        <Text style={{ textAlign: "center", fontSize: 14, color: "#999", marginBottom: 5 }}>Saldo Atual: <Text style={{fontWeight:'bold', color:'#333'}}>{i.estoque}</Text></Text>

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
                                    
                                    <Locais
                                        item={i}
                                        setVisible={setVisibleLocais}
                                        visible={visibleLocais}
                                        onUpdateField={handleUpdateField}
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
                    <View style={{ width: '90%', height: '80%', backgroundColor: "#FFF", borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                        <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Selecionar Setor</Text>
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
        </View>
    )
}