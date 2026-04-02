import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Modal, ScrollView, Alert, Linking } from "react-native";
import { useUsuario } from '../../database/queryUsuario/queryUsuario';
import Checkbox from 'expo-checkbox'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export const Inicio = ({ navigation }: any) => {

    const[isLoading, setIsLoading] = useState(true);
    const [consentGiven, setConsentGiven] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [visibleModal, setVisibleModal] = useState(false);

    const [urlPoliticas] = useState("https://intersig.com.br/politicas-privacidade-app/");
    const [urlTermos] = useState("https://www.intersig.com.br/termos-de-uso-app/");

    const APP_CONSENT_KEY = '@app_consent_given';

    const animatedValue = useRef(new Animated.Value(0)).current;
    
    const imageOpacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1], 
    });

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange:[150, 0], // Começa um pouco mais abaixo para um efeito "slide up" melhor
    });

    const openUrl = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Não foi possível abrir esta URL: ${url}`);
        }
    };

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800, // Deixei levemente mais suave (800ms)
            useNativeDriver: true,
        }).start();
    },[]);

    const handleAcceptConsent = async () => {
        try {
            await AsyncStorage.setItem(APP_CONSENT_KEY, 'true');
            setConsentGiven(true);
            setVisibleModal(false);
        } catch (e) {
            console.error("Failed to save consent status.", e);
            setConsentGiven(true); 
            setVisibleModal(false);
        }
    };

    useEffect(() => {
        const checkConsent = async () => {
            try {
                const value = await AsyncStorage.getItem(APP_CONSENT_KEY);
                if (value !== null && value === 'true') {
                    setConsentGiven(true);
                } else {
                    setVisibleModal(true);
                }
            } catch (e) {
                console.error("Failed to load consent status.", e);
            } finally {
                setIsLoading(false);
            }
        };
        checkConsent();
    },[]);

    const handleContinue = () => {
        if (isChecked) {
            handleAcceptConsent();
        } else {
            Alert.alert('Atenção', 'Você precisa ler e aceitar os Termos de Uso e a Política de Privacidade para continuar.');
        }
    };

    const useQueryUsuario = useUsuario();

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            
            {/* Logo Centralizada Animada */}
            <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: 'center', opacity: imageOpacity, transform: [{ translateY }] }}>
                <Image
                    style={{ width: 120, height: 120, resizeMode: 'contain' }}
                    source={require('../../imgs/intersig120x120.png')}
                />
            </Animated.View>

            {/* Painel Inferior Azul Animado */}
            <Animated.View
                style={{
                    transform: [{ translateY }],
                    width: '100%',
                    backgroundColor: '#185FED',
                    alignItems: "center",
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    paddingTop: 40,
                    paddingBottom: 60,
                    paddingHorizontal: 20,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10
                }}
            >
                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
                    Bem-vindo ao Intersig
                </Text>

                <TouchableOpacity 
                    style={{ 
                        alignItems: "center", 
                        paddingVertical: 14, 
                        borderRadius: 12, 
                        backgroundColor: '#FFF', 
                        width: '100%', 
                        marginBottom: 15,
                        elevation: 3
                    }}
                    onPress={() => navigation.navigate('login')}  
                >
                    <Text style={{ color: '#185FED', fontWeight: 'bold', fontSize: 18 }}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={{
                        alignItems: "center", 
                        paddingVertical: 14, 
                        borderRadius: 12, 
                        backgroundColor: 'transparent', 
                        width: '100%', 
                        borderWidth: 2,
                        borderColor: '#FFF'
                    }} 
                    onPress={() => navigation.navigate('registrar_empresa')}  
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>Teste Grátis</Text>
                </TouchableOpacity>

                <Text style={{ marginTop: 15, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: "600" }}>
                    Teste válido por 30 dias!
                </Text>
            </Animated.View>

            {/* MODAL DE TERMOS DE USO */}
            <Modal visible={visibleModal} transparent={true} animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                    
                    <View style={{ 
                        width: '90%', 
                        height: '85%', 
                        backgroundColor: '#FFF', 
                        borderRadius: 16, 
                        overflow: 'hidden', 
                        elevation: 10 
                    }}>
                        {/* Header do Modal */}
                        <View style={{ backgroundColor: '#185FED', padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                                Termos de Uso e Privacidade
                            </Text>
                        </View>

                        {/* Corpo do Texto */}
                        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                            
                            <Text style={{ fontSize: 12, fontStyle: 'italic', color: '#999', marginBottom: 15, textAlign: 'center' }}>
                                Última atualização: 20 de Maio de 2025
                            </Text>

                            <Text style={{ fontSize: 15, lineHeight: 22, color: '#444', marginBottom: 15 }}>
                                Bem-vindo ao App Intersig! Antes de começar, por favor, leia e concorde com nossos Termos de Uso.
                            </Text>

                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>
                                O que você precisa saber:
                            </Text>

                            {/* Tópicos */}
                            {[
                                { title: "Quem Somos", text: "O aplicativo Intersig Móvel (\"Aplicativo\") é fornecido pela Intersig Informática." },
                                { title: "Seu Acordo", text: "Ao usar o Aplicativo, você concorda com nossos Termos Legais completos. Se não concordar, não utilize o Aplicativo." },
                                { title: "Atualizações", text: "Podemos alterar estes Termos. A data de \"Última atualização\" indicará mudanças. É sua responsabilidade revisá-los." },
                                { title: "Uso do App", text: "Destinado a pessoas jurídicas ou físicas maiores de 18 anos. Menores de idade devem ter supervisão." },
                                { title: "Período de Teste", text: "Oferecemos um teste gratuito de 30 dias. Após isso, será necessário assinar um plano para continuar o uso." },
                                { title: "Privacidade", text: "Seus dados são importantes. Consulte nossa Política de Privacidade para entender como os coletamos e protegemos em conformidade com a LGPD." },
                                { title: "Modo Offline", text: "O app permite uso offline. A responsabilidade pela sincronização regular quando houver internet é sua." }
                            ].map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <Text style={{ fontSize: 15, color: '#185FED', marginRight: 8 }}>•</Text>
                                    <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: '#444' }}>
                                        <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.title}: </Text>
                                        {item.text}
                                    </Text>
                                </View>
                            ))}

                            <Text style={{ fontSize: 15, lineHeight: 22, color: '#444', marginTop: 10, marginBottom: 20 }}>
                                Ao marcar a caixa abaixo e continuar, você confirma que leu, compreendeu e concorda em se vincular integralmente aos nossos Termos e Política.
                            </Text>

                            {/* Checkbox */}
                            <TouchableOpacity 
                                activeOpacity={0.7} 
                                onPress={() => setChecked(!isChecked)}
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: isChecked ? '#185FED' : '#E0E0E0' }}
                            >
                                <Checkbox
                                    value={isChecked}
                                    onValueChange={setChecked}
                                    color={isChecked ? '#185FED' : undefined}
                                    style={{ marginRight: 10 }}
                                />
                                <Text style={{ flex: 1, fontSize: 14, color: isChecked ? '#185FED' : '#555', fontWeight: isChecked ? 'bold' : 'normal' }}>
                                    Li e concordo com os Termos de Uso e a Política de Privacidade.
                                </Text>
                            </TouchableOpacity>

                            {/* Links Externos */}
                            <View style={{ gap: 10, marginBottom: 30 }}>
                                <TouchableOpacity onPress={() => openUrl(urlTermos)}>
                                    <Text style={{ fontSize: 14, color: '#185FED', textDecorationLine: 'underline', textAlign: 'center' }}>Ler os Termos de Uso Completos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openUrl(urlPoliticas)}>
                                    <Text style={{ fontSize: 14, color: '#185FED', textDecorationLine: 'underline', textAlign: 'center' }}>Ler a Política de Privacidade</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>

                        {/* Botão Fixo no Rodapé do Modal */}
                        <View style={{ padding: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FFF' }}>
                            <TouchableOpacity 
                                disabled={!isChecked}
                                onPress={handleContinue}
                                style={{
                                    alignItems: "center",
                                    paddingVertical: 14,
                                    borderRadius: 10,
                                    backgroundColor: isChecked ? '#185FED' : '#B0C4DE',
                                    width: '100%',
                                    elevation: isChecked ? 3 : 0
                                }}
                            >
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Aceitar e Continuar</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

        </View>
    );
};