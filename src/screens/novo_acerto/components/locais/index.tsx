import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { prod_setor } from "../../../../database/queryProdutoSetor/queryProdutoSetor";

type historico = { historico: string }
type unidade_medida = { unidade_medida: string }
type dataProdMov = prod_setor & historico & unidade_medida

type props = {
    item: { local_produto: string, local1_produto: string, local2_produto: string, local3_produto: string, local4_produto: string, },
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    onUpdateField: (fieldName: keyof dataProdMov, value: string) => void
}

type InputLocalProps = {
    label: string,
    field: keyof dataProdMov,
    value: string,
    onChangeText: (field: keyof dataProdMov, text: string) => void
}

const InputLocal = ({ label, field, value, onChangeText }: InputLocalProps) => (
    <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' }}>{label}</Text>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F5F7FA',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            paddingHorizontal: 12
        }}>
            <Ionicons name="location-outline" size={20} color="#185FED" style={{ marginRight: 8 }} />
            <TextInput
                style={{ flex: 1, height: 45, color: '#333', fontSize: 16 }}
                value={value}
                onChangeText={(text) => onChangeText(field, text)}
                placeholder="Informe o local"
                placeholderTextColor="#BDBDBD"
            />
        </View>
    </View>
);

export const Locais = ({ item, visible, setVisible, onUpdateField }: props) => {

    const [locais, setLocais] = useState({
        local_produto: item.local_produto,
        local1_produto: item.local1_produto,
        local2_produto: item.local2_produto,
        local3_produto: item.local3_produto,
        local4_produto: item.local4_produto,
    });

    const handleChangeText = (field: keyof dataProdMov, text: string) => {
        setLocais((prev) => ({ ...prev, [field]: text }));
    };

    const handleConfirm = () => {
        (Object.keys(locais) as (keyof typeof locais)[]).forEach((field) => {
            onUpdateField(field, locais[field]);
        });
        setVisible(false);
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
            <View style={{ flex: 1,  backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ width: '100%', alignItems: 'center'  }}
                >
                    <View style={{
                        width: "90%",
                        backgroundColor: "#FFF",
                        borderRadius: 16,
                        overflow: 'hidden',
                        elevation: 10,
                        maxHeight: '99%'
                    }}>
                        <View style={{
                            backgroundColor: '#185FED',
                            padding: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Definir Locais</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled">
                            <View style={{ padding: 20 }}>
                                <InputLocal label="Local Principal" field="local_produto" value={locais.local_produto} onChangeText={handleChangeText} />
                                <InputLocal label="Local Extra 1" field="local1_produto" value={locais.local1_produto} onChangeText={handleChangeText} />
                                <InputLocal label="Local Extra 2" field="local2_produto" value={locais.local2_produto} onChangeText={handleChangeText} />
                                <InputLocal label="Local Extra 3" field="local3_produto" value={locais.local3_produto} onChangeText={handleChangeText} />
                                <InputLocal label="Local Extra 4" field="local4_produto" value={locais.local4_produto} onChangeText={handleChangeText} />

                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    style={{
                                        backgroundColor: '#185FED',
                                        borderRadius: 10,
                                        paddingVertical: 12,
                                        alignItems: 'center',
                                        marginTop: 10
                                    }}
                                >
                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    )
}
