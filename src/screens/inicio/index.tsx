import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StatusBar, Modal, StyleSheet, ScrollView, Button, Alert, Linking } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUsuario } from '../../database/queryUsuario/queryUsuario';
import Checkbox from 'expo-checkbox'; // Importa o Checkbox do Expo
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export const Inicio = ({navigation}:any) => {

     const [isLoading, setIsLoading] = useState(true);
     const [consentGiven, setConsentGiven] = useState(false);
     const [isChecked, setChecked] = useState(false);
    const [ visibleModal, setVisibleModal ] = useState(false);

            const [urlPoliticas ] = useState("https://intersig.com.br/politicas-privacidade-app/");
            const [ urlTermos ] = useState("https://www.intersig.com.br/termos-de-uso-app/")

     const APP_CONSENT_KEY = '@app_consent_given';

    const animatedValue = useRef(new Animated.Value(0)).current;
    const imageOpacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1], // Começa invisível e termina visível
    });


     const openUrl = async (url:string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert(`Não foi possível abrir esta URL: ${url}`);
        }
      };

    useEffect(() => {
        // Iniciar a animação para subir a view e a imagem
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500, // Duração da animação
            useNativeDriver: true,
        }).start();
    }, []);

    // Interpolar o valor de animação para a posição Y
    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0], // Começa 100 unidades abaixo e termina na posição original
    });
    
    const handleAcceptConsent = async () => {
    try {
      await AsyncStorage.setItem(APP_CONSENT_KEY, 'true');
      setConsentGiven(true);
      setVisibleModal(false)
      
    } catch (e) {
      console.error("Failed to save consent status.", e);
      // Ainda assim, permite o prosseguimento, mas loga o erro
      setConsentGiven(true); 
    }
  };

        useEffect(() => {

         const checkConsent = async () => {
                try {
                    const value = await AsyncStorage.getItem(APP_CONSENT_KEY);
                    if (value !== null && value === 'true') {
                    setConsentGiven(true);
                    }else{
                    setVisibleModal(true);
                    }
                } catch (e) {
                    console.error("Failed to load consent status.", e);
                } finally {
                    setIsLoading(false);
                }
                };

                checkConsent()
        
            }, []);

 const handleContinue = () => {
    if (isChecked) {
     
      if (handleAcceptConsent) {
        handleAcceptConsent(); 
      }
    } else {
      Alert.alert('Atenção', 'Você precisa ler e aceitar os Termos de Uso e a Política de Privacidade para continuar.');
    }
  };
  const useQueryUsuario = useUsuario();

    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            

                <Animated.View style={{ width: '100%' ,marginTop: 55,   alignItems: "center",justifyContent:'center', opacity: imageOpacity, transform: [{ translateY }] }}>
                    <Image
                        style={{ width: 95, height: 95, resizeMode: 'stretch' }}
                        source={require('../../imgs/intersig120x120.png')}
                    />
                  
                </Animated.View>

                <Animated.View
                    style={{
                        transform: [{ translateY }],
                        width: '100%',
                        padding: 10,
                        backgroundColor: '#185FED',
                        alignItems: "center",
                        borderTopStartRadius: 30,
                        borderTopEndRadius: 30,
                        marginTop: 55,
                        height: '100%',
                    }}
                >
                    <View style={{ width: '100%', alignItems: "center", marginTop: 25 }}>
                        <TouchableOpacity style={{ alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: '#FFF', width: '90%', marginTop: 15   }}
                         onPress={()=> navigation.navigate('login')}  >
                            <Text style={{ color: '#185FED', fontWeight:'bold', width: '100%',textAlign:'center', fontSize:18}}>Entrar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginTop: 15 ,alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: '#fff', width: '90%' }} 
                           onPress={()=> navigation.navigate('registrar_empresa')}  >
                             <Text style={{ color: '#185FED', fontWeight:'bold', width: '100%',textAlign:'center', fontSize:18 }}>Teste Grátis</Text>
                        </TouchableOpacity>
                        <Text style={{ marginTop:5 , color: '#FFF', fontWeight:"bold"}}> teste valido por 30 dias!</Text>

                    </View>
            
                </Animated.View>

                    <Modal visible={visibleModal}>
                           <ScrollView style={styles.container}>
                            <View style={styles.content}>
                                <Text style={styles.title}>Consentimento dos Termos de Uso do Intersig Mobile</Text>
                                <Text style={styles.lastUpdated}>Última atualização: 20 de Maio de 2025</Text>

                                <Text style={styles.paragraph}>
                                Bem-vindo ao App Intersig! Antes de começar, por favor, leia e concorde com nossos Termos de Uso.
                                </Text>

                                <Text style={styles.subtitle}>O que você precisa saber:</Text>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Quem Somos:</Text> O aplicativo Intersig Móvel ("Aplicativo") é fornecido pela <Text style={styles.bold}>Intersig Informática.</Text>.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Seu Acordo:</Text> Ao usar o Aplicativo, você concorda com nossos Termos Legais completos. Se não concordar, não utilize o Aplicativo.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Atualizações:</Text> Podemos alterar estes Termos. A data de "Última atualização" indicará mudanças. É sua responsabilidade revisá-los periodicamente.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Uso do App:</Text> Destinado a pessoas jurídicas ou físicas maiores de 18 anos. Menores de idade, se funcionários de empresas cadastradas, devem ter permissão e supervisão.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Seus Dados:</Text>
                                    {'\n  '}- <Text style={styles.bold}>Dados da Empresa:</Text> Você é proprietário dos dados da sua empresa (CNPJ, produtos, clientes, pedidos, etc.) inseridos no app. Você nos concede uma licença para usar esses dados apenas para operar, proteger e melhorar o Aplicativo para você, incluindo a sincronização offline/online.
                                    {'\n  '}- <Text style={styles.bold}>Dados da Conta:</Text> Seus dados de login (nome, e-mail) são tratados conforme nossa Política de Privacidade.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Período de Teste:</Text> Oferecemos um teste gratuito de 30 dias. Após esse período, será necessário assinar um plano para continuar o uso completo.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Propriedade Intelectual:</Text> Nós somos proprietários do Aplicativo e seu conteúdo. Você recebe uma licença para usá-lo para fins comerciais internos.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Privacidade:</Text> Seus dados são importantes. Consulte nossa Política de Privacidade para entender como os coletamos, usamos e protegemos seus dados, em conformidade com a LGPD.
                                </Text>
                                </View>
                                <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>
                                    <Text style={styles.bold}>Funcionalidade Offline-First:</Text> O app permite uso offline, armazenando dados localmente (SQLite) e sincronizando quando há conexão. A responsabilidade pela sincronização regular é sua.
                                </Text>
                                </View>

                                <Text style={styles.paragraph}>
                                Ao marcar a caixa abaixo e continuar, você confirma que leu, compreendeu e concorda em se vincular integralmente aos nossos Termos Legais e à nossa Política de Privacidade.
                                </Text>

                                <View style={styles.checkboxContainer}>
                                <Checkbox
                                    style={styles.checkbox}
                                     value={isChecked}
                                    onValueChange={setChecked}
                                     color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={styles.labelCheckbox} 
                                 //onPress={() => setChecked(!isChecked)}
                                >
                                    Li e concordo com os Termos de Uso e a Política de Privacidade.
                                </Text>
                                </View>

                                <TouchableOpacity 
                                 onPress={() => openUrl(urlTermos)}
                                    >
                                <Text style={styles.link}>Ler os Termos de Uso Completos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                 onPress={() => openUrl(urlPoliticas)}
                                >
                                <Text style={styles.link}>Ler a Política de Privacidade</Text>
                                </TouchableOpacity>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={{marginTop: 15 ,alignItems: "center",elevation:3, padding: 10, borderRadius: 5, backgroundColor: '#185FED', width: '100%' }} 
                                    disabled={!isChecked}
                                    onPress={()=> handleContinue() }
                                    >
                                      <Text style={{ color: '#FFF', fontWeight:'bold', width: '100%',textAlign:'center', fontSize:18 }}>Aceitar e Continuar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                           </ScrollView>
                    </Modal>


        </View>
    );
};


 const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Cor de fundo suave
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
    color: '#444',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 15,
    marginRight: 8,
    lineHeight: 22,
    color: '#444',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  labelCheckbox: {
    fontSize: 15,
    color: '#333',
    flex: 1, // Para permitir que o texto quebre a linha se necessário
  },
  link: {
    fontSize: 16,
    color: '#007bff', // Cor padrão de link
    textDecorationLine: 'underline',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30, // Espaço extra no final para scroll
  },
});