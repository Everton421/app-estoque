import { Modal, Text, TouchableOpacity, View, Platform } from "react-native";
import { useEffect, useState } from "react";
import Fontisto from '@expo/vector-icons/Fontisto';
import DateTimePicker from '@react-native-community/datetimepicker';
import { configMoment } from "../../../services/moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
  type typeEnt_sai = 'S' | 'E' | '*'

type props = {
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setTipo: (ent_sai?: typeEnt_sai | undefined) => Promise<void>,
    setDate: any
    dateFilter:string
    tipoMovimento: 'E' | 'S' | '*'
}

export const ModalFilter = ({ visible, setVisible, setTipo, dateFilter, setDate,tipoMovimento   }: props) => {
    const moment = configMoment();

    const [showPicker, setShowPicker] = useState(false);

    async function selectTipo(tipo: 'E' | 'S' | '*') {
      
            setTipo(tipo);
    }


      const handleEvent = async (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            const dataFormatada = moment.formatarData(selectedDate as any);
            setDate(dataFormatada); 
        
        }
    };

 

     // --- CORREÇÃO DO FUSO HORÁRIO (TIMEZONE) ---
    const parseDateString = (dateString: string) => {
        if (!dateString) return new Date();

        try {
            // Se a data estiver no formato DD/MM/YYYY
            if (dateString.includes('/')) {
                const [day, month, year] = dateString.split('/');
                return new Date(Number(year), Number(month) - 1, Number(day)); 
                // Obs: Mês em JS começa no 0 (Janeiro = 0, Fevereiro = 1...)
            }
            
            // Se a data estiver no formato YYYY-MM-DD
            if (dateString.includes('-')) {
                const[year, month, day] = dateString.split('-');
                // Pega apenas os dois primeiros caracteres do dia (caso venha com hora junto)
                const cleanDay = day.substring(0, 2); 
                return new Date(Number(year), Number(month) - 1, Number(cleanDay));
            }
            
            return new Date(dateString);
        } catch (error) {
            return new Date(); // Em caso de erro, retorna data atual
        }
    };

    // Usando a função segura para passar a data para o DatePicker
    const dataParaO_Picker = parseDateString(dateFilter);

       
   
    // Componente interno para opção de filtro
    const FilterOption = ({ type, label, icon, color }: any) => {
        const isSelected = tipoMovimento === type;
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
                                {dateFilter ? dateFilter : moment.formatarData(new Date() as any)}

                            </Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={dataParaO_Picker}
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