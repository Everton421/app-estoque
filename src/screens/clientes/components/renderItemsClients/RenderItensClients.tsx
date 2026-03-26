import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type IClient = {
    codigo: number;
    id:string
    cnpj: string;
    nome: string;
    ie: string;
    cep: string;
    cidade: string;
    endereco: string;
    numero: string;
};

interface Props {
    item: IClient;
    handleSelect?: (item: IClient) => void;
}

export function RenderItensClients({ item, handleSelect }: Props) {
    return (
        <TouchableOpacity
            onPress={() => handleSelect && handleSelect(item) }
            style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                marginHorizontal: 10,
                marginVertical: 6,
                padding: 15,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                flexDirection: 'row',
                alignItems: 'center'
            }}
        >
            {/* Avatar / Ícone do Cliente */}
            <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#E3F2FD',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15
            }}>
                <FontAwesome5 name="user" size={22} color="#185FED" />
            </View>

            {/* Informações do Cliente */}
            <View style={{ flex: 1 }}>
                
                {/* Linha Nome e Código */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                     <Text style={{  fontSize: 12, color: '#185FED', fontWeight: 'bold', backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2,  borderRadius: 4   }}>
                         {item.id ? ("id: "+ item.id) : "Cód: "+ item.codigo}   

                    </Text>

                </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                     
                      <Text 
                        testID='nameClient' 
                        style={{ fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 }} 
                        numberOfLines={1} 
                        ellipsizeMode="tail"
                    >
                        {item.nome}
                    </Text>
                    </View>
                {/* Linha CNPJ */}
                <Text style={{ fontSize: 14, color: '#666' }}>
                    CNPJ/CPF: {item.cnpj || 'Não informado'}
                </Text>
            </View>

            {/* Ícone Indicador de Ação */}
            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" style={{ marginLeft: 5 }} />
            
        </TouchableOpacity>
    );
}