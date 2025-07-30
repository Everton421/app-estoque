import React, { useEffect, useContext, useState } from "react";
import { View, FlatList, Text, Alert, BackHandler, TouchableOpacity, StatusBar, Image, ActivityIndicator, ScrollView } from "react-native";
import { AuthContext } from "../../contexts/auth";
import { AntDesign, Entypo, Fontisto, MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { restartDatabaseService } from "../../services/restartDatabase";
import { queryEmpresas } from "../../database/queryEmpresas/queryEmpresas";
import useApi from "../../services/api";

type cadEmpre =
  {
    cnpj: string,
    email_empresa: string,
    telefone_empresa: string,
    nome: string,
    codigo: number,
    responsavel: number
  }

export const Home = ({ navigation }: any) => {
  const { setLogado, setUsuario, usuario }: any = useContext(AuthContext);
  const api = useApi();

  const [sair, setSair] = useState<boolean>(false)
  const [cadEmpresa, setCadEmpresa] = useState<cadEmpre>()
  const [loaidngEmpr, setLoadingEmpr] = useState(false);

  let useQueryEmpresa = queryEmpresas();
  let restartDB = restartDatabaseService();


async function buscaEmpresa (){
  setLoadingEmpr(true)
  let validEmpr:any  = await useQueryEmpresa.selectAll();
  if(validEmpr?.length > 0 ){
    setCadEmpresa(validEmpr[0]);
  setLoadingEmpr(false)
  }else{
    try{
      let validEmpresa = await api.post("/empresa/validacao" ,
        { Headers:{
          token: usuario.token
          }
        }  );
  
      if (validEmpresa.data.status.cadastrada) {
        let objEmpr = {
          codigo_empresa: validEmpresa.data.data.codigo,
          nome: validEmpresa.data.data.nome,
          cnpj: validEmpresa.data.data.cnpj,
          email: validEmpresa.data.data.email_empresa,
          responsavel: validEmpresa.data.data.responsavel,
        };
      let aux = await useQueryEmpresa.createByCode(objEmpr);
        setCadEmpresa(validEmpresa.data.data)
      }
    }catch(e:any){
      console.log( 'Ocorreu um erro ao tentar validar a empresa ',  e.response.data.msg )
    } finally{
      setLoadingEmpr(false)
    }
  }

 
}

  useEffect(
    () => {

      buscaEmpresa()

    }, [usuario.token]
  )


  function alertSair() {
    Alert.alert('Sair', 'Ao sair serão excluidos os dados do aplicativo, será necessario efetuar uma nova sincronização',
      [
        {
          text: 'Cancelar',
          onPress: () => setSair(false),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => setSair(true) }
      ]);

  }

  useEffect(() => {
    async function logout() {
      if (sair === true) {
        setLogado(false)
        setUsuario({})
        await restartDB.restart();
        navigation.navigate('inicio')
      }
    }
    logout()
  }, [sair])



  const data = [
    {
      "nome": "acertos",
      "icon": <MaterialCommunityIcons name="barcode-scan" size={30} color="#185FED" />
    },
  
    {
      "nome": "usuarios",
      "icon": <FontAwesome name="users" size={24} color="#185FED" />
    },
    {
      "nome": "ajustes",
      "icon": <FontAwesome5 name="sync-alt" size={24} color="#185FED" />
    } 
  ];

  const Item = ({ value }: any) => {
    return (
      <TouchableOpacity style={{ margin: 6  }} onPress={() => navigation.navigate(value.nome)}    >
        <View
          style={{ backgroundColor: "#FFF", margin: 10, borderRadius: 100, width: 55, height: 55, alignItems: "center", justifyContent: "center", elevation: 5 }} >
          {value.icon}
        </View>
        <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center", maxWidth: 150 }}> {value.nome}</Text>
      </TouchableOpacity>

    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#EAF4FE" , height:'auto'}}>
      <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", backgroundColor: '#185FED', elevation: 7, padding: 5, }}>
        <View style={{ backgroundColor: '#FFF', borderRadius: 55, padding: 3, margin: 3 }}>
          <Image
            style={{ width: 45, height: 45, resizeMode: 'stretch', }}
            source={
              require('../../imgs/intersig120x120.png')
            }
          />
        </View>

        {
          loaidngEmpr ? (
            <ActivityIndicator size={20} color={'#FFF'} />
          ) : (
            <Text style={{ fontWeight: "bold", color: '#FFF', margin: 7 }}>
              {cadEmpresa?.nome}
            </Text>

          )
        }

      </View>

      <ScrollView style={{ flex:1}}>
        <View style={{ margin: 10, alignItems: "center"   }}>
          <FlatList
            horizontal={true}
            data={data}
            renderItem={({ item }) => <Item value={item} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={{   width:'100%'  }}>

          <View style={{ flexDirection: "row", width: '100%', alignItems: "center", justifyContent: "center" }}>
            <TouchableOpacity style={{ marginTop: 15, margin: 10, backgroundColor: '#FFF', width: '40%', padding: 15, borderRadius: 10, elevation: 2, justifyContent: "space-between", alignItems: "center" }}
              onPress={() => { navigation.navigate('produtos') }} >
              <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
                 <Foundation name="book" size={30} color="#185FED" />
              </View>
              <Text style={{ fontWeight: "bold", fontSize: 15, color: '#333', width: '80%', textAlign: 'center' }} >produtos</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", width: '100%', alignItems: "center", justifyContent: "center" }}>
            <TouchableOpacity style={{ marginTop: 15, margin: 10, backgroundColor: '#FFF', width: '40%', padding: 15, borderRadius: 10, elevation: 2, justifyContent: "space-between", alignItems: "center" }}
              onPress={() => { navigation.navigate('setores') }} >
              <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
                 <MaterialIcons name="local-activity" size={24} color="#185FED" />
              </View>
              <Text style={{ fontWeight: "bold", fontSize: 15, color: '#333', width: '80%', textAlign: 'center' }} >setores</Text>
            </TouchableOpacity>
          </View>
        </View>
     </ScrollView> 

      <View style={{  flexDirection: "row", position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#185FED', padding: 10, justifyContent: "space-between", }}>
        <Text style={{ color: '#FFF', fontSize: 20, fontWeight: "bold", width: '50%' }}>
          {usuario && usuario.nome}
        </Text>

        <TouchableOpacity onPress={() => alertSair()} style={{ flexDirection: "row" }}>
          <Text style={{ color: '#FFF', fontWeight: "bold" }} >Sair</Text>
          <MaterialCommunityIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
 
      </View>

    </View>
  );
};
