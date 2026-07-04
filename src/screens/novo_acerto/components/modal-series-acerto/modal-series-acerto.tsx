import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import useApi from "../../../../services/api";
import { CameraView } from "expo-camera";
import { AlertType, CustomAlert } from "../../../../components/custom-alert/custom-alert";

type ModalProps = {
   setor:number,
   setVisible: (visible:boolean)=>void,
    produto:number,
     maxQuantity:number,
      visible:boolean
      ent_sai: 'E'| 'S'  
};

type type_lote_serie_setor = {
    serie: string | null 
    quantidade:number 
    produto:number,
    setor:number
    };

 


export const ModalSeriesAcerto = ( { maxQuantity, visible,setVisible, setor ,produto, ent_sai}: ModalProps) => {

    const api = useApi();

    const [isloadingDataSeries, setIsloadingDataSeries] = useState(false);
    const [dataSeries, setDataSeries] = useState<type_lote_serie_setor[]>([]);

    const [isVisibleCamera, setIsVisibleCamera ] = useState(false);
    const [ visibleAlert, setVisibleAlert  ] = useState(false);
    const [ messageAlert, setMessageAlert  ] = useState<string>('');

      const [typeAlert, setTypeAlert] = useState<AlertType>('info');
  
  
    async function handleCodeRead(data: string) {
         setIsVisibleCamera(false);

            console.log(dataSeries);
          try {
            let auxDataSeries = dataSeries ;

            const payload = { produto:produto , setor: setor , quantidade: 1, serie: data } 
            
            if(maxQuantity == auxDataSeries.length){
                ///console.log( `${maxQuantity} == ${auxDataSeries.length}`)
                setVisibleAlert(true)
                const msg =`A quantidade de series informada deve corresponder a quantidade a ser movimentada no acerto. Quantidade informada no acerto: ${maxQuantity} `;
                setMessageAlert(msg)
                setTypeAlert('warning')
                return
            }else{
              auxDataSeries.push(payload)
             setDataSeries(auxDataSeries);
            console.log(auxDataSeries);

            }


        } catch (e: any) {
            console.log("Erro ao tentar consultar lote-serie-setor ", e?.response?.data || e);
        } finally {
            setIsloadingDataSeries(false);
        }
    }


     
        const handleConfirm = ()=>{
            if(dataSeries.length < maxQuantity){
                setVisibleAlert(true)
                const msg =`A quantidade de series informada deve corresponder a quantidade a ser movimentada no acerto. Quantidade informada no acerto: ${maxQuantity} `;
                setMessageAlert(msg)
                setTypeAlert('warning')
                return
            }else{
                setVisible(false)
            }
        }

        async function initState(){
            if(ent_sai == 'S'){



            }
        }


    const renderserie = ({ item }: { item: type_lote_serie_setor }) => {


            function handleDeleteSerie (serie:type_lote_serie_setor) {
                let auxSeries =  dataSeries.filter ( s => s.serie != serie.serie)
                setDataSeries(auxSeries);
            }

        return (
            <View style={{
                backgroundColor:  '#eaffe2',
                borderRadius: 12,
                marginBottom: 12,
                padding: 10,
                elevation: 3,
                borderLeftWidth: 5,
                borderLeftColor:  '#4CAF50' 
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>produto: {item.produto}</Text>

                     <TouchableOpacity 
                      onPress={()=> handleDeleteSerie(item)}
                       >
                        <Ionicons name="close" size={24} color="#c40000" />
                    </TouchableOpacity>
 
                </View>

                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                    Série: {item.serie || "Serie com valor vazio"}
                </Text>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>Qtd : {item.quantidade}</Text>

                                   {
                                    /** 
                                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                       <TouchableOpacity
                                           style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center" }}
                                           onPress={() => handleDecrement(item.lote_serie)}
                                       >
                                           <AntDesign name="minus" size={20} color="#333" />
                                       </TouchableOpacity>
               
                                       <View style={{ minWidth: 40, borderBottomWidth: 2, borderBottomColor: qty > 0 ? '#4CAF50' : '#185FED', alignItems: 'center' }}>
                                           <TextInput
                                               style={{ fontSize: 20, fontWeight: 'bold', color: qty > 0 ? '#4CAF50' : '#185FED', textAlign: 'center', paddingVertical: 0 }}
                                               value={String(parseInt(qty))}
                                               onChangeText={(text) => {
                                                   const num = Number(text.replace(/[^0-9]/g, ''));
                                                   handleUpdateQuantity(item.lote_serie, num, item.estoque);
                                               }}
                                               keyboardType="numeric"
                                           />
                                       </View>
               
                                       <TouchableOpacity
                                           style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: hasStock && !atMax ? '#4CAF50' : "#ccc", justifyContent: "center", alignItems: "center", elevation: 2 }}
                                           onPress={() => handleIncrement(item.lote_serie, item.estoque)}
                                       >
                                           <AntDesign name="plus" size={20} color="#FFF" />
                                       </TouchableOpacity>
                                   </View>
                                    */
                                   }

            </View>
        );
    };


     

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={()=> setVisible(false) }>
             <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={()=> setVisible(false)} />

                <View style={{
                    flex: 1,
                    marginTop: 45,
                    backgroundColor: "#FFF",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    overflow: 'hidden',
                    elevation: 10
                }}>
                    <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Lote Séries:</Text>
                        </View>

                        <TouchableOpacity onPress={()=> setVisible(false)}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
              

                    <View style={{ flex: 1, padding: 20 }}>
                        {isloadingDataSeries ? (
                            <ActivityIndicator size={25} color='#185FED' />
                        ) : (
                            <FlatList
                                data={dataSeries}
                                renderItem={renderserie}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={() => (
                                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                                        <MaterialCommunityIcons name="package-variant-closed" size={50} color="#BDBDBD" />
                                        <Text style={{ color: '#999', fontSize: 16, marginTop: 10 }}>Nenhuma Série disponivel.</Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>

                    <View style={{ padding: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>
                                Total separado: <Text style={{ color: '#185FED', fontWeight: 'bold' }}>{dataSeries.length }</Text>
                            </Text>
                            {maxQuantity !== undefined && (
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#555' }}>
                                    Máx: <Text style={{ color: '#185FED', fontWeight: 'bold' }}>{maxQuantity}</Text>
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#185FED',
                                borderRadius: 12,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 10
                            }}
                             onPress={handleConfirm}
                        >
                            <AntDesign name="check" size={20} color="#FFF" />
                            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Confirmar</Text>
                        </TouchableOpacity>
  
     {/* BOTÃO FLUTUANTE DE LEITURA (acima do rodapé) */}
                <TouchableOpacity
                    onPress={() => { setIsVisibleCamera(true) }}
                    style={{
                        backgroundColor: '#185FED',
                        width: 56, height: 56,
                        borderRadius: 28,
                        position: "absolute",
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        right: 20,
                        bottom: 90, 
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 99
                    }}
                >
                    <MaterialCommunityIcons name="barcode-scan" size={28} color="#FFF" />
                </TouchableOpacity>

                         {/* MODAL CÂMERA */}
                                    <Modal visible={isVisibleCamera} animationType="slide">
                                        <CameraView
                                            style={{ flex: 1 }}
                                            facing="back"
                                            onBarcodeScanned={({ data }) => {
                                                if (data) handleCodeRead(data);
                                            }}
                                        >
                                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                                <View style={{ width: 280, height: 280, borderWidth: 2, borderColor: '#FFF', borderRadius: 20 }} />
                                                <Text style={{ color: '#FFF', marginTop: 20, fontWeight: 'bold' }}>Posicione o código de barras na área</Text>
                        
                                                <TouchableOpacity
                                                    onPress={() => setIsVisibleCamera(false)}
                                                    style={{ position: 'absolute', bottom: 50, backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
                                                >
                                                    <Text style={{ color: '#000', fontWeight: 'bold' }}>Cancelar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </CameraView>
                                    </Modal>



                            <CustomAlert
                                  visible={visibleAlert}
                                  title=""
                                  onConfirm={ ()=>setVisibleAlert(false)}
                                  message={messageAlert}
                                  type={typeAlert}
                                  />

                    </View>
             </View>
             </View>
        </Modal>
    );
};
