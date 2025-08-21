import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Button, ActivityIndicator, Modal } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useApi from '../../services/api';
import { useUsuario } from '../../database/queryUsuario/queryUsuario';
import { queryEmpresas } from '../../database/queryEmpresas/queryEmpresas';

import Foundation from '@expo/vector-icons/Foundation';
import { insertDataFic } from '../../services/insertDataFic';
import { AuthContext } from '../../contexts/auth';
import { cpf as cpfValid, cnpj as cnpjValid } from 'cpf-cnpj-validator'

// --- FUNÇÕES DE VALIDAÇÃO ADICIONADAS ---
const isValidEmail = (email: string): boolean => {
    // Expressão regular simples para validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
    // Remove caracteres não numéricos
    const cleanedPhone = phone.replace(/\D/g, '');
    // Valida se tem 10 ou 11 dígitos (comum para formatos brasileiros com DDD)
    // (XX) XXXX-XXXX -> 10 dígitos
    // (XX) XXXXX-XXXX -> 11 dígitos
    return cleanedPhone.length === 10 || cleanedPhone.length === 11;
};
// --- FIM DAS FUNÇÕES DE VALIDAÇÃO ---

export const Resgistrar_empresa = ({ navigation }: any) => {
    const api = useApi();

    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [emailEmpresa, setEmailEmpresa] = useState('');
    const [cnpjInput, setCnpjInput] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState(''); // Telefone da empresa
    const [loading, setLoading] = useState(false);
    const [telefoneUsuario, setTelefoneUsuario] = useState(''); // Telefone do usuário/responsável

    const [visible, setVisible] = useState(true);

    const [dadosFic, setDadosFic] = useState<boolean | null>(true);

    const { logado, setLogado, usuario, setUsuario }: any = useContext(AuthContext);

    let useQueryUsuario = useUsuario();
    let useQueryEmpresa = queryEmpresas();
    let useDataFic = insertDataFic();

    const showAlert = (message: any) => {
        Alert.alert('Alerta', message, [{ text: 'OK' }]);
    };


    interface EmpresaMobile {
        codigo_empresa: number,
        nome: string,
        cnpj: string,
        email: string,
        responsavel: string
    }


    async function register() {

        let validCnpjInput = false;
        if (cnpjValid.isValid(cnpjInput)) {
            validCnpjInput = cnpjValid.isValid(cnpjInput)
        }
        if (cpfValid.isValid(cnpjInput)) {
            validCnpjInput = cpfValid.isValid(cnpjInput)
        }

        if (!validCnpjInput) {
            return Alert.alert('Erro!', "CNPJ/CPF inválido!")
        }

        if (!nomeEmpresa) {
            setLoading(false);
            return showAlert('É Necessário Informar o Nome da Empresa!');
        }
        if (!cnpjInput) return showAlert('É Necessário Informar o CNPJ da Empresa!');
        
        // Validação do Email da Empresa
        if (!emailEmpresa) {
            setLoading(false);
            return showAlert('É Necessário Informar o Email da Empresa!');
        }
        if (!isValidEmail(emailEmpresa)) {
            setLoading(false);
            return showAlert('Email da Empresa inválido!');
        }

        // Validação do Telefone da Empresa (opcional, mas se informado, deve ser válido)
        if (telefone && !isValidPhoneNumber(telefone)) {
            setLoading(false);
            return showAlert('Telefone da Empresa inválido! Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.');
        }

        if (!nomeUsuario) return showAlert('É Necessário Informar o Responsável da Empresa!');
        
        // Validação do Email do Responsável
        if (!email) {
            setLoading(false);
            return showAlert('É Necessário Informar o Email do Responsável da Empresa!');
        }
        if (!isValidEmail(email)) {
            setLoading(false);
            return showAlert('Email do Responsável inválido!');
        }
        
        // Validação do Telefone do Usuário/Responsável (opcional, mas se informado, deve ser válido)
        if (telefoneUsuario && !isValidPhoneNumber(telefoneUsuario)) {
            setLoading(false);
            return showAlert('Telefone do Responsável inválido! Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.');
        }

        if (!senha) return showAlert('É Necessário Informar a Senha do Responsável da Empresa!');

        let empresa =
        {
            "nome_empresa": nomeEmpresa,
            "telefone_empresa": telefone,
            "email_empresa": emailEmpresa,
            "cnpj": cnpjInput,
            dados_teste: dadosFic
        }
        let usuarioEmpresa =
        {
            "nome": nomeUsuario,
            "telefone": telefoneUsuario,
            "email": email,
            "senha": senha
        }

        try {
            setLoading(true);
            let response = await api.post('/empresa', { empresa: empresa, usuario: usuarioEmpresa });
            if (response.status === 200) {
                console.log(response.data);
                const apiResult = response.data;
                const resultEmpresa = response.data.data.empresa
                const resultUsuario = response.data.data.usuario

                let responsavel = resultUsuario.codigo_usuario;
                let codigo_empresa = resultEmpresa.codigo_empresa;
                let cnpj = resultEmpresa.cnpj;
                let nome_empresa = resultEmpresa.nome_empresa;
                let email_empresa = resultEmpresa.email_empresa;

                const empMobile: EmpresaMobile = { codigo_empresa: codigo_empresa, nome: nome_empresa, cnpj: cnpj, email: email_empresa, responsavel: responsavel };

                let email_usuario = resultUsuario.email_usuario;
                let senhaUsuarioApi = resultUsuario.senha; // Renomeei para evitar conflito com a variável de estado 'senha'
                let nomeDoUsuarioApi = resultUsuario.usuario // nome do usuario - Renomeei para evitar conflito
                let token = resultUsuario.token

                let userMobile = {
                    email: email_usuario,
                    senha: senhaUsuarioApi, // Use a senha retornada pela API ou a digitada, conforme a lógica do seu app
                    codigo: responsavel,
                    nome: nomeDoUsuarioApi,
                    lembrar: "S",
                    token: token
                };
                let codeUser = await useQueryUsuario.create(userMobile);


                let resCadEmpr = await useQueryEmpresa.create(empMobile);
                if (resCadEmpr > 0) console.log("empresa rgistrada")
                setNomeEmpresa('')
                setEmailEmpresa('')
                setCnpjInput('')
                setNomeUsuario('')
                setEmail('')
                setSenha('');
                setTelefone(''); // Limpar telefone da empresa
                setTelefoneUsuario(''); // Limpar telefone do usuário
                showAlert(apiResult.status.msg);
                setUsuario(userMobile);
                setLogado(true);
            }
        } catch (e: any) {
            console.log('Erro:', e.response?.data?.msg || e.message); // Melhor log de erro
            if (e.response && e.response.status === 400) {
                 showAlert(e.response.data.msg);
            } else if (e.response) {
                showAlert(`Erro ${e.response.status}: ${e.response.data?.msg || 'Ocorreu um erro.'}`);
            }
             else {
                showAlert('Ocorreu um erro ao tentar registrar. Verifique sua conexão.');
            }
        } finally {
            setLoading(false);
        }
    }


    return (
        <View style={{ flex: 1 }}>
            {/*************** */}
            <Modal transparent={true} visible={visible}>
                <View style={{ width: '100%', height: '100%', alignItems: "center", justifyContent: "center", backgroundColor: 'rgba(50,50,50, 0.6)' }} >
                    <View style={{ width: '90%', height: 'auto', maxHeight: '80%', backgroundColor: '#FFF', borderRadius: 10, alignItems: 'center', paddingVertical: 20, paddingHorizontal: 15 }} >
                        <Foundation name="alert" size={50} color="#185FED" />
                        <Text style={{ width: "100%", textAlign: "center", fontWeight: "bold", color: "#868686", fontSize: 20, marginTop: 10 }}>
                            Atenção!
                        </Text>
                        <Text style={{ width: "100%", textAlign: "center", color: "#868686", marginTop: 10, marginBottom: 20, lineHeight: 20 }}>
                            Ao utilizar dados fictícios, serão adicionados exemplos dos itens a serem usados no App, como produtos, clientes, etc. Após efetuar o login, execute uma sincronização para obter os dados.
                        </Text>


                        <View style={{ marginBottom: 20, width: '100%', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={{ marginVertical: 5, alignItems: "center", flexDirection: 'row', padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 5, width: '90%', justifyContent: 'center' }}
                                onPress={() => {
                                    setDadosFic(true)
                                }}
                            >
                                <View style={[{ width: 20, height: 20, borderWidth: 2, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', borderColor: dadosFic ? "#185FED" : "#AAA" }]}>
                                    {dadosFic && (
                                        <View style={{ width: 10, height: 10, backgroundColor: "#185FED", borderRadius: 5 }} />
                                    )}
                                </View>
                                <Text style={{ fontWeight: "bold", color: "#868686", flexShrink: 1 }}>
                                    Desejo utilizar dados fictícios.
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 20, width: '100%', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={{ marginVertical: 5, alignItems: "center", flexDirection: 'row', padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 5, width: '90%', justifyContent: 'center' }}
                                onPress={() => {
                                    setDadosFic(false)
                                }}
                            >
                                <View style={[{ width: 20, height: 20, borderWidth: 2, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', borderColor: dadosFic === false ? "#185FED" : "#AAA" }]}>
                                    {dadosFic === false && (
                                        <View style={{ width: 10, height: 10, backgroundColor: "#185FED", borderRadius: 5 }} />
                                    )}
                                </View>
                                <Text style={{ fontWeight: "bold", color: "#868686", flexShrink: 1 }}>
                                    Desejo cadastrar os dados da minha empresa.
                                </Text>
                            </TouchableOpacity>
                        </View>


                        <TouchableOpacity
                            style={{ marginTop: 20, backgroundColor: '#185FED', width: '80%', alignItems: "center", justifyContent: "center", borderRadius: 10, padding: 10, }}
                            onPress={() => setVisible(false)}

                        >
                            <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 20 }}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/*************** */}

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} 
            >
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                        <ActivityIndicator size={25} color={'#185FED'} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#EAF4FE' }}>
                        <View style={{ width: '100%', marginTop: 10 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ margin: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="arrow-back" size={30} color="#185FED" />
                                {/* <Text style={{ color: '#185FED', fontSize: 16, marginLeft: 5 }}>Voltar</Text> */}
                            </TouchableOpacity>

                            {/* Empresa */}
                            <View style={{ backgroundColor: '#FFF', padding: 10, marginHorizontal: 10, marginBottom: 10, borderRadius: 5, elevation: 3 }}>
                                <Text style={{ color: '#185FED', fontSize: 20, marginLeft: 10, fontWeight: 'bold', marginBottom: 15 }}> Empresa </Text>
                                <View style={{ width: '100%', marginTop: 5 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: '#185FED', marginLeft: 10 }}> Nome: </Text>
                                        {/* <Text style={{ color: '#185FED', marginLeft: 5, fontWeight: 'bold' }}>   {nomeEmpresa}</Text> */}
                                    </View>

                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="Nome fantasia:"
                                            value={nomeEmpresa}
                                            onChangeText={setNomeEmpresa}
                                        />
                                        <MaterialCommunityIcons name="store" size={24} color="#185FED" />
                                    </View>
                                </View>

                                <View style={{ width: '100%', marginTop: 15 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: '#185FED', marginLeft: 10 }}> CNPJ/CPF: </Text>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="00.000.000/0000-00 ou CPF"
                                            value={cnpjInput}
                                            onChangeText={setCnpjInput}
                                            keyboardType="numeric"
                                        />
                                        <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#185FED" />
                                    </View>
                                </View>

                                <View style={{ width: '100%', marginTop: 15 }}>
                                    <Text style={{ color: '#185FED', marginLeft: 10 }}> Email: </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="empresa@exemplo.com"
                                            value={emailEmpresa}
                                            onChangeText={setEmailEmpresa}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        <MaterialIcons name="email" size={24} color="#185FED" />
                                    </View>
                                </View>

                                <View style={{ width: '100%', marginTop: 15, paddingBottom: 10 }}>
                                    <Text style={{ color: '#185FED', marginLeft: 10 }}> Telefone: </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="(XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
                                            value={telefone}
                                            onChangeText={setTelefone}
                                            keyboardType="phone-pad"
                                        />
                                        <MaterialIcons name="phone" size={24} color="#185FED" />
                                    </View>
                                </View>
                            </View>

                            {/* Responsável */}
                            <View style={{
                                backgroundColor: '#FFF', padding: 10, marginHorizontal: 10, marginBottom: 10, borderRadius: 5, elevation: 3
                            }}>
                                <Text style={{ color: '#185FED', fontSize: 20, marginLeft: 10, fontWeight: 'bold', marginBottom: 15 }}> Responsável </Text>

                                <View style={{ width: '100%', marginTop: 5 }}>
                                    <Text style={{ color: '#185FED', marginLeft: 10 }}> Nome do Usuário:</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="Seu nome de usuário"
                                            value={nomeUsuario}
                                            onChangeText={setNomeUsuario}
                                        />
                                        <FontAwesome name="user" size={24} color="#185FED" />
                                    </View>
                                </View>

                                <View style={{ width: '100%', marginTop: 15 }}>
                                    <Text style={{ color: '#185FED', marginLeft: 10 }}> Telefone: </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="(XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
                                            value={telefoneUsuario}
                                            onChangeText={setTelefoneUsuario}
                                            keyboardType="phone-pad"
                                        />
                                        <MaterialIcons name="phone" size={24} color="#185FED" />
                                    </View>
                                </View>

                                <View style={{ width: '100%', marginTop: 15 }}>
                                    <Text style={{ color: '#185FED', marginLeft: 10 }}> Email: </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="seuemail@exemplo.com"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        <MaterialIcons name="email" size={24} color="#185FED" />
                                    </View>
                                </View>

                                <View style={{ width: '100%', marginTop: 15, paddingBottom: 10 }}>
                                    <Text style={{ color: '#185FED', marginLeft: 10 }}> Senha: </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingHorizontal: 10 }}>
                                        <TextInput style={{ borderBottomWidth: 1, borderColor: '#DDD', flex: 1, paddingVertical: 8 }} placeholder="Senha" secureTextEntry
                                            value={senha}
                                            onChangeText={setSenha}
                                        />
                                        <MaterialIcons name="password" size={24} color="#185FED" />
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={{ alignItems: "center", padding: 12, borderRadius: 5, backgroundColor: '#185FED', marginHorizontal: 15, marginVertical: 20, elevation: 3 }}
                                onPress={() => register()}
                                disabled={loading}
                            >
                                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Registrar </Text>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};