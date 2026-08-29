import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import { useContext, useEffect, useReducer, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";

import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";
import { CustomHeader } from "../../components/custom-header/custom-header";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { delay } from "../../utils/delay";
import { ModalFilterRequirement } from "./components/modal-filter-requeriment/modal-filter-requirement";
import { ModalPrintRequirement } from "./components/modal-print-requirement";
import { AuthContext } from "../../contexts/auth";
import { verifyUserPermission } from "../../services/verify-user-permissions";
 

export type seller = {
      codigo: number,
      nome:  string ,
      email: string ,
      cnpj:  string ,
      responsavel:  string ,
      ativo:  string 
}

type requirement = {
     codigo: number,
     data_requerimento:  string ,
     requerente:  number,
     data_efetuacao:  string ,
     responsavel:  number,
     pedido: null | number,
     setor_origem: number,
     setor_destino: number,
     historico:  string ,
     situacao:  string ,
     itens: [
      {
         produto: number,
         quantidade: number,
         custo: null | number,
         lotes_series: [
          {
             lote_serie :  number,
             quantidade : number
          }
        ]
      }
    ]
}

export type statusRequeriment = 'A' | 'E' | 'C'

export type applicantSelected = {
    codigo: number
    nome: string
}

export type setorSelected = {
    codigo: number
    descricao: string
}

export type filterRequeriment = {
    status: statusRequeriment | null
    data_init: string
    origin_sector: setorSelected | null
    applicant: applicantSelected | null
    destination_sector: setorSelected | null
    limit: number
    search: null | string
}

export type actionsFilterRequeriment =
    { type: 'switch_status', payload: statusRequeriment | null }
    | { type: 'switch_data_init', payload: string }
    | { type: 'switch_destination_sector', payload: setorSelected }
    | { type: 'switch_origin_sector', payload: setorSelected }
    | { type: 'switch_applicant', payload: applicantSelected }
    | { type: 'switch_limit', payload: number }
    | { type: 'switch_search', payload: string }

function handleEditFilter(state: filterRequeriment, action: actionsFilterRequeriment) {
    switch (action.type) {
        case 'switch_applicant':
            return { ...state, applicant: action.payload }
        case 'switch_data_init':
            return { ...state, data_init: action.payload }
        case 'switch_destination_sector':
            return { ...state, destination_sector: action.payload }
        case 'switch_origin_sector':
            return { ...state, origin_sector: action.payload }
        case 'switch_status':
            return { ...state, status: action.payload }
        case 'switch_search':
            return { ...state, search: action.payload }

        case 'switch_limit':
            return { ...state, limit: action.payload }
    }
}


export const Lista_requerimentos = ({ navigation  }: any) => {
    const useMoment = configMoment();
        const { usuario, permissoes }: any = useContext(AuthContext);

    const [requiriments, setRequeriments] = useState<requirement[]>([]);

    const [refreshing, setRefreshing] = useState(false);
    
    const [visiblePrintModal, setVisiblePrintModal] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<requirement | null>(null);

    const [isloadingOrderData, setIsLoadingOrderData] = useState(false);
    const [visibleFilterModal, setVisibleFilterModal] = useState(false);

    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [typeAlert, setTypeAlert] = useState<AlertType>('info');

    const [visibleAlertApplyRequirement, setVisibleAlertApplyRequirement] = useState(false);
 

    const [ isEnabledViewerRequirements ] = useState( verifyUserPermission("requerimentos", 'ler', permissoes))
    const [ isEnabledCreateRequirement ] = useState( verifyUserPermission("requerimentos", 'criar', permissoes))
    const [ isEnabledEditRequirement ] = useState( verifyUserPermission("requerimentos", 'editar', permissoes))
        
     


    const initialStateFilter: filterRequeriment = {
        applicant: null,
        data_init: useMoment.dataAtual(),
        destination_sector: null,
        limit: 50,
        origin_sector: null,
        status: 'A',
        search: null
    };

    const [filterSearchRequirement, dispatch] = useReducer(handleEditFilter, initialStateFilter)

    const api = useApi();

 
  
    async function busca() {
        setIsLoadingOrderData(true)
        await delay(700);
        let params = {
                 limit: filterSearchRequirement.limit,
                 alterado_apos: filterSearchRequirement.data_init,
                } as any;
                
                if(filterSearchRequirement.origin_sector) params = { ...params, setor_origem: filterSearchRequirement.origin_sector.codigo} ;
                if(filterSearchRequirement.destination_sector) params = { ...params, setor_destino: filterSearchRequirement.destination_sector.codigo} ;
                if(filterSearchRequirement.applicant) params = { ...params, requerente: filterSearchRequirement.applicant.codigo} ;
                if(filterSearchRequirement.search)params = { ...params, search: filterSearchRequirement.search} ;
                if( filterSearchRequirement.status)params = { ...params, situacao: filterSearchRequirement.status} ;

        try {
            const responseApiOrder = await api.get('/requirements', {
                params 
            });
            setRequeriments(responseApiOrder.data);
        } catch (e:any) {
            console.log("[X] Erro ao buscar requerimentos na api ", e.response.data)
        } finally {
            setIsLoadingOrderData(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await busca();
        setRefreshing(false);
    };

    useEffect(() => {
        busca()
    }, [navigation, filterSearchRequirement])
 


 
        async function applyRequirement (codigo:number){
        try{

            await delay(1000,' Efetuar requerimento ');
             const resultApllyRequirement = await api.post(`/requirements/${codigo}/efetuar`);

                if(resultApllyRequirement.status == 200){
                    setVisibleAlert(true);
                    setTitleAlert(`Sucesso!`);
                    setTypeAlert('success');
                    setMessageAlert(`Requerimento ${codigo} efetuado com sucesso!`);
                }
        }catch(e:any){
                  setVisibleAlert(true);
                    setTitleAlert(`Erro!`);
                    setTypeAlert('error');
                    setMessageAlert(`Erro ao efetuar requerimento ${codigo} ! \n ${e.response.data.message}`);
        } 
    }
     
    async function handleApplyRequirement( codigo: number ){
            setVisibleAlertApplyRequirement(true)
                    setTitleAlert(`Atenção!`);
                    setTypeAlert('warning');
                    setMessageAlert(`Deseja efetuar requerimento ${codigo} ? `);
    }


    const getSituationsParams = (situacao: string) => {
        switch (situacao) {
            case 'A': return { color: '#1E9C43', label: 'Em Aberto' };
            case 'E': return { color: '#307CEB', label: 'Efetuado' };
            case 'C': return { color: '#9C0404', label: 'Cancelado' };
            default: return { color: '#999999', label: 'Desconhecido' };
        }
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const ItemRequirements = ({ item }: { item: requirement }) => {
        const situation = getSituationsParams(item.situacao);
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
                borderLeftColor: situation.color
            }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                            #{item.codigo}
                        </Text>
                        {item.pedido ? (
                            <Text style={{ fontSize: 12, color: '#757575', marginTop: 2 }}>
                                Pedido: {item.pedido}
                            </Text>
                        ) : null}
                    </View>
                    <View style={{ backgroundColor: situation.color + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ color: situation.color, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {situation.label}
                        </Text>
                    </View>
                </View>

                <View style={{ gap: 8, marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="calendar" size={13} color="#888" />
                        <Text style={{ fontSize: 12, color: '#888' }}>
                            {formatDate(item.data_requerimento)}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="arrow-right-circle" size={22} color="#1E9C43" />
                        <Text style={{ fontSize: 13, color: '#555' }}>Origem: </Text>
                        <Text style={{ fontSize: 13, color: '#1E9C43', fontWeight: '500' }}>{item.setor_origem}</Text>
                        <Feather name="arrow-left-circle" size={22} color="#C62828" />
                        <Text style={{ fontSize: 15, color: '#555' }}>Destino: </Text>
                        <Text style={{ fontSize: 15, color: '#C62828', fontWeight: '500' }}>{item.setor_destino}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="user" size={13} color="#888" />
                        <Text style={{ fontSize: 13, color: '#757575' }}>Req: {item.requerente}</Text>
                        {item.responsavel > 0 && (
                            <Text style={{ fontSize: 13, color: '#757575' }}>
                                | Resp: {item.responsavel}
                            </Text>
                        )}
                    </View>
                    {item.historico ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Feather name="file-text" size={13} color="#888" />
                            <Text style={{ fontSize: 12, color: '#999' }} numberOfLines={1}>
                                {item.historico}
                            </Text>
                        </View>
                    ) : null}
                    {item.data_efetuacao ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Feather name="check-circle" size={13} color="#307CEB" />
                            <Text style={{ fontSize: 12, color: '#307CEB', fontWeight: '500' }}>
                                Efetuado em: {formatDate(item.data_efetuacao)}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 }}>
                    <View style={{ backgroundColor: '#F0F4FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>
                            {item.itens.length} {item.itens.length === 1 ? 'item' : 'itens'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {item.situacao === 'A' && (
                            <TouchableOpacity
                                onPress={() =>{ 
                                    isEnabledEditRequirement ? 
                                     navigation.navigate('novoRequerimento', { codigo: item.codigo })
                                    :
                                    setVisibleAlert(true);
                                    setTitleAlert("Atenção!");
                                    setTypeAlert('warning');
                                    setMessageAlert("Você não tem permissão para editar novos requerimentos!");
                                }
                            }

                                style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                                <FontAwesome name="pencil" size={18} color="#185FED" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => { setSelectedRequirement(item); setVisiblePrintModal(true); }}
                            style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                            <Feather name="eye" size={18} color="#185FED" />
                        </TouchableOpacity>

                        {
                            item.situacao == 'A' && 
                     <TouchableOpacity
                             onPress={() => {
                                     setSelectedRequirement(item); 
                                    handleApplyRequirement(item.codigo); 
                                }}
                            style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                        <FontAwesome5 name="check-circle" size={18} color="#185FED" />
                        </TouchableOpacity>
                        }
                       
                    </View>
                </View>
            </View>
        )
    }


function handlesCreateRequirement (){
        isEnabledCreateRequirement ?     
                        navigation.navigate('novoRequerimento')
                        :
                      setVisibleAlert(true);
                      setTitleAlert("Atenção!");
                      setTypeAlert('warning');
                      setMessageAlert("Você não tem permissão para criar novos requerimentos!");
   }

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }} >

            <CustomHeader
                title={'Requerimentos'}
                onBack={() => navigation.goBack()}
                showSearch={true}
                searchPlaceholder="Pesquisar..."
                showFilter={true}
                onFilterPress={() => setVisibleFilterModal(true)}
                searchValue={filterSearchRequirement.search || ''}
                 onSearchChange={(str)=> dispatch({ type:'switch_search', payload: str})}
            />

            <ModalPrintRequirement
                visible={visiblePrintModal}
                requirement={selectedRequirement}
                setVisible={setVisiblePrintModal}
            />
            <ModalFilterRequirement
                dispatch={dispatch}
                filter={filterSearchRequirement}
                setVisible={setVisibleFilterModal}
                visible={visibleFilterModal}
            />

          <TouchableOpacity
                    style={{position: 'absolute',bottom: 50,right: 30,backgroundColor: '#185FED',width: 56,height: 56,borderRadius: 28,justifyContent: 'center',alignItems: 'center',elevation: 6,shadowColor: '#000',shadowOpacity: 0.3,shadowOffset: { width: 0, height: 3 },zIndex: 999
                    }}
                    onPress={() => {
                      handlesCreateRequirement()
                    }}
                >
                    <MaterialIcons name="add" size={32} color="#FFF" />
                </TouchableOpacity>

            {
                isloadingOrderData ?
                    (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
                            <ActivityIndicator color='#185FED' size={50} />
                        </View>
                    ) :
                    (
                         isEnabledViewerRequirements ? 
                            <FlatList
                                data={requiriments}
                                renderItem={({ item }) => <ItemRequirements item={item}  />}
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
                                    <View style={{ flex:1, alignItems: 'center', justifyContent:"center" }}>
                                        <Text style={{ color: '#999', fontSize: 16 }}>Nenhum registro encontrado.</Text>
                                    </View>
                                )}
                            />
                     :
                    <View style={{flex:1, alignItems:"center", justifyContent:"center" }}>
                            <Text style={{ fontWeight:"bold", color:'#999'}}>Você não tem permissão para ver os requerimentos!</Text>
                    </View>
                        
                    )
            }
            <View style={{backgroundColor: '#FFF',padding: 10,borderTopWidth: 1,borderTopColor: '#E0E0E0',flexDirection: 'row',justifyContent: 'space-around',alignItems: 'center',elevation: 10 }}>      
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#1E9C43', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Em Aberto</Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#307CEB', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Efetuado</Text>
                                </View>
                                
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: '#9C0404', borderRadius: 6, marginBottom: 2 }} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>Cancelado</Text>
                                </View>
                            </View>

            <CustomAlert
                message={messageAlert}
                onConfirm={ 
                     ()=>  { applyRequirement(selectedRequirement?.codigo!)
                        setVisibleAlertApplyRequirement(false);
                    }}
                title={titleAlert}
                visible={visibleAlertApplyRequirement}
                cancelText='Não'
                confirmText='Sim'
                onCancel={()=> { setVisibleAlertApplyRequirement(false) 

                }}
            />


                { /** se o alerta for do tipo info   */}
                {
                   visibleAlert && typeAlert == 'warning' ?
                    <CustomAlert
                        message={messageAlert}
                        onConfirm={ ()=>{ 
                            setVisibleAlert(false)
                          //  onRefresh()    
                        }
                        }
                        title={titleAlert}
                        visible={visibleAlert}
                    />:

       <CustomAlert
                message={messageAlert}
                onConfirm={ ()=>{ 
                    setVisibleAlert(false)
                      onRefresh()    
                }
                }
                title={titleAlert}
                visible={visibleAlert}
                 cancelText='Não'
                confirmText='Sim'
            />
                }

        </View>
    )
}