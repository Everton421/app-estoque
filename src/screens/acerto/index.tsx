import { ActivityIndicator, Alert, Button, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from "react";
import { useMovimentos } from "../../database/queryMovimentos/queryMovimentos";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ModalFilter } from "./components/modal-filter";
import moment from "moment";
import { configMoment } from "../../services/moment";

type movimentos = {
    setor:number
    produto:number
    quantidade:number
    tipo:string
    historico:string
    data_recadastro:string,
    codigo:number
 }

type resultQueryMov = {
  data_recadastro :string
  codigo_produto :number
  descricao_produto:string
  quantidade_movimento:number
  codigo_setor:number
  historico_movimento:string
codigo_movimento:number
descricao_setor:string
  entrada_saida: 'E' | 'S' 
  unidade_medida:string
 
}

export const Acertos = ({navigation}:any)=>{
         const moment = configMoment();

         
    const useQueryMovimentos = useMovimentos(); 

    const [ loadingData,setLoadinData ] = useState(false);
    const [ dataMovimet, setDataMoviment ] = useState<resultQueryMov[] | [] >([]);
    const [ pesquisa, setPesquisa ] = useState<string>('');
    const [ visibleFilter , setVisibleFilter ] = useState(false)
    const [ tipoMovimento, setTipoMovimento ] = useState< 'S'|'E'|'*'> ('*')
    
    const [ dateFilter, setDateFilter ] = useState(moment.dataAtual() );    
 
    async function buscaPorDescricao(value:any){
           try{
            setLoadinData(true)
        let result = await useQueryMovimentos.selectQuery(value, { data: dateFilter , tipo: tipoMovimento});
                setDataMoviment(result)    
    }catch(e){
        }finally{
            setLoadinData(false)
        }
    }

        useFocusEffect(
            React.useCallback(() => {
               buscaPorDescricao( pesquisa)
            return () => {
            };
            }, [])  
        );

    useEffect(()=>{
        //if( pesquisa !== ''){
            buscaPorDescricao(pesquisa);
        //}

    },[pesquisa, tipoMovimento, dateFilter])


   function renderItem({ item}:{ item: resultQueryMov} ){
        return(
            <TouchableOpacity 
              //   onPress={ ()=> handleSelect(item) }
                style={{ backgroundColor:'#FFF', elevation:5, padding:3, margin:5, borderRadius:5,  width:'95%' }}
             >
                   <Text style={{ fontSize:10,right:5  ,fontWeight:'bold', color:'#474b4dff', alignSelf:'flex-end'}}>
                            Cód: {item.codigo_movimento}
                        </Text>
                    <View style={{flexDirection:"row"}}>
                        
                        <Text style={{ left:3 ,fontWeight:'bold', color:'#474b4dff'}}>
                          Data Acerto: {new Date(item.data_recadastro).toLocaleString('pt-br', { day:'numeric',month:'short',year:'2-digit' })} 
                        </Text>
                    </View>
                   <View style={{flexDirection:"row"}}>
                        <Text style={{ left:3,fontWeight:"bold",fontSize:15, color:'#185FED'}}>
                        Cód ({item.codigo_produto})  {item.descricao_produto}
                        </Text>
                    </View>
               
                <View style={{ flexDirection:"row", justifyContent:'space-between' ,margin:5}}>
                  
                    <View style={{flexDirection:"row",  width:'100%', justifyContent:'space-between'}}>
                           <Text style={{ fontWeight:"bold",fontSize:17, color:'#474b4dff'}}>
                             Quantidade:
                           </Text>
                           <Text style={{ left:3,fontWeight:"bold",fontSize:17, color:'#185FED'}}>
                             {item.quantidade_movimento} / ({item.unidade_medida})
                          </Text>
                    </View>
                    
                </View>
               <View style={{flexDirection:"row" , marginHorizontal: 5 }}>
                        <Text style={{  fontWeight:"bold" ,color:'#474b4dff', fontSize:17 }}>Setor:</Text>
                        <Text numberOfLines={5}  style={{flex:1, marginLeft:5, fontSize:17,fontWeight:"bold",  color:'#185FED'}}>
                             Cód({item.codigo_setor}) / { item.descricao_setor}
                        </Text>
                        
               </View>
                    <View style={{flexDirection:"row"}}>
                    <Text style={{ fontWeight:"bold" ,left:5 ,color:'#474b4dff', fontSize:17}}>
                        tipo: 
                    </Text>
                    <Text style={{ left:5, fontWeight:"bold",fontSize:15, color:'#185FED'}}>
                            { item.entrada_saida === 'E' ? ' entrada ' : ' saida '}
                        </Text>
                </View>
               <View style={{flexDirection:"row", marginHorizontal:5}}>
                  <Text style={{ fontWeight:"bold", color:'#474b4dff', fontSize:17  }}>
                    historico: 
                  </Text>
                   <Text numberOfLines={10} style={{ flex:1, left:10,fontWeight:"bold",fontSize:15, color:'#185FED'}}>
                        {item.historico_movimento}
                     </Text>
                </View>
             
            </TouchableOpacity>
        )
    }


    return(

        <View style={{  flex:1, backgroundColor:'#EAF4FE'  }}>
            <View style={{ backgroundColor:'#185FED', }}> 
             <View style={{   padding:15,  alignItems:"center", flexDirection:"row", justifyContent:"space-between" }}>
                <TouchableOpacity onPress={  ()=> navigation.goBack()  } style={{ margin:5 }}>
                    <Ionicons name="arrow-back" size={25} color="#FFF" />
                </TouchableOpacity>
            
                  
                <View style={{ flexDirection:"row", marginLeft:10 , gap:2, width:'100%', alignItems:"center"}}>
                    < TextInput 
                        style={{  width:'70%', fontWeight:"bold" ,padding:5, margin:5, textAlign:'center', borderRadius:5, elevation:5, backgroundColor:'#FFF'}}
                        onChangeText={(value)=>setPesquisa(value)}
                        placeholder="pesquisar"
                    /> 

                    <TouchableOpacity  
                    onPress={()=>setVisibleFilter(true)}
                        >
                            <AntDesign name="filter" size={35} color="#FFF" />
                        </TouchableOpacity>
                    </View>
             </View>
                    <Text style={{ fontWeight:"bold", color:'#FFF', fontSize:20, bottom:4 , left:5}}> Acertos</Text>
           
           </View>

           <TouchableOpacity
                style={{
                    backgroundColor: '#185FED',   width: 50,   height: 50,   borderRadius: 25,    position: "absolute",   bottom: 150,                 
                    right: 30,  elevation: 10,   alignItems: "center", 
                    justifyContent: "center",  zIndex: 999,  // Garante que o botão fique sobre os outros itens
                }}
                onPress={() => {
                     navigation.navigate('novo_acerto')
                }}
            >
                <MaterialIcons name="add-circle" size={45} color="#FFF" />
            </TouchableOpacity>
        
        <ModalFilter setDate={setDateFilter} setTipo={setTipoMovimento} setVisible={setVisibleFilter} visible={visibleFilter}  />
                 <FlatList
                            data={ dataMovimet }
                            renderItem = {(i)=>  renderItem(i)  }
                            keyExtractor={(i: resultQueryMov)=> i.codigo_movimento.toString()}
                            />
         </View>

    )
}