import { ActivityIndicator, Alert, Button, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from "react";
import { useMovimentos } from "../../database/queryMovimentos/queryMovimentos";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

type movimentos = {
    setor:number
    produto:number
    quantidade:number
    tipo:string
    historico:string
    data_recadastro:string,
    codigo:number
 }


export const Acertos = ({navigation}:any)=>{
    
    const useQueryMovimentos = useMovimentos(); 

    const [ loadingData,setLoadinData ] = useState(false);
    const [ dataMovimet, setDataMoviment ] = useState<movimentos[]>([]);
    const [ pesquisa, setPesquisa ] = useState<string>('');


    async function busca(){
        try{
            setLoadinData(true)
        let result = await useQueryMovimentos.findByTypeMoviment('A');
            if( result && result.length > 0 ){
              setDataMoviment(result)    
            }
    }catch(e){
        }finally{
            setLoadinData(false)
        }
    }



      useFocusEffect(
            React.useCallback(() => {
           
        busca( )

            
            return () => {
              
            };
            }, []) // Empty dependency array means it runs on focus/unfocus
        );


    //useEffect(()=>{
    //    busca( )
    //},[])


    ////////
    async function buscaPorDescricao(value:any){
           try{
            setLoadinData(true)
        let result = await useQueryMovimentos.selectQuery(value);
            if( result && result.length > 0 ){
              setDataMoviment(result)    
            }
    
    }catch(e){
        }finally{
            setLoadinData(false)
        }

    }

    useEffect(()=>{
        if( pesquisa !== ''){
            buscaPorDescricao(pesquisa);
        }

    },[pesquisa])

   function renderItem({ item }: any  ){
        return(
            <TouchableOpacity 
              //   onPress={ ()=> handleSelect(item) }
                style={{ backgroundColor:'#FFF', elevation:5, padding:3, margin:5, borderRadius:5,  width:'95%' }}
             >
                    <Text style={{ fontWeight:"bold" }}>
                        Codigo Movimento: {item.codigo}
                   </Text>
               
                <View style={{ flexDirection:"row", justifyContent:'space-between' ,margin:5}}>
            

                     <View style={{flexDirection:"row"}}>
                        <Text style={{ fontWeight:"bold"}}>
                            Produto:
                        </Text>
                        <Text style={{ left:3,fontWeight:"bold",fontSize:15, color:'#185FED'}}>
                         {item.produto}
                        </Text>
                    </View>

                    <View style={{flexDirection:"row"}}>
                        <Text style={{ fontWeight:"bold"}}>
                            quantidade:
                        </Text>
                        <Text style={{ left:3,fontWeight:"bold",fontSize:15, color:'#185FED'}}>
                         {item.quantidade}
                        </Text>
                    </View>
                     <View style={{flexDirection:"row"}}>
                        <Text style={{ fontWeight:"bold"}}>
                            Setor:
                        </Text>
                        <Text style={{ left:3,fontWeight:"bold",fontSize:15, color:'#185FED'}}>
                         {item.setor}
                        </Text>
                    </View>
                </View>
              
               <View style={{flexDirection:"row"}}>
                  <Text style={{ fontWeight:"bold" }}>
                    historico: 
                  </Text>
                   <Text style={{ left:3,fontWeight:"bold",fontSize:15, color:'#185FED'}}>
                        {item.historico}
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

                    <TouchableOpacity   onPress={()=> busca()}
                        >
                            <AntDesign name="filter" size={35} color="#FFF" />
                        </TouchableOpacity>
                    </View>
             </View>
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
        
                 <FlatList
                            data={ dataMovimet }
                            renderItem = {(i)=>  renderItem(i)  }
                            keyExtractor={(i:any)=> i.codigo}
                            />
         </View>

    )
}