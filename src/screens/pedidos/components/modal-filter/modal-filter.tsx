import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configMoment } from "../../../../services/moment"; 

type ModalFilterProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    statusAtual: string;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    dataAtual: string; 
    setDate: React.Dispatch<React.SetStateAction<string>>;
};

export const ModalFilter = ({ visible, setVisible, statusAtual, setStatus, dataAtual, setDate }: ModalFilterProps) => {
    
    const moment = configMoment();
    const [showPicker, setShowPicker] = useState(false);

    const statusOptions =[
        { id: '*', label: 'Todos', color: '#333' },
        { id: 'EA', label: 'Orçamentos', color: '#1E9C43' },
        { id: 'AI', label: 'Pedidos', color: '#307CEB' },
        { id: 'FI', label: 'Faturados', color: '#FF7F27' },
        { id: 'FP', label: 'Parcialmente Faturados', color: '#0023F5' },
        { id: 'RE', label: 'Reprovados', color: '#F44336' },
    ];

    const handleSelectStatus = async (newStatus: string) => {
        setStatus(newStatus); 
        try {
            await AsyncStorage.setItem('filtroPedidos', newStatus);
        } catch (e) {
            console.log("Erro ao salvar o status no AsyncStorage", e);
        }
    };

    const handleDateChange = async (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            const dataFormatada = moment.formatarData(selectedDate as any);
            setDate(dataFormatada); 
            try {
                await AsyncStorage.setItem('dataPedidos', dataFormatada);
            } catch (e) {
                console.log("Erro ao salvar a data no AsyncStorage", e);
            }
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
    const dataParaO_Picker = parseDateString(dataAtual);

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={() => setVisible(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                
                <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setVisible(false)} />

                <View style={{
                    width: "85%",
                    backgroundColor: "#FFF",
                    borderRadius: 16,
                    overflow: 'hidden',
                    elevation: 10
                }}>
                    <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Filtros</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 20 }}>
                        
                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>Filtrar a partir de:</Text>
                        
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
                            <Fontisto name="date" size={20} color="#185FED" style={{ marginRight: 10 }} />
                            <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                {dataAtual ? dataAtual : moment.formatarData(new Date() as any)}
                            </Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={dataParaO_Picker}
                                display="default"
                                mode="date"
                                onChange={handleDateChange}
                            />
                        )}

                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>Situação do Pedido:</Text>

                        {statusOptions.map((opt) => {
                            const isSelected = statusAtual === opt.id;
                            return (
                                <TouchableOpacity
                                    key={opt.id}
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
                                    onPress={() => handleSelectStatus(opt.id)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: opt.color }} />
                                        <Text style={{ fontSize: 15, fontWeight: isSelected ? 'bold' : '500', color: isSelected ? '#185FED' : '#555' }}>
                                            {opt.label}
                                        </Text>
                                    </View>
                                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#185FED" />}
                                </TouchableOpacity>
                            );
                        })}

                    </View>
                </View>
            </View>
        </Modal>
    );
};