import { TextInput, Text, Button, TouchableOpacity, View, Image, Alert, Modal, ActivityIndicator, Animated, ScrollView, } from "react-native";
import useApi from "../../services/api";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import { useUsuario } from "../../database/queryUsuario/queryUsuario";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { restartDatabaseService } from "../../services/restartDatabase";
import { queryEmpresas } from "../../database/queryEmpresas/queryEmpresas";
import { useSyncProdSector } from "../../hooks/sync-produto-setor/useSyncProdutosSetor";
import { useSyncMovimentos } from "../../hooks/sync-movimentos/useSyncMovimentos";
import { useSyncProdutos } from "../../hooks/sync-produtos/useSyncProdutos";
import { useSyncCategorias } from "../../hooks/sync-categorias/useSyncCategorias";
import { useSyncFotos } from "../../hooks/sync-fotos/useSyncFotos";
import { useSyncMarcas } from "../../hooks/sync-marcas/useSyncMarcas";
import { useSyncSetores } from "../../hooks/sync-setores/useSyncSetores";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import { configMoment } from "../../services/moment";
import { ConnectedContext } from "../../contexts/conectedContext";
import { DotIndicatorLoadingData } from "../../components/dotIndicator";

type PrevUser = { 
  email:string
  senha:string
  codigo:string
  nome:string
  lembrar:string
  token:string
}

type propsLoadingLogin = { isLoading: boolean }

const LoadingLogin = ({ isLoading }: propsLoadingLogin) => (
  <Modal animationType='slide' transparent={true} visible={isLoading}>
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    }}>
      <ActivityIndicator size="large" color="#FFF" />
      {/**
      <Text style={styles.loadingText}>Carregando  pedidos ...  </Text>
       <Animated.View style={[styles.progressBar, { width: `${1}%` }]} />*/}
    </View>
  </Modal>
);


export const Login = ({ navigation }: any) => {

  const api = useApi();
  const useQueryUsuario = useUsuario();
  const useRestart = restartDatabaseService();

  const { logado, setLogado, usuario, setUsuario }: any = useContext(AuthContext);



  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState<Boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function buscaUser() {
      let users: any = await useQueryUsuario.selectRemember();
      if (users?.length > 0) {
        setUsuario(users[0]);
        console.log(users);
        //   setLogado(true)
        //    navigation.navigate('home')
        setEmail(users[0].email);
        setSenha(users[0].senha);

        if (users[0].lembrar === "S") {
          setLembrar(true);
        }
      }
    }
    buscaUser();
  }, []);

 

  async function logar() {
    if (!email) return Alert.alert("é necessario informar o email!");
    if (!senha) return Alert.alert("é necessario informar a senha!");

    let user = { email: email, senha: senha };

    let userRemember: any = await useQueryUsuario.selectRemember();

    if (userRemember.length > 0 && userRemember[0].email === user.email) {
      if (lembrar === false) {
        await useQueryUsuario.updateRemember();
      }
      console.log("usuario encontrado", userRemember[0].nome);
      setUsuario(userRemember[0]);
      setLogado(true);
      return;
    } else {

      try {
        setLoading(true)

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

          let codeUser = await useQueryUsuario.create(userMobile);

          return Alert.alert(response.data.status.msg);
        } else {
        }

      } catch (e: any) {

        if (e.response.status === 400) {
          console.log(e.response.data.msg)
          Alert.alert('Erro!', e.response.data.msg);
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#EAF4FE" }}>

      <LoadingLogin isLoading={loading} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#EAF4FE" }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 5, marginTop: 25 }}
        >
          <Ionicons name="arrow-back" size={30} color="#185FED" />
        </TouchableOpacity>

        <View style={{ width: "100%", alignItems: "center" }}>
          <View
            style={{backgroundColor: "#FFF",borderRadius: 60,height: 120,width: 120,alignItems: "center",justifyContent: "center",elevation: 3,
            }}
          >
            <FontAwesome6 name="user-tie" size={60} color="#185FED" />
          </View>

          <View
            style={{top: 10,backgroundColor: "#FFF",width: "95%",padding: 15,borderRadius: 10,justifyContent: "center",alignItems: "center",elevation: 3,
            }}
          >
            <Text style={{color: "#185FED",fontSize: 25,fontWeight: "bold",width: "100%",textAlign: "center",  }} >
              Login 
            </Text>

            <View style={{ width: "100%" }}>
              <View style={{ width: "100%",   alignItems:"center"}}>
                 <Text style={{ alignSelf:'flex-start',marginLeft:15 ,color: "#185FED", fontWeight: "bold" }}>EMAIL </Text>
                  <TextInput
                    style={{ borderBottomWidth: 1, width: "90%" }}
                    placeholder="example@example.com"
                    onChangeText={(t) => setEmail(t)}
                    value={email}
                    autoComplete="email"
                  />
                </View>
            </View>

            <View style={{ width: "100%", marginTop: 50,  }}>
             <View  style={{ width: "100%",alignItems:"center"}} > 
                <Text style={{ alignSelf:'flex-start',marginLeft:10 ,color: "#185FED", fontWeight: "bold" }}> SENHA </Text>
                <TextInput
                  style={{ borderBottomWidth: 1, width: "90%" }}
                  secureTextEntry={false}
                  onChangeText={(v) => setSenha(v)}
                  placeholder="*********"
                  value={senha}
                />
            </View>
              <View style={{ margin: 10  }}>

                <TouchableOpacity
                  style={{ alignItems: "center",padding: 10,borderRadius: 5,backgroundColor: "#185FED",elevation:5 }}
                  onPress={() => logar()}
                >
                  <Text style={{color: "#FFF",width: "100%",textAlign: "center" }} >
                    LOGIN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={{ margin: 5, alignItems: "center" }}
              onPress={() => {
                lembrar ? setLembrar(false) : setLembrar(true);
              }}
            >
              <View style={[{ padding: 8, borderWidth: 2, borderRadius: 2 }]}>
                {lembrar ? (
                  <View style={{ position: "absolute", left: -2, top: -9 }}>
                    <FontAwesome name="check" size={26} color="#185FED" />
                  </View>
                ) : null}
              </View>
              <Text style={{ width: "100%", textAlign: "center" }}>
                {" "}
                lembrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ margin: 6 }} onPress={() => navigation.navigate('enviar_codigo')}>
              <Text style={{ color: '#185FED', fontWeight: "bold" }} > esqueci minha senha</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </View>
  );
};
