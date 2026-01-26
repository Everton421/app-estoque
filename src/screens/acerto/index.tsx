import { ActivityIndicator, Alert, Button, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from "react";
import { useMovimentos } from "../../database/queryMovimentos/queryMovimentos";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ModalFilter } from "./components/modal-filter";
import moment from "moment";
import { configMoment } from "../../services/moment";
import { StyleSheet } from "react-native";

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

const getStatusColor = (tipo: string) => {
    return tipo === 'E' ? '#4CAF50' : '#E53935'; // Verde para Entrada, Vermelho para Saída
};

const getStatusIcon = (tipo: string) => {
    return tipo === 'E' ? 'arrow-up-circle' : 'arrow-down-circle';
};

function renderItem({ item }: { item: resultQueryMov }) {
    const isEntrada = item.entrada_saida === 'E';
    const colorStatus = getStatusColor(item.entrada_saida);

    return (
        <TouchableOpacity style={styles.card}>
            {/* Cabeçalho do Card: ID e Data */}
            <View style={styles.cardHeader}>
                <Text style={styles.textId}>#{item.codigo_movimento}</Text>
                <Text style={styles.textDate}>
                    {new Date(item.data_recadastro).toLocaleDateString('pt-BR')}
                </Text>
            </View>

            {/* Corpo Principal: Ícone, Produto e Qtd */}
            <View style={styles.mainContent}>
                {/* Ícone Indicador Esquerda */}
                <View style={[styles.iconContainer, { backgroundColor: isEntrada ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Ionicons 
                        name={getStatusIcon(item.entrada_saida)} 
                        size={28} 
                        color={colorStatus} 
                    />
                </View>

                {/* Informações do Produto */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.descricao_produto}
                    </Text>
                    <Text style={styles.productCode}>Cód. Prod: {item.codigo_produto}</Text>
                </View>

                {/* Quantidade em Destaque */}
                <View style={styles.quantityContainer}>
                    <Text style={[styles.quantityText, { color: colorStatus }]} > {isEntrada ? '+' : '-'}{item.quantidade_movimento} </Text>
                    <Text style={styles.unitText}>{item.unidade_medida}</Text>
                </View>
            </View>

            {/* Divisor Sutil */}
            <View style={styles.divider} />

            {/* Rodapé: Setor e Histórico */}
            <View style={styles.footer}>
                <View style={styles.rowInfo}>
                    <MaterialIcons name="store" size={16} color="#757575" />
                    <Text style={styles.footerText} numberOfLines={1}>
                        {item.descricao_setor} <Text style={{fontSize: 10}}>({item.codigo_setor})</Text>
                    </Text>
                </View>

                {item.historico_movimento ? (
                    <View style={[styles.rowInfo, { marginTop: 4 }]}>
                        <MaterialIcons name="history" size={16} color="#757575" />
                        <Text style={styles.footerText} numberOfLines={2}>
                            {item.historico_movimento}
                        </Text>
                    </View>
                ) : null}
            </View>
            
            {/* Badge de Tipo (Opcional, canto superior visual) */}
            <View style={[styles.typeBadge, { backgroundColor: colorStatus }]}>
                <Text style={styles.typeBadgeText}>
                    {isEntrada ? 'ENTRADA' : 'SAÍDA'}
                </Text>
            </View>
        </TouchableOpacity>
    );
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
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 10,
        marginVertical: 6,
        padding: 12,
        elevation: 3, // Sombra Android
        shadowColor: '#000', // Sombra iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 5, // Detalhe lateral colorido via lógica (opcional, pode aplicar inline)
        borderLeftColor: '#ddd' // Cor padrão, mas sobrescreva no style inline se quiser a cor do status
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    textId: {
        fontSize: 12,
        color: '#9E9E9E',
        fontWeight: 'bold',
    },
    textDate: {
        fontSize: 12,
        color: '#757575',
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    productCode: {
        fontSize: 12,
        color: '#757575',
    },
    quantityContainer: {
        alignItems: 'flex-end',
        minWidth: 60,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    unitText: {
        fontSize: 10,
        color: '#9E9E9E',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    },
    footer: {
        gap: 4
    },
    rowInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 13,
        color: '#616161',
        flex: 1,
    },
    typeBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    typeBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
    }
});