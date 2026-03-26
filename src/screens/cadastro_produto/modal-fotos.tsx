import { useState, useEffect } from "react";
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { typeFotoProduto } from "./types/fotos";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  imgs: typeFotoProduto[];
  codigo_produto: number;
  setImgs: (imgs: typeFotoProduto[] | any) => void;
};

export const Modal_fotos = ({ imgs, codigo_produto, setImgs }: Props) => {
  const [visible, setVisible] = useState(false);
  const [link, setLink] = useState("");
  const [fotos, setFotos] = useState<typeFotoProduto[]>([]);

  const deleteItemListImgs = (item:typeFotoProduto) => {
    setImgs((prev: any) => {
      let aux = prev.filter((i: typeFotoProduto) => i.sequencia !== item.sequencia);
        setFotos(aux);
       return aux;
    });
  };
  

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

  const gravarImgs = () => {
    if (link === "") return;
  
    let sequencia = imgs.length > 0 ? Math.max(...imgs.map((i) => i.sequencia)) + 1 : 1;
  
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

  useEffect(()=>{
    setFotos(imgs)
    console.log("useEffect1 fotos carregadas ",fotos)
},[ ])

  useEffect(()=>{
    setFotos(imgs)
    console.log("useEffect2 fotos carregadas ",fotos)

},[ gravarImgs ])

  return (
    <View style={{ flex: 1 }}>
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

            {fotos && fotos.length > 0 && (
                <FlatList
                  data={fotos}
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
    </View>
  );
};