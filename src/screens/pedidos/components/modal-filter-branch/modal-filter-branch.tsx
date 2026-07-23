import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useApi from '../../../../services/api';
import { branch } from '../..';

type props = {
        visible: boolean,
        setVisible: ( visible:boolean)=>void;
        selectBranch: ( branch: branch | null)=>void;
        branchSelected: number | null
    }


type propsBranch = {
    branch: branch,
    selectBranch:(branch:branch | null)=>void
     branchSelected: number | null
     setVisible: (visible:boolean)=>void
}

  const RenderBranch = ({ setVisible, branch, selectBranch, branchSelected }: propsBranch) => {
    return (
        <TouchableOpacity
            style={{
                backgroundColor:   branch.codigo == branchSelected ? '#e7ffe2' : '#FFF' ,
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
                borderLeftColor:    branch.codigo == branchSelected ? '#1ea902f0' : '#185FED'  
            }}
            onPress={() => { 
                branchSelected && branchSelected == branch.codigo ? selectBranch(null) : selectBranch(branch)
            setVisible(false)
            }}
        >
            <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15
            }}>
                <MaterialIcons name="store" size={24} color={ branch.codigo == branchSelected ? '#1ea902f0' : '#185FED'} />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }} numberOfLines={1}>
                    {branch.nome_fantasia}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color:  branch.codigo == branchSelected ? '#1ea902f0' : '#185FED', fontWeight: 'bold', backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 }}>
                        Cód: {branch.codigo}
                    </Text>
                  
                </View>
            </View>

            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
    )
}

export const ModalBranches = ({ visible, setVisible, selectBranch, branchSelected }: props)=>{
    const api = useApi();

    const [ dataBranches, setDataBranches  ]= useState<branch[]>();
    const [searchText, setSearchText] = useState('');

        
    async function findbranches() {
        try{

        let params = { ativo:'S' } as any 
        if(searchText){
                params.nome_fantasia = searchText
        }
        const resultDataSector = await api.get('/filias/search',{
            params 
        });
        if (resultDataSector && resultDataSector?.status == 200) {
            setDataBranches(resultDataSector.data);
        }
        }catch( e ){
            console.log(e)
        }
    
    }



    useEffect(()=>{
         findbranches()
    },[searchText])

return  ( 
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '90%', height: '80%', backgroundColor: "#FFF", borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                        
                        <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Selecionar Filial</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

             

                        <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
                            <TextInput
                                style={{
                                    backgroundColor: '#F5F7FA',
                                    borderRadius: 8,
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                    fontSize: 14,
                                    color: '#333',
                                }}
                                placeholder="Pesquisar Filial..."
                                placeholderTextColor="#999"
                                defaultValue={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        <FlatList
                            data={dataBranches}
                            renderItem={({ item }) => <RenderBranch setVisible={setVisible} branchSelected={branchSelected}  branch={item} selectBranch={selectBranch} />}
                            contentContainerStyle={{ paddingVertical: 10 }}
                        />
                    </View>
                </View>
            </Modal>
)
}
