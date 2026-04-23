import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useMarcas } from "../../../database/queryMarcas/queryMarcas"
import useApi from "../../../services/api";
import { queryConfig_api } from "../../../database/queryConfig_Api/queryConfig_api";
type ApiConfig = {
    codigo?: number
    url: string,
    porta: number,
    token: string
    data_sinc: string,
    data_env: string,
    offline: 'S' | 'N'
}

export const RenderModalMarcas = ({ setMarca, codigoMarca }: any) => {

    const useQueryMarcas = useMarcas();

    let [active, setActive] = useState<boolean>(false);
    const [data, setData] = useState([])
    const [pesquisa, setPesquisa] = useState("");
    const [loading, setLoading] = useState(false);
    const [marcaSelecionada, setMarcaSelecionada] = useState(null);
    const api = useApi();
    const useQueryConfigApi = queryConfig_api();

    const [configMobileApi, setConfigMobileApi] = useState<ApiConfig>();



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

          const buscarMarcas = async () => {
         if(configMobileApi && configMobileApi.offline === 'N'){
             try{
                    setLoading(true)
                    const responsebrandsProduct = await api.get('/marcas/search', 
                        {
                            params: { 
                                limit: 25,
                                search: pesquisa,
                                ativo: 'S'
                            }
                        }
                    );
                      setData(responsebrandsProduct?.data);
                }catch(e){
                    console.log( "[X] Erro ao buscar marcas na api ",e )
                }finally{
                    setLoading(false)
                }

         }else{
            setLoading(true);
            try {
                let dados: any = await useQueryMarcas.selectAll();
                if (dados?.length > 0) {
                    setData(dados);
                }
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
            }
        }



    useEffect(() => {
      
        if (active) {
            buscarMarcas();
        }
    }, [active,pesquisa, configMobileApi ]);

    useEffect(() => {
        async function buscaMarca() {
            let dados: any = await useQueryMarcas.selectByCode(codigoMarca);
            if (dados?.length > 0) {
                selecionaMarca(dados[0])
            }
        }

        if (codigoMarca > 0) {
            buscaMarca()
        }
    }, [codigoMarca])


    function selecionaMarca(item: any) {
        setMarcaSelecionada(item);
        setMarca(item)
        setActive(false)
    }

    function renderItem({ item }: any) {
        return (
            <TouchableOpacity
                onPress={() => selecionaMarca(item)}
                style={[{
                    backgroundColor: "#FFF",
                    borderRadius: 12,
                    marginHorizontal: 15,
                    marginVertical: 6,
                    padding: 12,
                    elevation: 3,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    flexDirection: 'row',
                    alignItems: 'center'},
                     codigoMarca && codigoMarca == item.codigo &&    {backgroundColor:'#185FED' }
                ]}
            >
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[{ fontSize: 14, color: '#185FED', fontWeight: 'bold' },
                             codigoMarca && codigoMarca == item.codigo &&  {color:'#FFF' }
                        ]}>Cód: {item.codigo}</Text>
                    </View>
                    <Text numberOfLines={2} style={[{ fontSize: 14, fontWeight: '600', color: '#333', marginTop: 4 },
                     codigoMarca && codigoMarca == item.codigo &&    {color:'#FFF' }
                        
                    ]}>
                        {item.descricao}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Botão de abrir modal estilizado como Input Search */}
            <TouchableOpacity
                onPress={() => setActive(true)}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FFF",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    paddingHorizontal: 15,
                    height: 47,
                    elevation: 2
                }}
            >
                <FontAwesome name="tag" size={18} color="#185FED" style={{ marginRight: 10 }} />
                <Text style={{ color: "#757575", fontSize: 16 }}>
                    {marcaSelecionada ? marcaSelecionada.descricao : "Selecionar marca..."}
                </Text>
            </TouchableOpacity>

            <Modal visible={active} animationType="fade" transparent={true} onRequestClose={() => setActive(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{
                        width: "90%",
                        height: "80%",
                        backgroundColor: "#F5F7FA",
                        borderRadius: 16,
                        overflow: 'hidden',
                        elevation: 10
                    }}>
                        {/* Header Modal */}
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
                                    placeholder="Buscar marca..."
                                    placeholderTextColor="#999"
                                    onChangeText={(text) => setPesquisa(text)}
                                    autoFocus={true}
                                />
                            </View>
                            <TouchableOpacity onPress={() => setActive(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Lista */}
                        <View style={{ flex: 1, paddingVertical: 10 }}>
                            {loading ? (
                                <ActivityIndicator size="large" color="#185FED" style={{ marginTop: 20 }} />
                            ) : (
                                <FlatList
                                    data={data}
                                    renderItem={(item) => renderItem(item)}
                                    keyExtractor={(item: any) => item.codigo.toString()}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    ListEmptyComponent={() => (
                                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                                            <Text style={{ color: '#999' }}>Nenhuma marca encontrada.</Text>
                                        </View>
                                    )}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}