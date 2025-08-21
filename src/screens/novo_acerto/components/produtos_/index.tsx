import React, { useContext, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";

import { useProducts } from "../../../../database/queryProdutos/queryProdutos";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFotosProdutos } from "../../../../database/queryFotosProdutos/queryFotosProdutos";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";

 
export const ListaProdutos = ({produto , setProduto}:{ produto:any, setProduto:React.Dispatch<React.SetStateAction<any>>} ) => {

  const [pesquisa, setPesquisa] = useState<any>("a");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleProdutos, setVisibleProdutos] = useState(false);


  const useQueryProdutos = useProducts();
  const useQueryFotos = useFotosProdutos();
 
  const adiciona = (dado:any) => {
    setPesquisa(dado);
  };
  //////////////////
  useEffect(() => {
    const busca = async () => {
      try {
       let aux: any = await useQueryProdutos.selectByDescription(pesquisa, 20);
        //   let aux: any = await useQueryProdutos.selectAll();

        for( let p of aux ){
          let dadosFoto:any = await useQueryFotos.selectByCode(p.codigo)   
          if(dadosFoto?.length > 0 ){
              p.fotos = dadosFoto
          }else{
              p.fotos = []
           }
      }
        setData(aux);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    if (pesquisa.trim() !== "") {
      busca();
    } else {
      setData([]);
    }
  }, [pesquisa]);
  //////////////////

  function selecionarItem(item:any){
    setProduto(item)
    setVisibleProdutos(false)
  }
  const renderItem = ({ item }:any ) => {

    return (
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor:  "#FFF"   },
        ]}
        onPress={() => selecionarItem(item)} 
      >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                  style={[
                    styles.txt,
                    { fontWeight:   "bold" },
                  ]}
                >
                  Código: {item.codigo}
                </Text>
                <Text style={[styles.txt ]}>
                  R$: {  item && item.preco && item?.preco.toFixed(2)}
                </Text>

                <Text style={[styles.txt  ]}>
                  estoque: {item?.estoque}
                </Text>
                
          </View>
           <View style={{ flexDirection:"row", justifyContent:"space-between"}}>
            {  item.fotos.length > 0 && item.fotos[0].link ?
                        (<Image
                             source={{ uri: `${item.fotos[0].link}` }}
                             // style={styles.galleryImage}
                             style={{ width: 100, height: 100,  borderRadius: 5,}}
                              resizeMode="contain"
                            />) :(
                              <MaterialIcons name="no-photography" size={40} color={  "#5f666dff"  } />
     

                            )
                 }
             
            </View>
        <Text
          style={[styles.txtDescricao ]}  >   {item.descricao}  </Text>
     
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity
        onPress={() => setVisibleProdutos(true)}
          style={{        elevation:  5,    flexDirection: "row",  justifyContent: "space-between",  backgroundColor: "#185FED",  padding: 10,   borderRadius: 5,  width: "70%", }}   >
           <Text
            style={{ color: "white", fontWeight: "bold",  fontSize: 20, width: '90%',   }} >  produtos
          </Text>
                <FontAwesome name="search" size={22} color="#FFF" />
      </TouchableOpacity>

      <View>
        <Modal
          visible={visibleProdutos}
          animationType="slide"
          transparent={true}
        >
          <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", flex: 1 }}>
            <View
            style={{  margin: 5,  backgroundColor: "white",   borderRadius: 20,  width: "96%",    height: "80%",  shadowColor: "#000",   shadowOffset: { width: 0, height: 2 },  shadowOpacity: 0.25,  shadowRadius: 4,  elevation: 5,   }}    >
            <View style={styles.searchContainer}>
                                         <TouchableOpacity onPress={() => {  setVisibleProdutos(false)   }} style={{  width:'15%', padding:3, margin:5}}  >
                                                            <Ionicons name="close" size={28} color={"#6C757D"} />
                                          </TouchableOpacity>

                <View
                  style={{   flexDirection: "row", justifyContent: "space-between",  marginBottom: 15,   margin: 5,   elevation: 5,  }}   >
                  <TextInput
                    style={{  backgroundColor: "#FFF",  borderRadius: 5, borderColor:'#c3c4c5ff',borderWidth:1, width: "90%",fontWeight:'bold',   marginTop: 3,   marginHorizontal: 5,
                    }}
                    placeholder="Pesquisar..."
                    onChangeText={adiciona}
                    placeholderTextColor="#5f666dff"
                  />
           
                </View>
              </View>
              <View style={{ backgroundColor: "#dcdcdd" }}>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color="#009de2"
                    style={styles.loader}
                  />
                ) : (
                  <FlatList
                    data={data}
                    renderItem={renderItem}
                  //  keyExtractor={(item) => item.codigo.toString()}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
        <View
          style={{
            flexDirection: "row",  justifyContent: "space-between",  margin: 5,  }} >
        </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    elevation: 5,
  },
  searchContainer: {
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    borderRadius: 5,
    elevation: 10,
  },
  limpar: {
    borderRadius: 5,
    backgroundColor: "red",
    width: 50,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 1,
  },
  limparText: {
    color: "#FFF",
  },
  buttonsContainer: {
    flexDirection: "row",
  },
  button: {
    margin: 3,
    backgroundColor: "#FFF",
    elevation: 4,
    width: 60,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  txtDescricao: {
    fontWeight: "bold",
    fontSize: 15,
    color:'#5f666dff'

  },
  txt: {
    fontWeight: "bold",
    color:'#5f666dff'
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
