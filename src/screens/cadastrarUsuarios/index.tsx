import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from "react";
import useApi from "../../services/api";
import { LodingComponent } from "../../components/loading";

export const CadastroUsuario = ({navigation}:any) => {


    const [nomeUsuario, setNomeUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [ loading, setLoading ] = useState(false);
    const api = useApi();

   const showAlert = (message: any) => {
        Alert.alert('Alerta', message, [{ text: 'OK' }]);
    };




    async function gravar() {
        if (!nomeUsuario) return showAlert('É necessário informar o responsável da empresa');
        if (!email) return showAlert('É necessário informar o email do responsável da empresa');
        if (!senha) return showAlert('É necessário informar a senha do responsável da empresa');
        //if (!cnpj) return showAlert('É necessário informar o cnpj da empresa');

        let user = {
            "email": email,
            "senha": senha,
             "nome": nomeUsuario
        }

        try {
            setLoading(true)
            let response = await api.post('/usuarios', user);

            if (response.status === 200 ) {
                showAlert("Usuário Registrado com Sucesso!");
                 
                navigation.navigate('usuarios')
            } 

        } catch (e) {
            console.log(e)
        }finally{
            setLoading(false)
        }

    }


    return (
        <View style={{ flex: 1,alignItems:"center", justifyContent:"center" }}>
                     <LodingComponent isLoading={loading} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}   >

                <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#EAF4FE', alignItems: "center", justifyContent: "center" }}>
                  
                 <View   style={{ backgroundColor: "#FFF", borderRadius: 60, height: 120,  width: 120,   alignItems: "center", justifyContent: "center",  elevation: 3,   }}
                    >
                        <FontAwesome6 name="user-tie" size={60} color="#185FED" />
                    </View>  
                    <View style={{ backgroundColor: '#FFF', padding: 3, margin: 5, borderRadius: 5, elevation: 3, paddingBottom: 25 }}>
                        <Text style={{ color: '#185FED', fontSize: 20, marginLeft: 10, fontWeight: 'bold' }}> Usuário </Text>

                        <View style={{ width: '100%', marginTop: 20 }}>
                            <Text style={{ color: '#185FED', marginLeft: 10 }}> Usuário:</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" }}>
                                <TextInput style={{ borderBottomWidth: 1, width: '85%' }} placeholder="usuário"
                                    onChangeText={(v: any) => setNomeUsuario(v)}
                                />
                                <FontAwesome name="user" size={24} color="#185FED" />
                            </View>
                        </View>

                        {/*      <View style={{ width: '100%', marginTop: 20 }}>
            <Text style={{ color: '#185FED', marginLeft: 10 }}> cnpj/cpf da empresa:</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" }}>
                <TextInput style={{ borderBottomWidth: 1, width: '85%' }} placeholder="cnpj/cpf:"
                       onChangeText={(v:any)=> setCnpj(v)}
                />
                 <MaterialCommunityIcons name="store" size={24} color="#185FED" />
            </View>
        </View>
*/}

                        <View style={{ width: '100%', marginTop: 20 }}>
                            <Text style={{ color: '#185FED', marginLeft: 10 }}> Email: </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" }}>
                                <TextInput style={{ borderBottomWidth: 1, width: '85%' }} placeholder="example@example.com"
                                    onChangeText={(v: any) => setEmail(v)}
                                />
                                <MaterialIcons name="email" size={24} color="#185FED" />
                            </View>


                        </View>

                        <View style={{ width: '100%', marginTop: 20 }}>
                            <Text style={{ color: '#185FED', marginLeft: 10 }}> Senha: </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" }}>
                                <TextInput style={{ borderBottomWidth: 1, width: '85%' }} placeholder="Senha:" secureTextEntry
                                    onChangeText={(v: any) => setSenha(v)}
                                />
                                <MaterialIcons name="password" size={24} color="#185FED" />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ alignItems: "center", padding: 10, borderRadius: 20, backgroundColor: '#185FED', margin: 15, elevation: 2 }}
                            onPress={() => gravar()}
                        >
                            <Text style={{ color: '#FFF', fontSize: 20 }}>Registrar </Text>
                        </TouchableOpacity>
                    </View>



                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
} 