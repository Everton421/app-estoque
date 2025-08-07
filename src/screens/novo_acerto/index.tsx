 


import { CameraView, useCameraPermissions } from "expo-camera"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, Button, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { ListaProdutos } from "./components/produtos_";
import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { prod_setor, useProdutoSetores } from "../../database/queryProdutoSetor/queryProdutoSetor";
import { FlatList } from "react-native-gesture-handler";
import { useSetores } from "../../database/querySetores/querySetores";
import { configMoment } from "../../services/moment";
import { Setores } from "./components/setores";
import { Locais } from "./components/locais";
import { useMovimentos } from "../../database/queryMovimentos/queryMovimentos";
import { useProducts } from "../../database/queryProdutos/queryProdutos";
import AsyncStorage from "@react-native-async-storage/async-storage";


 type filterBarcodeOption = {
        chave: 'codigo' | 'num_fabricante' | 'num_original' | 'sku'
 }
 type historico = { historico :string }

 type unidade_medida= {
    unidade_medida:string
} 
 type dataProdMov =  prod_setor & historico & unidade_medida   


 


export const NovoAcerto = ()=>{
    const [ modalVisible, setModalvisible ] = useState(false);
    const [ visibleModalSetores, setVisibleModalSetores ] = useState(false);
    const [ visibleLocais, setVisibleLocais ] = useState(false);

        const [  permission, requestPermission] = useCameraPermissions()
        const [ prodSeletor, setProdSeletor ] = useState<any>();
         const [ loadingInsertItem, setLoadingInsertItem ] = useState(false);

        const [ dataProd , setDataProd ] = useState< dataProdMov[]> ([]);
        const [ dataSetores , setDataSetores ] = useState< any>();
        const [setorSelecionado, setSetorSelecionado] = useState<any>();
        const [loadingDataProd , setLoadingDataProd ] = useState(false);
         const [ent_sai , setEnt_sai] = useState('E')
         const [ novoSaldo, setNovoSaldo ] = useState(0);

        const [defaultConfigFilter , setDefaultConfigFilter ]= useState< 'codigo' | 'num_fabricante' | 'num_original' | 'sku'>('num_fabricante');

            const useQueryMovimento = useMovimentos();
            const useQueryProdutos = useProducts();
            const useQuerySetores = useSetores();
            const useQueryProdutoSetores = useProdutoSetores();
            const moment = configMoment();

    const qrcodeLock = useRef(false)

      
       async function getDefaultConfig(){
                        try{
                           let value:any =  await AsyncStorage.getItem('configProduto');
                            if (value !== null) {
                                    setDefaultConfigFilter(value)
                            }
                            }catch(e){
                        console.log('erro ao tentar obter a configuração no AsyncStorage')
                            
                        }
                    }

         /**
          *  função usada no compoente camera, ao ler o codigo sera passado para esta função
          * @param data 
          */
       function handleCodeRead(data:string){
                    setModalvisible(false)
                    fyndBarcode(data)
            }

       /**
        *  pesquisa o codigo de barras lido na tabela do produtos 
        * @param codeScanned 
        * @returns 
        */     
       async function fyndBarcode(codeScanned:string){
                try{
                    setLoadingDataProd(true)


            let resultDataProd = await useQueryProdutos.findByParam({ chave: defaultConfigFilter, value:String(codeScanned)})
                    if(resultDataProd.length > 0 ){
                        handleSelectProduct(resultDataProd[0])
                    setLoadingDataProd(false)
                    }else{
                    setLoadingDataProd(false)
                        console.log("produto nao foi encontrado!")
                        setDataProd([])
                        return Alert.alert('Atenção!',`produto nao foi encontrado, ${defaultConfigFilter} : ${codeScanned} `, )
                    }

                }catch(e){
                    setLoadingDataProd(false)
                    console.log(`ocorreu um erro ao tentar buscar o produto pelo ${defaultConfigFilter}`, e )
                }finally{
                    setLoadingDataProd(false)
                }
            }


      /**
       *  atualiza os campos da variavel dataProd que contem os dados que seram usados para gravar
       * @param fieldName 
       * @param value 
       * @returns 
       */      
     const handleUpdateField = (fieldName: keyof dataProdMov, value: string) => {
            if (!dataProd || dataProd.length === 0) return;
            const updatedData = dataProd.map((item) => {
                return { ...item, [fieldName]: value };
            });
            setDataProd(updatedData);
        };

        /**
         *  abre o modal onde seleciona os setores
         */
        function handleSetores(){
            if(!prodSeletor || prodSeletor === undefined){
                Alert.alert('',"É necessario selecionar um produto");
            }else{
                setVisibleModalSetores(true)
            }
        }

            /**
             *  seleciona o setor 
             * @param item 
             */
        function selectSetor(item:any){
            setSetorSelecionado(item)
            setNovoSaldo(0)
            setVisibleModalSetores(false) 
        }

        
        /**
         *  seleciona o produto 
         * @param item 
         */
        function handleSelectProduct(item:any){
            setProdSeletor(item)
            setNovoSaldo(0)
             setSetorSelecionado(null)
        }

            /**
             *  busca os dados do produto nos setores 
             * @param codigo 
             * @param setor 
             */
        async function findProdSectorByCode( codigo:number, setor:number ){
                    try{
                setLoadingDataProd(true)
                let resultDataProd:any = await useQueryProdutoSetores.selectByCodeProductAndCodeSector(codigo,   setor)

                     if( resultDataProd && resultDataProd?.length > 0 ){
                         setDataProd(resultDataProd);
                        
                     }else{
                        let aux:any = { 
                                 data_recadastro: moment.dataHoraAtual(),
                                 estoque: '0',
                                 local1_produto: "",
                                 local2_produto: "",
                                 local3_produto: "",
                                 local4_produto: "",
                                 local_produto: "",
                                 produto: String(codigo),
                                 setor:  String(setor) 
                            }

                        setDataProd( [aux])
                     }
                    }catch(e){
                        console.log("Ocorreu um erro ao tentar consultar os produtos no setor")
                    }finally{
                        setLoadingDataProd(false);
                    }
       }

            /**
             * busca os dados dos setores 
             */
          async function findSetores( ){
                let resultDataSetores = await useQuerySetores.selectAll()
                    if( resultDataSetores && resultDataSetores?.length > 0 ){
                    setDataSetores(resultDataSetores);
                    }
           }


           /**
            *  grava os dados na tabela produto_setor / movimentos 
            * @param data 
            * @returns 
            */
            async function gravar(data:dataProdMov[]){

                
                            if(ent_sai === 'E'){
                                let aux = Number(data[0].estoque) + novoSaldo 
                                data[0].estoque =  aux 
                            }
                            if( ent_sai === 'S'){
                                let aux = Number(data[0].estoque) - novoSaldo 
                                data[0].estoque =  aux 
                            }
                            data[0].data_recadastro = moment.dataHoraAtual();
                             
                            data[0].unidade_medida = prodSeletor.unidade_medida 

                     try{ 
                   
                                setLoadingInsertItem(true)
                    let verifi = await useQueryProdutoSetores.selectByCodeProductAndCodeSector(Number(data[0].produto), Number(data[0].setor))
                        
                       if( verifi && verifi.length > 0   ){
                            let resultUpdate = await useQueryProdutoSetores.update(data[0])
                             
                        }else{

                             let resultInsert = await useQueryProdutoSetores.create(data[0])
                        }

                         await useQueryMovimento.create(
                             {
                                unidade_medida: data[0].unidade_medida,
                              tipo:'A',
                              data_recadastro:moment.dataHoraAtual(),
                              historico: data[0].historico ? data[0].historico : '',
                              produto: Number(data[0].produto),
                              quantidade:   novoSaldo,
                              setor: Number(data[0].setor), 
                              ent_sai: ent_sai
                             }
                         )
                         
                              setLoadingInsertItem(false)
                                setDataProd([])
                                setProdSeletor(undefined)
                                setSetorSelecionado(undefined)
                           return  Alert.alert('OK!', `  Acerto registrado com sucesso  ! `)
 
                   }catch(e){
                    console.log("Erro ao registrar produto no setor" , e )
                    Alert.alert('Atenção!', 'Ocorreu um erro ao tentar registrar o item no setor!')
                                setLoadingInsertItem(false)
                       } finally{
                                setLoadingInsertItem(false)
                                setNovoSaldo(0)
                                setEnt_sai('E')
                   }
                    
            }


         //////////////
            useEffect(()=>{
                    if( prodSeletor && prodSeletor.codigo   ){
                        findSetores()
                }
            },[ prodSeletor ])
        //////////////

            useEffect(()=>{
                if(setorSelecionado && setorSelecionado.codigo > 0 && prodSeletor.codigo > 0 ){
                    findProdSectorByCode(prodSeletor.codigo,  setorSelecionado.codigo)
                }
            },[ setorSelecionado   ])
         //////////////
            
            useEffect(()=>{
           getDefaultConfig()
            },[])
            //////////////

            if (!permission) {
            return null;
            }

            if ( modalVisible && !permission.granted) {
                return (
                <View style={{flex:1, alignItems:"center",justifyContent:"center"}}>
                      <Text  style={{ fontWeight:"bold",margin:10, color:"#89898fff", fontSize:17}} > 
                             você precisa liberar o acesso a camera para continuar!
                    </Text>
                    <Button onPress={requestPermission} title="Liberar acesso" />
                </View>
                );
            }

 


    return(

        <View style={{  flex:1, backgroundColor:'#EAF4FE'  }}>
            {
                loadingInsertItem && 
                <ActivityIndicator size={50}/>
            }
            <ScrollView  style={{     width:'100%' ,backgroundColor:'#EAF4FE'}} 
            contentContainerStyle={{   alignItems: 'center', paddingVertical: 10, paddingBottom: 30  }}
            > 
               <Modal visible={modalVisible} >
                    <CameraView
                        style={{ flex: 1 }}
                        facing="back"
                        onBarcodeScanned={({ data }) => {
                            if (data) {
                                handleCodeRead(data)
                            }
                        }}
                    >
                        {/* Sobreposição (Overlay) com estilos inline */}
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {/* Parte superior da sobreposição */}
                            <View style={{
                                flex: 1,
                                width: '100%',
                                backgroundColor: 'rgba(0,0,0,0.4)'
                            }} />

                            {/* Container do meio (inclui a área de foco e as laterais) */}
                            <View style={{
                                flexDirection: 'row',
                                height: 250 // Mesma altura da área de foco
                            }}>
                                {/* Lateral da sobreposição */}
                                <View style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0,0,0,0.4)'
                                }} />

                                {/* Área de Foco Central */}
                                <View style={{
                                    width: 300,
                                    height: 250,
                                    borderWidth: 2,
                                    borderColor: '#FFF',
                                    borderRadius: 10,
                                }} />

                                {/* Outra lateral da sobreposição */}
                                <View style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0,0,0,0.4)'
                                }} />
                            </View>

                            {/* Parte inferior da sobreposição */}
                            <View style={{
                                flex: 1,
                                width: '100%',
                                backgroundColor: 'rgba(0,0,0,0.4)'
                            }} />
                        </View>
                    </CameraView>

                    <View style={{ position: 'absolute', bottom: 32, left: 32, right: 32 }}>
                        <Button title="cancelar" onPress={() => { setModalvisible(false) }} />
                    </View>
                </Modal>
                
                <View style={{ flexDirection:"row", width:'95%', top:10 , marginLeft:5,   justifyContent:"center"}}>
                             <ListaProdutos produto={prodSeletor} setProduto={handleSelectProduct} /> 
                   
                      <TouchableOpacity style={{backgroundColor: "#185FED",height:47,alignItems:"center",justifyContent:"center",elevation:5,   width:'20%' ,right:5,  borderRadius:3}} 
                             onPress={()=>{setModalvisible(true)}} >
                          <MaterialCommunityIcons name="barcode-scan" size={30} color="#FFF" />
                     </TouchableOpacity>
                </View>
                   
                  {
                        prodSeletor  ? (
                            <View style={{ flex:1 ,width:'95%',top:10 ,alignItems:"center",borderWidth:1 ,borderColor:'#CCC', backgroundColor:'#FFF', borderRadius:5}}>
                                   {   
                                     <Text style={{ fontWeight:"bold",margin:3, color:"#89898fff", fontSize:16}} numberOfLines={4} > 
                                          Cód: ({ prodSeletor.codigo})  {prodSeletor.descricao}     
                                         </Text>
                                  } 
                                 
                                       
                                    <TouchableOpacity style={{ padding:3, backgroundColor: "#185FED",marginBottom:10, marginTop:10 , width:'50%',flexDirection:"row",height:47,alignItems:"center",justifyContent:"space-between",elevation:5, borderRadius:5}} 
                                     onPress={()=>{ handleSetores()}} >
                                      <Text style={{ fontWeight:"bold" , color:"#FFF", fontSize:16 }}> setores </Text>
                                     <AntDesign name="caretright" size={30} color="#FFF" />
                                   </TouchableOpacity>

                                  <View style={{flexDirection:"row", width:'70%',justifyContent:'space-between',alignItems:"center",padding:5 }}>
                              
                                       <TouchableOpacity style={ [{ borderRadius: 10, elevation:5, alignItems: 'center', justifyContent: "center", width: 70, height: 70  },{  backgroundColor: ent_sai === 'E' ? "#185FED" : "#FFF"} ]}
                                                onPress={() => { setEnt_sai('E') }}   >
                                                 <AntDesign name="enter" size={24} color={ ent_sai === 'E' ? "#FFF" : "#185FED" } />
                                                <Text style={[ { fontWeight: "bold", fontSize: 12  },{ color: ent_sai && ent_sai === 'E' ? "#FFF" : "#185FED"}   ]} >  Entrada </Text>
                                            </TouchableOpacity>

 
                                         <TouchableOpacity style={ [ { borderRadius: 10, alignItems: 'center', justifyContent: "center", width: 70, height: 70 },{  backgroundColor: ent_sai === 'S' ? "#185FED" : "#FFF"} ]} 
                                                onPress={() => { setEnt_sai('S') }} >
                                             <AntDesign name="back" size={24} color={ ent_sai === 'S' ? "#FFF" : "#185FED" }/>
                                                <Text style={ [ { fontWeight: "bold", fontSize: 12,  } ,{  color: ent_sai === 'S' ? "#FFF" : '#185FED'   }]} >  saida </Text>
                                          </TouchableOpacity>
                                  </View>

 

                                    { loadingDataProd ?
                                        <ActivityIndicator  size={50}/>
                                        :
                                           dataProd && setorSelecionado  ? dataProd.map((i, index)=>(
                                                   <View  key={index}
                                                style={{  width:"100%",  marginTop:9, marginBottom:10 }}  
                                                >
                                                      <View style={{ borderWidth:1, borderColor:'#CCC'  , width:'100%'}}>
                                                        <Text numberOfLines={3} style={{ marginLeft:10, fontSize:17,fontWeight:"bold", color:"#89898fff"}} >
                                                            setor (Cód:  {setorSelecionado && setorSelecionado.codigo}) /  { setorSelecionado &&  setorSelecionado.descricao}  
                                                            </Text>
                                                      </View>
                                                    
                                                        <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"center"}}>
                                                           <Text  style={{  textAlign:"center",  fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  saldo atual: </Text>
                                                           <Text  style={{  textAlign:"center",  fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  {i.estoque} </Text>
                                                       </View>
                                                       <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"center"}}>
                                                       </View>
                                                    
                                                        
                                                    <View   style={{  width:"50%", alignSelf:"center", flexDirection:"row",justifyContent:"space-between",gap:10,marginTop:5, alignItems:"center", }}    >
                                                    
                                                            <TouchableOpacity style={{ borderRadius: 10, alignItems: 'center', justifyContent: "center", backgroundColor: "#185FED", width: 50, height: 50 }}
                                                                    onPress={() => { setNovoSaldo( novoSaldo + 1 )  }}  >
                                                                   <Text style={{ fontWeight: "bold", fontSize: 25, color: '#FFF' }} > + </Text>
                                                               </TouchableOpacity>
                                                                <TextInput
                                                                        style={{ fontSize: 17, alignSelf: 'center', textAlign: 'center', width: '30%', borderRadius: 3, color: "#89898fff", borderColor: '#89898fff', borderWidth: 1, padding: 5 }}
                                                                        value={String( novoSaldo)  }
                                                                        onChangeText={(text) => {
                                                                            const numericValue = text.replace(/[^0-9]/g, '');
                                                                            setNovoSaldo(Number(numericValue))
                                                                        }}
                                                                        keyboardType="numeric"
                                                                    />
                                                            <TouchableOpacity style={{ borderRadius: 10, alignItems: 'center', justifyContent: "center", backgroundColor: "#185FED", width: 50, height: 50 }}
                                                                onPress={() => { setNovoSaldo( novoSaldo - 1 ) }}  >
                                                                <Text style={{ fontWeight: "bold", fontSize: 25, color: '#FFF' }} > - </Text>
                                                             </TouchableOpacity>
                                                </View>
                                                {/******** 
                                                 * locais
                                                */}
                                                 <View style={{ marginTop:10}} >
                                                    <Locais
                                                        item={i} setVisible={setVisibleLocais} 
                                                        visible={visibleLocais}
                                                        onUpdateField={handleUpdateField} 
                                                        />
                                                </View>

                                                    <TouchableOpacity style={{ marginLeft:5, backgroundColor: "#185FED", marginTop:10 , width:'50%',flexDirection:"row",height:47,alignItems:"center",justifyContent:"space-around",elevation:5, borderRadius:5}} 
                                                        onPress={()=>{ setVisibleLocais(true)}} 
                                                        >
                                                        <Text style={{  fontWeight:"bold" ,fontSize:15, color:"#FFF" }}>  locais</Text>
                                                        <FontAwesome6 name="map-location-dot" size={24} color="#FFF" />
                                                    </TouchableOpacity>

                                                {/******** */}
                                                {/********
                                                 * historico
                                                 */}

                                                <View style={{ marginTop:10}}> 
                                                    <Text  style={{   fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  Historico: </Text>

                                                    <TextInput
                                                        style={{ borderWidth:2,margin:5, borderColor:'#89898fff'}}
                                                        numberOfLines={5}
                                                        multiline={true}
                                                        onChangeText={(text) => handleUpdateField('historico', text)}
                                                    />
                                                </View>

                                                {/******** */}

                                                <TouchableOpacity style={{ margin:10, alignItems: "center", padding: 10, borderRadius: 5, backgroundColor: "#185FED", elevation:5 }}
                                                            onPress={() =>  gravar(dataProd)} 
                                                        >
                                                    <Text  style={{    color: "#FFF",width: "100%",textAlign: "center",fontSize:17,fontWeight:"bold"  }}  >
                                                        gravar  </Text> 
                                                    </TouchableOpacity>
                                                    </View>
                                            )
                                        ):(
                                            <Text style={{ fontWeight:"bold", color:"#89898fff", fontSize:16, marginTop:5}} > selecione um setor! </Text>
                                        ) 
                                   
                                    }
                           </View>
                        ) :
                       
                       <View style={{ flex:1 ,width:'95%',top:20 ,  elevation:5 , backgroundColor:'#FFF', borderRadius:5}}>
                          <Text  style={{ fontWeight:"bold",margin:3, textAlign:"center",color:"#89898fff", fontSize:20}} > Selecione um produto para começar!</Text>
                        </View>
                    }

                    <Modal    visible={ visibleModalSetores } > 
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", flex: 1 }} >
                             <View style={{ backgroundColor: "#FFF", flex: 1 , margin:15, borderRadius:15, height:'80%'}} >
                                    <TouchableOpacity onPress={() => setVisibleModalSetores(false)} style={{  width:'15%', padding:3, margin:5}}  >
                                                <Ionicons name="close" size={28} color={"#6C757D"} />
                                </TouchableOpacity>
                                           <Text  style={{ fontWeight:"bold",margin:3, textAlign:"center",color:"#89898fff", fontSize:17}} > Setores</Text>
                                    <FlatList
                                    data={dataSetores}
                                    renderItem={( {item} )=> <Setores  setor={item} selectSetor={selectSetor} /> }
                                    />
                                </View>
                            </View>
                     </Modal>  
           </ScrollView>                    
         </View>

    )
}