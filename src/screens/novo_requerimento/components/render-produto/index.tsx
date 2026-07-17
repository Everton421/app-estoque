import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { actionsRequirement, itensPayloadRequirement } from "../..";

export const RenderProduto = ({ item, indexItem, onOpenSeries, dispatch }: {
    item:  itensPayloadRequirement ,
    indexItem: number,
    dispatch:  (action: actionsRequirement) => void
    onOpenSeries: (index: number) => void
}) => {
    const seriesCount = item.lotes_series?.length ?? 0;

    return (
        <View style={{
            backgroundColor: '#FFF',
            borderRadius: 12,
            marginHorizontal: 15,
            marginBottom: 12,
            padding: 15,
            elevation: 3,
            borderLeftWidth: 3,
            borderLeftColor: '#185FED',
            width: 250 
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold' }}>Cód: {item.produto}</Text>

                  <TouchableOpacity
                        style={{ width: 20, height: 20,   justifyContent: "center", alignItems: "center",  }}
                        onPress={()=>{ dispatch({type: 'remove_item', payload: item.produto}) }}
                    >
                        <FontAwesome name="remove" size={20} color="#b10909" />
                    </TouchableOpacity>


                    {/**    <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isSerie ? "#ccc" : (concluido ? '#4CAF50' : "#185FED"), 
                                justifyContent: "center", alignItems: "center", elevation: isSerie ? 0 : 2 }}
                            onPress={() => handleUpdateQuantity(item.codigo, quantidadeSeparada + 1, item.quantidade)}
                            disabled={isSerie}
                        >
                            <AntDesign name="plus" size={20} color={isSerie ? "#999" : "#FFF"} />
                        </TouchableOpacity> */}

            </View>

            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }} numberOfLines={2}>
                {item.descricao || "Produto sem descrição"}
            </Text>

            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#e8eff5',
                padding: 10,
                borderRadius: 8
            }}>
                
                    <TouchableOpacity
                        onPress={()=> dispatch({type: 'update_item_qtd', payload:{ codigo: item.produto, 
                            quantidade: item.quantidade > 0 ? item.quantidade - 1 : 0
                         }})}
                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.controle_lote_serie =='S' ?  '#CCC' : "#b10909", justifyContent: "center", alignItems: "center" }}
                    >

                            <AntDesign name="minus" size={20} color={"#FFF"} />
                    </TouchableOpacity>

                    <View style={{ minWidth: 40, borderBottomWidth: 2, borderBottomColor: '#185FED', alignItems: 'center' }}>
                        <TextInput
                            style={{ fontSize: 20, fontWeight: 'bold', color: '#185FED', textAlign: 'center', paddingVertical: 0 }}
                            value={String(Number(item.quantidade))}
                            onChangeText={(text) => {
                                const num = Number(text.replace(/[^0-9]/g, ''));
                            }}
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={()=> dispatch({type: 'update_item_qtd', payload:{ codigo: item.produto, quantidade: item.quantidade + 1 }})}
                       style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.controle_lote_serie =='S' ?  '#CCC' : "#4CAF50", justifyContent: "center", alignItems: "center", elevation: 0 }}
                    >
                            <AntDesign name="plus" size={20} color={"#FFF"} />
                    </TouchableOpacity>
            </View>

            {item.controle_lote_serie == 'S' && (
                <TouchableOpacity
                    onPress={() => onOpenSeries(indexItem)}
                    style={{
                        backgroundColor: seriesCount > 0 ? '#E8F5E9' : '#FFF',
                        borderRadius: 12,
                        paddingVertical: 15,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 10,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: seriesCount > 0 ? '#1E9C43' : '#E0E0E0'
                    }}
                >
                    <Ionicons name="barcode" size={35} color="#185FED" />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: '#555' }}>
                            {seriesCount > 0 ? `${seriesCount} série(s)` : 'Separar Série'}
                        </Text>
                        {seriesCount > 0 && (
                            <Text style={{ fontSize: 11, color: '#1E9C43', fontWeight: 'bold', marginTop: 2 }}>
                                Total: {item.lotes_series.reduce((s, ls) => s + ls.quantidade, 0)} und
                            </Text>
                        )}
                    </View>
                    <MaterialCommunityIcons name="cursor-pointer" size={35} color="#185FED" />
                </TouchableOpacity>
            )}
        </View>
    );
};
