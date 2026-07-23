import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CameraView } from "expo-camera";
import useApi from "../../../services/api";
import { AlertType, CustomAlert } from "../../../components/custom-alert/custom-alert";
import { delay } from "../../../utils/delay";

type ModalProps = {
   setor:number,
   setVisible: (visible:boolean)=>void,
    produto:number,
      visible:boolean
};

type type_lote_serie_setor = {
    serie: string | null 
    estoque:number 
    produto:number,
    setor:number
    };

 


export const ModalSeriesProducts = ( { visible, setVisible, setor ,produto   }: ModalProps) => {

    const api = useApi();

    const [dataSeries, setDataSeries] = useState<type_lote_serie_setor[]>([]);
    const [ isLoadingDataLoteSeriesSector , setIsLoadingDataLoteSeriesSector ] = useState(false);

    async function findSeriesProdSector(  codeProduct:number, sector:number ) {
              try{
                    setIsLoadingDataLoteSeriesSector(true)
                await delay(700, 'Busca de lote serie setor')
                    const responseLoteSeriesSector= await api.get('/lote-serie-setor/search', 
                        {
                            params: { 
                                setor: sector,
                                produto:codeProduct 
                            }
                        }
                    );
                      setDataSeries(responseLoteSeriesSector?.data);
                      console.log(responseLoteSeriesSector?.data);
                }catch(e:any){
                    console.log( "[X] Erro ao buscar lote series setor na api ",e.response?.data?.message)
                }finally{
                    setIsLoadingDataLoteSeriesSector(false)
                }
    }

    useEffect(()=>{
                findSeriesProdSector(produto, setor)
    },[])

    const renderserie = ({ item }: { item: type_lote_serie_setor }) => {

        return (
            <View style={{
                backgroundColor:  '#FFF',
                borderRadius: 12,
                marginBottom: 12,
                padding: 10,
                elevation: 3,
                borderLeftWidth: 5,
                borderLeftColor:  '#4CAF50' 
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>produto: {item.produto}</Text>
 
                </View>

                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>

                    Série: {item.serie ? 
                     <Text style={{ color:'#4CAF50',   padding:1, borderRadius:5}} >
                         {item.serie}
                     </Text>
                    : 
                     <Text style={{ color:'#940000', backgroundColor:'#ffcfcfd5', padding:1, borderRadius:5}} >
                        Serie com valor vazio 
                     </Text>
        }
                </Text>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Qtd : {item.estoque}</Text>
            </View>
        );
    };


     

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={()=> setVisible(false) }>
             <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={()=> setVisible(false)} />

                <View style={{
                    flex: 1,
                    marginTop: 45,
                    backgroundColor: "#FFF",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    overflow: 'hidden',
                    elevation: 10
                }}>
                    <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: '#FFF', fontWeight: 'bold' }}>Séries Produto : {produto} setor: {setor}</Text>
                        <TouchableOpacity onPress={()=> setVisible(false)}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
              

                    <View style={{ flex: 1, padding: 20 }}>
                        {isLoadingDataLoteSeriesSector ? (
                            <View style={{ flex:1, justifyContent:"center"}}>
                            <ActivityIndicator size={25} color='#185FED' />
                            </View>
                        
                        ) : (
                            <FlatList
                                data={dataSeries}
                                renderItem={renderserie}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={() => (
                                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                                        <MaterialCommunityIcons name="package-variant-closed" size={50} color="#BDBDBD" />
                                        <Text style={{ color: '#999', fontSize: 16, marginTop: 10 }}>Nenhuma Série disponivel.</Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>

             </View>
             </View>
        </Modal>
    );
};
