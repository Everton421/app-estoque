import React, { useCallback, useContext, useEffect, useState } from "react"
import { Alert, TextInput,Button, FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native"
import { RenderModalCategorias } from "./modalCategorias"
import { RenderModalMarcas } from "./modalMarcas"
import useApi from "../../services/api"
import NetInfo from '@react-native-community/netinfo';
import Entypo from "@expo/vector-icons/Entypo";
import { ConnectedContext } from "../../contexts/conectedContext"
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons"
import { useProducts } from "../../database/queryProdutos/queryProdutos"
import { useFotosProdutos } from "../../database/queryFotosProdutos/queryFotosProdutos"
import { typeFotoProduto } from "./types/fotos"
import { LodingComponent } from "../../components/loading"
 

type produtoBancoLocal = 

 { 
    ativo : string,
    class_fiscal : string,  
    codigo : number,
    cst: string,
    data_cadastro:  string,
    data_recadastro: string,
    descricao :string,
    estoque: number,
    grupo: number,
    marca: number,
    num_fabricante: string,
    num_original : string,
    observacoes1: string,
    observacoes2 : string,
    observacoes3 : string,
    origem : string,
    preco : number,
    sku : string,
    tipo : string
}

export const Cadastro_produto: React.FC  = ( { route, navigation }:any ) => {

    const [ marcaSelecionada, setMarcaSelecionada ] = useState(0); 
    const [ categoriaSelecionada, setCategoriaSelecionada ] = useState(0); 
    const [ estoque, setEstoque ] = useState<number>(0);
    const [ preco, setPreco ] = useState<any>(0);
    const [ sku, setSku ] = useState<string>('');
    const [ descricao, setDescricao] = useState<string>('');
    const [ gtim, setGtim ] = useState<string>('');
    const [ referencia, setReferencia ] = useState<string>('');


    const [visible, setVisible] = useState (false);
    const [link, setLink] = useState("");
    const [fotos, setFotos] = useState<typeFotoProduto[]>([]);

    const [produto, setProduto] = useState<produtoBancoLocal>();
    const [ imgs, setImgs] = useState<typeFotoProduto[]>();
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ dados , setDados ] = useState('');
    const useQueryProdutos = useProducts();
    const api = useApi();
    const {connected,  setConnected} = useContext(ConnectedContext)
    const useQueryFotos = useFotosProdutos();

    const [ loading2, setLoading2 ] = useState(false);

    let { codigo_produto } =   route.params || { codigo_produto : 0};


    async function carregarProduto(){
        try{
            setLoading(true)

            if( codigo_produto && codigo_produto > 0 ){
            let dataProd:any= await useQueryProdutos.selectByCode(codigo_produto);
                
                let dadosFoto:any = await useQueryFotos.selectByCode(codigo_produto)   
                dataProd[0].fotos = dadosFoto;
                
                setDados(dataProd);

                setImgs(dadosFoto)
            let prod:produtoBancoLocal = dataProd[0]  
            setProduto(prod)
            if(dataProd.length > 0 ){
                    setCategoriaSelecionada(prod.grupo);
                    setMarcaSelecionada(prod.marca);
                    setReferencia(prod.num_original)
                    setEstoque(prod.estoque);
                    setPreco( Number(prod.preco));
                    setSku(prod.sku);
                    setDescricao(prod.descricao)
                    setGtim(prod.num_fabricante)
                }
            } 
    }catch(e) {
    }finally{
        setLoading(false)
    }

    }


///////////////////
    useEffect(() => {
            function setConexao(){
           const unsubscribe = NetInfo.addEventListener((state) => {
                   setConnected(state.isConnected);
                   console.log('conexao com a internet :', state.isConnected);
              });
           // Remove o listener quando o componente for desmontado
           return () => {
               unsubscribe();
           };
       }
       setConexao();
        carregarProduto();
       }, []);
///////////////////
   

    async function gravar (){
        if( connected === false ) return Alert.alert('Erro', 'É necessario estabelecer conexão com a internet para efetuar o cadastro !');
        if(!preco) setPreco(0);
        if(!estoque) setEstoque(0);
        if(!sku) setSku('');
        if(!referencia) setReferencia('');
        if(!marcaSelecionada) return Alert.alert('É necessario informar uma marca para gravar o produto!');
        if(!categoriaSelecionada) return Alert.alert('É necessario informar uma categoria para gravar o produto!');

        if( codigo_produto > 0 || codigo_produto){
            let responseApi
            let data =   { 
                "codigo":codigo_produto,
                "preco":preco,
                "estoque":estoque,
                "descricao":descricao,
                "sku":sku,
                "referencia":referencia,
                "marca":  marcaSelecionada  ,
                "grupo": {codigo:categoriaSelecionada }
            }
          //  console.log(data)
        try{
            setLoading(true)
            let obj = { produto: codigo_produto, fotos: imgs};
            console.log(obj);
             
                try{
                        let obj = { produto: codigo_produto, fotos: imgs};
                        responseApi = await api.post('/offline/fotos', obj);
                            
                        if(responseApi.status === 200){

                                let imgsProd:typeFotoProduto[] | any = await useQueryFotos.selectByCode(codigo_produto);
                                if ( imgsProd.length > 0 ||imgs?.length === 0  ){
                                    await useQueryFotos.deleteByCodeProduct(codigo_produto);
                                }  
                                if(imgs?.length === 0 ){
                                    setImgs(imgsProd)
                                }
                            imgs?.forEach( async ( f:typeFotoProduto )=>{
                                    await useQueryFotos.create(f)
                            })   
                        }

                    }catch(e:any){
                        console.log(e);
                        if( e.status === 400 ){
                            return Alert.alert('Erro ao processar imagens!', e.response.data.msg)
                        }
                    }
                     
                  let  responseProdutoApi = await api.put('/produto', data);
                        if(responseProdutoApi.status === 200 && responseProdutoApi.data.codigo > 0 ){
                            let objResponse = 
                            {
                                 codigo :responseProdutoApi.data.codigo,
                                 id :responseProdutoApi.data.id,
                                 estoque :responseProdutoApi.data.estoque,
                                 preco :responseProdutoApi.data.preco,
                                 grupo :responseProdutoApi.data.grupo.codigo,
                                 origem :responseProdutoApi.data.origem,
                                 descricao: responseProdutoApi.data.descricao,
                                 num_fabricante: responseProdutoApi.data.num_fabricante,
                                 num_original: responseProdutoApi.data.num_original,
                                 sku: responseProdutoApi.data.sku,
                                 marca :responseProdutoApi.data.marca.codigo  ,
                                 ativo: responseProdutoApi.data.ativo,
                                 class_fiscal: responseProdutoApi.data.class_fiscal,
                                 cst: responseProdutoApi.data.cst,
                                 data_recadastro: responseProdutoApi.data.data_recadastro,
                                 data_cadastro: responseProdutoApi.data.data_cadastro,
                                 observacoes1: responseProdutoApi.data.observacoes1,
                                 observacoes2: responseProdutoApi.data.observacoes2,
                                 observacoes3: responseProdutoApi.data.observacoes3,
                                 tipo: responseProdutoApi.data.tipo
                            }
                            useQueryProdutos.update(objResponse, objResponse.codigo);
                            navigation.goBack();
                            return Alert.alert('', `Produto ${responseProdutoApi.data.codigo} Alterado Com Sucesso! `)     
                        }

            }catch(e:any){
                if(e.status === 400 ){
                Alert.alert("Erro!" , e.response.data.msg );
                }
            } finally{
                setLoading(false)
            } 
        
        }  else{
        let data =   { 
                    "preco":preco,
                    "estoque":estoque,
                    "descricao":descricao,
                    "sku":sku,
                    "referencia":referencia,
                    "marca":  marcaSelecionada ,
                    "grupo":categoriaSelecionada 
                }
             try{
                    setLoading(true)
                let response =   await api.post('/produto', data)
                if(response.status === 200 && response.data.codigo > 0 ){

                            let objResponse = 
                            {
                                 codigo : response.data.codigo,
                                 id : response.data.id,
                                 estoque : response.data.estoque,
                                 preco : response.data.preco,
                                 grupo :  response.data.grupo.codigo,
                                 origem : response.data.origem,
                                 descricao: response.data.descricao,
                                 num_fabricante: response.data.num_fabricante,
                                 num_original: response.data.num_original,
                                 sku: response.data.sku,
                                 marca : response.data.marca.codigo  ,
                                 ativo: response.data.ativo,
                                 class_fiscal:  response.data.class_fiscal,
                                 cst: response.data.cst,
                                 data_recadastro: response.data.data_recadastro,
                                 data_cadastro: response.data.data_cadastro,
                                 observacoes1: response.data.observacoes1,
                                 observacoes2: response.data.observacoes2,
                                 observacoes3: response.data.observacoes3,
                                 tipo: response.data.tipo
                            }
                    try{
                           await useQueryProdutos.createByCode(objResponse, response.data.codigo)
                           Alert.alert('',`Produto ${descricao} registrado com sucesso!`)
                        navigation.goBack()
                    }catch(e){
                        console.log(" ocorreu um erro ao cadastrar o produto ",e)
                        Alert.alert('Erro!',` Ocorreu um erro ao tentar registrar o produto no banco local!`);
                    }
                }
                }catch(e:any){
                    if(e.status === 400 ){
                        console.log(`erro ao tentar registrar o produto na api ` , e )
                        Alert.alert('Erro!',` ${e.response.data.msg}`)
                    }

                }finally{
                    setLoading(false)

                }

        }
    
    }
    const renderImgs = ({ item }: { item: typeFotoProduto }) => {
        return (
          <View style={{ margin: 5, padding: 4, borderRadius: 10, backgroundColor: "#FFF", elevation: 3 }}>
            <TouchableOpacity onPress={() => deleteItemListImgs(item)}>
              <AntDesign name="closecircle" size={24} color="red" />
            </TouchableOpacity>
            {item.foto && item.link ? (
              <Image
                source={{ uri: `${item.link}` }}
                style={{ width: 120, height: 120, borderRadius: 5 }}
                resizeMode="contain"
              />
            ) : null}
          </View>
        );
      };
    
      
  const deleteItemListImgs = (item:typeFotoProduto) => {
    setImgs((prev: any) => {
      let aux = prev.filter((i: typeFotoProduto) => i.sequencia !== item.sequencia);
        setFotos(aux);
       return aux;
    });
  };
      const gravarImgs = () => {
        if (link === "") return;
      
        let sequencia = imgs && imgs.length > 0 ? Math.max(...imgs.map((i) => i.sequencia)) + 1 : 1;
      
        const newImage: typeFotoProduto = {
          produto: codigo_produto,
          data_cadastro: "0000-00-00",
          data_recadastro: "0000-00-00 00:00:00",
          descricao: link,
          foto: link,
          link: link,
         
          sequencia: sequencia,
        };
      
          setImgs((prev: any) => {
              const aux = [...prev,newImage]
                 setFotos(aux)
             return aux
            });
    
          setLink('');
      };
    

    return (
        <View style={{ flex: 1 }}>
             <LodingComponent isLoading={loading} />
     
          <View style={{ flex: 1 ,width: '100%',  backgroundColor: '#EAF4FE' }} >
                <View style={{ margin: 10, gap: 15, flexDirection: "row" }}>
                    
                                        
                                       { /*produto && produto?.fotos[0] ?
                                        (   <Modal_fotos  imgs={imgs} codigo_produto={codigo_produto} setImgs={ setImgs} />   )
                                        :(   <Modal_fotos  imgs={[]} codigo_produto={codigo_produto} setImgs={ setImgs}  />   )
                                        */}
                            <TouchableOpacity onPress={() => setVisible(true)}>
                                <View style={{ margin: 2 }}>
                                {imgs && imgs.length > 0 ? (
                                    <Image
                                    source={{ uri: `${imgs[0].link}` }}
                                    style={{ width: 100, height: 100, borderRadius: 5 }}
                                    resizeMode="contain"
                                    />
                                ) : (
                                    <MaterialIcons name="no-photography" size={100} color="black" />
                                )}
                                </View>
                            </TouchableOpacity>
                                                        <Modal visible={visible} transparent={true}>
                                                                <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", flex: 1 }}>
                                                                <View style={{ backgroundColor: "#FFF", flex: 1, margin: 15, borderRadius: 15, height: "80%" }}>
                                                                    <View style={{ backgroundColor: "#FFF" }}>
                                                                    <TouchableOpacity
                                                                        onPress={() => {
                                                                        setVisible(false);
                                                                        }}
                                                                        style={{
                                                                        margin: 15,
                                                                        backgroundColor: "#185FED",
                                                                        padding: 7,
                                                                        borderRadius: 7,
                                                                        width: "20%",
                                                                        elevation: 5,
                                                                        }}
                                                                    >
                                                                        <Text style={{ color: "#FFF", fontWeight: "bold" }}>voltar</Text>
                                                                    </TouchableOpacity>
                                                                    </View>

                                                                    <View style={{ alignItems: "center" }}>

                                                                    {imgs && imgs.length > 0 && (
                                                                        <FlatList
                                                                        data={imgs}
                                                                        keyExtractor={(item) => String(item.sequencia)}
                                                                        renderItem={renderImgs}
                                                                        horizontal={true}
                                                                        />
                                                                    )}
                                                                    </View>
                                                                    <View style={{ alignItems: "center" }}>
                                                                        {link !== "" ? (
                                                                        <View style={{ margin: 10 }}>
                                                                            <Image style={{ width: 100, height: 100 }} source={{ uri: `${link}` }} />
                                                                        </View>
                                                                        ) : (
                                                                        <View style={{ margin: 10 }}>
                                                                            <Entypo name="image" size={54} color="#185FED" />
                                                                        </View>
                                                                        )}
                                                                        <TextInput
                                                                        style={{ borderWidth: 1, width: "90%", padding: 10, borderRadius: 5 }}
                                                                        placeholder="https://reactnative.dev/img/tiny_logo.png"
                                                                        onChangeText={(v) => {
                                                                            setLink(v);
                                                                        }}
                                                                        value={link}
                                                                        />
                                                                        <TouchableOpacity style={{ padding: 5, alignItems: "center" }} onPress={() => gravarImgs()}>
                                                                        <Entypo name="arrow-with-circle-up" size={35} color="#185FED" />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                                </View>
                                                     </Modal>



                    <View style={{ gap:10, width:'100%'}}>
                            <View style={{ alignItems:"center", flexDirection:"row", width: '50%',backgroundColor: '#fff' , padding:2,borderRadius: 5,  elevation: 5}}>
                                    <Text style={{ fontWeight:"bold" , color:'#868686' }} > codigo: {codigo_produto} </Text>
          

                            </View>

                            <View style={{ alignItems:"center", flexDirection:"row", width: '50%',backgroundColor: '#fff' ,borderRadius: 5,  elevation: 5}}>
                          <Text style={{fontWeight:"bold", color:'#868686'}} > Preço:$ </Text>
                                    <TextInput
                                    onChangeText={(v)=> setPreco( Number(v) )}
                                    style={{ height:30,backgroundColor:'#FFF', width: '50%'}}

                                    keyboardType="numeric"
                                    defaultValue={ String(preco)  }
                                    />

                           </View>

                            <View style={{ alignItems:"center", flexDirection:"row", width: '50%',backgroundColor: '#fff' ,borderRadius: 5,  elevation: 5}}>
                                <Text style={{fontWeight:"bold" , color:'#868686'}} > Estoque: </Text>
                                    <TextInput
                                    onChangeText={(value:any)=> setEstoque( value )}
                                    style={{ height:30,backgroundColor:'#FFF', width: '50%'}}
                                    keyboardType="numeric"
                                    value={String( estoque )}

                                    />
                            </View>

                        </View>

                </View>

                <View style={{ margin: 7, backgroundColor: '#FFF', padding: 2, borderRadius: 5, elevation: 5 }}>
                    <TextInput
                         onChangeText={(value)=> setDescricao( value )}
                        style={{ padding: 5, backgroundColor: '#FFF' }}
                        placeholder="descrição"
                        value={String(descricao)}
                    />
                </View>
               
                <View style={{ margin: 7, backgroundColor: '#fff', alignItems: "center", justifyContent: "flex-start", flexDirection: "row", borderRadius: 5, height: 35, elevation: 5 }}>
                    <Text style={{ fontWeight:"bold", color:'#868686'}}> SKU: </Text>
                        <TextInput
                                onChangeText={(value)=> setSku( value )}
                                value={String(sku)}
                            />
                    </View>
                <View style={{ margin: 7, backgroundColor: '#fff', alignItems: "center", justifyContent: "flex-start", flexDirection: "row", borderRadius: 5, height: 35, elevation: 5 }}>
                <Text style={{ fontWeight:"bold", color:'#868686'}}> Cod.Barras: </Text>
                        <TextInput
                                onChangeText={(value)=> setGtim( value )}
                                value={String(gtim)}
                        />
                </View>
                <View style={{ margin: 7, backgroundColor: '#fff', alignItems: "center", justifyContent: "flex-start", flexDirection: "row", borderRadius: 5, height: 35, elevation: 5 }}>
                <Text style={{ fontWeight:"bold", color:'#868686'}}>  Referencia: </Text>
                            <TextInput
                                onChangeText={(value)=> setReferencia( value )}
                                value={ referencia ? String(referencia) : '' }
                            />
                </View>

                <Text style={{marginLeft:5 ,fontWeight:"bold", color:'#868686'  }} > { marcaSelecionada && 'Marca:'}</Text> 
                 
                 <View style={{ flexDirection:"row" }}>
                    <RenderModalMarcas codigoMarca={  marcaSelecionada ? marcaSelecionada : 0  } setMarca={setMarcaSelecionada} />
                 </View>  

                 <Text style={{marginLeft:5 ,fontWeight:"bold", color:'#868686'  }} > { categoriaSelecionada && 'Categoria:'}</Text> 

                 <View style={{ flexDirection:"row" }}>
                    <RenderModalCategorias  codigoCategoria={ categoriaSelecionada ? categoriaSelecionada  : 0}  setCategoria={setCategoriaSelecionada}  />
                 </View> 
              
    
                <View style={{ flexDirection: "row", marginTop:50 ,width: '100%', alignItems: "center", justifyContent: "center" }} >
                    <TouchableOpacity 
                    style={{ backgroundColor: '#185FED', width: '80%', alignItems: "center", justifyContent: "center", borderRadius:  10, padding: 5 }}
                         onPress={()=>gravar()}
                    >
                        <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 20 }}>gravar</Text>
                    </TouchableOpacity>
                </View> 

               
         </View>
 
 
        </View>
    )
}