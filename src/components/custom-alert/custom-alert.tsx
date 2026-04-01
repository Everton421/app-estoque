import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: AlertType;
    onConfirm: () => void;
    confirmText?: string;
    onCancel?: () => void;
    cancelText?: string;
}

export const CustomAlert = ({
    visible,
    title,
    message,
    type = 'info',
    onConfirm,
    confirmText = 'OK',
    onCancel,
    cancelText = 'Cancelar'
}: CustomAlertProps) => {

    // Configuração visual dinâmica baseada no "tipo" do alerta
    const typeConfig = {
        success: { icon: 'checkmark-circle', color: '#4CAF50', bg: '#E8F5E9' },
        error: { icon: 'close-circle', color: '#F44336', bg: '#FFEBEE' },
        warning: { icon: 'warning', color: '#FF9800', bg: '#FFF3E0' },
        info: { icon: 'information-circle', color: '#185FED', bg: '#EAF4FE' },
    };

    const config = typeConfig[type];

    return (
        <Modal 
            transparent={true} 
            visible={visible} 
            animationType="fade"
            onRequestClose={onCancel || onConfirm} // Fecha no Android ao apertar voltar
        >
            {/* Overlay escuro */}
            <View style={{ 
                flex: 1, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                justifyContent: 'center', 
                alignItems: 'center',
                paddingHorizontal: 20
            }}>
                
                {/* Card do Alerta */}
                <View style={{ 
                    width: '100%', 
                    backgroundColor: '#FFF', 
                    borderRadius: 16, 
                    padding: 25, 
                    alignItems: 'center', 
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5
                }}>
                    
                    {/* Ícone Redondo */}
                    <View style={{ 
                        width: 70, 
                        height: 70, 
                        borderRadius: 35, 
                        backgroundColor: config.bg, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        marginBottom: 15 
                    }}>
                        <Ionicons name={config.icon as any} size={40} color={config.color} />
                    </View>

                    {/* Textos */}
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 }}>
                        {title}
                    </Text>
                    <Text style={{ fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 }}>
                        {message}
                    </Text>

                    {/* Botões */}
                    <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
                        
                        {/* Botão Cancelar (Só aparece se passar a função onCancel) */}
                        {onCancel && (
                            <TouchableOpacity
                                style={{ 
                                    flex: 1, 
                                    backgroundColor: '#F5F5F5', 
                                    paddingVertical: 12, 
                                    borderRadius: 10, 
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#E0E0E0'
                                }}
                                onPress={onCancel}
                            >
                                <Text style={{ color: '#555', fontWeight: 'bold', fontSize: 16 }}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Botão Confirmar */}
                        <TouchableOpacity
                            style={{ 
                                flex: 1, 
                                backgroundColor: config.color, 
                                paddingVertical: 12, 
                                borderRadius: 10, 
                                alignItems: 'center',
                                elevation: 2
                            }}
                            onPress={onConfirm}
                        >
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{confirmText}</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </Modal>
    );
};