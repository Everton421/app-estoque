import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import useApi from "../../../../services/api";
import { serie } from "../..";
import { BarcodeScanner } from "../../../../components/barcode-scanner";

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    codigo_pedido: number;
    setor: number;
    codigo_produto: number;
    series: serie[];
    onConfirm?: (series: serie[]) => void;
    maxQuantity?: number;
};

type type_lote_serie_setor = {
    setor: number,
    produto: number,
    lote_serie: number,
    estoque: number
    serie: string | null 
    lote: string | null 
};

type propsSwitchStockSeries = {
    situations:typeSituations[],
 setSituation: ( situation:typeSituations)=>void
    visible:boolean
    setVisible: (visible:boolean)=>void
}

type typeSituations=  'positivo' | 'negativo' | 'zerado' | 'todos'

export const ModalSeries = ({ visible, onClose, setor, codigo_pedido, codigo_produto, series, onConfirm, maxQuantity }: ModalProps) => {

    const api = useApi();

    const [isloadingDataSeries, setIsloadingDataSeries] = useState(false);
    const [dataSeries, setDataSeries] = useState<type_lote_serie_setor[]>([]);
    const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
    const [exibirNegativo, setExibirNegativo] = useState(false);
    const [ isVisiblesSwitchStockSeries , setIsVisiblesSwitchStockSeries]  = useState(false);
    const [ situacao_estoque, setSituacao_estoque] = useState<typeSituations>('positivo');
    const [ isVisibleScanner, setIsVisibleScanner ] = useState(false);

    useEffect(() => {
        if (visible) {
            setSelectedQuantities({});
            buscaSeriesPedidos();
        }
    }, [visible, codigo_produto, setor, exibirNegativo]);

 

    useEffect(() => {
        if (visible) {
            if (series.length > 0) {
                const initial: Record<number, number> = {};
                series.forEach(s => {
                    initial[s.lote_serie] = s.quantidade;
                });
                setSelectedQuantities(initial);
            } else {
                setSelectedQuantities({});
            }
        }
    }, [visible, series]);
    

    async function buscaSeriesPedidos() {
        try {
            setIsloadingDataSeries(true);
            const params: Record<string, any> = {
                produto: codigo_produto,
                situacao_estoque: situacao_estoque
            };
            if (setor > 0) {
                params.setor = setor;
            }
            const resultData = await api.get(`/lote-serie-setor/search`, { params });

            if (resultData.status == 200) {
                let lista: type_lote_serie_setor[] = resultData.data || [];

                if (series.length > 0) {
                    const lotesApi = new Set(lista.map(item => item.lote_serie));
                    for (const s of series) {
                        if (!lotesApi.has(s.lote_serie)) {
                            lista.push({
                                setor: setor,
                                produto: codigo_produto,
                                lote_serie: s.lote_serie,
                                estoque: Number.parseInt(s.quantidade),
                                serie: `${s.serie}`,
                                lote: null
                            });
                        }
                    }
                }

                setDataSeries(lista);
            }
        } catch (e: any) {
            console.log("Erro ao tentar consultar lote-serie-setor ", e?.response?.data || e);
            setDataSeries([]);
        } finally {
            setIsloadingDataSeries(false);
        }
    }

    const totalSelected = Object.values(selectedQuantities).reduce((sum, q) => sum + (q || 0), 0);

    const handleUpdateQuantity = (loteSerie: number, newQuantity: number, maxEstoque: number) => {
        let newQty = Math.round(Number(newQuantity));
        if (newQty < 0) newQty = 0;
        if (newQty > maxEstoque) newQty = maxEstoque;
        setSelectedQuantities(prev => ({
            ...prev,
            [loteSerie]: newQty
        }));
    };

    const handleIncrement = (loteSerie: number, maxEstoque: number) => {
        const current = selectedQuantities[loteSerie] || 0;
        if (current >= maxEstoque) return;
        if (maxQuantity !== undefined && totalSelected >= maxQuantity) return;
        setSelectedQuantities(prev => ({
            ...prev,
            [loteSerie]: (prev[loteSerie] || 0) + 1
        }));
    };

    const handleDecrement = (loteSerie: number) => {
        const current = selectedQuantities[loteSerie] || 0;
        if (current <= 0) return;
        setSelectedQuantities(prev => ({
            ...prev,
            [loteSerie]: current - 1
        }));
    };

    const handleConfirm = () => {
        const result: serie[] = Object.entries(selectedQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([lote, qty]) => ({
                lote_serie: Number(lote),
                quantidade: Number(qty)
            }));
        onConfirm?.(result);
        onClose();
    };
  
  
  
    async function handleCodeRead(data: string) {
          try {
            setIsloadingDataSeries(true);
            const params: Record<string, any> = {
                produto: codigo_produto,
                situacao_estoque: 'positivo',
                serie: data
            };
            if (setor > 0) {
                params.setor = setor;
            }
            const resultData = await api.get(`/lote-serie-setor/search`, { params });

            if (resultData.status == 200) {
              //  setDataSeries(resultData.data || []);
             //   console.log(resultData.data)
                if(resultData.data.length > 0 ){
                    const { lote_serie, estoque} =resultData.data[0];
                     handleIncrement(lote_serie, estoque)
                }
            }
        } catch (e: any) {
            console.log("Erro ao tentar consultar lote-serie-setor ", e?.response?.data || e);
            //setDataSeries([]);
        } finally {
            setIsloadingDataSeries(false);
        }
    }


    const SwitchStockSeries= ({visible, setVisible,  situations, setSituation }:propsSwitchStockSeries)=>{

        const RenderItem = ({item}: { item: typeSituations})=>{
                return(
                        <TouchableOpacity onPress={()=> setSituation(item)}>
                            <Text>{item}</Text>
                        </TouchableOpacity>
                        )
          }

      return  ( 
                <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal:200 ,position:'absolute' }}>
                        <FlatList
                        data={situations}
                         renderItem={({ item }) => <RenderItem  item={item} />}
                              contentContainerStyle={{ paddingVertical: 10 }}
                        />
                     <TouchableOpacity onPress={()=>{ setVisible(false) }}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                  </View>

               )
             
    }

    const renderserie = ({ item }: { item: type_lote_serie_setor }) => {
        const qty = selectedQuantities[item.lote_serie] || 0;
        const hasStock = item.estoque > 0;
        const atMax = maxQuantity !== undefined && totalSelected >= maxQuantity && qty === 0;

        return (
            <View style={{
                backgroundColor: hasStock ? '#FFF' : '#ffe2e2',
                borderRadius: 12,
                marginBottom: 12,
                padding: 10,
                elevation: 3,
                borderLeftWidth: 5,
                borderLeftColor: hasStock ? '#4CAF50' : 'red'
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Setor: {item.setor}</Text>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Qtd. Disp: {item.estoque}</Text>
                </View>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Id: {item.lote_serie}</Text>

                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                    {item.serie || "Serie com valor vazio"}
                </Text>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F5F7FA',
                    padding: 10,
                    borderRadius: 8
                }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>Qtd. Separada:</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center" }}
                            onPress={() => handleDecrement(item.lote_serie)}
                        >
                            <AntDesign name="minus" size={20} color="#333" />
                        </TouchableOpacity>

                        <View style={{ minWidth: 40, borderBottomWidth: 2, borderBottomColor: qty > 0 ? '#4CAF50' : '#185FED', alignItems: 'center' }}>
                            <TextInput
                                style={{ fontSize: 20, fontWeight: 'bold', color: qty > 0 ? '#4CAF50' : '#185FED', textAlign: 'center', paddingVertical: 0 }}
                                value={String(parseInt(qty))}
                                onChangeText={(text) => {
                                    const num = Number(text.replace(/[^0-9]/g, ''));
                                    handleUpdateQuantity(item.lote_serie, num, item.estoque);
                                }}
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: hasStock && !atMax ? '#4CAF50' : "#ccc", justifyContent: "center", alignItems: "center", elevation: 2 }}
                            onPress={() => handleIncrement(item.lote_serie, item.estoque)}
                        >
                            <AntDesign name="plus" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };


     

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
             <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            
                <View style={{   flex: 1,marginTop: 15,backgroundColor: "#FFF",borderTopRightRadius:20,  borderTopLeftRadius: 20,overflow: 'hidden',elevation: 10 }}> 
                        {/**HEADER */}
                    <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Lote Séries:</Text>
                        </View>
                    </View>

                    {/** HEADER */}
                    <View style={{ flex: 1, padding: 20 }}>
                        {isloadingDataSeries ? (
                            <ActivityIndicator size={25} color='#185FED' />
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

                    <View style={{ padding: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>
                                Total separado: <Text style={{ color: '#185FED', fontWeight: 'bold' }}>{totalSelected}</Text>
                            </Text>
                            {maxQuantity !== undefined && (
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>
                                    Máx: <Text style={{ color: '#185FED', fontWeight: 'bold' }}>{maxQuantity}</Text>
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={{ backgroundColor: '#185FED', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}
                            onPress={handleConfirm}
                           >
                            <AntDesign name="check" size={20} color="#FFF" />
                            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Confirmar</Text>
                        </TouchableOpacity>
  
                {/* BOTÃO FLUTUANTE DE LEITURA (acima do rodapé) */}
                            <TouchableOpacity
                                onPress={() => { setIsVisibleScanner(true) }}
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

                            {/* SCANNER DE SÉRIES */}
                            <BarcodeScanner
                                visible={isVisibleScanner}
                                onClose={() => setIsVisibleScanner(false)}
                                onBarcodeScanned={(data) => handleCodeRead(data)}
                                stripZeros={false}
                            />

                    </View>
               </View>
             </View>
        </Modal>
    );
};
