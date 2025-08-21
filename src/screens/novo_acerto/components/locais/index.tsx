import React from "react"
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native"

import { AntDesign, FontAwesome6, Ionicons,     } from '@expo/vector-icons';
import { prod_setor } from "../../../../database/queryProdutoSetor/queryProdutoSetor";
 type historico = { historico :string }

 type unidade_medida= {
    unidade_medida:string
} 
 type dataProdMov =  prod_setor & historico & unidade_medida   

 
type props={
    item: { local_produto:string, local1_produto:string, local2_produto:string, local3_produto:string, local4_produto:string,}
    visible:boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    onUpdateField: (fieldName: keyof dataProdMov, value: string) => void
}
export const Locais = ({item, visible, setVisible, onUpdateField}:props)=>{


    return(
           <Modal visible={ visible } style={{flex:1}}> 
              <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", flex: 1 }} >
                  <View style={{ backgroundColor: "#FFF", flex: 1 , margin:15, borderRadius:15, height:'80%'}} >
                      <TouchableOpacity onPress={() => setVisible(false)} style={{  width:'15%', padding:3, margin:5}}  >
                             <Ionicons name="close" size={28} color={"#6C757D"} />
                        </TouchableOpacity>
                      <View 
                        style={{  width:"90%", flexDirection:"row", alignItems:"center",marginTop:10 }}  
                        >
                        <Text  style={{ fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  local: </Text>
                          <TextInput
                              style={{ fontSize:17, width:'90%', borderRadius:3 ,color:"#89898fff", borderColor:'#89898fff', borderWidth:1, }}
                            value={item.local_produto && String(item.local_produto) || '' } 
                            onChangeText={(text) => onUpdateField('local_produto', text)}
                          />
                     </View>
                    
                     <View 
                        style={{  width:"100%", flexDirection:"row", alignItems:"center",marginTop:10  }}  
                        >
                          <Text  style={{ fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  local (1): </Text>
                             <TextInput
                             style={{ fontSize:17, width:'73%', borderRadius:3 ,color:"#89898fff", borderColor:'#89898fff', borderWidth:1, }}
                              value={item.local1_produto && String(item.local1_produto) || '' } 
                            onChangeText={(text) => onUpdateField('local1_produto', text)}

                          />
                      </View>
                      <View 
                          style={{  width:"100%", flexDirection:"row", alignItems:"center",marginTop:10  }}  
                           >
                        <Text  style={{ fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  local (2): </Text>
                           <TextInput
                           style={{ fontSize:17, width:'73%', borderRadius:3 ,color:"#89898fff", borderColor:'#89898fff', borderWidth:1, }}
                            value={item.local2_produto && String(item.local2_produto) || '' }
                            onChangeText={(text) => onUpdateField('local2_produto', text)}

                           />
                       </View>
                       <View 
                        style={{  width:"100%", flexDirection:"row", alignItems:"center",marginTop:10  }}  
                          >
                        <Text  style={{ fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  local (3): </Text>
                           <TextInput
                          style={{ fontSize:17, width:'73%', borderRadius:3 ,color:"#89898fff", borderColor:'#89898fff', borderWidth:1, }}
                            value={item.local3_produto && String(item.local3_produto) || '' } 
                            onChangeText={(text) => onUpdateField('local3_produto', text)}

                            />
                       </View>
                       <View 
                          style={{  width:"100%", flexDirection:"row", alignItems:"center",marginTop:10  }}  
                          >
                       <Text  style={{ fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  local (4): </Text>
                         <TextInput
                         style={{ fontSize:17, width:'73%', borderRadius:3 ,color:"#89898fff", borderColor:'#89898fff', borderWidth:1, }}
                          value={item.local4_produto && String(item.local4_produto) || '' } 
                            onChangeText={(text) => onUpdateField('local4_produto', text)}

                         />
                      </View>
                         </View>
                 </View>
    </Modal>
    )
}