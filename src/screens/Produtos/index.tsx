import { View , Text, TextInput, FlatList, Modal, Button, Image, TouchableOpacity} from "react-native";
import { produto, useProducts } from "../../database/queryProdutos/queryProdutos";
import { useEffect, useState } from "react";
 
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFotosProdutos } from "../../database/queryFotosProdutos/queryFotosProdutos";
import { useProdutoSetores } from "../../database/queryProdutoSetor/queryProdutoSetor";


type fotos = {
    link:string
}

type  selectCompleteProdSector= {
    data_recadastro :  string,
    descricao_produto:  string,
    descricao_setor:  string,
    estoque: number, 
    produto: number,
    setor: number,
    local_produto:string,
    local1_produto:string
    local2_produto:string
    local3_produto:string
    local4_produto:string
}


export function Produtos ( {navigation}:any ){
  
    const useQueryProdutos = useProducts();
    const useQueryFotos = useFotosProdutos();
        const useQueryProdutoSetores = useProdutoSetores();

const [ pesquisa, setPesquisa ] = useState<string>('a');
const [ dados , setDados ] = useState();
const [ pSelecionado, setpSelecionado ] = useState<produto>();
const [ visible, setVisible ] = useState(false);
const [ visibleModalSetores, setVisibleModalSetores ] = useState(false);

const [ dataProdSector, setDataProdSector ] = useState<selectCompleteProdSector[]> ([])

const [ prodViewSector,setProdViewSector ] = useState(0);

type fotoProduto =
 {
produto: number,
sequencia:number,
descricao:string,
link:string,
foto:string,
data_cadastro:string,
data_recadastro:string 
 }


    async function filterByDescription(){
        const response:any = await useQueryProdutos.selectByDescription(pesquisa, 10);
        for( let p of response ){
            let dadosFoto:any = await useQueryFotos.selectByCode(p.codigo)   
            if(dadosFoto?.length > 0 ){
                p.fotos = dadosFoto
            }else{
                p.fotos = []
            }
        }

        if(response.length > 0  ){
            setDados(response)
        }
    }

    async function filterAll(){
        const response:any = await useQueryProdutos.selectAllLimit(25);
        for( let p of response ){
            let dadosFoto:any = await useQueryFotos.selectByCode(p.codigo)   
            if(dadosFoto?.length > 0 ){
                p.fotos = dadosFoto
            }
        }
        if(response.length > 0  ){
            setDados(response)
        }
        console.log('  filterAll carregando produtos ....');
    }


///////
   useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if( pesquisa !== null || pesquisa !== '' ){
        filterByDescription()
      }else{
        filterAll()

      }
    });

    return unsubscribe;
  }, [navigation]);

///////

