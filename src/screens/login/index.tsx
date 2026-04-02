import { TextInput, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import useApi from "../../services/api";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import { useUsuario } from "../../database/queryUsuario/queryUsuario";
import { restartDatabaseService } from "../../services/restartDatabase";
import { CustomAlert } from "../../components/custom-alert/custom-alert";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const Login = ({ navigation }: any) => {

    const api = useApi();
    const useQueryUsuario = useUsuario();
    const useRestart = restartDatabaseService();
    
    // Estados do Alerta Customizado
    const[visibleAlert, setVisibleAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState<string>('');
    const [typeAlert, setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
    const [titleAlert, setTitleAlert] = useState<string>('');

    const { setLogado, setUsuario }: any = useContext(AuthContext);

    const[email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [lembrar, setLembrar] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const[showPassword, setShowPassword] = useState(false); // Para mostrar/ocultar senha

    useEffect(() => {
        async function buscaUser() {
            let users: any = await useQueryUsuario.selectRemember();
            if (users?.length > 0) {
                setUsuario(users[0]);
                setEmail(users[0].email);
                setSenha(users[0].senha);
                if (users[0].lembrar === "S") {
                    setLembrar(true);
                }
            }
        }
        buscaUser();
    },[]);

    const dispararAlerta = (titulo: string, mensagem: string, tipo: 'success' | 'error' | 'warning' | 'info') => {
        setTitleAlert(titulo);
        setMessageAlert(mensagem);
        setTypeAlert(tipo);
        setVisibleAlert(true);
    }

    async function logar() {
        if (!email) return dispararAlerta("Erro", "É necessário informar o e-mail!", "error");
        if (!senha) return dispararAlerta("Erro", "É necessário informar a senha!", "error");

        let user = { email: email, senha: senha };

        let userRemember: any = await useQueryUsuario.selectRemember();

        if (userRemember.length > 0 && userRemember[0].email === user.email) {
            if (lembrar === false) {
                await useQueryUsuario.updateRemember();
            }
            setUsuario(userRemember[0]);
            setLogado(true);
            return;
        } else {
            try {
                setLoading(true);
                let response: any = await api.post("/login", user);

                if (response.status == 200) {
                    let lembrarUsuario = lembrar ? "S" : "N";
                    let userMobile = {
                        email: user.email,
                        senha: user.senha,
                        codigo: response.data.codigo,
                        nome: response.data.usuario,
                        lembrar: lembrarUsuario,
                        token: response.data.token
                    };

                    await useRestart.restart();
                    setUsuario(userMobile);
                    setLogado(true);

                    await useQueryUsuario.create(userMobile);
                    return;
                }
            } catch (e: any) {
                console.log(e);
                if (e.response && e.response.status === 400) {
                    dispararAlerta("Falha no Login", e.response.data.msg, "error");
                } else {
                    dispararAlerta("Erro", "Ocorreu um erro inesperado ao conectar ao servidor.", "error");
                }
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        /* --- AJUSTE AQUI: O behavior foi ajustado para Android e iOS --- */
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1, backgroundColor: "#EAF4FE" }}
        >
            
            <CustomAlert
                visible={visibleAlert}
                message={messageAlert}
                onConfirm={() => setVisibleAlert(false)}
                title={titleAlert}
                type={typeAlert}
            />

            {/* --- AJUSTE AQUI: keyboardShouldPersistTaps e paddingBottom aumentado --- */}
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', padding: 5, marginBottom: 20 }}>
                    <Ionicons name="arrow-back" size={28} color="#185FED" />
                </TouchableOpacity>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    
                    <View style={{
                        backgroundColor: "#FFF",
                        borderRadius: 50,
                        height: 100,
                        width: 100,
                        alignItems: "center",
                        justifyContent: "center",
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        marginBottom: -40, 
                        zIndex: 10
                    }}>
                        <FontAwesome6 name="user-tie" size={45} color="#185FED" />
                    </View>

                    <View style={{
                        backgroundColor: "#FFF",
                        width: "100%",
                        padding: 20,
                        paddingTop: 60, 
                        borderRadius: 16,
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    }}>
                        <Text style={{ color: "#333", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
                            Bem-vindo de volta!
                        </Text>

                        {/* Input E-mail */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: "#555", fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>E-mail</Text>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#F5F7FA',
                                borderWidth: 1,
                                borderColor: '#E0E0E0',
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                height: 50
                            }}>
                                <MaterialCommunityIcons name="email-outline" size={22} color="#185FED" style={{ marginRight: 10 }} />
                                <TextInput
                                    style={{ flex: 1, color: '#333', fontSize: 16 }}
                                    placeholder="Digite seu e-mail"
                                    placeholderTextColor="#999"
                                    onChangeText={setEmail}
                                    value={email}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Input Senha */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ color: "#555", fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>Senha</Text>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#F5F7FA',
                                borderWidth: 1,
                                borderColor: '#E0E0E0',
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                height: 50
                            }}>
                                <MaterialCommunityIcons name="lock-outline" size={22} color="#185FED" style={{ marginRight: 10 }} />
                                <TextInput
                                    style={{ flex: 1, color: '#333', fontSize: 16 }}
                                    secureTextEntry={!showPassword}
                                    onChangeText={setSenha}
                                    placeholder="Sua senha"
                                    placeholderTextColor="#999"
                                    value={senha}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Opções: Lembrar e Esqueci a Senha */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => setLembrar(!lembrar)}
                            >
                                <MaterialCommunityIcons 
                                    name={lembrar ? "checkbox-marked" : "checkbox-blank-outline"} 
                                    size={24} 
                                    color={lembrar ? "#185FED" : "#999"} 
                                />
                                <Text style={{ marginLeft: 8, color: '#555', fontWeight: '500' }}>Lembrar-me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('enviar_codigo')}>
                                <Text style={{ color: '#185FED', fontWeight: "bold" }}>Esqueci a senha</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Botão de Login */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: loading ? "#B0C4DE" : "#185FED",
                                borderRadius: 10,
                                paddingVertical: 14,
                                alignItems: "center",
                                justifyContent: "center",
                                elevation: loading ? 0 : 4
                            }}
                            onPress={logar}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>ENTRAR</Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};