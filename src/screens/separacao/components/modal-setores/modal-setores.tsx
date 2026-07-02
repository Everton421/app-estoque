import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useApi from '../../../../services/api';

type props = {
        visible: boolean,
        setVisible: ( visible:boolean)=>void;
        selectSector: ( setor: setor)=>void;
    }

type setor = {
    codigo: number,
    data_cadastro: string,
    data_recadastro: string,
    descricao: string
}
type propsSetor = {
    setor: setor,
    selectSetor:(setor:setor)=>void
}

  const RenderSetores = ({ setor, selectSetor }: propsSetor) => {
    return (
        <TouchableOpacity
            style={{
                backgroundColor: '#FFF',
                marginHorizontal: 10,
                marginVertical: 5,
                borderRadius: 12,
                padding: 15,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: 4,
                borderLeftColor: '#185FED'
            }}
            onPress={() => { selectSetor(setor) }}
        >
            <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15
            }}>
                <MaterialIcons name="store" size={24} color="#185FED" />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                    {setor.descricao}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: '#185FED', fontWeight: 'bold', backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 }}>
                        Cód: {setor.codigo}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>
                        {new Date(setor.data_cadastro).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </View>

            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
    )
}

export const ModalSetores = ({ visible, setVisible, selectSector }: props)=>{
    const api = useApi();

    const [ dataSetores, setDataSetores  ]= useState<setor[]>();

    async function findSetores() {
        const resultDataSector = await api.get('/setores/search');

        if (resultDataSector && resultDataSector?.status == 200) {
            setDataSetores(resultDataSector.data);
        }
    }

    useEffect(()=>{
        findSetores()
    },[])

return  ( 
<Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '90%', height: '80%', backgroundColor: "#FFF", borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                        <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Selecionar Setor</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={dataSetores}
                            renderItem={({ item }) => <RenderSetores setor={item} selectSetor={selectSector} />}
                            contentContainerStyle={{ paddingVertical: 10 }}
                        />
                    </View>
                </View>
            </Modal>
)
}
