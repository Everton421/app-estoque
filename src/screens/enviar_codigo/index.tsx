import { useState } from "react"
import { Alert, Text, TextInput, View, TouchableOpacity} from "react-native"
import useApi from "../../services/api"

export const Enviar_codigo = ( {navigation} :any)=>{

    const api = useApi();
    const [ email, setEmail ] = useState('');
    const [ senha, setSenha ] = useState('');


    async function sendCode( ) {
            if(!email || email ==='') Alert.alert('o email nao foi informado!')
                try{
                   let result = await api.post('enviar_codigo', {"email":email}) 
                    if(result.status === 200 && result.data.ok === true ){

                        navigation.navigate('alterar_senha')
                        console.log(result.data)    
                    }  
                    if(result.status === 200 && result.data.erro === true ){
                        Alert.alert('Atenção', result.data.msg)
                    }
              }catch(e){
                console.log
                }
            }   




    return(
        <View style={{ flex:1 }}>

           <View style={{ alignItems:"center" , justifyContent:'center' }}>
                <View  style={{ top: 10, backgroundColor: "#FFF", width: "90%", padding: 15, borderRadius: 10 ,justifyContent: "center", alignItems: "center", elevation: 3,   }} >
                <Text style={{ color: "#185FED", fontSize:20 }}> enviar codigo </Text>
                        <View style={{ width: "100%" }}>
                            <Text style={{ color: "#185FED" }}> EMAIL </Text>
                            <TextInput
                                style={{ borderBottomWidth: 1, width: "90%" }}
                                placeholder="example@example.com"
                                onChangeText={(v)=> setEmail(v)}
                                value={email}
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
                             enviar codigo 
                        </Text>
                        </TouchableOpacity>

                </View>
            </View>
        </View>

    )
}