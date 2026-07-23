 
import { Text, View ,TouchableOpacity, TextInput, FlatList, Modal, Image, Alert} from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import useApi from "../../services/api";
import { LodingComponent } from "../../components/loading";
import { configMoment } from "../../services/moment";
import { RenderItensCaracteristicas } from "./renderItem";
import { EmptyState } from "../../components/empty-state";
import { Fab } from "../../components/fab";
import { CustomHeader } from "../../components/custom-header/custom-header";

type caracteristica= { codigo:number, descricao:string, unidade:string}

export const Caracteristicas = ({navigation}:any)=>{
    const [ press, setPress ] = useState(false);
    const [ dados, setDados ] = useState<caracteristica[]>();
    const [ pesquisa, setPesquisa ] = useState<string | undefined>('');
    const [ visible, setVisible ] = useState<boolean>(false);
    const [ caracteristicaSelecionada, setCaracteristicaSelecionada ] = useState<any>();
    const [ loading , setLoading ] = useState(false);

    const api = useApi();
    const dateService = configMoment();
    
    useFocusEffect(
                ()=>{

                    if( pesquisa === '' || pesquisa === undefined){
                    }
                } 
            )
 
            useEffect(
                ()=>{   
                 
                },[ pesquisa ]
            )



        function handleSelect(item:any){
            setVisible(true);
            setCaracteristicaSelecionada(item)
        }

async function gravar(){
  if( !caracteristicaSelecionada?.descricao ) return Alert.alert("Erro!", "É necessario informar a descrição para poder gravar!") 

    try{
        
        setLoading(true);
        let objCaracteristica:any = {
                    "codigo": caracteristicaSelecionada && caracteristicaSelecionada.codigo,
                    "descricao": caracteristicaSelecionada.descricao,
                    "unidade": caracteristicaSelecionada.unidade,
                    "data_cadastro": caracteristicaSelecionada?.data_cadastro,
                    "data_recadastro": dateService.dataHoraAtual(),
                    "id": caracteristicaSelecionada?.id
                    }
        let result = await api.put('/caracteristica', objCaracteristica);
        
        if(result.status === 200 ){
          
            setVisible(false)
            return Alert.alert('', ` Característica: ${caracteristicaSelecionada?.descricao} Alterado Com Sucesso! ` );
        }


    }catch(e:any){
        if(e.status === 400 ){
            return Alert.alert('Erro!', e.response.data.msg);
        } else{
            console.log(e)
            return Alert.alert('Erro!', 'Erro desconhecido!');

        }  
    }finally{
        setLoading(false);
    }
}

    return(

        <View style={{   flex:1,  backgroundColor:'#EAF4FE'}} >
                   <LodingComponent isLoading={loading} />
       
      <CustomHeader
        title="Características"
        onBack={() => navigation.goBack()}
        showSearch
        searchValue={pesquisa}
        onSearchChange={(v) => setPesquisa(v)}
        showFilter
      />
 
            <Modal transparent={true} visible={visible} animationType="fade">
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '85%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                  <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Editar Característica</Text>
                    <TouchableOpacity onPress={() => setVisible(false)}>
                      <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Código</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                      {caracteristicaSelecionada?.codigo}
                    </Text>

                    <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Descrição</Text>
                    <TextInput
                      style={{ backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, height: 47, fontSize: 15, color: '#333', marginBottom: 15 }}
                      defaultValue={caracteristicaSelecionada?.descricao}
                      onChangeText={(v) => setCaracteristicaSelecionada((prev: any) => ({ ...prev, descricao: v }))}
                    />

                    <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Unidade</Text>
                    <TextInput
                      style={{ backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, height: 47, fontSize: 15, color: '#333' }}
                      defaultValue={caracteristicaSelecionada?.unidade}
                      onChangeText={(v) => setCaracteristicaSelecionada((prev: any) => ({ ...prev, unidade: v }))}
                    />

                    <TouchableOpacity
                      style={{ backgroundColor: '#185FED', borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 25, elevation: 3 }}
                      onPress={() => gravar()}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Gravar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
           <View style={{ marginTop:10}}> 
                 <FlatList
                     data={ dados || [] }
                     renderItem = {( { item } )=>  <RenderItensCaracteristicas item={item} handleSelect={handleSelect} />  }
                     keyExtractor={(i)=> i.codigo.toString()}
                     ListEmptyComponent={() => <EmptyState icon="list-alt" message="Nenhuma característica encontrada" />}
                 />
            </View>
        {/**  */}
            <Fab onPress={() => navigation.navigate('cadastro_caracteristicas')} />

        </View>
    )
}