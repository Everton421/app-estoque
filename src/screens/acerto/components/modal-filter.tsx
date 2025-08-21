import { Modal, Text, TouchableOpacity, View } from "react-native"
import {   useEffect, useState } from "react"
import Fontisto from '@expo/vector-icons/Fontisto';
import DateTimePicker from '@react-native-community/datetimepicker';
import { configMoment } from "../../../services/moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";


  type statusPedido = {
                todos:boolean
                orcamentos:boolean
                pedidos:boolean
                faturado:boolean
                reprovados:boolean
                parcial:boolean
              }
type props = {
     visible:boolean ,
     setVisible: React.Dispatch<React.SetStateAction<boolean>>,
     setTipo: React.Dispatch<React.SetStateAction< 'E'|'S'|'*' >>
    setDate:any
    }


     
export const ModalFilter = ({ visible , setVisible, setTipo,   setDate }:props ) =>{
        const moment = configMoment();
     
        const [showPicker, setShowPicker] = useState(false);
        const [ auxData, setAuxData ] = useState<  string >(   moment.dataAtual() );
        const [ tipoSelecionado, setTipoSelecionado ] = useState('*');
        
        async  function selectTipo( tipo:'E' | 'S' | '*'){
                   
                        try{
                            await AsyncStorage.setItem('filtroAcerto',tipo );
                            setTipoSelecionado(tipo)
                            setTipo(tipo)
                          //  console.log(status)
                        }catch( e ) {
                            console.log("erro ao tentar salvar o filtro dos pedidos ", e )
                        }
            }

   
  const handleEvent = async (event: any, selectedDate?: any) => {
    // 1. Feche o seletor de data imediatamente, independentemente do evento.
    setShowPicker(false);

    // 2. Verifique se o evento foi de confirmação ('set') e se uma data foi realmente selecionada.
    if (event.type === 'set' && selectedDate) {
        // O usuário clicou em "OK", agora podemos atualizar os estados.
        setAuxData(selectedDate); // Atualiza o estado local com o objeto Date
        const dataFormatada = moment.formatarData(selectedDate);
        setDate(dataFormatada); // Atualiza o estado do componente pai

        try {
            await AsyncStorage.setItem('dataPedidos', dataFormatada);
        } catch (e) {
            console.log("Erro ao tentar salvar a data do filtro dos pedidos ", e);
        }
    }
    // Se o evento for 'dismissed', não fazemos nada, pois o seletor já foi fechado.
};
        return(
                 <Modal  visible={visible}  transparent={true} >
                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" , flex:1, alignItems:"center", justifyContent:"flex-start" }}>
                                <View style={{ backgroundColor:'#FFF', width:'80%', height:'80%', marginTop:10, borderRadius:10 }}>    
                                               
                                                       <TouchableOpacity onPress={() => setVisible(false)}  style={ { width:'15%'  ,padding: 10, borderRadius: 12    }}>
                                                                           <Ionicons name="close" size={28} color={ '#6C757D' } />
                                                         </TouchableOpacity>
                                        
                                              <View style={{   width:'95%', height:"100%", marginLeft: 5 } } >
                                                        <View style={{  borderColor: '#DDD', borderWidth: 1,padding: 10,marginVertical: 5, borderRadius: 5, width: '95%'  }}>
                                                          <Text style={{ fontWeight:"bold"}}> Movimentos gerados a partir de :</Text>   

                                                        <TouchableOpacity onPress={() => setShowPicker(true)} style={{ flexDirection: 'row', gap: 7 }}>
                                                               <Fontisto name="date" size={24} color="black" />
                                                            <Text style={{ fontSize: 20, fontWeight: 'bold' , width:'100%'}}>
                                                                {   moment.formatarData(  auxData )   }
                                                            </Text>
                                                          </TouchableOpacity>
                                                       { showPicker &&
                                                          <DateTimePicker
                                                             value={new Date(auxData)}
                                                            display="calendar"
                                                            mode="date"
                                                            onChange={handleEvent}
                                                            //locale="pt-BR"
                                                         />
                                                         }
                                                       </View>
                                                       <View style={{    backgroundColor: '#FFF'   }}>

                                                            <View style={{ marginBottom: 5,  width: '100%', alignItems: 'center' }}>
                                                                <TouchableOpacity
                                                                    style={{ marginVertical: 5, alignItems: "center", flexDirection: 'row', padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 5, width: '90%', justifyContent: 'center' }}
                                                                    onPress={() => {
                                                                           {   selectTipo('S')   }  
                                                                    }}
                                                                >
                                                                    <View style={[{ width: 20, height: 20, borderWidth: 2, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', 
                                                                        borderColor:    tipoSelecionado === 'S'  ?  "#307CEB" : "#868686" 
                                                                    }  
                                                                        ]}>
                                                                        {  tipoSelecionado === 'S'   ? (
                                                                            <View style={{ width: 10, height: 10, backgroundColor: "#307CEB", borderRadius: 5 }} />
                                                                          ) : (
                                                                            <View style={{ width: 10, height: 10, backgroundColor: "#868686", borderRadius: 5 }} />
                                                                          )
                                                                        }
                                                                    </View>
                                                                        {  tipoSelecionado === 'S' ? (
                                                                             <Text style={ [ { color: "#307CEB" , fontWeight: "bold", flexShrink: 1, width:'100%' , textAlign:"center" } ] }>
                                                                                    Saídas
                                                                              </Text>
                                                                        ):(
                                                                             <Text style={ [ { color: "#868686" , fontWeight: "bold", flexShrink: 1, width:'100%' , textAlign:"center" } ] }>
                                                                                    Saídas
                                                                              </Text>
                                                                    )}
                                                                </TouchableOpacity>
                                                            </View>

                                                            <View style={{ marginBottom: 5, width: '100%', alignItems: 'center' }}>
                                                                <TouchableOpacity
                                                                    style={{ marginVertical: 5, alignItems: "center", flexDirection: 'row', padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 5, width: '90%', justifyContent: 'center' }}
                                                                    onPress={() => {
                                                                        {  selectTipo('E')
                                                                         }  
                                                                    }}
                                                                >
                                                                    <View style={[{ width: 20, height: 20, borderWidth: 2, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', 
                                                                        borderColor:   tipoSelecionado === 'E'     ? "#307CEB" : "#868686"
                                                                        }]}>
                                                                        {   tipoSelecionado === 'E'    ? (
                                                                            <View style={{ width: 10, height: 10, backgroundColor: "#307CEB", borderRadius: 5 }} />
                                                                       )  : (
                                                                            <View style={{ width: 10, height: 10, backgroundColor: "#868686", borderRadius: 5 }} />
                                                                          )
                                                                        }
                                                                    </View> 
                                                                          {   tipoSelecionado === 'E'   ? (
                                                                        <Text style={{ fontWeight: "bold", color: "#307CEB", flexShrink: 1, width:'100%' , textAlign:"center"}}>
                                                                                 Entradas
                                                                             </Text>
                                                                          ):(
                                                                            <Text style={{ fontWeight: "bold", color: "#868686", flexShrink: 1, width:'100%' , textAlign:"center"}}>
                                                                                 Entradas
                                                                             </Text>
                                                                          )}
                                                               
                                                                </TouchableOpacity>
                                                            </View>
                                   <View style={{ marginBottom: 5, width: '100%', alignItems: 'center' }}>
                                                                <TouchableOpacity
                                                                    style={{ marginVertical: 5, alignItems: "center", flexDirection: 'row', padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 5, width: '90%', justifyContent: 'center' }}
                                                                    onPress={() => {
                                                                        {  selectTipo('*')
                                                                         }  
                                                                    }}
                                                                >
                                                                    <View style={[{ width: 20, height: 20, borderWidth: 2, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', 
                                                                        borderColor:   tipoSelecionado === '*'     ? "#307CEB" : "#868686"
                                                                        }]}>
                                                                        {   tipoSelecionado === '*'    ? (
                                                                            <View style={{ width: 10, height: 10, backgroundColor: "#307CEB", borderRadius: 5 }} />
                                                                       )  : (
                                                                            <View style={{ width: 10, height: 10, backgroundColor: "#868686", borderRadius: 5 }} />
                                                                          )
                                                                        }
                                                                    </View> 
                                                                          {   tipoSelecionado === '*'   ? (
                                                                        <Text style={{ fontWeight: "bold", color: "#307CEB", flexShrink: 1, width:'100%' , textAlign:"center"}}>
                                                                                 Todos
                                                                             </Text>
                                                                          ):(
                                                                            <Text style={{ fontWeight: "bold", color: "#868686", flexShrink: 1, width:'100%' , textAlign:"center"}}>
                                                                                 Todos
                                                                             </Text>
                                                                          )}
                                                               
                                                                </TouchableOpacity>
                                                            </View>
                                                     </View>
                                         </View>

                                </View>
                            </View>
                        </Modal>

        )
}