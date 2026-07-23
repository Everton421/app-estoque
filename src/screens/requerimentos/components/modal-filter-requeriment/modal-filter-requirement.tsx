import React, { useState } from "react";
import { FlatList, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, Fontisto, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { configMoment } from "../../../../services/moment";
import { actionsFilterRequeriment, filterRequeriment, statusRequeriment } from "../..";
import { ModalApllicant } from "../modal-filter-apllicant/modal-filter-apllicant";
import { ModalSetoresRequerimento } from "../../../../screens/novo_requerimento/components/modal-setores-requerimento/modal-setores-requerimento";

type ModalFilterProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    filter: filterRequeriment
    dispatch: React.ActionDispatch<[action: actionsFilterRequeriment]>
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'A': return { color: '#1E9C43', label: 'Em Aberto' };
        case 'E': return { color: '#307CEB', label: 'Efetuado' };
        case 'C': return { color: '#9C0404', label: 'Cancelado' };
        default: return { color: '#999999', label: 'Desconhecido' };
    }
}

export const ModalFilterRequirement = ({ dispatch, filter, visible, setVisible }: ModalFilterProps) => {
    const RenderItemStatus = ({ item }: { item: statusRequeriment }) => {
        const isSelected = filter.status && filter.status === item;
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 12, paddingHorizontal: 15,
                    backgroundColor: isSelected ? '#E3F2FD' : '#FFF',
                    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
                }}
                onPress={() => handleSelectStatus(item)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: getStatusColor(item).color }} />
                    <Text style={{ fontSize: 15, fontWeight: isSelected ? 'bold' : '500', color: isSelected ? '#185FED' : '#555' }}>
                        {getStatusColor(item).label}
                    </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#185FED" />}
            </TouchableOpacity>
        );
    }

    const moment = configMoment();
    const [showPicker, setShowPicker] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [isVisibleModalSeller, setIsVisibleModalSeller] = useState(false);
    const [isVisibleModalOriginSector, setIsVisibleModalOriginSector] = useState(false);
    const [isVisibleModalDestinationSector, setIsVisibleModalDestinationSector] = useState(false);
    const [statusOptions] = useState<statusRequeriment[]>(['A', 'C', 'E'])

    const handleSelectStatus = (newStatus: statusRequeriment) => {
        if (filter.status === newStatus) {
            dispatch({ payload: null, type: 'switch_status' })
        } else {
            dispatch({ payload: newStatus, type: 'switch_status' })
        }
        setShowStatusModal(false);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            const dataFormatada = moment.formatarData(selectedDate as any);
            dispatch({ type: "switch_data_init", payload: dataFormatada })
        }
    };

    const parseDateString = (dateString: string) => {
        if (!dateString) return new Date();
        try {
            if (dateString.includes('/')) {
                const [day, month, year] = dateString.split('/');
                return new Date(Number(year), Number(month) - 1, Number(day));
            }
            if (dateString.includes('-')) {
                const [year, month, day] = dateString.split('-');
                const cleanDay = day.substring(0, 2);
                return new Date(Number(year), Number(month) - 1, Number(cleanDay));
            }
            return new Date(dateString);
        } catch (error) {
            return new Date();
        }
    };

    const dataParaO_Picker = parseDateString(filter.data_init);

    const getStatusLabel = () => {
        if (!filter.status) return 'Todos';
        return getStatusColor(filter.status).label;
    };

    const getStatusDotColor = () => {
        if (!filter.status) return '#333';
        return getStatusColor(filter.status).color;
    };

    const FilterOption = ({ value, label, filter, dispatch }: { value: number, label: string, filter: filterRequeriment, dispatch: React.ActionDispatch<[action: actionsFilterRequeriment]> }) => {
        const isSelected = filter.limit === value;
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
                }}
                onPress={() => { dispatch({ type: 'switch_limit', payload: value }); setShowLimitModal(false); }}
            >
                <Text style={{ fontSize: 15, color: isSelected ? '#185FED' : '#555', fontWeight: isSelected ? 'bold' : '500' }}>
                    {label}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#185FED" />}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => setVisible(false)}>

            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>

                <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setVisible(false)} />

                <View style={{
                    width: "100%",
                    backgroundColor: "#FFF",
                    borderRadius: 16,
                    overflow: 'hidden',
                    elevation: 10,
                    height: '85%'
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
                                {filter.data_init ? filter.data_init : moment.formatarData(new Date() as any)}
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

                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>Situação do requerimento:</Text>

                        <TouchableOpacity
                            onPress={() => setShowStatusModal(!showStatusModal)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#F5F7FA',
                                padding: 12,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: showStatusModal ? '#185FED' : '#E0E0E0',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: getStatusDotColor() }} />
                                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                    {getStatusLabel()}
                                </Text>
                            </View>
                            <Ionicons name={showStatusModal ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                        </TouchableOpacity>

                        {showStatusModal && (
                          
                            
                   <Modal visible={showStatusModal} transparent={true} animationType="fade" onRequestClose={() => setShowStatusModal(false)}>  
                          <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                                 <View style={{  width:'80%', marginTop: 8, backgroundColor: '#F5F7FA', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' }}>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                        paddingVertical: 12, paddingHorizontal: 15,
                                        backgroundColor: !filter.status ? '#E3F2FD' : '#FFF',
                                        borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
                                    }}
                                    onPress={() => {
                                        dispatch({ payload: null, type: 'switch_status' })
                                        setShowStatusModal(false);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#333' }} />
                                        <Text style={{ fontSize: 15, fontWeight: !filter.status ? 'bold' : '500', color: !filter.status ? '#185FED' : '#555' }}>
                                            Todos
                                        </Text>
                                    </View>
                                    {!filter.status && <Ionicons name="checkmark-circle" size={20} color="#185FED" />}
                                </TouchableOpacity>
                                <FlatList
                                    data={statusOptions}
                                    renderItem={({ item }) => <RenderItemStatus item={item} />}
                                    keyExtractor={(item) => item}
                                />
                                </View>
                            </View>
                   </Modal>
                        )}

                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, marginTop: 15, fontWeight: 'bold' }}>Vendedor:</Text>

                        <TouchableOpacity
                            onPress={() => setIsVisibleModalSeller(true)}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: '#F5F7FA', padding: 12, borderRadius: 8,
                                borderWidth: 1, borderColor: '#E0E0E0',
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <MaterialIcons name="people-alt" size={24} color={'#185FED'} />
                                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                    {filter.applicant ? filter.applicant.nome : 'Selecionar vendedor'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        <ModalApllicant
                            dispatch={dispatch}
                            sellerSelected={filter.applicant || null}
                            setVisible={setIsVisibleModalSeller}
                            visible={isVisibleModalSeller}
                        />

                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, marginTop: 15, fontWeight: 'bold' }}>Setores:</Text>

                        <TouchableOpacity
                            onPress={() => setIsVisibleModalOriginSector(true)}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: '#F5F7FA', padding: 12, borderRadius: 8,
                                borderWidth: 1, borderColor: '#E0E0E0',
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <MaterialIcons name="store" size={24} color={'#1E9C43'} />
                                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                    Origem: {filter.origin_sector ? filter.origin_sector.descricao : 'Selecionar setor'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        <ModalSetoresRequerimento
                            visible={isVisibleModalOriginSector}
                            setVisible={setIsVisibleModalOriginSector}
                            selectSector={(setor) => dispatch({ type: 'switch_origin_sector', payload: { codigo: setor.codigo, descricao: setor.descricao } })}
                            isSelected={filter.origin_sector?.codigo || null}
                            title="Selecionar Setor de Origem"
                        />

                        <TouchableOpacity
                            onPress={() => setIsVisibleModalDestinationSector(true)}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: '#F5F7FA', padding: 12, borderRadius: 8,
                                borderWidth: 1, borderColor: '#E0E0E0', marginTop: 10,
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <MaterialIcons name="store" size={24} color={'#C62828'} />
                                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                    Destino: {filter.destination_sector ? filter.destination_sector.descricao : 'Selecionar setor'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        <ModalSetoresRequerimento
                            visible={isVisibleModalDestinationSector}
                            setVisible={setIsVisibleModalDestinationSector}
                            selectSector={(setor) => dispatch({ type: 'switch_destination_sector', payload: { codigo: setor.codigo, descricao: setor.descricao } })}
                            isSelected={filter.destination_sector?.codigo || null}
                            title="Selecionar Setor de Destino"
                        />

                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, marginTop: 15, fontWeight: 'bold' }}>Limite de Registros:</Text>

                        <TouchableOpacity
                            onPress={() => setShowLimitModal(true)}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: '#F5F7FA', padding: 12, borderRadius: 8,
                                borderWidth: 1, borderColor: '#E0E0E0',
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <MaterialIcons name="format-list-numbered" size={24} color={'#185FED'} />
                                <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
                                    {filter.limit} registros
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                    </View>
                </View>
              
            </View>
                    
            <Modal visible={showLimitModal} transparent={true} animationType="fade" onRequestClose={() => setShowLimitModal(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setShowLimitModal(false)} />

                        <View style={{ width: '85%', backgroundColor: "#FFF", borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                            <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Limite de Registros</Text>
                                <TouchableOpacity onPress={() => setShowLimitModal(false)}>
                                    <Ionicons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            <View style={{ padding: 20 }}>
                                <Text style={{ fontSize: 13, color: '#777', marginBottom: 15 }}>
                                    Selecione quantos registros exibir por vez:
                                </Text>

                                <View style={{ gap: 10 }}>
                                    <FilterOption value={50} label="50 Registros" filter={filter} dispatch={dispatch} />
                                    <FilterOption value={100} label="100 Registros" filter={filter} dispatch={dispatch} />
                                    <FilterOption value={250} label="250 Registros" filter={filter} dispatch={dispatch} />
                                    <FilterOption value={500} label="500 Registros" filter={filter} dispatch={dispatch} />
                                    <FilterOption value={1000} label="1000 Registros" filter={filter} dispatch={dispatch} />
                                </View>
                            </View>
                        </View>
                </View>
            </Modal>

        </Modal>
    );
};
