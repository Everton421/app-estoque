import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';

type props = {
    visible: boolean;
    onConclude: () => void;
    onPause: () => void;
    onCancel: () => void;
    onContinue: () => void;
}

export const ModalExitSeparation = ({ visible, onConclude, onPause, onCancel, onContinue }: props) => {

    const ActionButton = ({ label, icon, color, onPress }: { label: string; icon: React.ReactNode; color: string; onPress: () => void }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: color,
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 10,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3
            }}
            onPress={onPress}
        >
            {icon}
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onContinue}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
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
                    <View style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: '#FFF3E0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 15
                    }}>
                        <Ionicons name="exit-outline" size={40} color="#FF9800" />
                    </View>

                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 }}>
                        Saindo da separação
                    </Text>
                    <Text style={{ fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 }}>
                        Selecione uma ação para registrar antes de sair.
                    </Text>

                    <View style={{ width: '100%', gap: 10 }}>
                        <ActionButton
                            label="Concluir"
                            color="#1E9C43"
                            icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />}
                            onPress={onConclude}
                        />
                        <ActionButton
                            label="Pausar"
                            color="#185FED"
                            icon={<Feather name="pause-circle" size={18} color="#FFF" />}
                            onPress={onPause}
                        />
                        <ActionButton
                            label="Cancelar"
                            color="#9C0404"
                            icon={<AntDesign name="close-circle" size={18} color="#FFF" />}
                            onPress={onCancel}
                        />
                        <ActionButton
                            label="Continuar separação"
                            color="#757575"
                            icon={<Ionicons name="arrow-back-circle-outline" size={18} color="#FFF" />}
                            onPress={onContinue}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
