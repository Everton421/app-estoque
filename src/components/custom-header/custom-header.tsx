import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

type CustomHeaderProps = {
    title: string;
    onBack?: () => void; // Se não passar, o botão de voltar não aparece
    
    // --- Props da Barra de Pesquisa ---
    showSearch?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    
    // --- Props do Filtro ---
    showFilter?: boolean;
    onFilterPress?: () => void;
    
    // --- Elemento extra caso queira colocar um ícone na direita superior ---
    rightElement?: React.ReactNode; 
}

export const CustomHeader = ({
    title,
    onBack,
    showSearch = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = "Pesquisar...",
    showFilter = false,
    onFilterPress,
    rightElement
}: CustomHeaderProps) => {

    const hasBottomRow = showSearch || showFilter;

    return (
        <View style={{
            backgroundColor: '#185FED',
            paddingTop: 10,
            paddingBottom: 20,
            paddingHorizontal: 15,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            elevation: 5,
            marginBottom: 10, // Margem para afastar do restante da tela
            width: '100%'
        }}>
            
            {/* --- LINHA SUPERIOR: Voltar, Título, Elemento Direito --- */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: hasBottomRow ? 15 : 5 // Espaçamento menor se não tiver barra de busca
            }}>
                {/* Botão de Voltar ou Espaço Vazio para centralizar o título */}
                {onBack ? (
                    <TouchableOpacity onPress={onBack} style={{ padding: 5 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 34 }} />
                )}

                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>
                    {title}
                </Text>

                {/* Elemento da Direita ou Espaço Vazio para centralizar o título */}
                <View style={{ minWidth: 34, alignItems: 'flex-end', justifyContent: 'center' }}>
                    {rightElement ? rightElement : <View style={{ width: 24 }} />}
                </View>
            </View>

            {/* --- LINHA INFERIOR: Busca e Filtro --- */}
            {hasBottomRow && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    
                    {/* Barra de Pesquisa */}
                    {showSearch && (
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#FFF',
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            height: 45
                        }}>
                            <Ionicons name="search" size={20} color="#185FED" style={{ marginRight: 8 }} />
                            <TextInput
                                style={{ flex: 1, color: '#333', fontWeight: '500' }}
                                value={searchValue}
                                onChangeText={onSearchChange}
                                placeholder={searchPlaceholder}
                                placeholderTextColor="#999"
                            />
                        </View>
                    )}

                    {/* Botão de Filtro */}
                    {showFilter && (
                        <TouchableOpacity onPress={onFilterPress} style={{ padding: 2 }}>
                            <AntDesign name="filter" size={28} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}