import { useEffect, useState } from "react";
import { useMarcas } from "../../database/queryMarcas/queryMarcas"
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export  const RenderModalMarcas = ({setMarca, codigoMarca}:any) => {
    
        const useQueryMarcas = useMarcas();

    let [ active, setActive ] = useState<boolean>(false);
    const [ marcas , setMarcas ] = useState([]);
    const [ data, setData] = useState([])
    const [ marcaSelecionada, setMarcaSelecionada ] = useState(null);

/*-----*/
    useEffect(
        ()=>{

            async function buscaMarcas(){
                let dados:any = await useQueryMarcas.selectAll();
                if(dados?.length > 0 ){
                    setData(dados);  
                }
            }
             async function buscaMarca(){
                let dados:any = await useQueryMarcas.selectByCode(codigoMarca);
                  if(dados?.length > 0 ){
                    selecionaMarca(dados[0])
                  }
            }
              

            if(codigoMarca > 0 ){
              buscaMarca()
            }else{
              buscaMarcas()
            }

        },[codigoMarca]
    )
/*-----*/
    
function selecionaMarca(item:any){
    setMarcaSelecionada(item);
    setMarca(item)
    setActive(false)
}
        
        function renderItem ({item}:any){
             return (
                <TouchableOpacity onPress={(  )=>{  selecionaMarca(item)}}
                    style={{margin:5, flexDirection:"row", backgroundColor:"#009de2", borderRadius:5,padding:5 }}
                > 
                   <Text style={{ color:'#FFF'}}> {item.codigo} </Text>
                   <Text style={{ color:'#FFF'}}> {item.descricao} </Text>
                </TouchableOpacity>
                
                )}


        return(
        <View style={{ flex:1}}>
               <View>
                  <TouchableOpacity
                          style={{ backgroundColor:'#185FED',   padding:5, borderRadius:5, flexDirection:"row",justifyContent:"space-between" , margin:7, elevation:3}}
                          onPress={()=>{ !active ? setActive(true) : setActive(false)  }}
                        >
                     <Text style={{color:'#FFF', fontWeight:"bold", fontSize:15}}> {marcaSelecionada ?  marcaSelecionada.descricao : 'Marcas'} </Text>
                    <AntDesign name="caretdown" size={24} color="white"    />  
                  </TouchableOpacity>
              </View>
            
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

                   <View style={{     height:'90%'}} >
                        <FlatList 
                            data={data}
                            renderItem={(item)=> renderItem(item)}
                            keyExtractor={(item:any)=> item.codigo }
                        />
                   </View>


                 </View>
               </View>
            </Modal>
        </View>
    )
}