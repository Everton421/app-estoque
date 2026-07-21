import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import { useCallback, useEffect, useReducer, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";

import { CustomHeader } from "../../components/custom-header/custom-header";
import useApi from "../../services/api";
import { ModalPrintRequirement } from "./components/modal-print-requirement";
import { useFocusEffect } from "@react-navigation/native";
import { ModalFilterRequirement } from "./components/modal-filter-requeriment/modal-filter-requirement";
import { configMoment } from "../../services/moment";
 

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

    const [requiriments, setRequeriments] = useState<requirement[]>([]);

    const [refreshing, setRefreshing] = useState(false);
    
    const [visiblePrintModal, setVisiblePrintModal] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<requirement | null>(null);

    const [isloadingOrderData, setIsLoadingOrderData] = useState(false);
    const [visibleFilterModal, setVisibleFilterModal] = useState(false);

    const initialStateFilter: filterRequeriment = {
        applicant: null,
        data_init: useMoment.dataAtual(),
        destination_sector: null,
        limit: 50,
        origin_sector: null,
        status: null,
        search: null
    };

    const [filterSearchRequirement, dispatch] = useReducer(handleEditFilter, initialStateFilter)

    const api = useApi();

 
  
    async function busca() {
        setIsLoadingOrderData(true)
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
                                onPress={() => navigation.navigate('novoRequerimento', { codigo: item.codigo })}
                                style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                                <FontAwesome name="pencil" size={18} color="#185FED" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => { setSelectedRequirement(item); setVisiblePrintModal(true); }}
                            style={{ padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                            <Feather name="eye" size={20} color="#185FED" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
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
                    style={{
                        position: 'absolute',
                        bottom: 50,
                        right: 30,
                        backgroundColor: '#185FED',
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        justifyContent: 'center',
                        alignItems: 'center',
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOpacity: 0.3,
                        shadowOffset: { width: 0, height: 3 },
                        zIndex: 999
                    }}
                    onPress={() => {
                        navigation.navigate('novoRequerimento')
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
                        <>
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
                        </>
                    )
            }
        
        </View>
    )
}