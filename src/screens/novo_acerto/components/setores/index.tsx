import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type setor = {
    codigo: number,
    data_cadastro: string,
    data_recadastro: string,
    descricao: string
}
type props = {
    setor: setor,
    selectSetor: any
}

export const Setores = ({ setor, selectSetor }: props) => {
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