import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import useApi from "../../../../services/api";
import { CameraView } from "expo-camera";
import { AlertType, CustomAlert } from "../../../../components/custom-alert/custom-alert";

type LoteSerieItem = {
    lote_serie: number;
    quantidade: number;
};

type ModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    produto: number;
    setor_origem: number;
    maxQuantity: number;
    lotes_series: LoteSerieItem[];
    onConfirm: (lotes_series: LoteSerieItem[]) => void;
};

type type_lote_serie_setor = {
    setor: number;
    produto: number;
    lote_serie: number;
    estoque: number;
    serie: string | null;
    lote: string | null;
};

export const ModalSeletorSeriesRequerimento = ({ visible, setVisible, produto, setor_origem, maxQuantity, lotes_series, onConfirm }: ModalProps) => {

    const api = useApi();

    const [isloadingDataSeries, setIsloadingDataSeries] = useState(false);
    const [dataSeries, setDataSeries] = useState<type_lote_serie_setor[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<LoteSerieItem[]>([]);
    const [isVisibleCamera, setIsVisibleCamera] = useState(false);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState<string>('');
    const [typeAlert, setTypeAlert] = useState<AlertType>('info');

    useEffect(() => {
        if (visible) {
            setSelectedSeries(lotes_series || []);
            buscaSeriesDisponiveis();
        }
    }, [visible]);

    async function buscaSeriesDisponiveis() {
        try {
            setIsloadingDataSeries(true);
            if (!setor_origem) return;
            const params: Record<string, any> = {
                produto: produto,
                situacao_estoque: 'positivo',
                setor: setor_origem,
            };
            const resultData = await api.get(`/lote-serie-setor/search`, { params });
            if (resultData.status == 200) {
                setDataSeries(resultData.data);
            }
        } catch (e: any) {
            console.log("Erro ao buscar séries:", e?.response?.data || e);
        } finally {
            setIsloadingDataSeries(false);
        }
    }

    async function handleCodeRead(data: string) {
        setIsVisibleCamera(false);

        const totalAtual = selectedSeries.reduce((sum, s) => sum + s.quantidade, 0);
        if (totalAtual >= maxQuantity) {
            setVisibleAlert(true);
            setMessageAlert(`A quantidade de séries deve corresponder à quantidade do produto. Máximo: ${maxQuantity}`);
            setTypeAlert('warning');
            return;
        }

        try {
            setIsloadingDataSeries(true);
            const params: Record<string, any> = {
                produto: produto,
                situacao_estoque: 'positivo',
                serie: data,
            };
            if (setor_origem > 0) {
                params.setor = setor_origem;
            }
            const resultData = await api.get(`/lote-serie-setor/search`, { params });

            if (resultData.status == 200 && resultData.data.length > 0) {
                const item = resultData.data[0];
                if (item.estoque <= 0) {
                    setVisibleAlert(true);
                    setMessageAlert(`A série ${data} não possui estoque disponível.`);
                    setTypeAlert('warning');
                    return;
                }

                setSelectedSeries(prev => {
                    const idx = prev.findIndex(s => s.lote_serie === item.lote_serie);
                    if (idx >= 0) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], quantidade: updated[idx].quantidade + 1 };
                        return updated;
                    }
                    return [...prev, { lote_serie: item.lote_serie, quantidade: 1 }];
                });
            } else {
                setVisibleAlert(true);
                setMessageAlert(`Série ${data} não encontrada no setor de origem.`);
                setTypeAlert('warning');
            }
        } catch (e: any) {
            console.log("Erro ao consultar série:", e?.response?.data || e);
        } finally {
            setIsloadingDataSeries(false);
        }
    }

    function handleIncrement(lote_serie: number, estoque: number) {
        const totalAtual = selectedSeries.reduce((sum, s) => sum + s.quantidade, 0);
        if (totalAtual >= maxQuantity) {
            setVisibleAlert(true);
            setMessageAlert(`Quantidade máxima de ${maxQuantity} atingida.`);
            setTypeAlert('warning');
            return;
        }
        setSelectedSeries(prev => {
            const idx = prev.findIndex(s => s.lote_serie === lote_serie);
            if (idx >= 0) {
                const updated = [...prev];
                const newQtd = updated[idx].quantidade + 1;
                if (newQtd > estoque) {
                    setVisibleAlert(true);
                    setMessageAlert(`Estoque disponível: ${estoque}`);
                    setTypeAlert('warning');
                    return prev;
                }
                updated[idx] = { ...updated[idx], quantidade: newQtd };
                return updated;
            }
            return [...prev, { lote_serie, quantidade: 1 }];
        });
    }

    function handleDecrement(lote_serie: number) {
        setSelectedSeries(prev => {
            const idx = prev.findIndex(s => s.lote_serie === lote_serie);
            if (idx < 0) return prev;
            const updated = [...prev];
            if (updated[idx].quantidade <= 1) {
                return updated.filter((_, i) => i !== idx);
            }
            updated[idx] = { ...updated[idx], quantidade: updated[idx].quantidade - 1 };
            return updated;
        });
    }

    function handleDelete(lote_serie: number) {
        setSelectedSeries(prev => prev.filter(s => s.lote_serie !== lote_serie));
    }

    function handleUpdateQuantity(lote_serie: number, value: number, estoque: number) {
        if (value <= 0) {
            handleDelete(lote_serie);
            return;
        }
        if (value > estoque) {
            setVisibleAlert(true);
            setMessageAlert(`Estoque disponível: ${estoque}`);
            setTypeAlert('warning');
            return;
        }
        const totalAtual = selectedSeries.reduce((sum, s) => s.lote_serie !== lote_serie ? sum + s.quantidade : sum, 0);
        if (totalAtual + value > maxQuantity) {
            setVisibleAlert(true);
            setMessageAlert(`Quantidade máxima de ${maxQuantity} atingida.`);
            setTypeAlert('warning');
            return;
        }
        setSelectedSeries(prev => {
            const idx = prev.findIndex(s => s.lote_serie === lote_serie);
            if (idx < 0) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], quantidade: value };
            return updated;
        });
    }

    function getStock(lote_serie: number): number {
        const item = dataSeries.find(s => s.lote_serie === lote_serie);
        return item?.estoque ?? 0;
    }

    function getSerieLabel(lote_serie: number): string {
        const item = dataSeries.find(s => s.lote_serie === lote_serie);
        return item?.serie || `#${lote_serie}`;
    }

    const handleConfirm = () => {
        const total = selectedSeries.reduce((sum, s) => sum + s.quantidade, 0);
        if (total !== maxQuantity) {
            setVisibleAlert(true);
            setMessageAlert(`A soma das séries (${total}) deve ser igual à quantidade do produto (${maxQuantity}).`);
            setTypeAlert('warning');
            return;
        }
        onConfirm(selectedSeries);
        setVisible(false);
    };

    const renderserie = ({ item }: { item: type_lote_serie_setor }) => {
        const selected = selectedSeries.find(s => s.lote_serie === item.lote_serie);
        const qtd = selected?.quantidade ?? 0;
        const hasStock = item.estoque > 0;
        const atMax = selectedSeries.reduce((sum, s) => sum + s.quantidade, 0) >= maxQuantity;

        return (
            <View style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginBottom: 12,
                padding: 12,
                elevation: 2,
                borderLeftWidth: 5,
                borderLeftColor: qtd > 0 ? '#1E9C43' : '#E0E0E0'
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                        Série: {getSerieLabel(item.lote_serie)}
                    </Text>
                    {qtd > 0 && (
                        <TouchableOpacity onPress={() => handleDelete(item.lote_serie)}>
                            <Ionicons name="close" size={22} color="#C62828" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={{ fontSize: 12, color: '#757575', marginBottom: 8 }}>
                    Estoque: {item.estoque}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                    <TouchableOpacity
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: qtd > 0 ? "#E0E0E0" : "#ccc", justifyContent: "center", alignItems: "center" }}
                        onPress={() => handleDecrement(item.lote_serie)}
                        disabled={qtd <= 0}
                    >
                        <AntDesign name="minus" size={18} color={qtd > 0 ? "#333" : "#999"} />
                    </TouchableOpacity>

                    <View style={{ minWidth: 40, borderBottomWidth: 2, borderBottomColor: qtd > 0 ? '#1E9C43' : '#E0E0E0', alignItems: 'center' }}>
                        <TextInput
                            style={{ fontSize: 18, fontWeight: 'bold', color: qtd > 0 ? '#1E9C43' : '#999', textAlign: 'center', paddingVertical: 0 }}
                            value={String(qtd)}
                            onChangeText={(text) => {
                                const num = Number(text.replace(/[^0-9]/g, ''));
                                handleUpdateQuantity(item.lote_serie, num, item.estoque);
                            }}
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: hasStock && !atMax ? '#1E9C43' : "#ccc",
                            justifyContent: "center", alignItems: "center", elevation: 2
                        }}
                        onPress={() => handleIncrement(item.lote_serie, item.estoque)}
                        disabled={!hasStock || atMax}
                    >
                        <AntDesign name="plus" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => setVisible(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setVisible(false)} />

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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Selecionar Séries</Text>
                        </View>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, padding: 20 }}>
                        {isloadingDataSeries ? (
                            <ActivityIndicator size={25} color='#185FED' />
                        ) : dataSeries.length === 0 && selectedSeries.length === 0 ? (
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <MaterialCommunityIcons name="package-variant-closed" size={50} color="#BDBDBD" />
                                <Text style={{ color: '#999', fontSize: 16, marginTop: 10 }}>Nenhuma série disponível neste setor.</Text>
                                <Text style={{ color: '#999', fontSize: 13, marginTop: 4 }}>Escaneie para adicionar.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={dataSeries}
                                renderItem={renderserie}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item.lote_serie.toString()}
                                ListEmptyComponent={() => (
                                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                                        <Text style={{ color: '#999', fontSize: 14 }}>Escaneie séries para adicionar.</Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>

                    <View style={{ padding: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>
                                Total separado: <Text style={{ color: '#185FED', fontWeight: 'bold' }}>{selectedSeries.reduce((sum, s) => sum + s.quantidade, 0)}</Text>
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>
                                Máx: <Text style={{ color: '#185FED', fontWeight: 'bold' }}>{maxQuantity}</Text>
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#185FED',
                                borderRadius: 12,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 10
                            }}
                            onPress={handleConfirm}
                        >
                            <AntDesign name="check" size={20} color="#FFF" />
                            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Confirmar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsVisibleCamera(true)}
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

                        <Modal visible={isVisibleCamera} animationType="slide">
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
                                        onPress={() => setIsVisibleCamera(false)}
                                        style={{ position: 'absolute', bottom: 50, backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
                                    >
                                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </CameraView>
                        </Modal>

                        <CustomAlert
                            visible={visibleAlert}
                            title=""
                            onConfirm={() => setVisibleAlert(false)}
                            message={messageAlert}
                            type={typeAlert}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
