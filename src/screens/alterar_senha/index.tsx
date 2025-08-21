import { useState } from "react"
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native"
import useApi from "../../services/api";

export const Alterar_senha = ({navigation}:any)=>{

    const [ email, setEmail  ] = useState('');
    const [ senha, setSenha  ] = useState('');
    const [ codigo, setCodigo ] = useState('');
    const api = useApi();

    async function sendCode( ) {
        if(!email || email ==='') Alert.alert('o email nao foi informado!')
        if(!senha || senha ==='') Alert.alert('a senha nao foi informada!')
        if(!codigo || codigo ==='') Alert.alert('o codigo de recuperacao nao foi informado!')

            try{
               let result = await api.post('alterar_senha', { "email":email, "senha":senha, "codigo":codigo }) 
               console.log(result.data)
                if(result.status === 200 && result.data.ok === true ){
                    Alert.alert('Ok', result.data.msg)
                    setTimeout(()=>{ },3000)
                    navigation.navigate('login')
                } 
                if(result.status === 200 && result.data.erro === true ){
                    Alert.alert('Atenção', result.data.msg)
                } 
          }catch(e){
            console.log 
            }
        }   

    return(
        <View style={{ flex:1}} >
                 <View style={{ alignItems:"center" , justifyContent:'center', marginTop:30 }}>
                <View  style={{ top: 10, backgroundColor: "#FFF", width: "90%", padding: 15, borderRadius: 10 ,justifyContent: "center", alignItems: "center", elevation: 3,   }} >
                 <Text style={{ color: "#185FED", fontSize:20 }}> alterar senha </Text>

                        <View style={{ width: "100%" }}>
                            <Text style={{ color: "#185FED" }}> EMAIL: </Text>
                            <TextInput
                                style={{ borderBottomWidth: 1, width: "90%" }}
                                placeholder="example@example.com"
                                 onChangeText={(v)=> setEmail(v)}
                                 value={email}
                            />
                        </View>

                        <View style={{ width: "100%", marginTop:10 }}>
                            <Text style={{ color: "#185FED" }}> NOVA SENHA: </Text>
                            <TextInput
                                style={{ borderBottomWidth: 1, width: "90%" }}
                                placeholder=""
                                onChangeText={(v)=> setSenha(v)}
                                 value={senha}
                            />
                        </View>

                        <View style={{ width: "100%", marginTop:10 }}>
                            <Text style={{ color: "#185FED" }}>CODIGO:</Text>
                            <TextInput
                                style={{ borderBottomWidth: 1, width: "90%" }}
                                placeholder=""
                                onChangeText={(v)=> setCodigo(v)}
                                value={codigo}
                            />
                        </View>


                        <TouchableOpacity
                        style={{
                           margin:15, alignItems: "center", padding: 10, borderRadius: 20, backgroundColor: "#185FED", }}
                       onPress={() => sendCode()}
                        >
                            <Text
                                style={{
                                color: "#FFF",
                                width: "100%",
                                textAlign: "center",
                                }}
                            >
                                alterar senha 
                            </Text>
                        </TouchableOpacity>

                </View>
            </View>
    
        </View>
    )
} 