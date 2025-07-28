 


import { CameraView, useCameraPermissions } from "expo-camera"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, Button, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { ListaProdutos } from "./components/produtos_";
import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useProducts } from "../../database/queryProdutos/queryProdutos";
import { prod_setor, useProdutoSetores } from "../../database/queryProdutoSetor/queryProdutoSetor";
import { FlatList } from "react-native-gesture-handler";
import { useSetores } from "../../database/querySetores/querySetores";
import { configMoment } from "../../services/moment";
import { Setores } from "./components/setores";
import { Locais } from "./components/locais";
import { useMovimentos } from "../../database/queryMovimentos/queryMovimentos";

 type historico = { historico :string }
 
 type dataProdMov =  prod_setor &   historico    


export const NovoAcerto = ()=>{
    const [ modalVisible, setModalvisible ] = useState(false);
    const [ visibleModalSetores, setVisibleModalSetores ] = useState(false);
    const [ visibleLocais, setVisibleLocais ] = useState(false);

        const [  permission, requestPermission] = useCameraPermissions()
        const [ prodSeletor, setProdSeletor ] = useState<any>();
    const [ loadingInsertItem, setLoadingInsertItem ] = useState(false);

        const [ dataProd , setDataProd ] = useState< dataProdMov[]> ();
        const [ dataSetores , setDataSetores ] = useState< any>();
        const [setorSelecionado, setSetorSelecionado] = useState();

        const [loadingDataProd , setLoadingDataProd ] = useState(false);

        const useQueryProdutos = useProducts();
        const useQueryMovimento = useMovimentos();

        const useQuerySetores = useSetores();
        const useQueryProdutoSetores = useProdutoSetores();
        const moment = configMoment();

    const qrcodeLock = useRef(false)

        async function handleOpenCamera(){
            try{
                const { granted } = await requestPermission();
                if( !granted){
                    return Alert.alert("Camera", "É necessario habilitar o uso da camera")
                }
                setModalvisible(true)
                qrcodeLock.current = false
            }catch(e){
                console.log(e)
            }
        }

     const handleUpdateField = (fieldName: keyof dataProdMov, value: string) => {
            if (!dataProd || dataProd.length === 0) return;
            const updatedData = dataProd.map((item) => {
                return { ...item, [fieldName]: value };
            });
            setDataProd(updatedData);
        };

        function hadleCodeRead(data:string){
            setModalvisible(false)
        }
        function handleSetores(){
            if(!prodSeletor || prodSeletor === undefined){
                Alert.alert('',"É necessario selecionar um produto");
            }else{
                setVisibleModalSetores(true)
            }
        }

        function selectSetor(item){
            setSetorSelecionado(item)
            setVisibleModalSetores(false) 
        }

        function handleSelectProduct(item:any){
            setProdSeletor(item)
        }

        async function findProdSectorByCode( codigo:number, setor:number ){
                    try{
                setLoadingDataProd(true)
                let resultDataProd = await useQueryProdutoSetores.selectByCodeProductAndCodeSector(codigo,   setor)
                     if( resultDataProd && resultDataProd?.length > 0 ){
                         setDataProd(resultDataProd);
                        setLoadingDataProd(false);
                     }else{
                        let aux = { 
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


          async function findSetores( ){
                let resultDataSetores = await useQuerySetores.selectAll()
                    if( resultDataSetores && resultDataSetores?.length > 0 ){
                    setDataSetores(resultDataSetores);
                    }
           }

            async function gravar(data:dataProdMov[]){
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
                              tipo:'A',
                              data_recadastro:moment.dataHoraAtual(),
                              historico: data[0].historico ? data[0].historico : '',
                              produto: Number(data[0].produto),
                              quantidade: Number(data[0].estoque),
                              setor: Number(data[0].setor) 
                             }
                         )
                              setLoadingInsertItem(false)
                                setDataProd([])
                                setProdSeletor(undefined)
                                setSetorSelecionado(undefined)
                           return  Alert.alert('OK!', ` Saldo atualizado do produto:${data[0].produto} com sucesso ! `)

                   }catch(e){
                    console.log("Erro ao registrar produto no setor" , e )
                    Alert.alert('Atenção!', 'Ocorreu um erro ao tentar registrar o item no setor!')
                                setLoadingInsertItem(false)
                       } finally{
                                setLoadingInsertItem(false)
                   }

            }

        useEffect(()=>{
                if( prodSeletor && prodSeletor.codigo   ){
                    findSetores()
               }
        },[ prodSeletor ])

        useEffect(()=>{

            if(setorSelecionado && setorSelecionado.codigo > 0 && prodSeletor.codigo > 0 ){
                findProdSectorByCode(prodSeletor.codigo,  setorSelecionado.codigo)
            }
        },[ setorSelecionado ,prodSeletor])
        


    return(

        <View style={{  flex:1, backgroundColor:'#FFF'  }}>
            {
                loadingInsertItem && 
                <ActivityIndicator size={50}/>
            }
            <ScrollView  style={{     width:'100%' ,backgroundColor:'#FFF'}} 
            contentContainerStyle={{   alignItems: 'center', paddingVertical: 10, paddingBottom: 30  }}
            > 
                  <Modal visible={modalVisible} >
                    <CameraView style={{ flex:1 }}
                     facing="back"
                     onBarcodeScanned={ ({ data } ) => { 
                        if(data && !qrcodeLock.current){
                            qrcodeLock.current = true
                            setTimeout(()=> hadleCodeRead(data), 500)
                        }
                     }}
                     />

                    <View style={{ position: 'absolute', bottom:32, left:32, right:32}}>
                          <Button title="cancelar" onPress={()=>{setModalvisible(false)}} /> 
                    </View>
                </Modal> 
                
                <View style={{ flexDirection:"row", width:'98%', top:10 , margin:2,  justifyContent:"center"}}>
                       <ListaProdutos produto={prodSeletor} setProduto={handleSelectProduct} /> 
                      <TouchableOpacity style={{backgroundColor: "#185FED",height:47,alignItems:"center",justifyContent:"center",elevation:5,   width:'20%' ,right:5,  borderRadius:3}} 
                             onPress={()=>{handleOpenCamera}} >
                          <MaterialCommunityIcons name="barcode-scan" size={30} color="#FFF" />
                    </TouchableOpacity>
                </View>
                   
                  {
                        prodSeletor ? (
                            <View style={{ flex:1 ,width:'95%',top:10 ,alignItems:"center",borderWidth:1 ,borderColor:'#CCC', backgroundColor:'#FFF', borderRadius:5}}>
                                     <Text style={{ fontWeight:"bold",margin:3, color:"#89898fff", fontSize:17}} numberOfLines={4} > { prodSeletor && prodSeletor.descricao }</Text>
                                  
                                   <TouchableOpacity style={{ backgroundColor: "#185FED", marginTop:10 , width:'50%',flexDirection:"row",height:47,alignItems:"center",justifyContent:"center",elevation:5, borderRadius:5}} 
                                     onPress={()=>{ handleSetores()}} >
                                     <AntDesign name="caretdown" size={30} color="#FFF" />
                                      <Text style={{ fontWeight:"bold" , color:"#FFF" }}> setores </Text>
                                   </TouchableOpacity>

                                    { loadingDataProd ?
                                        <ActivityIndicator  size={50}/>
                                        :
                                        dataProd  ? dataProd.map((i, index)=>(
                                        <View  key={index}
                                            style={{  width:"100%",  marginTop:9, marginBottom:10 }}  
                                             >
                                                <Text numberOfLines={3} style={{ marginLeft:10, fontSize:17,fontWeight:"bold", color:"#89898fff"}} >setor (Cód:  {setorSelecionado && setorSelecionado.codigo}) /  { setorSelecionado &&  setorSelecionado.descricao}  </Text>
                                                  <Text  style={{  textAlign:"center",  fontSize:17,fontWeight:"bold", color:"#89898fff"}}  >  saldo: </Text>
                                                     
                                                 <View   style={{  width:"50%", alignSelf:"center", flexDirection:"row",justifyContent:"space-between",gap:10,marginTop:5, alignItems:"center", }}    >
                                                 
                                                  <TouchableOpacity style={{ borderRadius: 10, alignItems: 'center', justifyContent: "center", backgroundColor: "#185FED", width: 50, height: 50 }}
                                            onPress={() => {
                                                const currentEstoque = parseInt(i.estoque || '0', 10);
                                                handleUpdateField('estoque', String(currentEstoque + 1));
                                            }}
                                        >
                                            <Text style={{ fontWeight: "bold", fontSize: 25, color: '#FFF' }} > + </Text>
                                        </TouchableOpacity>
                                            <TextInput
                                                    style={{ fontSize: 17, alignSelf: 'center', textAlign: 'center', width: '30%', borderRadius: 3, color: "#89898fff", borderColor: '#89898fff', borderWidth: 1, padding: 5 }}
                                                    value={String(i.estoque || '0')}
                                                    onChangeText={(text) => {
                                                        // Garante que apenas números sejam inseridos
                                                        const numericValue = text.replace(/[^0-9]/g, '');
                                                        handleUpdateField('estoque', numericValue);
                                                    }}
                                                    keyboardType="numeric"
                                                />
                                            <TouchableOpacity style={{ borderRadius: 10, alignItems: 'center', justifyContent: "center", backgroundColor: "#185FED", width: 50, height: 50 }}
                                              onPress={() => {
                                                    const currentEstoque = parseInt(i.estoque || '0', 10);
                                                    // Impede que o estoque fique negativo
                                                        if (currentEstoque > 0) {
                                                        handleUpdateField('estoque', String(currentEstoque - 1));
                                                    }
                                                    }}
                                                >
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
                                                    style={{ borderWidth:2, borderColor:'#89898fff'}}
                                                    numberOfLines={5}
                                                    multiline={true}
                                                    onChangeText={(text) => handleUpdateField('historico', text)}
                                                />
                                            </View>

                                            {/******** */}

                                              <TouchableOpacity style={{ alignItems: "center", padding: 10, borderRadius: 5, backgroundColor: "#185FED", elevation:5, marginTop:10}}
                                                         onPress={() =>  gravar(dataProd)} 
                                                    >
                                                <Text  style={{  color: "#FFF",width: "100%",textAlign: "center",fontSize:17,fontWeight:"bold"  }}  >
                                                    gravar  </Text> 
                                                 </TouchableOpacity>
                                            </View>
                                        )):(
                                            <Text style={{ fontWeight:"bold", color:"#89898fff", fontSize:16, marginTop:5}} > selecione um setor! </Text>
                                        )
                                    }
                           </View>
                        ) :
                          <Text style={{ fontWeight:"bold",margin:3, color:"#89898fff", fontSize:17}} > Selecione um produto para começar!</Text>
                    }

                                <Modal    visible={ visibleModalSetores } > 
                                    <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", flex: 1 }} >
                                         <View style={{ backgroundColor: "#FFF", flex: 1 , margin:15, borderRadius:15, height:'80%'}} >
                                
                                                <TouchableOpacity onPress={() => setVisibleModalSetores(false)} style={{  width:'15%', padding:3, margin:5}}  >
                                                            <Ionicons name="close" size={28} color={"#6C757D"} />
                                          </TouchableOpacity>


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