import { AntDesign, Entypo, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CustomAlert } from "../../components/custom-alert/custom-alert";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { BarcodeScanner } from "../../components/barcode-scanner";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { ApiConfig } from "../../types/type-config-api";
import { ModalExitSeparation } from "./components/modal-exit/modal-exit";
import { ModalSeries } from "./components/modal-series/modal-series";
import { ModalSetores } from "./components/modal-setores/modal-setores";
import { AuthContext } from "../../contexts/auth";

export interface Cliente {
  bairro: string;
  celular: string;
  cep: string;
  cidade: string;
  cnpj: string;
  codigo: number;
  data_cadastro: string; 
  data_recadastro: string;
  endereco: string;
  estado: string;
  ie: string;
  nome: string;
  numero: string;
  vendedor: number;
}
export interface fornecedor {
  bairro: string;
  celular: string;
  cep: string;
  cidade: string;
  cnpj: string;
  codigo: number;
  data_cadastro: string; 
  data_recadastro: string;
  endereco: string;
  estado: string;
  ie: string;
  nome: string;
  numero: string;
}

export interface Parcela {
  parcela: number;
  pedido: number;
  valor: number;
  vencimento: string;
}

export interface serie   {
          lote_serie : number,
           quantidade : number
}

export interface Produto {
  codigo: number;
  id:string
  desconto: number;
  descricao: string;
  pedido: number;
  preco: number;
  quantidade: number;
  total: number;
  num_fabricante: string;
  num_original: string;
  sku: string;
  series: serie[]
  quantidade_separada?: number; 
}
type status_separacao = 'NAO INICIADA' | 'EM ANDAMENTO' | 'PAUSADA' | 'RECUSADA' | 'CONCLUIDA'

export interface Pedido {
  cliente: Cliente;
 fornecedor: fornecedor
  codigo: number;
  codigo_cliente: number;
  contato: string;
  data_cadastro: string;
  data_recadastro: string;
  descontos: number;
  enviado: "S" | "N"; 
  forma_pagamento: number;
  id: string;
  id_externo: string;
  id_interno: string;
  nome: string;
  observacoes: string;
  parcelas: Parcela[];
  produtos: resultOrderItens[];
  quantidade_parcelas: number;
  servicos: any[]; 
  situacao: string;
  situacao_separacao: string;
  tipo: number;
  tipo_os: number;
  setor:number
  total_geral: number;
  total_produtos: number;
  total_servicos: number;
  veiculo: number;
  vendedor: number;
   usuario:number,
    usuario_separcao:number
    inicio_separacao:string 
    fim_separacao:string
    status_separacao: 'NAO INICIADA' | 'EM ANDAMENTO' | 'PAUSADA' | 'RECUSADA' | 'CONCLUIDA'
}

type resultOrderItens = {
    descricao: string
    num_fabricante: string
    num_original: string
    sku: string
    id: number
    quantidade_separada: number
    frete: number
    codigo: number
    pedido: number
    desconto: number
    preco: number
    quantidade: number
    total: number
    series: serie[]
    controle_lote_serie: 'S' | 'N'
    local_produto: string
    local1_produto: string
    local2_produto: string
    local3_produto: string
    local4_produto: string
}

