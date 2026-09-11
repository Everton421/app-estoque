import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from "react-native";
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { generateOrderHTML } from '../../utils/generateHTML';
import { AuthContext } from '../../../../contexts/auth';



// --- Constantes de Estilo (Melhor prática para cores e tamanhos) ---
const COLORS = {
    primary: '#007BFF',
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    gray: '#DEE2E6',
    darkGray: '#6C757D',
    text: '#212529',
    background: 'rgba(0, 0, 0, 0.6)',
    danger: '#DC3545',
};

const SIZES = {
    padding: 16,
    borderRadius: 12,
    base: 8,
};

// --- Componente Principal do Modal ---

export const ModalPrint = ({ visible, orcamento, setVisible }) => {
        const { usuario, permissoes }: any = useContext(AuthContext);
        const [ isEnabledViewerValues ] =useState( permissoes.some(( i:any )=> i =='pedidos.ver_valores')) 

    if (!orcamento) {
        return null;
    }

//////////////    
//    useEffect(()=>{
//        if(isEnable) setIsViewerValues(true);
//    },[])
/////////

    const print = async () => {
        try {
            const html = generateOrderHTML(orcamento, isEnabledViewerValues);
            await Print.printAsync({ html });
        } catch (error) {
            console.error('Erro ao imprimir:', error);
            Alert.alert('Erro', 'Não foi possível imprimir. Tente novamente.');
        }
    };

    const printToFile = async () => {
        try {
            const html = generateOrderHTML(orcamento);
            const { uri } = await Print.printToFileAsync({ html });
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            Alert.alert('Erro', 'Não foi possível exportar o PDF. Tente novamente.');
        }
    };

    const getTipoOrcamento = () => {
        if (orcamento.tipo === 1) return `Orçamento: #${orcamento.id}`;
        if (orcamento.tipo === 3) return `Ordem de Serviço: #${orcamento.id}`;
        if (orcamento.tipo === 6) return `Ordem de Compra: #${orcamento.id}`;
        return `Documento: ${orcamento.id}`;
    }


    const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
         <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const ProdutoItem = ({ item }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.descricao}</Text>
            <Text style={styles.cardSubtitle}>Código: {item?.codigo}</Text>
            <View style={styles.cardDetails}>
                <Text style={styles.detailText}>Qtd: {item.quantidade}</Text>
                <Text style={styles.detailText}>Unit.: R$ {
                        isEnabledViewerValues ? Number(item.preco)?.toFixed(2) : 
                          <MaterialIcons name="money-off" size={17} color="#185FED" />  
                    }</Text>
                <Text style={[styles.detailText, styles.totalText]}>
                        Total: R$ { 
                                    isEnabledViewerValues  ?  
                                        Number(item.total)?.toFixed(2)
                                    : 
                                       <MaterialIcons name="money-off" size={17} color="#185FED" />  
                                    }
                        </Text>
            </View>
        </View>
    );
};

const ServicoItem = ({ item }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.aplicacao}</Text>
            <Text style={styles.cardSubtitle}>Código: {item?.codigo}</Text>
            <View style={styles.cardDetails}>
                <Text style={styles.detailText}>Qtd: {item.quantidade}</Text>
                <Text style={styles.detailText}>Unit.: R$ {
                                            isEnabledViewerValues ? 
                                                    Number(item.valor)?.toFixed(2)
                                                :
                                                    <MaterialIcons name="money-off" size={17} color="#185FED" />  
                                                }</Text>
                <Text style={[styles.detailText, styles.totalText]}>Total: R$ 
                        {
                            isEnabledViewerValues ? 
                               Number(item.total)?.toFixed(2)
                            :
                              <MaterialIcons name="money-off" size={17} color="#185FED" />  
                        }</Text>
            </View>
        </View>
    );
};
 
