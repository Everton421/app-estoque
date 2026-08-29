import { AntDesign, Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { ModalFilter } from "./components/modal-filter";
import { delay } from "../../utils/delay";
import { AuthContext } from "../../contexts/auth";
import { verifyUserPermission } from "../../services/verify-user-permissions";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";

type resultQueryMov = {
    data_recadastro: string
    codigo_produto: number
    descricao_produto: string
    quantidade_movimento: number
    codigo_setor: number
    historico_movimento: string
    codigo_movimento: number
    descricao_setor: string
    entrada_saida: 'E' | 'S'
    unidade_medida: string
}
type resultMovRequest = {
     codigo: number,
     setor : {
      codigo : number,
       id : string,
       descricao : string,
     },
     id : string,
     produto : {
       codigo : number,
       id : string,
       descricao : string,
       unidade_medida : string
    },
     unidade_medida : string,
     ent_sai : string,
     quantidade : number,
     tipo : string,
     historico : string,
     data_recadastro : string,
     usuario : 1,
     id_setor : string,
     id_produto : string
  }

  type typeEnt_sai = 'S' | 'E' | '*'

export const Acertos = ({ navigation }: any) => {
    const moment = configMoment();
    const api = useApi();

    const [loadingData, setLoadinData] = useState(false);
    const [dataMovimet, setDataMoviment] = useState<resultMovRequest[] | []>([]);
    const [pesquisa, setPesquisa] = useState<string>('');
    const [visibleFilter, setVisibleFilter] = useState(false);
    const [tipoMovimento, setTipoMovimento] = useState<typeEnt_sai>('*');
    const [dateFilter, setDateFilter] = useState(moment.dataAtual());
    const [refreshing, setRefreshing] = useState(false);

    const { usuario, permissoes }: any = useContext(AuthContext);

    const [ isEnabledCreateInventoryAdjustment ] = useState( verifyUserPermission("acertos", 'criar', permissoes))
    const [ isEnabledViewerInventoryAdjustment ] = useState( verifyUserPermission("acertos", 'ler', permissoes))

       const [visibleAlert, setVisibleAlert] = useState(false);
        const [messageAlert, setMessageAlert] = useState('');
        const [titleAlert, setTitleAlert] = useState('');
        const [typeAlert, setTypeAlert] = useState<AlertType>('info');
    

    async function buscaPorDescricao() {
        try {

          const dataFiltro =  await getFitroAcertos()

            setLoadinData(true);
                    await delay(700)
                    let params:any = { 
                                ent_sai: dataFiltro?.ent_sai,
                                data_recadastro: dataFiltro?.data_recadastro
                    }

                    if(pesquisa){
                        params.search = pesquisa
                    }
                const result = await api.get('/movimentos_produtos/search', 
                        {
                            params 
                        }
                    );
                        setDataMoviment(result.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadinData(false);
        }
    }

     const getFitroAcertos = async () => {
        try {

            const valueFilterDataCadastro = await AsyncStorage.getItem('dataAcertos');
            const valueFilterEnt_sai = await AsyncStorage.getItem('ent_sai');
            
            let resultFilter = { data_recadastro: moment.dataAtual() , ent_sai: '*'}

            if (valueFilterDataCadastro !== null) {
                resultFilter.data_recadastro = valueFilterDataCadastro
            } else {
                await AsyncStorage.setItem('dataAcertos', moment.dataAtual());
            }

            if(valueFilterEnt_sai != null){
                    resultFilter.ent_sai = valueFilterEnt_sai;
            }else{
                await AsyncStorage.setItem('ent_sai', '*');
            }
            setDateFilter(resultFilter.data_recadastro)
            setTipoMovimento(resultFilter.ent_sai as any);
            return resultFilter
        } catch (e) {
            console.log("erro ao consultar AsyncStorage",e )
        }
    }



    const saveDateFilter = async ( dataToSave ?:string  )=>{
        try {
       
        if( dataToSave){
             await AsyncStorage.setItem('dataAcertos', moment.formatarData(dataToSave));
                setDateFilter(dataToSave);
        }
        
            } catch (e) {
            console.log("erro ao tentar salvar filtros do acerto no AsyncStorage")
        }

    }

     const saveFilter = async (  ent_sai?:typeEnt_sai )=>{
        try {
       
        if(ent_sai){
                await AsyncStorage.setItem('ent_sai', ent_sai);
            setTipoMovimento(ent_sai)
            }
            } catch (e) {
            console.log("erro ao tentar salvar filtros do acerto no AsyncStorage")
        }

    }

    
    useFocusEffect(
        React.useCallback(() => {
            buscaPorDescricao( );
            return () => { };
        }, [])
    );

  const onRefresh = async () => {
        setRefreshing(true);
          buscaPorDescricao( );
        setRefreshing(false);
    };

    useEffect(() => {
        buscaPorDescricao( );
    }, [pesquisa, tipoMovimento, dateFilter]);

    const getStatusColor = (tipo: string) => {
        return tipo === 'E' ? '#4CAF50' : '#E53935';
    };

    const getStatusIcon = (tipo: string) => {
        return tipo === 'E' ? 'arrow-up-circle' : 'arrow-down-circle';
    };


    function handleCreateInventoryAdjustment (){
        isEnabledCreateInventoryAdjustment ?     
                       navigation.navigate('novo_acerto') 
                        :
                      setVisibleAlert(true);
                      setTitleAlert("Atenção!");
                      setTypeAlert('warning');
                      setMessageAlert("Você não tem permissão para criar novos acertos!");
   }


    // --- RENDER ITEM (MANTIDO E ADAPTADO AO ESTILO INLINE) ---
    function renderItem({ item }: { item: resultMovRequest }) {
        const isEntrada = item.ent_sai === 'E';
        const colorStatus = getStatusColor(item.ent_sai);

        return (
            <TouchableOpacity style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 10,
                marginVertical: 6,
                padding: 12,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                borderLeftWidth: 5,
                borderLeftColor: colorStatus
            }}>
                {/* Cabeçalho do Card: ID e Data */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#9E9E9E', fontWeight: 'bold' }}>#{item.codigo}</Text>
                    <Text style={{ fontSize: 12, color: '#757575' }}>
                        {new Date(item.data_recadastro).toLocaleDateString('pt-BR')}
                    </Text>
                </View>

                {/* Corpo Principal: Ícone, Produto e Qtd */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Ícone Indicador Esquerda */}
                    <View style={{
                        width: 45,
                        height: 45,
                        borderRadius: 22.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                        backgroundColor: isEntrada ? '#E8F5E9' : '#FFEBEE'
                    }}>
                        <Ionicons
                            name={getStatusIcon(item.ent_sai)}
                            size={28}
                            color={colorStatus}
                        />
                    </View>

                    {/* Informações do Produto */}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 }} numberOfLines={2}>
                            {item.produto.descricao}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#757575' }}>Cód. Prod: {item.produto.codigo}</Text>
                    </View>

                    {/* Quantidade em Destaque */}
                    <View style={{ alignItems: 'flex-end', minWidth: 60 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colorStatus }}> {isEntrada ? '+' : '-'}{item.quantidade} </Text>
                        <Text style={{ fontSize: 10, color: '#9E9E9E', textTransform: 'uppercase' }}>{item.unidade_medida}</Text>
                    </View>
                </View>

                {/* Divisor Sutil */}
                <View style={{ height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 }} />

                {/* Rodapé: Setor e Histórico */}
                <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialIcons name="store" size={16} color="#757575" />
                        <Text style={{ fontSize: 13, color: '#616161', flex: 1 }} numberOfLines={1}>
                            {item.setor.descricao} <Text style={{ fontSize: 10 }}>({item.setor.codigo})</Text>
                        </Text>
                    </View>

                    {item.historico ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <MaterialIcons name="history" size={16} color="#757575" />
                            <Text style={{ fontSize: 13, color: '#616161', flex: 1 }} numberOfLines={2}>
                                {item.historico}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Badge de Tipo */}
                <View style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    borderTopRightRadius: 12,
                    borderBottomLeftRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: colorStatus
                }}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>
                        {isEntrada ? 'ENTRADA' : 'SAÍDA'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            
            {/* --- HEADER --- */}
            <View style={{
                backgroundColor: '#185FED',
                paddingTop: 10,
                paddingBottom: 20,
                paddingHorizontal: 15,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                elevation: 5
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Acertos</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#FFF',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        height: 45
                    }}>
                        <Ionicons name="search" size={20} color="#185FED" style={{ marginRight: 8 }} />
                        <TextInput
                            style={{ flex: 1, color: '#333', fontWeight: '500' }}
                            onChangeText={(value) => setPesquisa(value)}
                            placeholder="Pesquisar movimento..."
                            placeholderTextColor="#999"
                            value={pesquisa}
                        />
                    </View>
                    
                    <TouchableOpacity onPress={() => setVisibleFilter(true)}>
                        <AntDesign name="filter" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- LISTA --- */}
            {loadingData ? (
                <View style={{ flex:1, justifyContent:"center"}}>
                  <ActivityIndicator size={50} color="#185FED" style={{ marginTop: 20 }} />
                </View>
            ) : (
                isEnabledViewerInventoryAdjustment  ? 
                ( <FlatList
                    data={dataMovimet}
                    renderItem={(i) => renderItem(i)}
                    keyExtractor={(i: resultMovRequest) => i.codigo.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                         <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: '#999', fontSize: 16 }}>Nenhum movimento encontrado.</Text>
                        </View>
                    )}
                     refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#185FED']}
                                tintColor="#185FED"
                            />
                        }
                /> ) 
                :
                   (
                     <View style={{flex:1, alignItems:"center", justifyContent:"center" }}>
                            <Text style={{ fontWeight:"bold", color:'#999'}}>Você não tem permissão para ver os acertos de estoque!</Text>
                     </View>
                    )
            )}

            {/* --- FAB --- */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 30,
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
                     handleCreateInventoryAdjustment()
                }}
            >
                <MaterialIcons name="add" size={32} color="#FFF" />
            </TouchableOpacity>
 
                    <CustomAlert
                        message={messageAlert}
                        onConfirm={ ()=>{ 
                            setVisibleAlert(false)
                        }
                        }
                        title={titleAlert}
                        visible={visibleAlert}
                    />

            <ModalFilter
                 dateFilter={dateFilter}
                 tipoMovimento={tipoMovimento}
                setDate={saveDateFilter}
                setTipo={saveFilter}
                setVisible={setVisibleFilter}
                visible={visibleFilter}
            />
        </View>
    );
}