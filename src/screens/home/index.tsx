import { AntDesign, Entypo, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { InitialLoadingData } from "../../components/initialloadingData";
import { AuthContext } from "../../contexts/auth";
import { ConnectedContext } from "../../contexts/conectedContext";
import { queryConfig_api } from "../../database/queryConfig_Api/queryConfig_api";
import { queryEmpresas } from "../../database/queryEmpresas/queryEmpresas";
import { useSyncCategorias } from "../../hooks/sync-categorias/useSyncCategorias";
import { useSyncFotos } from "../../hooks/sync-fotos/useSyncFotos";
import { useSyncMarcas } from "../../hooks/sync-marcas/useSyncMarcas";
import { useSyncMovimentos } from "../../hooks/sync-movimentos/useSyncMovimentos";
import { useSyncProdSector } from "../../hooks/sync-produto-setor/useSyncProdutosSetor";
import { useSyncProdutos } from "../../hooks/sync-produtos/useSyncProdutos";
import { useSyncSetores } from "../../hooks/sync-setores/useSyncSetores";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { restartDatabaseService } from "../../services/restartDatabase";
import { useSyncClients } from '../../hooks/sync-clientes/useSyncClientes';
import { defaultColors } from '../../styles/global';
import { CustomAlert } from '../../components/custom-alert/custom-alert';


  type typeCompanyRequest = {
    cnpj : string
    data_contrato : string
    telefone : string
    nome : string
    email : string
    codigo : any
    responsavel : string
    logo : string
    cor_fonte : string
    cor_fundo : string
    cor_banner : string
  }

    interface EmpresaMobile  {
        codigo_empresa:number,
        nome:string,
        cnpj:string,
        email:string,
        responsavel:string
        logo: string | null
    }


export const Home = ({ navigation }: any) => {

  const { connected, setConnected }: any = useContext(ConnectedContext);
  const { setLogado, setUsuario, usuario , permissoes}: any = useContext(AuthContext);
  const api = useApi();
  
  const syncprodSector = useSyncProdSector();
  const syncMovimentos = useSyncMovimentos();
  const syncProdutos = useSyncProdutos();
  const syncCategorias = useSyncCategorias();
  const syncFotos = useSyncFotos();
  const syncMarcas = useSyncMarcas();
  const syncSetores = useSyncSetores();
  const useQueryConfigApi = queryConfig_api();
  const useMoment = configMoment();
  const syncClientes = useSyncClients();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [item, setItem] = useState<string | undefined >();

  const [ visibleAlert , setVisibleAlert ] = useState(false);
  const [ messageAlert , setMessageAlert ] = useState<string>('');
  const [typeAlert,      setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
  const [ titleAlert, setTitleAlert ] = useState<string>('');
  const [ cancelText, setCancelText ] = useState<string |  undefined>();
  const [ confirmText, setConfirmText ] = useState<string | undefined>();

    
  const [sair, setSair] = useState<boolean>(false)
  const [cadEmpresa, setCadEmpresa] = useState<EmpresaMobile>()
  const [loaidngEmpr, setLoadingEmpr] = useState(false);

  let useQueryEmpresa = queryEmpresas();
  let restartDB = restartDatabaseService();



  async function buscaEmpresa() {
    setLoadingEmpr(true)
    let validEmpr: any = await useQueryEmpresa.selectAll();
    if (validEmpr && validEmpr?.length > 0) {
      setCadEmpresa(validEmpr[0]);
      setLoadingEmpr(false)
    } else {
      try {
        let resultRequestCompany = await api.get("/empresa",
          {
            headers: {
              token: usuario.token
            }
          }) ;

            const companyRequest = resultRequestCompany.data as any;
        if (resultRequestCompany.status == 200) {
          let objEmpr = {
            codigo_empresa: Number(companyRequest.codigo),
            nome: companyRequest.nome,
            cnpj:  companyRequest.cnpj,
            email:  companyRequest.email,
            responsavel:  companyRequest.responsavel,
            logo: companyRequest.logo_url || ''
          };
          let aux = await useQueryEmpresa.createByCode(objEmpr);
          setCadEmpresa( objEmpr)
  
        }
      } catch (e: any) {
        console.log('Ocorreu um erro ao tentar validar a empresa ', e.response.data.message)
        console.log('[X] ', e.response.data)
      } finally {
        setLoadingEmpr(false)
      }
    }

  }


  useEffect(
    () => {
      buscaEmpresa()
    }, [usuario.token])


  function alertSair() {
        setVisibleAlert(true)
        setTitleAlert('Atenção');
        setTypeAlert('warning');
        setCancelText('Cancelar');
        setConfirmText('Sim');
        setMessageAlert('Deseja realmente sair?');
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
      "nome": "vendas",
      "icon": <MaterialCommunityIcons name="cart-variant" size={30} color={defaultColors.darkBlue} />
    },
    
      {
      "nome": "compras",
      "icon": <MaterialCommunityIcons name="cart-plus" size={30} color="#185FED" />
    },
    {
      "nome": "requerimentos",
      "icon": <Entypo name="shuffle" size={26} color={defaultColors.darkBlue} />
    },

    {
      "nome": "acertos",
      "icon": <MaterialCommunityIcons name="barcode-scan" size={30} color="#185FED" />
    },
   
    {
      "nome": "ajustes",
      "icon": <FontAwesome5 name="sync-alt" size={24} color="#185FED" />
    },
    
    {
      "nome": "usuarios",
      "icon": <FontAwesome name="users" size={24} color="#185FED" />
    },
   
  ];
  
 
 

  const Item = ({ value }: any) => {
    return (
      <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => navigation.navigate(value.nome)}    >
        <View
          style={{ backgroundColor: "#FFF", margin: 10, borderRadius: 100, width: 55, height: 55, alignItems: "center", justifyContent: "center", elevation: 5 }} >
          {value.icon}
        </View>
        <Text style={{ fontSize: 12, fontWeight: "bold", textAlign: "center", maxWidth: 150, color: '#FFF' }}> {value.nome}</Text>
      </TouchableOpacity>

    );
  };

 
  return (

    <View style={{ flex: 1, backgroundColor: "#EAF4FE", height: 'auto' }}>

      <InitialLoadingData
        isLoading={isLoading}
        item={item!}
        progress={progress} />

      <View style={{ backgroundColor: '#185FED', elevation: 7, padding: 5, height: 200, borderBottomEndRadius: 50, borderStartEndRadius: 50 }}>
          < View style={{ width: '100%', alignItems: "center", flexDirection: "row", justifyContent: "space-between" }} >
            <TouchableOpacity style={{ backgroundColor: '#FFF', borderRadius: 55, padding: 3, margin: 3 }}
              onPress={()=> console.log("cadEmpresa: ",cadEmpresa)}
            >

                  {
                    loaidngEmpr ?  
                    <View style={{alignItems:'center'}}>
                       <ActivityIndicator size={35} color={'#185FED'} />
                    </View>
                   : 
                    cadEmpresa?.logo && cadEmpresa?.logo != ''  ?
                      <Image
                      style={{ width: 40, height: 40, resizeMode: 'stretch', borderRadius:50}}
                     src={cadEmpresa.logo}
                     />
                     :
                        <Image
                        style={{ width: 45, height: 45, resizeMode: 'stretch', borderRadius:50 }}
                        source={ require('../../imgs/intersig120x120.png')  }
                      />
                        }
                     
            </TouchableOpacity>

            {
              loaidngEmpr ? (
                <ActivityIndicator size={20} color={'#FFF'} />
              ) : (
                <Text style={{ fontWeight: "bold", color: '#FFF', margin: 7, fontSize:12 }}
                numberOfLines={1}
                >
                  {cadEmpresa?.nome}
                </Text>
              )
            }
          </View>
          <View style={{ margin: 10, alignItems: "center" ,}}>
            <FlatList
              horizontal={true}
              data={data}
              renderItem={({ item }) => <Item value={item} />}
              showsHorizontalScrollIndicator={false}
            />
          </View>
      </View>

     <CustomAlert 
                          visible={visibleAlert}
                          message={messageAlert}
                          onConfirm={async ()=>{  
                            setSair(true) ;
                            setVisibleAlert(false)
                          } }
                          onCancel={()=> { 
                             setVisibleAlert(false);
                            setSair(false);
                            }
                            }
                          
                          title={titleAlert}
                          type={typeAlert}
                          cancelText={cancelText}
                          confirmText={confirmText}

                          />
      <ScrollView style={{ flex: 1 }}>

        <View style={{ width: '100%', alignItems: "center", justifyContent: "center" }}>


          <TouchableOpacity
            style={{ flexDirection: "row", padding: 10, marginTop: 15, margin: 10, backgroundColor: '#FFF', width: '80%', height: 80, borderRadius: 10, elevation: 2, justifyContent: "space-around", alignItems: "center" }}
            onPress={() => { navigation.navigate('ViewTabProdutos') }} >
            <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
              <FontAwesome name="cubes" size={24} color="#185FED" />
            </View>
            <Text style={{ fontWeight: "bold", fontSize: 15, color: '#5f666dff', flex: 1, textAlign: 'center' }} > Produtos </Text>
            <AntDesign name="caret-down" size={24} color="#185FED" />
          </TouchableOpacity>


          <TouchableOpacity style={{ backgroundColor: '#FFF', marginTop: 15, width: '80%', padding: 15, borderRadius: 10, elevation: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
              onPress={() => { navigation.navigate('clientes') }}
             >
              <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
                <FontAwesome6 name="users" size={25} color={defaultColors.darkBlue}/>
              </View>
              <Text style={{ fontWeight: "bold", fontSize: 15, color:   defaultColors.gray, width: '50%', textAlign: 'center' }} >Clientes</Text>
              <AntDesign name="caret-down" size={24} color={defaultColors.darkBlue} />
            </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: '#FFF', marginTop: 15, width: '80%', padding: 15, borderRadius: 10, elevation: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
               onPress={() => { navigation.navigate('fornecedores') }}
                >
                  <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
                 <FontAwesome6 name="user-tag" size={24} color={defaultColors.darkBlue}/>

                  </View>
                <Text style={{ fontWeight: "bold", fontSize: 15, color:   defaultColors.gray, width: '50%', textAlign: 'center' }} >Fornecedores</Text>
                <AntDesign name="caret-down" size={24} color={defaultColors.darkBlue} />
            </TouchableOpacity>

          <TouchableOpacity style={{ backgroundColor: '#FFF', marginTop: 15, width: '80%', padding: 15, borderRadius: 10, elevation: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
              onPress={() => { navigation.navigate('setores') }}
                >
                  <View style={{ backgroundColor: '#EAF4FE', flexDirection: "row", height: 50, width: 50, alignItems: "center", justifyContent: "center", borderRadius: 7, elevation: 3 }}>
                <FontAwesome6 name="map-location-dot" size={24} color={defaultColors.darkBlue} />

                  </View>
                <Text style={{ fontWeight: "bold", fontSize: 15, color:   defaultColors.gray, width: '50%', textAlign: 'center' }} >Setores</Text>
                <AntDesign name="caret-down" size={24} color={defaultColors.darkBlue} />
            </TouchableOpacity>
                 
            

     

        </View>
      </ScrollView>

      <View style={{ flexDirection: "row", position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#185FED', padding: 11, justifyContent: "space-between", }}>
        <Text style={{ color: '#FFF', fontSize: 15, fontWeight: "bold"  }}>
          {usuario && usuario.nome}
        </Text>

        <TouchableOpacity onPress={() => alertSair()} style={{ flexDirection: "row" }}>
          <AntDesign name="logout" size={24} color="white" />
        </TouchableOpacity>

      </View>
    </View>
  );
};
