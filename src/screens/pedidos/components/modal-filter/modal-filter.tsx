import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, Fontisto, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { configMoment } from "../../../../services/moment"; 
import { ModalBranches } from "../modal-filter-branch/modal-filter-branch";
import { actionsFilterOrder, filterOrdersituation, typefilterOrders } from "../..";
import { ModalSeller } from "../modal-filter-seller/modal-filter-seller";

type ModalFilterProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  
   setFilter: React.ActionDispatch<[action: actionsFilterOrder]>
   filter: typefilterOrders
};

export const ModalFilter = ({setFilter, filter,  visible, setVisible,    }: ModalFilterProps) => {
    
    const moment = configMoment();
    const [showPicker, setShowPicker] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [isVisibleModalBranch, setIsVisibleModalBranch] = useState(false);
    const [ isVisibleModalSeller, setIsVisibleModalSeller] = useState(false);
    

    const statusOptions = [  
        { id: '*', label: 'Todos', color: '#333' },
        { id: 'EA', label: 'Orçamentos', color: '#1E9C43' },
        { id: 'AI', label: 'Pedidos', color: '#307CEB' },
        { id: 'FI', label: 'Faturados', color: '#FF7F27' },
        { id: 'FP', label: 'Parcialmente Faturados', color: '#0023F5' },
        { id: 'RE', label: 'Reprovados', color: '#F44336' },
    ];

    const handleSelectStatus = (newStatus: filterOrdersituation) => {
        setFilter({ paylod: newStatus, type:'switch_status' })
        setShowStatusPicker(false);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            const dataFormatada = moment.formatarData(selectedDate as any);
            setFilter({ type: "switch_data_init", paylod:dataFormatada })
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
    const dataParaO_Picker = parseDateString(filter.data_inicial);

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => setVisible(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                
                <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setVisible(false)} />

                <View style={{
                    width: "100%",
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
                                {filter.data_inicial ? filter.data_inicial : moment.formatarData(new Date() as any)}
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

                        <TouchableOpacity
                            onPress={() => setShowStatusPicker(!showStatusPicker)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#F5F7FA',
                                padding: 12,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: showStatusPicker ? '#185FED' : '#E0E0E0',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: statusOptions.find(o => o.id === filter.situacao)?.color ?? '#333' }} />
                                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                    {statusOptions.find(o => o.id === filter.situacao)?.label ?? 'Todos'}
                                </Text>
                            </View>
                            <Ionicons name={showStatusPicker ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                        </TouchableOpacity>

                        {showStatusPicker && (
                            <View style={{ marginTop: 8, backgroundColor: '#F5F7FA', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' }}>
                                {statusOptions.map((opt:any) => {
                                    const isSelected = filter.situacao === opt.id;
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                paddingVertical: 12,
                                                paddingHorizontal: 15,
                                                backgroundColor: isSelected ? '#E3F2FD' : '#FFF',
                                                borderBottomWidth: opt.id !== statusOptions[statusOptions.length - 1].id ? 1 : 0,
                                                borderBottomColor: '#E0E0E0',
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
                        )}

                    <TouchableOpacity
                        onPress={() => setIsVisibleModalBranch(true)}
                        style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',backgroundColor: '#F5F7FA',padding: 12,borderRadius: 8,borderWidth: 1,borderColor: '#E0E0E0',marginTop: 10  }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                             <MaterialIcons name="store" size={24} color={ '#185FED'} />

                            <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                Filial: { filter.filial &&  filter.filial   }
                            </Text>
                        </View>
                        <Ionicons name={isVisibleModalBranch ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                    </TouchableOpacity>

                     <TouchableOpacity
                        onPress={() => setIsVisibleModalSeller(true)}
                        style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',backgroundColor: '#F5F7FA',padding: 12,borderRadius: 8,borderWidth: 1,borderColor: '#E0E0E0',marginTop: 10  }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                             <MaterialIcons name="people-alt" size={24} color={ '#185FED'} />

                            <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                Vendedor: { filter.vendedor &&  filter.vendedor   }
                            </Text>
                        </View>
                        <Ionicons name={isVisibleModalSeller ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                    </TouchableOpacity>

                    <ModalBranches
                        selectBranch={(branch) => setFilter( { type: 'switch_branch', paylod:branch.codigo} )}
                        setVisible={setIsVisibleModalBranch}
                        visible={isVisibleModalBranch}
                        branchSelected={filter.filial}
                    />

                    <ModalSeller
                    selectSeller={(seller)=>setFilter({ type: 'switch_seller', paylod: seller.codigo})}
                    sellerSelected={filter.vendedor}
                    setVisible={setIsVisibleModalSeller}
                    visible={isVisibleModalSeller}
                    />


                    </View>
                </View>
            </View>
        </Modal>
    );
};