import { Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

type props = {
    tipo: string,
    value: string,
    defaultConfig: string,
    setDefaultConfig: (value: any) => void
}

export function RenderConfigSeletor({ tipo, value, defaultConfig, setDefaultConfig }: props) {
    const isSelected = defaultConfig === value;

    return (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 15,
                backgroundColor: isSelected ? '#E3F2FD' : '#F5F7FA', // Azul claro se selecionado, cinza se não
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: isSelected ? '#185FED' : '#E0E0E0'
            }}
            onPress={() => setDefaultConfig(value)}
        >
            <Text style={{ flex:1,
                fontWeight: isSelected ? "bold" : "500",
                color: isSelected ? '#185FED' : '#555',
                fontSize: 16
            }}>  {tipo} </Text>

            {isSelected ? (
                <Ionicons name="radio-button-on" size={24} color="#185FED" />
            ) : (
                <Ionicons name="radio-button-off" size={24} color="#9E9E9E" />
            )}
        </TouchableOpacity>
    );
}