useEffect(()=>{
    filterByDescription()
},[  pesquisa])

   
    useEffect(
        ()=>{
            async function buscaProdSector(){
                let dados:any = await useQueryProdutoSetores.selectCompleteProdSector(prodViewSector);   
                if(dados?.length > 0 ){
                    setDataProdSector(dados);  
                }
            }
         buscaProdSector()
          
        },[  visibleModalSetores]
    )
    ////

        function handleSelect(item:any){
                setpSelecionado(item);
            //setVisible(true)
            navigation.navigate('cadastro_produto',{
                codigo_produto:item.codigo
            })
        }

          function viewItemSector(item:any){
            setVisibleModalSetores(true)
            setProdViewSector(item.codigo)
        }
        function renderItem({item}:any){
            return(
                <TouchableOpacity 
                    onPress={ ()=> handleSelect(item) }
                    style={{ backgroundColor:'#FFF', elevation:2, padding:3, margin:5, borderRadius:5,  width:'95%' }}
                 >
                   <View style={{ flexDirection:"row", justifyContent:"space-between"}}>  
                    <Text style={{ fontWeight:"bold"}}>
                        Codigo: {item.codigo}
                    </Text>
                        <TouchableOpacity style={{ alignItems:"center"}}
                            onPress={()=>{ viewItemSector(item) }}
                        >
                        <AntDesign name="database" size={24} color="black" />
                                        <Text style={{ fontWeight:"bold"}}> Estoque</Text>
                        </TouchableOpacity>
                   </View>

                   <Text style={{fontSize:15}}>
                     {item.descricao}
                   </Text>

                   {  item.fotos && item.fotos.length > 0 && item.fotos[0].link ?
                     (<Image
                        source={{ uri: `${item.fotos[0].link}` }}
                        // style={styles.galleryImage}
                        style={{ width: 100, height: 100,  borderRadius: 5,}}
                         resizeMode="contain"
                       />) :(
                         <MaterialIcons name="no-photography" size={40} color="black"  />
                       )
                    
                    }

                <View style={{ flexDirection:"row", justifyContent:"space-between", margin:3}}>  
                    <Text style={{ fontWeight:"bold"}}>
                      R$ {item.preco.toFixed(2)}
                    </Text>
                    <Text style={{ fontWeight:"bold"}}>
                       estoque total: {item.estoque}
                    </Text>
                </View>
                </TouchableOpacity>
            )
        }
      

     
        function renderProdSectorItem ({item}: {item: selectCompleteProdSector}) {
        return(
            <View style={{ 
                backgroundColor: "#FFF", // Fundo branco para o card
                marginHorizontal: 16,   // Margens laterais para não colar na borda do modal
                marginVertical: 8,      // Margem vertical para separar os itens
                padding: 16,            // Espaçamento interno
                borderRadius: 12,       // Bordas arredondadas
                elevation: 4,           // Sombra para o efeito de card (Android)
                shadowColor: '#000',    // Sombra (iOS)
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                flexDirection: 'row',   // Itens na horizontal
                justifyContent: 'space-between', // Espaço entre os elementos
                alignItems: 'center',   // Alinha verticalmente ao centro
            }}>
                {/* Lado esquerdo com as informações */}
                <View style={{ flex: 1, marginRight: 10 }}> 
                    
                     <View  style={{ flexDirection:"row"}} >
                        <Text style={{fontWeight: 'bold'}}>Setor: </Text>
                          <Text style={{ fontSize: 15, color: '#7F8C8D'   }}>
                             {item.descricao_setor} (Cód: {item.setor})
                          </Text>
                      </View>

                 <View     >
                    

 
                        { item.local_produto && <Text style={{fontWeight: 'bold'  }}>  Local :  <Text style={{color: '#7F8C8D'}}> { item.local_produto  } </Text></Text> }
                        { item.local1_produto && <Text style={{fontWeight: 'bold'  }}>  Local (1):  <Text style={{color: '#7F8C8D'}}> { item.local1_produto  } </Text></Text> }
                        { item.local2_produto && <Text style={{fontWeight: 'bold'  }}>  Local (2):  <Text style={{color: '#7F8C8D'}}> { item.local2_produto  } </Text></Text> }
                        { item.local3_produto && <Text style={{fontWeight: 'bold'  }}>  Local (3):  <Text style={{color: '#7F8C8D'}}> { item.local3_produto  } </Text></Text> }
                        { item.local4_produto && <Text style={{fontWeight: 'bold'  }}>  Local (4):  <Text style={{color: '#7F8C8D'}}> { item.local4_produto  } </Text></Text> }

                </View>
                </View>

                {/* Lado direito com o estoque em destaque */}
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                        color: '#185FED' // Cor principal do seu app
                    }}>
                        {item.estoque}
                    </Text>
                    <Text style={{  fontSize: 12,  color: '#7F8C8D'  }}>
                        Saldo
                    </Text>
                  
                </View>
               

            </View>
        )
    }
      

     return  (

      <View style={{ flex:1 ,    backgroundColor:'#EAF4FE', width:"100%"  }}>

 
              <Modal 
                visible={visibleModalSetores} 
                transparent={true}
                animationType="fade" // Uma animação sutil
                onRequestClose={() => setVisibleModalSetores(false)}
            >
                      <View style={{ 
                    flex: 1, 
                    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fundo escuro semi-transparente
                    justifyContent: 'center', 
                    alignItems: 'center' 
                }}>
                    <View style={{ 
                        backgroundColor: "#F8F9FA", // Um branco um pouco mais suave
                        borderRadius: 15, 
                        width: '90%', 
                        maxHeight: '80%', // Altura máxima para não ocupar a tela toda
                        overflow: 'hidden' // Garante que o conteúdo respeite o borderRadius
                    }}>
                                              <TouchableOpacity onPress={() => setVisibleModalSetores(false)} style={{  width:'15%', padding:3, margin:5}}  >
                                                            <Ionicons name="close" size={28} color={"#6C757D"} />
                                          </TouchableOpacity>

                            <View style={{     height:'90%'}} >
                                      <Text style={{   color: '#767d7eff', fontSize: 15, fontWeight:"bold", textAlign:"center" }}>
                                        { dataProdSector && dataProdSector[0] && dataProdSector[0].descricao_produto}
                                      </Text>
                                    <FlatList 
                                        data={dataProdSector}
                                        renderItem={(item)=> renderProdSectorItem (item)}
                                        keyExtractor={(item:any)=> item.setor }
                                    />
                            </View>


                            </View>
                        </View>
            </Modal>
      {/******************************* */}

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

                    <TouchableOpacity  //onPress={()=> setShowPesquisa(true)}
                        >
                            <AntDesign name="filter" size={35} color="#FFF" />
                        </TouchableOpacity>
                    </View>
             </View>
                 <Text style={{   left:5, bottom:5, color:'#FFF' ,fontWeight:"bold" , fontSize:20}}> Produtos </Text>
           </View>
             
                <Modal transparent={true} visible={ visible }>
                    <View style={{ width:'100%',height:'100%', alignItems:"center", justifyContent:"center", backgroundColor: '#FFF'}} >
                        
                        <View style={{ width:'96%',height:'97%', backgroundColor:'#E0E0E0', borderRadius:10}} >
                            
                                <View style={{ margin:8}}>
                                       <Button
                                        onPress={()=>setVisible(false)}
                                        title="Voltar"
                                    />
                                </View>

                                 <View style={{ margin:10, gap:15, flexDirection:"row"}}>
                                    

                          {   pSelecionado && pSelecionado?.fotos &&  pSelecionado?.fotos.length > 0 && pSelecionado?.fotos[0].link &&

                                         (<Image    
                                                source={{ uri: `${pSelecionado?.fotos[0].link}` }}
                                                // style={styles.galleryImage}
                                                style={{ width: 70 , height: 70   }}
                                                resizeMode="contain"
                                                />
                                        ) 
                                            }


                                     <View style={{ backgroundColor:'#fff', borderRadius:5, height:25, elevation:5 }}>
                                         <Text style={{ fontWeight:"bold" }} > Codigo: {pSelecionado?.codigo} </Text>
                                     </View>   

                                     <View style={{ backgroundColor:'#fff', borderRadius:5, height:25, elevation:5 }}>
                                       <Text> R$ {pSelecionado && pSelecionado.preco && pSelecionado.preco.toFixed(2)} </Text>
                                     </View>   
                                 </View>
  
                                        <View style={{ margin:7, backgroundColor:'#FFF', borderRadius:5, elevation:5 , padding:5}}>
                                          <Text>{pSelecionado?.descricao}</Text>
                                        </View>
                                       
                                        <View style={{ margin:7, backgroundColor:'#FFF', borderRadius:5, elevation:5 , padding:5}}>
                                            <Text> Estoque: {pSelecionado?.estoque} </Text>
                                        </View>

                                         <View style={{ margin:7, backgroundColor:'#FFF', borderRadius:5, elevation:5 , padding:5}}>
                                             <Text>SKU: {pSelecionado?.sku}</Text>
                                         </View>
                                         <View style={{ margin:7, backgroundColor:'#FFF', borderRadius:5, elevation:5 , padding:5}}>
                                             <Text>GTIN: {pSelecionado?.num_fabricante}</Text>
                                         </View>

                                        <View style={{ margin:7, backgroundColor:'#FFF', borderRadius:5, elevation:5 , padding:5}}>
                                             <Text>Referencia: {pSelecionado  && pSelecionado.num_original  }</Text>
                                        </View>
                                             
                                       <View style={{ flexDirection:"row", justifyContent:"space-between"}} > 
                                            <View style={{ margin:7, backgroundColor:'#FFF', borderRadius:5, elevation:5 , padding:5}}>
                                                 <Text>Marca: {pSelecionado?.marca}</Text>
                                            </View>
                                            <View style={{ margin:7, backgroundColor:'#FFF', borderRadius:5, elevation:5 , padding:5}}>
                                                 <Text>Grupo: {pSelecionado?.grupo}</Text>
                                            </View>
                                       </View>
                                        
                         </View>    

                    </View>

                </Modal> 

 
             <FlatList
                 data={dados}
                 renderItem={(item)=> renderItem(item)}
                 keyExtractor={(i)=>i.codigo}
             /> 
    
            <TouchableOpacity
                style={{
                    backgroundColor: '#185FED',   width: 50,   height: 50,   borderRadius: 25,    position: "absolute",   bottom: 150,                 
                    right: 30,  elevation: 10,   alignItems: "center", 
                    justifyContent: "center",  zIndex: 999,  // Garante que o botão fique sobre os outros itens
                }}
                onPress={() => {
                    navigation.navigate('cadastro_produto')
                }}
            >
                <MaterialIcons name="add-circle" size={45} color="#FFF" />
            </TouchableOpacity>


      </View> )   

      
     
}
 