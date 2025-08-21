import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RenderConfigSeletor } from "../RenderConfigSeletor";
import { Ionicons } from "@expo/vector-icons";


type propsSeletor=  {tipo:string, value:string } 

export const ConfigProdSeletor = ()=>{
    const [ visible,setVisible ] = useState(false)
        const [ defaultConfig, setDefaultConfig ] = useState< 'codigo' | 'num_fabricante' | 'num_original' | 'sku' >('num_fabricante');
   
        const [ tipos ] = useState<propsSeletor[]>([
        { tipo: "Codigo de barras", value: 'num_fabricante'},
        { tipo: "Referencia", value: 'num_original'},
        { tipo: "Sku", value: 'sku',  } 
    ]);
    
    
       async function getDefaultConfig(){
                        try{
                           let value:any =  await AsyncStorage.getItem('configProduto');
                            if (value !== null) {
                                    setDefaultConfig(value)
                                    console.log('Default: ', value)
                            }
                            }catch(e){
                        console.log('erro ao tentar obter a configuração no AsyncStorage')
                            
                        }
                    }

                    async function setConfig(value: 'codigo' | 'num_fabricante' | 'num_original' | 'sku' ){
                         try {
                         await AsyncStorage.setItem( 'configProduto',value );
                                    setDefaultConfig(value)
                      } catch (error) {
                         // Error saving data
                         console.log('erro ao tentar salvar a configuração no AsyncStorage')
                     }
                    }

        useEffect(()=>{
                getDefaultConfig()
            },[])


    return(
       <View  >
  

       <TouchableOpacity  style={ {gap:5, flexDirection:"row",alignItems:"center", margin:15, elevation:5,padding:5,borderRadius: 5,backgroundColor:'#185FED' }} 
        onPress={()=>{ setVisible(true)}}
       >
            <FontAwesome name="gear" size={35} color="#FFF" />
            <Text style={{ color:'#FFF', fontWeight:"bold", fontSize:15}} > 
              configurar leitor     
            </Text>
        </TouchableOpacity>
        
        
        <Modal visible={visible} transparent={true}>
          <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", flex: 1 }} >
               <View style={{ backgroundColor: "#FFF", flex: 1 , margin:15, borderRadius:15, height:'80%'}} >
 
                                          <TouchableOpacity onPress={()=>{   setVisible(false) }} style={{  width:'15%', padding:3, margin:5}}  >
                                                            <Ionicons name="close" size={28} color={"#6C757D"} />
                                          </TouchableOpacity>

                                   
                                    <FlatList
                                    data={tipos}
                                    renderItem={({item})=> <RenderConfigSeletor tipo={item.tipo} value={item.value}  setDefaultConfig={setConfig} defaultConfig={defaultConfig}/>}
                                    />
               </View>
           </View>
       </Modal>
       </View>

    )
}