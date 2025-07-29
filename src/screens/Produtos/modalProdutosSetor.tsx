import { useEffect, useState } from "react";
import { useMarcas } from "../../database/queryMarcas/queryMarcas"
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useCategoria } from "../../database/queryCategorias/queryCategorias";
import { useProdutoSetores } from "../../database/queryProdutoSetor/queryProdutoSetor";
import { Ionicons } from "@expo/vector-icons";

type props= {
   setActive: React.Dispatch<React.SetStateAction<boolean>>
  active:boolean
  codigoProduto:number
}
export  const ModalProdutoSetor = ({  codigoProduto ,active, setActive  }:props) => {

 

        const useQueryProdutoSetores = useProdutoSetores();

    //let [ active, setActive ] = useState<boolean>(false);

    const [ data, setData] = useState([])
 
    useEffect(
        ()=>{
            async function buscaProdSetor(){
                let dados:any = await useQueryProdutoSetores.selectByCodeProduct(codigoProduto);   
                if(dados?.length > 0 ){
                    setData(dados);  
                }
            }
         buscaProdSetor()
          
        },[codigoProduto]
    )

        const renderItem = ({item}:any)=>{
            return(
                <View>
                    <Text>
                        {item?.produto}
                    </Text>
                    <Text>
                        saldo: {item?.saldo}
                    </Text>
                </View>
            )
        }


        return(
        <View style={{ flex:1}}>
              
            
            <Modal visible={ active } 
              transparent={true}
                >
             <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", flex: 1 }} >
               <View style={{ backgroundColor: "#FFF", flex: 1 , margin:15, borderRadius:15, height:'80%'}} >

                        <TouchableOpacity
                             onPress={()=>{   setActive(false) }}
                                  style={{
                                    margin: 15, backgroundColor: "#185FED",  padding: 7, borderRadius: 7 ,width: "20%", elevation: 5, }}>
                                  <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                                    voltar
                                  </Text>
                                </TouchableOpacity>
                                

                   <View style={{ height:'90%'}} >
                        <FlatList 
                            data={data}
                            renderItem={(item)=> renderItem(item)}
                            keyExtractor={(item:any)=> item.produto }
                        />
                   </View>


                 </View>
               </View>
            </Modal>
        </View>
    )
}