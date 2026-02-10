import { Modal, Text, TouchableOpacity, View, Platform } from "react-native";
import { useState } from "react";
import Fontisto from '@expo/vector-icons/Fontisto';
import DateTimePicker from '@react-native-community/datetimepicker';
import { configMoment } from "../../../services/moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type props = {
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setTipo: React.Dispatch<React.SetStateAction<'E' | 'S' | '*'>>,
    setDate: any
}

export const ModalFilter = ({ visible, setVisible, setTipo, setDate }: props) => {
    const moment = configMoment();

    const [showPicker, setShowPicker] = useState(false);
    const [auxData, setAuxData] = useState<any>(new Date()); // Usar Date object
    const [displayData, setDisplayData] = useState<string>(moment.dataAtual()); // String para display
    const [tipoSelecionado, setTipoSelecionado] = useState<'E' | 'S' | '*'>('*');

    async function selectTipo(tipo: 'E' | 'S' | '*') {
        try {
            await AsyncStorage.setItem('filtroAcerto', tipo);
            setTipoSelecionado(tipo);
            setTipo(tipo);
            // setVisible(false); // Opcional: fechar ao selecionar tipo
        } catch (e) {
            console.log("erro ao tentar salvar o filtro", e);
        }
    }

    const handleEvent = async (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            setAuxData(selectedDate);
            const dataFormatada = moment.formatarData(selectedDate); // Assumindo que retorna DD/MM/YYYY ou similar
            setDisplayData(dataFormatada);
            setDate(dataFormatada);

            try {
                await AsyncStorage.setItem('dataPedidos', dataFormatada);
            } catch (e) {
                console.log("Erro storage data", e);
            }
        }
    };

    // Componente interno para opção de filtro
    const FilterOption = ({ type, label, icon, color }: any) => {
        const isSelected = tipoSelecionado === type;
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    paddingHorizontal: 15,
                    backgroundColor: isSelected ? '#E3F2FD' : '#F5F7FA',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#185FED' : '#E0E0E0',
                    marginBottom: 8
                }}
                onPress={() => selectTipo(type)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <MaterialCommunityIcons name={icon} size={24} color={isSelected ? '#185FED' : color || '#555'} />
                    <Text style={{ fontSize: 16, fontWeight: isSelected ? 'bold' : '500', color: isSelected ? '#185FED' : '#555' }}>
                        {label}
                    </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#185FED" />}
            </TouchableOpacity>
        )
    }

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ flex: 1, width: '100%' }} activeOpacity={1} onPress={() => setVisible(false)} />

                <View style={{
                    width: '85%',
                    backgroundColor: '#FFF',
                    borderRadius: 16,
                    padding: 0, // Padding controlado dentro
                    elevation: 10,
                    overflow: 'hidden',
                    position: 'absolute' // Garante centralização
                }}>
                    
                    {/* Header Modal */}
                    <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Filtros</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 20 }}>
                        
                        {/* Seletor de Data */}
                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>Data do Movimento:</Text>
                        <TouchableOpacity
                            onPress={() => setShowPicker(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#F5F7FA',
                                padding: 12,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#E0E0E0',
                                marginBottom: 20
                            }}
                        >
                            <Fontisto name="date" size={22} color="#185FED" style={{ marginRight: 10 }} />
                            <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                {displayData}
                            </Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={auxData instanceof Date ? auxData : new Date()}
                                display="default"
                                mode="date"
                                onChange={handleEvent}
                            />
                        )}

                        {/* Seletor de Tipo */}
                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>Tipo de Movimento:</Text>
                        
                        <FilterOption type="*" label="Todos" icon="filter-outline" />
                        <FilterOption type="E" label="Entradas" icon="arrow-up-bold-box-outline" color="#4CAF50" />
                        <FilterOption type="S" label="Saídas" icon="arrow-down-bold-box-outline" color="#E53935" />

                    </View>
                </View>
            </View>
        </Modal>
    );
}