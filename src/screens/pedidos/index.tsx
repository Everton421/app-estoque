import { Entypo, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../contexts/auth";
import { configMoment } from "../../services/moment";

import { CustomAlert } from "../../components/custom-alert/custom-alert";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { BarcodeScanner } from "../../components/barcode-scanner";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import useApi from "../../services/api";
import { ApiConfig } from "../../types/type-config-api";
import { delay } from "../../utils/delay";
import { ModalFilter } from "./components/modal-filter/modal-filter";
import { ModalPrint } from "./components/modal-print-pedido";
import { verifyUserPermission } from "../../services/verify-user-permissions";

export type pedido = {
    codigo?: number,
    id: number,
    id_externo: number,
    situacao: string,
    situacao_separacao: 'N' | 'P' | 'I', // i= integralmente separado, p= parcialmente separado, n= não separado
    descontos: number,
    vendedor: number,
    forma_pagamento: number,
    enviado: string,
    observacoes: string,
    quantidade_parcelas: number,
    total_geral: number,
    total_produtos: number,
    total_servicos: number,
    cliente: number,
    produtos: produto_pedido[],
    parcelas: parcela[],
    data_cadastro: string,
    data_recadastro: string,
    veiculo: number,
    tipo_os: number,
    tipo: 1 | 2 | 3 | 4 | 5 | 6, // 6 = (pedido de compra );  1 = Orçamento (gerado no sistema); 2 = Orçamento (gerado fora do sistema); 3 = Ordem de Serviço; 4 = Contrato de Prestação de Serviços; 5 = Devolução
    contato: string
    usuario:number,
    usuario_separcao:number
    inicio_separacao:string 
    fim_separacao:string
    status_separacao: 'NAO INICIADA' | 'EM ANDAMENTO' | 'PAUSADA' | 'RECUSADA' | 'CONCLUIDA'
}

export type produto_pedido = {
    codigo: number,
    sequencia: number,
    desconto: number,
    quantidade: number,
    preco: number,
    total: number,
    quantidade_separada: number,
    quantidade_faturada: number
}
export type parcela = {
    pedido: number,
    parcela: number,
    valor: number,
    vencimento: string
}
export type servico_pedido = {
    codigo: number,
    desconto: number,
    quantidade: number,
    valor: number,
    total: number
}

export type seller = {
      codigo: number,
      nome:  string ,
      email: string ,
      cnpj:  string ,
      responsavel:  string ,
      ativo:  string 
}

export type branch = {
     codigo: number,
     nome_fantasia:  string ,
     razao_social:  string ,
     cnpj:  string ,
     ativo: 'S' | 'N'
}


type statusOrderSeparation = 'NAO INICIADA' |  'EM ANDAMENTO' |  'PAUSADA' | 'RECUSADA' | 'CONCLUIDA';

export type filterOrdersituation = '*' | 'EA' | 'AI' | 'FI' | 'FP' | 'RE' | 'BM'

export type typefilterOrders = { 
    tipo: number, 
    data_inicial: string, 
    data_final: string, 
    situacao: filterOrdersituation,
    status_separacao:statusOrderSeparation[] | null
    filial: branch | null, 
    limit: number, 
    search: string 
    vendedor:seller | null
}


export type actionsFilterOrder = 
    | { type: 'switch_status', paylod: filterOrdersituation }
    | { type: 'switch_data_init', paylod: string }
    | { type: 'switch_data_final', paylod: string }
    | { type: 'switch_branch', paylod: branch | null }
    | { type: 'switch_seller', paylod: seller | null }
    | { type: 'switch_all', paylod: typefilterOrders }
    | { type: 'switch_search', paylod: string }
    | { type: 'switch_status_separation', payload:statusOrderSeparation }
    


export const Lista_pedidos = ({ navigation, tipo, to, route }: any) => {
    const useMoment = configMoment();
    const { usuario, permissoes }: any = useContext(AuthContext);
         const [ isEnabledViewerValuesOrder ] =useState( verifyUserPermission('pedidos', 'ver_valores', permissoes) || verifyUserPermission('*', '', permissoes) )

         const getInitialStatus = (): filterOrdersituation => {
                return 'AI';
            };
 
    const initialStateFilter: typefilterOrders = { 
        tipo: tipo, 
        status_separacao: null,
        data_inicial: useMoment.dataAtual(), 
        data_final: useMoment.dataAtual(), 
        situacao: getInitialStatus(),   
        filial: null, 
        limit: 1000000, 
        search: '', 
        vendedor: null
    }   
    
    function hadleEditFilter(state: typefilterOrders, action: actionsFilterOrder) {
        switch (action.type) {
            case 'switch_branch':
                return { ...state, filial: action.paylod }
            case 'switch_search':
                return { ...state, search: action.paylod }
            case 'switch_data_init':
                return { ...state, data_inicial: action.paylod }
            case 'switch_data_final':
                return { ...state, data_final: action.paylod }
            case 'switch_status':
                return { ...state, situacao: action.paylod }
            case 'switch_seller':
                return { ...state, vendedor: action.paylod }
            case 'switch_status_separation': {
                  const currentList = state.status_separacao || [];
                  let updatedList: statusOrderSeparation[];
                        if( currentList.includes(action.payload)){
                            updatedList = currentList.filter((i)=> i !== action.payload);
                        }else{
                            updatedList = [ ...currentList, action.payload]
                        }
                        return {
                            ...state,
                            status_separacao: updatedList.length > 0 ? updatedList : null
                        }
                        } 

            case 'switch_all': 
            return action.paylod
                default:
                return state
        }
    }

    const [orcamentosRegistrados, setOrcamentosRegistrados] = useState([]);
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [visible, setVisible] = useState(false);
    const [orcamentoModal, setOrcamentoModal] = useState();
    const [modalVisible, setModalvisible] = useState(false);
    const [ titleAlert , setTitleAlert ] = useState("");
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState<string>('');
    const [typeAlert, setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
    const [configMobileApi, setConfigMobileApi] = useState<ApiConfig>();
    const [refreshing, setRefreshing] = useState(false);
    const [ filterSearchOrders , dispatch] = useReducer( hadleEditFilter, initialStateFilter )
    const [isloadingOrderData, setIsLoadingOrderData] = useState(false);
    const [filtersLoaded, setFiltersLoaded] = useState(false);
    const api = useApi();
    const useQueryConfigApi = queryConfig_api();

    async function getConfigMobileApi() {
        try {
            setIsLoadingOrderData(true)
            const resultConfigMobileApi = await useQueryConfigApi.select(1);
            if (resultConfigMobileApi && resultConfigMobileApi.length > 0) {
                setConfigMobileApi(resultConfigMobileApi[0]);
            }
        } catch (e) {
        } finally {
            setIsLoadingOrderData(false)
        }
    }



    async function fyndOrderBycode(code: number) {
            try {
                setIsLoadingOrderData(true)
                await delay(500)

                 const responseApiOrder = await api.get(`/pedidos/${code}` );
                
                 if(responseApiOrder.status === 200 ){ 
                    const order = responseApiOrder.data;
                        if( order.status_separacao == 'EM ANDAMENTO' && ( order.usuario_separacao != 0 && order.usuario_separacao != usuario.codigo  )){
                            setVisibleAlert(true)
                            setMessageAlert(`Pedido ${order.codigo} já esta em processo de separação por outro usuario !`)
                            setTypeAlert('warning') 
                            setTitleAlert("Atenção!")
                            return
                        }

                      navigation.navigate('separacao', {
                        codigo_pedido: code,
                    });
                 }

            } catch (e) {
                console.log("[X] Erro ao buscar pedidos na api ", e)
            } finally {
                setIsLoadingOrderData(false)
            }
    } 

    function handleCodeRead(data: string) {
        setModalvisible(false);
        dispatch({ type: 'switch_search', paylod: data });
    }
        
    
    const carregarFiltros = async () => {
            try {
                const filtro = await AsyncStorage.getItem('filtroPedidos');
                if(filtro){
                    let aux = JSON.parse(filtro);
                    aux.tipo = tipo;
                    dispatch({type:'switch_all',paylod: aux })
                }
            } catch (e) {
                console.log("Erro ao carregar filtros do AsyncStorage", e)
            } finally {
                setFiltersLoaded(true)
            }
        };

        
    useEffect(() => {
        getConfigMobileApi();
    }, [])

    useEffect(() => {
        carregarFiltros();
    }, [])

 
     useEffect(() => {
        AsyncStorage.setItem('filtroPedidos', JSON.stringify(filterSearchOrders));
    }, [ filterSearchOrders ])
 
   useEffect(() => {
        busca()
    }, [filtersLoaded, filterSearchOrders, navigation, configMobileApi])

    const buscaRef = useRef(busca);
    buscaRef.current = busca;

    useFocusEffect(
        useCallback(() => {
            buscaRef.current();
        }, [])
    );


    async function busca() {
        setIsLoadingOrderData(true)
        await delay(500)
        try {
            let queryOrder = { 
                ...filterSearchOrders,
                filial:  filterSearchOrders.filial?.codigo,
                vendedor: filterSearchOrders.vendedor?.codigo,
                orderBy: 'codigo'
            } as any;

             if(!filterSearchOrders.filial)  delete queryOrder.filial;   
             if(!filterSearchOrders.vendedor?.codigo)  delete queryOrder.vendedor;   
             if (filterSearchOrders.search) queryOrder.search = filterSearchOrders.search

             if(filterSearchOrders.status_separacao){
                queryOrder.status_separacao = `${[filterSearchOrders.status_separacao]}`;
             }
            const responseApiOrder = await api.get('/pedidos', { params: queryOrder });
            setOrcamentosRegistrados(responseApiOrder.data);
        } catch (e) {
            console.log("[X] Erro ao buscar pedidos na api ", e)
        } finally {
            setIsLoadingOrderData(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await busca();
        setRefreshing(false);
    };

 

    async function selecionaOrcamentoModal(item: any) {
            try {
                     setIsLoadingOrderData(true)
                    const responseApiOrder = await api.get(`/pedidos/${item.codigo}`);
                    const dataOrderRequest =responseApiOrder.data as pedido;
                       setOrcamentoModal(dataOrderRequest as any) ;
             
                } catch (e) {
                    console.log("[X] Erro ao buscar pedidos na api ", e)
                } finally {
                     setIsLoadingOrderData(false)
                }
    
        setVisibleModal(true)
    }
    

    const getStatusParams = (situacao: string) => {
        switch (situacao) {
            case 'EA': return { color: '#1E9C43', label: 'Orçamento' };
            case 'AI': return { color: '#307CEB', label: 'Pedido' };
            case 'FI': return { color: '#FF7F27', label: 'Faturado' };
            case 'RE': return { color: '#9C0404', label: 'Reprovado' };
            case 'FP': return { color: '#0023F5', label: 'Parcial' };
            case 'BM': return { color: '#474747', label: 'Baixa Manual' };
            default: return { color: '#999999', label: 'Desconhecido' };
        }
    }

    const getSeparacaoParams = (situacao_separacao: string, situacao: string) => {
        switch (situacao_separacao) {
            case 'I': return { color: '#4CAF50', label: 'Separado' , id:'I', icon: <MaterialCommunityIcons name="package-variant-closed-check" size={20} color="#4CAF50" /> };
            case 'P': return { color: '#FF9800', label: 'Sep. Parcial' , id:'P' ,icon:<MaterialCommunityIcons name="package-variant-minus" size={20} color="#f29408" />};
            case 'N':
            default: return { color: '#E3F2FD', label: 'N. Separado', id:'N' ,icon:<MaterialCommunityIcons name="package-variant-plus" size={20} color="#185FED" />};
        }
    }
    const calcularTempoSeparacao = (inicio:string, fim:string) => {
        if (!inicio || !fim) return "N/A";
            const dataInicio = new Date(inicio) as any;
            const dataFim = new Date(fim)as any;
            const diferencaMs = Math.abs(dataFim - dataInicio);
            const segundos = Math.floor(diferencaMs / 1000) % 60;
            const minutos = Math.floor(diferencaMs / (1000 * 60)) % 60;
            const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    };



    const ItemOrcamento = ({ item, pedido }: { item: any, pedido: any }) => {
        const status = getStatusParams(item.situacao);
        const separacao = getSeparacaoParams(item.situacao_separacao, item.situacao);


        return (
            <View style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 15,
                marginVertical: 8,
                padding: 15,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                borderLeftWidth: 5,
                borderLeftColor: status.color
            }}>
                       
                 { /**     <View style={{ width: 12, height: 12, alignSelf:'flex-start',backgroundColor: status.color,bottom:10, borderRadius: 6 }} />*/}

                <View style={{flex:1, justifyContent:"space-between", flexDirection:"row"  }}>
                    
                     <Text style={{ fontSize: 13, color: '#666', fontWeight: 'bold', flex: 1 }}>
                        ID: {item.id || item.codigo || item.id_externo }  
                     </Text>
                        <View style={{  backgroundColor: '#307CEB' + '20', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6 ,marginHorizontal:3}}>
                               {separacao.icon}
                       </View>

                        <View style={{  backgroundColor: '#307CEB' + '20', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 10,justifyContent:'center',  color: '#185FED', fontWeight: 'bold', flex: 1 }}>
                                 <MaterialCommunityIcons name="store-check" size={20} color='#185FED' /> Filial {  item.filial}    
                           </Text>
                       </View>

                   {
                    item.tipo == 3 ?
                        <View style={{alignItems:"center", justifyContent:"center", backgroundColor: '#307CEB' + '20',marginHorizontal:3, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 10,justifyContent:'center',  color: '#185FED', fontWeight: 'bold', flex: 1 }}>
                                Os <FontAwesome5 name="tools" size={16} color="#185FED" />
                            </Text>
                       </View>
                    :
                        <View style={{alignItems:"center", justifyContent:"center", backgroundColor: '#307CEB' + '20',marginHorizontal:3, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 10,justifyContent:'center',  color: '#185FED', fontWeight: 'bold', flex: 1 }}>
                              Venda <MaterialCommunityIcons name="cart-check" size={18} color="#185FED" />
                            </Text>
                       </View>
                  }
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: 10, marginVertical:2 }}>
                </View>

                {
                    pedido.operacao == 'V' ? 
                    (
                <Text style={{ fontSize: 16, fontWeight: "bold", color: '#333', marginBottom: 2 }} numberOfLines={1}>
                    {item?.cliente?.nome }
                </Text>
                    ):(
                <Text style={{ fontSize: 16, fontWeight: "bold", color: '#333', marginBottom: 2 }} numberOfLines={1}>
                    {item?.fornecedor?.nome  }
                </Text>
                    )
                }
              

                {item.contato ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialCommunityIcons name="storefront-outline" size={16} color="#757575" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: '#757575', fontWeight: '500' }}>{item.contato}</Text>
                    </View>
                ) : <View style={{ marginBottom: 8 }} />}


                 {item.endereco ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialCommunityIcons name="location-enter" size={16} color="#757575" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: '#757575', fontWeight: '500' }}>{item.endereco}</Text>
                    </View>
                ) : <View style={{ marginBottom: 8 }} />}

                    {
                        isEnabledViewerValuesOrder ? (
                      <Text style={{ fontSize: 18, fontWeight: "bold", color: '#185FED', marginBottom: 10 }}>Total: R$ {Number(item?.total_geral).toFixed(2)}  </Text>
                         ) :(
                            <MaterialIcons name="money-off" size={35} color="#185FED" />  
                        )
                    }

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Criado: {new Date(item?.data_cadastro).toLocaleDateString("pt-br", { timeZone: 'UTC' })}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                        Modificado: {new Date(item?.data_recadastro).toLocaleTimeString("pt-br", { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
        

                {/* --- RODAPÉ DE AÇÕES --- */}
                <View style={{  borderTopWidth: 1,top:10, borderTopColor: '#F0F0F0', paddingTop: 7, paddingBottom:5 }}>
                   
                    <View style={{ flexDirection: 'row' , gap: 10, justifyContent: 'space-between' }}>
                       

                        {item.situacao === 'AI' &&  
                            (
                                <>
                                { item.status_separacao === 'NAO INICIADA' && 
                                    <View style={{  flex:1}}>
                                        <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                                            <TouchableOpacity onPress={() => fyndOrderBycode(pedido.codigo)}  
                                            style={{ padding: 8, backgroundColor: '#E3F2FD',    elevation:2, borderRadius: 8, flexDirection:"row", alignItems:"center"  }} 
                                            >
                                               <Text style={{fontWeight:'bold', fontSize: 12, color: '#185FED' }}>Iniciar Separação</Text>
                                                <MaterialCommunityIcons name="package-variant" size={18} color="#185FED" />
                                            </TouchableOpacity>
                                              <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 8,alignSelf:'flex-start', backgroundColor: '#E3F2FD', borderRadius: 8 ,elevation:2, }}>
                                                        <Feather name="eye" size={20} color="#185FED" />
                                                </TouchableOpacity>
                                            </View>
                                    </View>

                                } 

                                { item.status_separacao === 'EM ANDAMENTO' && 
                                    <View style={{  flex:1}}>
                                       <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                                        <TouchableOpacity 
                                            onPress={() =>{ usuario.codigo == pedido.usuario_separacao && fyndOrderBycode(pedido.codigo) } } 
                                        style={{alignItems:"center", justifyContent:"center",flexDirection:"row", padding: 8, backgroundColor: '#1E9C43' + '10', borderRadius: 8 }}>
                                            <Text style={{fontWeight:'bold', fontSize: 12, color: '#1E9C43' }}> Em Separação</Text>
                                              <Feather name="loader" size={20} color='#1E9C43' />
                                        </TouchableOpacity>
                                              <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 8,alignSelf:'flex-start', backgroundColor: '#E3F2FD', borderRadius: 8 ,elevation:2, }}>
                                                <Feather name="eye" size={20} color="#185FED" />
                                              </TouchableOpacity>
                                        </View>

                                      <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                                        <Text style={{ fontSize: 11, color: '#999'  }}>
                                            Inicio separação: {new Date(item?.inicio_separacao).toLocaleDateString("pt-br", { timeZone: 'UTC' })}
                                        </Text>
                                            <Text style={{ textAlign:'right', fontSize: 11, color: '#999'  }}>
                                                Separador:  {item.usuario_separacao}
                                            </Text>
                                      </View>
                                    </View>
                                } 

                                { item.status_separacao === 'PAUSADA' && 
                                    
                                   <View style={{  flex:1}}>
                                       <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between" , }}>
                                        <TouchableOpacity  onPress={() => fyndOrderBycode(pedido.codigo)}   
                                        style={{ padding: 8, backgroundColor: '#eff9f2',    elevation:2, borderRadius: 8, flexDirection:"row", alignItems:"center"  }}>
                                            <Text style={{fontWeight:'bold', fontSize: 12, color: '#1E9C43' }}>Separação pausada</Text>
                                            <Entypo name="controller-play" size={20} color='#1E9C43'  />
                                        </TouchableOpacity>
                                              <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 8,alignSelf:'flex-start', backgroundColor: '#E3F2FD', borderRadius: 8 ,elevation:2, }}>
                                                <Feather name="eye" size={20} color="#185FED" />
                                        </TouchableOpacity>
                                      </View>

                                     <View style={{flexDirection:"row", alignItems:"center",marginTop:5, justifyContent:"space-between"}}>
                                        <Text style={{ fontSize: 11, color: '#999'  }}>
                                            Inicio separação: {new Date(item?.inicio_separacao).toLocaleDateString("pt-br", { timeZone: 'UTC' })}
                                        </Text>
                                            <Text style={{ textAlign:'right', fontSize: 11, color: '#999'  }}>
                                                Separador:  {item.usuario_separacao}
                                            </Text>
                                      </View>
                                    </View>
                                 
                                }
                                  { item.status_separacao === 'RECUSADA' && 
                                    <>
                                      <View style={{  flex:1}}>
                                       <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                                           <TouchableOpacity onPress={() => fyndOrderBycode(pedido.codigo)}  style={{ padding: 8, backgroundColor: '#E3F2FD'  ,elevation:2, borderRadius: 8, flexDirection:"row", alignItems:"center", }}>
                                               <Text style={{fontWeight:'bold', fontSize: 12, color: '#185FED' }}>Iniciar Separação</Text>
                                                <MaterialCommunityIcons name="package-variant" size={21} color="#185FED" />
                                            </TouchableOpacity>
                                              <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 8,alignSelf:'flex-start', elevation:2, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                                                <Feather name="eye" size={20} color="#185FED" />
                                              </TouchableOpacity>
                                      </View>
                                           <View  style={{ padding: 4   ,marginTop: 5, borderRadius: 8, flexDirection:"row", alignItems:"center",width:'70%' }}>
                                                <MaterialCommunityIcons name="package-variant-closed-remove" size={18} color="#b82121" />
                                               <Text style={{ marginLeft:4, fontWeight:'bold', fontSize: 10, color: '#b82121' }}>Separação recusada separador: {item.usuario_separacao} </Text>
                                            </View>
                                    </View>
                                    </>

                                }
                                  { item.status_separacao === 'CONCLUIDA' && 
                                   <View style={{  flex:1}}>
                                       <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                                        <TouchableOpacity   style={{ padding: 8, backgroundColor: '#eff9f2'  ,elevation:2, borderRadius: 8, flexDirection:"row", alignItems:"center", }} 
                                            onPress={() =>{ usuario.codigo == pedido.usuario_separacao && fyndOrderBycode(pedido.codigo) } } 
                                        >
                                            <Text style={{fontWeight:'bold', fontSize: 12, color: '#1E9C43' }}>Separação Concluída</Text>
                                            <MaterialCommunityIcons name="package-variant-closed-check" size={21} color="#1E9C43" />
                                        </TouchableOpacity>
                                              <TouchableOpacity onPress={() => selecionaOrcamentoModal(item)} style={{ padding: 8,alignSelf:'flex-start',elevation:2, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                                                <Feather name="eye" size={20} color="#185FED" />
                                              </TouchableOpacity>
                                      </View>
                                     <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                                        <Text style={{ fontSize: 11, color: '#999',marginTop:5  }}>
                                            Tempo separação: { calcularTempoSeparacao(item?.inicio_separacao,item?.fim_separacao ) }
                                        </Text>
                                            <Text style={{ textAlign:'right', fontSize: 11, color: '#999'  }}>
                                                Separador:  {item.usuario_separacao}
                                            </Text>
                                      </View>
                                    </View>
                                }
                             </>
                            )
                        }
                    </View>
                
                </View>
            </View>
        )
    }

    function switchTipoOrder(tipo:number){
        switch ( tipo ) {
            case 1:
                 return 'Pedidos';       
             break;
            case 2: 
                return 'Pedidos';       
             break;
             case 3 : 
                return 'OS';
             break;
            case 4 : 
               return 'Contratos';
            break;
            case 5 : 
               return 'Devolução';
            break;
            case 6 : 
               return 'Ordem de Compra';
            break;

            default: return 'Pedidos'
                break;
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }} >

            <CustomAlert
                visible={visibleAlert}
                message={messageAlert}
                onConfirm={() => setVisibleAlert(false)}
                title={titleAlert}
                type={typeAlert}
            />
            <CustomHeader
                title={switchTipoOrder(tipo)}
                onBack={() => navigation.goBack()}
                showSearch={true}
                searchValue={filterSearchOrders.search}
                onSearchChange={(value) => dispatch({ type:'switch_search', paylod: value})}
                searchPlaceholder="Pesquisar..."
                showFilter={true}
                onFilterPress={() => setVisible(true)}
                searchLeftElement={
                    <TouchableOpacity onPress={() => setModalvisible(true)}>
                        <MaterialCommunityIcons name="barcode-scan" size={28} color="#185FED" />
                    </TouchableOpacity>
                }
            />



            <ModalFilter
                setFilter={dispatch}
                filter={filterSearchOrders}
                visible={visible}
                setVisible={setVisible}
            />

            <ModalPrint visible={visibleModal} orcamento={orcamentoModal} setVisible={setVisibleModal} />
            {
                  isloadingOrderData ?
                    (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
                            <ActivityIndicator color='#185FED' size={50} />
                        </View>
                    ) :
                    (
                        <>
                            <FlatList
                                data={orcamentosRegistrados}
                                renderItem={({ item }) => <ItemOrcamento item={item} pedido={item} />}
                                keyExtractor={(item: any) => item.codigo.toString()}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={['#185FED']}
                                        tintColor="#185FED"
                                    />
                                }
                                ListEmptyComponent={() => (
                                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                                        <Text style={{ color: '#999', fontSize: 16 }}>Nenhum registro encontrado.</Text>
                                    </View>
                                )}
                            />

                            <View style={{
                                backgroundColor: '#FFF',
                                padding: 10,
                                borderTopWidth: 1,
                                borderTopColor: '#E0E0E0',
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                elevation: 10
                            }}>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#1E9C43', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Orçamento</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#307CEB', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Pedido</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#FF7F27', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Faturado</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#0023F5', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Parcial</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#9C0404', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Reprovado</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#474747', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Baixa Manual</Text>
                                </View>


                            </View>
                        </>
                    )
            }
            {/* SCANNER DE CÓDIGO DE BARRAS */}
            <BarcodeScanner
                visible={modalVisible}
                onClose={() => setModalvisible(false)}
                onBarcodeScanned={(data) => handleCodeRead(data)}
            />

        </View>
    )
}