const ParcelaItem = ({ item }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Parcela {item.parcela}</Text>
            <View style={styles.cardDetails}>
                <Text style={styles.detailText}>Vencimento: {item.vencimento}</Text>
                <Text style={[styles.detailText, styles.totalText]}>Valor: R$ 
                        {   isEnabledViewerValues ? 
                            Number(item.valor)?.toFixed(2)
                        :
                              <MaterialIcons name="money-off" size={17} color="#185FED" />  
                        }</Text>
            </View>
        </View>
    );
};



    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={() => setVisible(false)}
        >
            <SafeAreaView style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                        <View style={{ flexDirection:'row', gap:5 , justifyContent:'space-around'}}>
                              <TouchableOpacity onPress={() => setVisible(false)} style={[styles.closeButton ]}>
                               <Ionicons name="close" size={28} color="#a40b0b" />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={()=>print()} style={[styles.printButton]}>
                                  <Feather name="printer" size={18} color="#FFF" />
                                 <Text style={styles.printButtonText}>Imprimir</Text>
                            </TouchableOpacity>
                           <TouchableOpacity onPress={()=>printToFile()} style={[styles.printButton, { backgroundColor: COLORS.darkGray }]}>
                              <Feather name="file-text" size={18} color="#FFF" />
                               <Text style={styles.printButtonText}>Exportar PDF</Text>
                            </TouchableOpacity>
                       
                       
                        </View>

                    {/* Cabeçalho do Modal */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle} numberOfLines={1} >{getTipoOrcamento()}</Text>
                            <Text style={  styles.headerSubtitle  } numberOfLines={1} >ID Externo: {orcamento?.id_externo || 'N/A'}</Text>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Informações Gerais */}
                        <View style={styles.section}>
                            <InfoRow label="Data Cadastro:" value={  new Date(orcamento?.data_cadastro).toLocaleString("pt-br", {    year: "numeric", month: "short", day: "numeric"  }) } />

                            {
                                orcamento.tipo == 6 ?
                                <InfoRow label="Fornecedor:" value={`${orcamento.fornecedor?.codigo  } - ${orcamento.fornecedor?.nome  }`} />
                                :
                                <InfoRow label="Cliente:" value={`${orcamento.cliente?.codigo } - ${orcamento.cliente?.nome   }`} />
                            }

                            <InfoRow label="Última alteração::" value={   new Date(orcamento?.data_recadastro).toLocaleTimeString("pt-br", { month: "short", day: "numeric"  })   } />
                        </View>

                        {/* Totais */}
                        <View style={styles.section}>
                            <View style={styles.totalsContainer}>
                                        {
                                         isEnabledViewerValues   
                                         ? 
                                          <InfoRow label="Total Produtos:" value={`R$ ${ Number(orcamento?.total_produtos)?.toFixed(2) || '0.00'}`} />
                                        :
                                          <InfoRow label="Total Produtos:" value={ <MaterialIcons name="money-off" size={20} color="#185FED" />} />
                                      }   
                                
                                    { 
                                         isEnabledViewerValues ?   
                                        <InfoRow label="Total Serviços:" value={`R$ ${Number(orcamento?.total_servicos)?.toFixed(2) || '0.00'}`} />
                                        :
                                          <InfoRow label="Total Serviços:" value={ <MaterialIcons name="money-off" size={20} color="#185FED" />} />
                                    }
                                    {
                                         isEnabledViewerValues ?   
                                       <InfoRow label="Descontos:" value={`R$ ${Number(orcamento?.descontos)?.toFixed(2) || '0.00'}`} />
                                      :
                                        <InfoRow label="Descontos:" value={ <MaterialIcons name="money-off" size={20} color="#185FED" />} />
                                    }

                                <View style={styles.divider} />
                                {
                                         isEnabledViewerValues ?   
                                      <InfoRow label="Total Geral:" value={`R$ ${Number(orcamento?.total_geral)?.toFixed(2) || '0.00'}`} />
                                    :
                                        <InfoRow label="Total Geral:" value={ <MaterialIcons name="money-off" size={20} color="#185FED" />} />

                                    }

                            </View>
                        </View>
                        
                        {/* Lista de Produtos */}
                        {orcamento.produtos && orcamento.produtos.length > 0 && (
                            <View style={styles.section}>
                                <SectionHeader title="PRODUTOS" />
                                <FlatList
                                    data={orcamento.produtos}
                                    renderItem={({ item }) => <ProdutoItem item={item} />}
                                    keyExtractor={(item) => item.codigo?.toString()}
                                    scrollEnabled={false} // Desabilita o scroll da FlatList interna
                                />
                            </View>
                        )}

                        {/* Lista de Serviços */}
                        {orcamento.servicos && orcamento.servicos.length > 0 && (
                            <View style={styles.section}>
                                <SectionHeader title="SERVIÇOS" />
                                <FlatList
                                    data={orcamento.servicos}
                                    renderItem={({ item }) => <ServicoItem item={item} />}
                                    keyExtractor={(item) => item.codigo?.toString()}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}
                        
                        {/* Lista de Parcelas */}
                        {orcamento.parcelas && orcamento.parcelas.length > 0 && (
                            <View style={styles.section}>
                                <SectionHeader title="PARCELAS" />
                                <FlatList
                                    data={orcamento.parcelas}
                                    renderItem={({ item }) => <ParcelaItem item={item} />}
                                    keyExtractor={(item) => item.parcela.toString()}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

// --- StyleSheet (Centraliza todos os estilos) ---

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '97%',
        height: '97%',
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
        flex:1
    },
    closeButton: {
        padding: SIZES.base / 2,
    },
    section: {
        marginVertical: SIZES.base,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: SIZES.base,
        marginTop: SIZES.base,
        paddingBottom: SIZES.base / 2,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.base / 2,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.darkGray,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: 'bold',
        textAlign: 'right',
        flex: 1,
        marginLeft: SIZES.base,
    },
    totalsContainer: {
        backgroundColor: COLORS.white,
        padding: SIZES.padding / 2,
        borderRadius: SIZES.borderRadius / 2,
        borderWidth: 1,
        borderColor: COLORS.gray,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray,
        marginVertical: SIZES.base / 2,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius / 1.5,
        padding: SIZES.padding / 1.5,
        marginBottom: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.gray,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginBottom: SIZES.base,
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SIZES.base,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.darkGray,
    },
    totalText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
      printButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
    },
    printButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 13,
    },
});