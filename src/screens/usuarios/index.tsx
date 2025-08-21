import { useEffect, useState } from "react"
import { Alert, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View, FlatList } from "react-native"

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import useApi from "../../services/api";
import { AntDesign } from "@expo/vector-icons";
import { useUsuario } from "../../database/queryUsuario/queryUsuario";


export const Usuarios = ({ navigation }: any) => {

    const showAlert = (message: any) => {
        Alert.alert('Alerta', message, [{ text: 'OK' }]);
    };


    const [nomeUsuario, setNomeUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [ dados, setDados ] = useState([]);

    const useQueryUsuario = useUsuario();


    const api = useApi();

    useEffect(()=>{
        async function busca(){
            let data:any = await useQueryUsuario.selectAll();
            setDados(data)
            
        }
        busca()
    },[])

    function renderItem( { item}:any ){
                    return(
                        <TouchableOpacity 
                           // onPress={ ()=> handleSelect(item) }
                            style={{ backgroundColor:'#FFF', elevation:2, padding:3, margin:5, borderRadius:5,  width:'95%'}}
                         >
                           <Text style={{ fontWeight:"bold"}}>
                              Codigo: {item.codigo}
                           </Text>
                           <Text>
                             {item.nome}
                           </Text>
                           <Text style={{ fontWeight:"bold" }}>
                                email: {item.email}
                           </Text>
                        </TouchableOpacity>
                    )
                }
                
   
    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: '#185FED', }}>
                <View style={{ padding: 15, alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ margin: 5 }}>
                        <Ionicons name="arrow-back" size={25} color="#FFF" />
                    </TouchableOpacity>


                    <View style={{ flexDirection: "row", marginLeft: 10, gap: 2, width: '100%', alignItems: "center" }}>
                        < TextInput
                            style={{ width: '70%', fontWeight: "bold", padding: 5, margin: 5, textAlign: 'center', borderRadius: 5, elevation: 5, backgroundColor: '#FFF' }}
                            //  onChangeText={(value)=>setPesquisa(value)}
                            placeholder="pesquisar"
                        />

                        <TouchableOpacity  //onPress={()=> setShowPesquisa(true)}
                        >
                            <AntDesign name="filter" size={35} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={{ left: 5, bottom: 5, color: '#FFF', fontWeight: "bold", fontSize: 20 }}> Usuários </Text>
            </View>

     
                     <FlatList
                         data={dados}
                         renderItem={( item )=> renderItem(item) }
                         keyExtractor={(i:any)=> i.codigo.toString() }
                     />
            <TouchableOpacity
                style={{
                    backgroundColor: "#185FED",
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    position: "absolute",
                    bottom: 150,
                    right: 30,
                    elevation: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 999, // Garante que o botão fique sobre os outros itens
                }}
                onPress={() => {
                  //  navigation.navigate("cadastro_usuario");
                }}
            >
                <MaterialIcons name="add-circle" size={45} color="#FFF" />
            </TouchableOpacity>

        </View>
    )
}