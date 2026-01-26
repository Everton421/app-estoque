import React, { useEffect, useRef, useContext, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConnectedContext } from '../../contexts/conectedContext';

const { width } = Dimensions.get('window');

export function OfflineBanner() {
    // Pegamos as duas variáveis do contexto
    const { internetConnected, connected } = useContext(ConnectedContext);
    const insets = useSafeAreaInsets();
    
    // Controle da animação (100 = escondido, 0 = visível)
    const translateY = useRef(new Animated.Value(100)).current;
    
    // Estado local para definir a mensagem e cor
    const [status, setStatus] = useState({ 
        visible: false, 
        message: '', 
        icon: 'wifi-off', 
        color: '#2e2e2e' 
    });

    useEffect(() => {
        // LÓGICA DE PRIORIDADE
        if (!internetConnected) {
            // Caso 1: Sem internet no celular (Prioridade Máxima)
            setStatus({
                visible: true,
                message: 'Sem conexão com a internet',
                icon: 'wifi-off',
                color: '#2e2e2e' // Cinza escuro (Spotify style)
            });
        } else 
            if (!connected) {
            // Caso 2: Tem internet, mas não conecta na API
            setStatus({
                visible: true,
                message: 'Conectando ao servidor...',
                icon: 'cloud-off',
                color: '#b91c1c' // Um vermelho escuro para diferenciar erro de API
            });
          } else 
            {
            // Caso 3: Tudo OK
            setStatus(prev => ({ ...prev, visible: false }));
        }

    }, [internetConnected, connected]);

    // Efeito para Animar a entrada/saída
    useEffect(() => {
        if (status.visible) {
            // Slide Up (Aparecer)
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Slide Down (Esconder)
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [status.visible]);

    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    backgroundColor: status.color, // Cor dinâmica
                    transform: [{ translateY }],
                    paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 10 
                }
            ]}
        >
            <View style={styles.content}>
                {/* Ícone dinâmico precisa de tipagem any para o name ou tratar tipos do vector-icons */}
                <MaterialIcons name={status.icon as any} size={18} color="#FFF" />
                <Text style={styles.text}>{status.message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: width,
        zIndex: 9999,
        elevation: 10,
        paddingTop: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    }
});