export const Separacao = ({ navigation, route }: any) => {
    
    const { codigo_pedido } = route.params;
    const[data, setData] = useState<Pedido>();
    const useMoment = configMoment();

    const[listaSeparacao, setListaSeparacao] = useState<resultOrderItens[]>([]);
    const[modalVisible, setModalvisible] = useState(false);
    const [defaultConfigFilter, setDefaultConfigFilter] = useState<'codigo' | 'num_fabricante' | 'num_original' | 'sku'>('num_fabricante');

    const [ visibleAlert , setVisibleAlert ] = useState(false);
    const [ messageAlert , setMessageAlert ] = useState<string>('');
    const [ typeAlert,      setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
    const [ titleAlert, setTitleAlert ] = useState<string>('');
    const [ configMobileApi, setConfigMobileApi] = useState<ApiConfig>();
    const [ isloadingOrderData, setIsLoadingOrderData] = useState(false);
    const [ confirmVisible, setConfirmVisible ] = useState(false);
    const [ pendingAction, setPendingAction ] = useState<status_separacao | null>(null);
    const [ exitVisible, setExitVisible ] = useState(false);
    const [ incompleteVisible, setIncompleteVisible ] = useState(false);
    const [ observacao, setObservacao ] = useState('');
    const allowExitRef = useRef(false);
    const { usuario }: any = useContext(AuthContext);

    const [ isVisibleSetores , setIsVisibleSetores ] = useState(false);

    const [selectedProductForSeries, setSelectedProductForSeries] = useState<resultOrderItens | null>(null);

    const api = useApi();

    const useQueryConfigApi = queryConfig_api();

        async function getConfigMobileApi() :Promise<ApiConfig | undefined>{
        try {
            setIsLoadingOrderData(true)
            const resultConfigMobileApi = await useQueryConfigApi.select(1);
            if (resultConfigMobileApi && resultConfigMobileApi.length > 0) {
                setConfigMobileApi(resultConfigMobileApi[0]);
                   return resultConfigMobileApi[0] as ApiConfig ;
            }
        } catch (e) {
        } finally {
            setIsLoadingOrderData(false)
        }
    }

    // busca as configurações do leitor no asyncStorage 
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

     useEffect(() => {
         getConfigMobileApi();
     }, [])


     // consulta o pedido na api
        async function findOrderApi(){
             try {
                setIsLoadingOrderData(true)
                const responseApiOrder = await api.get(`/pedidos/${codigo_pedido}` );
                    const orderData = responseApiOrder.data
                    if (!orderData) {
                        setVisibleAlert(true)
                        setMessageAlert(`Não foi possivel localizar o pedido ${codigo_pedido}.`)
                        setTypeAlert('error') 
                        setTitleAlert("Erro")
                        return
                    }
                    if( orderData.status_separacao == 'EM ANDAMENTO'){
                            setVisibleAlert(true)
                        setMessageAlert(`Pedido ${codigo_pedido} já esta em processo de separação!`)
                        setTypeAlert('warning') 
                        setTitleAlert("Atenção!")
                        return
                    }

                  setData(responseApiOrder.data);
                       if (orderData.produtos) {
                            const produtosIniciais = orderData.produtos.map((p:any) => ({
                                ...p,
                                quantidade: Number(p.quantidade) || 0,
                                quantidade_separada: Math.round(Number(p.quantidade_separada) || 0)
                            }));
                            setListaSeparacao(produtosIniciais);
                        }
                            await api.patch(`/pedidos/${codigo_pedido}`, {
                                status_separacao: 'EM ANDAMENTO',
                                inicio_separacao: useMoment.dataHoraAtual(),
                                usuario_separacao: usuario.codigo
                            })
            } catch (e) {
                console.log(`[X] Erro ao buscar pedido ${codigo_pedido} da api `, e)

            } finally {
                setIsLoadingOrderData(false)
            }
        }


        useEffect(() => {
            async function loadConfigAndOrder() {
                const config = await getConfigMobileApi();
                    await findOrderApi();
            }
            loadConfigAndOrder();
    }, [codigo_pedido, navigation]);

     useFocusEffect(
            useCallback(() => {
                getDefaultConfig();
            }, [navigation])
        );

     useEffect(() => {
         const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
             if (allowExitRef.current) return;
             e.preventDefault();
             setExitVisible(true);
         });
         return unsubscribe;
     }, [navigation]);
    

    function handleCodeRead(data: string) {
        setModalvisible(false);
        fyndBarcode(data);
    }

    async function fyndBarcode(codigo: string) {
        handleUpdateQuantityByCodeRead(Number(codigo), 1, 9999);
    }




    const handleUpdateQuantity = (codigo: number, newQuantity: number, maxQuantity: number) => {
        let newQty = Math.round(Number(newQuantity));
        if (newQty < 0) newQty = 0;
        if (newQty > maxQuantity) newQty = maxQuantity; 

        setListaSeparacao(prev => prev.map(p => 
            p.codigo === codigo ? { ...p, quantidade_separada: newQty } : p
        ));
    };
    
    const handleUpdateQuantityByCodeRead = (codigo: number, newQuantity: number, maxQuantity: number) => {
        if (newQuantity < 0) newQuantity = 0;
        
        let targetProduct = listaSeparacao.find(p => {
            if (defaultConfigFilter === 'codigo') return p.codigo === codigo;
            if (defaultConfigFilter === 'num_fabricante') return p.num_fabricante === String(codigo);
            if (defaultConfigFilter === 'sku') return p.sku === String(codigo);
            if (defaultConfigFilter === 'num_original') return p.num_original === String(codigo);
        });

        if (targetProduct) {
            let qtdAtual = Math.round(Number(targetProduct.quantidade_separada) || 0);
            let novaQtd = qtdAtual + 1;

            if (novaQtd > targetProduct.quantidade) novaQtd = targetProduct.quantidade; // Limita à quantidade do pedido

            setListaSeparacao(prev => prev.map(p => 
                p.codigo === targetProduct!.codigo ? { ...p, quantidade_separada: novaQtd } : p
            ));
        }
    };


        async function saveOrderApi(status_separacao: status_separacao,usuario_separacao:number,  itensOverride?: resultOrderItens[]) {
            try {
                const itens = (itensOverride ?? listaSeparacao).map(item => ({
                    produto: item.codigo,
                    quantidade_separada: item.quantidade_separada || 0,
                    series: (item.series || []).filter(s => s.quantidade > 0)
                }));

                const payload = { itens , setor: data!.setor, status_separacao, observacoes_separacao: observacao, usuario_separacao:usuario_separacao};
                console.log(payload)
             const response = await api.post(`/pedidos/${codigo_pedido}/separar`, payload);
             
                   if (response.status >= 200 && response.status < 300) {
                       allowExitRef.current = true;
                       setVisibleAlert(true);
                       setMessageAlert(`Separação salva com sucesso! \n Status da separação: ${status_separacao}`);
                       setTypeAlert('success');
                       setTitleAlert("Sucesso");
                   } else {
                       throw new Error('Resposta inválida da API');
                   }

            } catch (e: any) {
                console.log("erro ao salvar a separação na api", e?.response?.data || e);
                setVisibleAlert(true);
                let message = e?.response?.data?.message || "Ocorreu um problema ao enviar a separação para a API." 
                setMessageAlert(message);
                setTypeAlert('error');
                setTitleAlert("Erro");
            }
    }


    function openConfirmAction(action: status_separacao){
        setPendingAction(action);
        setConfirmVisible(true);
    }

    function executeSeparationAction(action: status_separacao){
        if (action === 'CONCLUIDA' && !isOrderFullySeparated()) {
            setIncompleteVisible(true);
            return;
        }
        if (action === 'RECUSADA') {
            const zeroedItems = listaSeparacao.map(p => ({ ...p, quantidade_separada: 0, series: [] }));
            setListaSeparacao(zeroedItems);
            // se a separacao for recusada é passado o usuario 0 na separação, para que o pedido apareça para outros usuarios separar
            saveOrderApi('RECUSADA', 0 , zeroedItems);
        } else {
            saveOrderApi(action, usuario.codigo);
        }
    }

    function isOrderFullySeparated(){
        return listaSeparacao.length > 0 &&
            listaSeparacao.every(item => Number(item.quantidade_separada || 0) >= item.quantidade);
    }

    function handleConfirmAction(){
        setConfirmVisible(false);
        if (pendingAction) executeSeparationAction(pendingAction);
        setPendingAction(null);
    }

    function handleExitAction(action: status_separacao){
        setExitVisible(false);
        executeSeparationAction(action);
    }


    const renderProduto = ({ item }: { item: resultOrderItens }) => {
        const quantidadeSeparada = item.quantidade_separada || 0;
        const concluido = quantidadeSeparada === item.quantidade;
        const isSerie = item.controle_lote_serie == 'S';
        return (
            <View style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 15,
                marginBottom: 12,
                padding: 15,
                elevation: 3,
                borderLeftWidth: 5,
                borderLeftColor: concluido ? '#4CAF50' : '#FFC107' 
            }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                       { item.id && 
                            <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold', flex:1 }} numberOfLines={1}>Id: {item.id}</Text>
                       }
                       {
                           item.id === 0  && 
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Cód: {item.codigo}</Text>
                    } 

                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Qtd. Pedida: {item.quantidade}</Text>
                </View>
                    <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>ean: {item.num_fabricante}</Text>

                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                    {item.descricao || "Produto sem descrição"}
                </Text>

                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    backgroundColor: concluido ? '#E8F5E9' : '#F5F7FA', 
                    padding: 10, 
                    borderRadius: 8 
                }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>Qtd. Separada:</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center" }}
                            onPress={() => handleUpdateQuantity(item.codigo, quantidadeSeparada - 1, item.quantidade)}
                            disabled={isSerie}
                        >
                            <AntDesign name="minus" size={20} color={isSerie ? "#ccc" : "#333"} />
                        </TouchableOpacity>

                        <View style={{ minWidth: 40, borderBottomWidth: 2, borderBottomColor: concluido ? '#4CAF50' : '#185FED', alignItems: 'center' }}>
                            <TextInput
                                style={{ fontSize: 20, fontWeight: 'bold', color: concluido ? '#4CAF50' : '#185FED', textAlign: 'center', paddingVertical: 0 }}
                                value={String(Number(quantidadeSeparada) )}
                                onChangeText={(text) => {
                                    const num = Number(text.replace(/[^0-9]/g, ''));
                                    handleUpdateQuantity(item.codigo, num, item.quantidade);
                                }}
                                keyboardType="numeric"
                                editable={!isSerie}
                            />
                        </View>

                        <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isSerie ? "#ccc" : (concluido ? '#4CAF50' : "#185FED"), justifyContent: "center", alignItems: "center", elevation: isSerie ? 0 : 2 }}
                            onPress={() => handleUpdateQuantity(item.codigo, quantidadeSeparada + 1, item.quantidade)}
                            disabled={isSerie}
                        >
                            <AntDesign name="plus" size={20} color={isSerie ? "#999" : "#FFF"} />
                        </TouchableOpacity>
 
                    </View>
                    
                    
                </View>
                   {
                       item.controle_lote_serie == 'S' ? (
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
                                             onPress={() => setSelectedProductForSeries(item) }
                                        >
                                            <Ionicons name="barcode" size={35} color="#185FED" />
                                            <Text style={{fontWeight: 'bold', color:'#555'}}> Lote Série</Text>
                                          <MaterialCommunityIcons name="cursor-pointer" size={35} color="#185FED" />
                                        </TouchableOpacity>
                                    ):(
                                        <></>
                                    )
                                }

                      <View style={{ marginTop:10 }}>
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Locais: </Text>
                        {item.local1_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local1_produto }</Text> }
                        {item.local2_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local2_produto }</Text> }
                        {item.local3_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local3_produto }</Text> }
                        {item.local4_produto && <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>local : {item.local4_produto }</Text> }
                      </View>

            </View>
        );
    };

        function handleSector(dataSector:any){
            setData(  (prev:any) =>( 
                {
                    ...prev,
                    setor: dataSector.codigo
                } )
            )

            setIsVisibleSetores(false)
            console.log('Novo setor:', dataSector.codigo)
        }

    const FooterActionButton = ({ label, icon, color, onPress }: { label: string; icon: React.ReactNode; color: string; onPress: () => void }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            style={{
                flex: 1,
                backgroundColor: color,
                borderRadius: 10,
                paddingVertical: 12,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3
            }}
            onPress={onPress}
        >
            {icon}
            <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            
              <CustomHeader 
                title="Separação" 
                onBack={() => navigation.goBack()} 
              />

              <CustomAlert 
                  visible={visibleAlert}
                  message={messageAlert}
                  onConfirm={() => { 
                      setVisibleAlert(false)
                      navigation.goBack()
                  }}
                  title={titleAlert}
                  type={typeAlert}
              />

              <CustomAlert
                  visible={confirmVisible}
                  title={
                      pendingAction === 'RECUSADA' ? 'Confirmar Cancelamento'
                      : pendingAction === 'PAUSADA' ? 'Confirmar Pausa'
                      : 'Confirmar Conclusão'
                  }
                  message={
                      pendingAction === 'RECUSADA'
                          ? `Confirma o cancelamento da separação do pedido #${data?.codigo}? As quantidades separadas serão zeradas.`
                          : pendingAction === 'PAUSADA'
                          ? `Confirma a pausa da separação do pedido #${data?.codigo}?`
                          : `Confirma a conclusão da separação do pedido #${data?.codigo}?`
                  }
                  type="warning"
                  confirmText={pendingAction === 'RECUSADA' ? 'Sim, cancelar' : 'Sim'}
                  cancelText="Voltar"
                  onConfirm={handleConfirmAction}
                  onCancel={() => setConfirmVisible(false)}
              />

              <CustomAlert
                  visible={incompleteVisible}
                  title="Separação incompleta"
                  message="Há itens com separação incompleta. Deseja salvar como PAUSADA para retomar depois?"
                  type="warning"
                  confirmText="pausar separação"
                  cancelText="Manter status"
                  onConfirm={() => {
                      setIncompleteVisible(false);
                      saveOrderApi('PAUSADA', usuario.codigo);
                  }}
                  onCancel={
                    () =>{
                         setIncompleteVisible(false)

                      saveOrderApi( data && data?.status_separacao || 'PAUSADA' , usuario.codigo);
                    }
                  }
              />

              <ModalSetores
              selectSector={handleSector}
              setVisible={setIsVisibleSetores}
              visible={isVisibleSetores}
              />                

              <ModalExitSeparation
                  visible={exitVisible}
                  onConclude={() => handleExitAction('CONCLUIDA')}
                  onPause={() => handleExitAction('PAUSADA')}
                  onCancel={() => handleExitAction('RECUSADA')}
                  onContinue={() => setExitVisible(false)}
              />

            {
            isloadingOrderData ? 
              (
                                    <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
                                        <ActivityIndicator color='#185FED' size={50} />
                                    </View>
                                )
            : 
                data && !isloadingOrderData &&(
            <>
                    <View style={{ backgroundColor: '#FFF', borderRadius: 12, marginHorizontal: 15,   marginBottom: 15, padding: 15, elevation: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        
                            <MaterialIcons name="receipt-long" size={24} color="#185FED" style={{ marginRight: 10 }} />
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                                    Pedido #{ data.codigo}      <Text style={{ fontSize: 15, color: '#555', marginBottom: 4 }}> id Ext: {data.id_externo ? data.id_externo : '' } </Text> 
                                </Text>
                        </View>

                   <TouchableOpacity
                        style={{ 
                            backgroundColor: '#185FED', 
                            borderRadius: 7, 
                            paddingVertical: 5, 
                            flexDirection: 'row', 
                            justifyContent: 'space-around',
                            alignItems: 'center', 
                            elevation:5,
                            gap: 10 
                        }}
                        onPress={ ()=> setIsVisibleSetores(true)} >
                            <AntDesign name="caret-down" size={25} color="#FFF" />

                        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}> Setor: {data.setor}</Text>
                         <Entypo name="location" size={20} color="#FFF" />
                    </TouchableOpacity>
                                    
                        {
                            data.tipo == 6 ?
                             <Text style={{ fontSize: 15,top:5, color: '#555', marginBottom: 4 }}>
                               <Text style={{ fontWeight: 'bold' }}>Fornecedor:</Text> { data.fornecedor && data.fornecedor?.nome}
                             </Text>
                            
                            :
                             <Text style={{ fontSize: 15, top:5, color: '#555', marginBottom: 4 }}>
                               <Text style={{ fontWeight: 'bold' }}>Cliente:</Text> {  data.cliente && data.cliente?.nome}
                             </Text>
                        }                                    

                        {data.contato ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <MaterialCommunityIcons name="storefront-outline" size={16} color="#757575" style={{ marginRight: 4 }} />
                                    <Text style={{ fontSize: 13, color: '#757575', fontWeight: '500' }}>{data.contato}</Text>
                                </View>
                            ) : <View style={{ marginBottom: 8 }} />}

                       
                    
                    { data.setor != undefined && 
                        <Text style={{ fontSize: 14, color: '#666' }}>
                            <Text style={{ fontWeight: 'bold' }}>Setor:</Text> {data.setor}
                        </Text>
                    }
                     <Text style={{ fontSize: 14, color: '#666' }}>
                            <Text style={{ fontWeight: 'bold' }}>Total de itens na lista:</Text> {listaSeparacao.length}
                        </Text>

                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold', marginBottom: 4 }}>Observação:</Text>
                        <TextInput
                            style={{
                                backgroundColor: '#F5F7FA',
                                borderRadius: 8,
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                fontSize: 13,
                                color: '#333',
                                maxHeight: 60,
                                textAlignVertical: 'top'
                            }}
                            placeholder="Adicionar observação na separação..."
                            placeholderTextColor="#999"
                            value={observacao}
                            onChangeText={setObservacao}
                            multiline
                        />
                    </View>
                    </View>
                    

                <FlatList
                    data={listaSeparacao}
                    renderItem={renderProduto}
                    keyExtractor={(item) => item.codigo.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }} 
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <MaterialCommunityIcons name="package-variant-closed" size={50} color="#BDBDBD" />
                            <Text style={{ color: '#999', fontSize: 16, marginTop: 10 }}>Nenhum produto neste pedido.</Text>
                        </View>
                    )}
                />

                {/* BOTÃO FIXO NO RODAPÉ */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFF',
                    padding: 12,
                    paddingBottom: 20,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4
                }}>

                    <FooterActionButton
                        label="Concluir"
                        color="#1E9C43"
                        icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />}
                        onPress={() => openConfirmAction('CONCLUIDA')}
                    />

                    <FooterActionButton
                        label="Pausar"
                        color="#185FED"
                        icon={<Feather name="pause-circle" size={18} color="#FFF" />}
                        onPress={() => openConfirmAction('PAUSADA')}
                    />

                    <FooterActionButton
                        label="Cancelar"
                        color="#9C0404"
                        icon={<AntDesign name="close-circle" size={18} color="#FFF" />}
                        onPress={() => openConfirmAction('RECUSADA')}
                    />

                </View>


                {/* BOTÃO FLUTUANTE DE LEITURA (acima do rodapé) */}
                <TouchableOpacity
                    onPress={() => { setModalvisible(true) }}
                    style={{
                        backgroundColor: '#185FED',
                        width: 56, height: 56,
                        borderRadius: 28,
                        position: "absolute",
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        right: 20,
                        bottom: 90, 
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 99
                    }}
                >
                    <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
                </TouchableOpacity>
            </>
            )}
            {/* SCANNER DE CÓDIGO DE BARRAS */}
            <BarcodeScanner
                visible={modalVisible}
                onClose={() => setModalvisible(false)}
                onBarcodeScanned={(data) => handleCodeRead(data)}
            />
           {
                 data && data.tipo != 6 &&
            <ModalSeries
                codigo_pedido={codigo_pedido}
                setor={data.setor}
                visible={!!selectedProductForSeries}
                codigo_produto={selectedProductForSeries?.codigo ?? 0}
                series={selectedProductForSeries?.series ?? []}
                onClose={() => setSelectedProductForSeries(null)}
                onConfirm={(updatedSeries) => {
                    if (selectedProductForSeries) {
                        const total = updatedSeries.reduce((sum, s) => sum + s.quantidade, 0);
                        setListaSeparacao(prev => prev.map(p =>
                            p.codigo === selectedProductForSeries.codigo
                                ? { ...p, series: updatedSeries, quantidade_separada: total }
                                : p
                        ));
                    }
                    setSelectedProductForSeries(null);
                }}
                maxQuantity={selectedProductForSeries?.quantidade}
            />
                }

        </KeyboardAvoidingView>
    );
}