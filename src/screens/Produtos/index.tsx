import { View , Text, TextInput, FlatList, Modal, Button, Image, TouchableOpacity, ActivityIndicator} from "react-native";
import { produto, useProducts } from "../../database/queryProdutos/queryProdutos";
import { useEffect, useState } from "react";
 
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFotosProdutos } from "../../database/queryFotosProdutos/queryFotosProdutos";
import { useProdutoSetores } from "../../database/queryProdutoSetor/queryProdutoSetor";
import { defaultDatabaseDirectory } from "expo-sqlite";
import { Entypo } from "@expo/vector-icons";

type  selectCompleteProdSector= {
    data_recadastro :  string,
    descricao_produto:  string,
    descricao_setor:  string,
    estoque: number, 
    produto: number,
    setor: number,
    local_produto:string,
    local1_produto:string
    local2_produto:string
    local3_produto:string
    local4_produto:string
}
 

 import { StyleSheet } from "react-native"; // Não esqueça de importar o StyleSheet

export function Produtos({ navigation }: any) {

    const useQueryProdutos = useProducts();
    const useQueryFotos = useFotosProdutos();
    const useQueryProdutoSetores = useProdutoSetores();

    const [pesquisa, setPesquisa] = useState<string>(''); // Começar vazio é mais comum
    const [dados, setDados] = useState<any[]>([]); // Tipar como array
    const [pSelecionado, setpSelecionado] = useState<produto>();
    const [visible, setVisible] = useState(false);
    const [visibleModalSetores, setVisibleModalSetores] = useState(false);

    const [dataProdSector, setDataProdSector] = useState<selectCompleteProdSector[]>([])
    const [prodViewSector, setProdViewSector] = useState(0);
    const [loadingItemModalSetor, setLoadingItemModalSetor] = useState(false);

    // ... Mantenha suas funções filterByDescription, filterAll, useEffect aqui ...
    // ... (Estou omitindo para focar no visual, mas mantenha sua lógica original) ...

    async function filterByDescription() {
        // Sua lógica original...
        // Apenas simulei para o exemplo, mantenha a sua função real
        const response: any = await useQueryProdutos.selectByDescription(pesquisa, 10);
        for (let p of response) {
            let dadosFoto: any = await useQueryFotos.selectByCode(p.codigo)
            if (dadosFoto?.length > 0) {
                p.fotos = dadosFoto
            } else {
                p.fotos = []
            }
        }
        if (response.length > 0) setDados(response);
    }

    async function filterAll() {
         // Sua lógica original...
         const response: any = await useQueryProdutos.selectAllLimit(25);
         for( let p of response ){
             let dadosFoto:any = await useQueryFotos.selectByCode(p.codigo)   
             if(dadosFoto?.length > 0 ) p.fotos = dadosFoto
         }
         if(response.length > 0 ) setDados(response)
    }
    
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (pesquisa !== null && pesquisa !== '') {
                filterByDescription()
            } else {
                filterAll()
            }
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        filterByDescription()
    }, [pesquisa])

    async function viewItemSector(item: any) {
        setVisibleModalSetores(true)
        setProdViewSector(item.codigo)
        try {
            setLoadingItemModalSetor(true)
            let dados: any = await useQueryProdutoSetores.selectCompleteProdSector(item.codigo);
            if (dados?.length > 0) {
                console.log(dados)
                setDataProdSector(dados);
            } else {
                setDataProdSector([]);
            }
        } catch (error) {
            console.log(`Erro consulta setores`)
        } finally {
            setLoadingItemModalSetor(false)
        }
    }

    function handleSelect(item: any) {
        setpSelecionado(item);
        navigation.navigate('cadastro_produto', {
            codigo_produto: item.codigo
        })
    }

    // --- NOVO RENDER ITEM (CARD DE PRODUTO) ---
    function renderItem({ item }: any) {
        const hasImage = item.fotos && item.fotos.length > 0 && item.fotos[0].link;
        const preco = item.preco ? item.preco : 0;

        return (
            <TouchableOpacity onPress={() => handleSelect(item)} style={styles.productCard}>
                
                {/* Imagem (Lado Esquerdo) */}
                <View style={styles.imageContainer}>
                    {hasImage ? (
                        <Image
                            source={{ uri: `${item.fotos[0].link}` }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.noImagePlaceholder}>
                            <MaterialIcons name="image-not-supported" size={30} color="#BDBDBD" />
                        </View>
                    )}
                </View>

                {/* Informações (Lado Direito) */}
                <View style={styles.contentContainer}>
                    
                    {/* Topo: Código e Preço */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.textCode}>Cód. {item.codigo}</Text>
                        <Text style={styles.textPrice}>R$ {preco.toFixed(2)}</Text>
                    </View>

                    {/* Descrição */}
                    <Text numberOfLines={2} style={styles.textDescription}>
                        {item.descricao}
                    </Text>

                    {/* Rodapé do Card: Estoque e Botão Setor */}
                    <View style={styles.cardFooter}>
                        <View style={styles.stockInfo}>
                            <Text style={styles.stockLabel}>Estoque Total</Text>
                            <Text style={styles.stockValue}>{item.estoque.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.btnSector}
                            onPress={() => { viewItemSector(item) }}>
                            <Entypo name="archive" size={18} color="#185FED" />
                            <Text style={styles.btnSectorText}>Setores</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    // --- NOVO RENDER ITEM (MODAL DE SETORES) ---
    function renderProdSectorItem({ item }: { item: selectCompleteProdSector }) {
        // Função auxiliar para renderizar linhas de local apenas se existirem
        const renderLocal = (label: string, value: string) => {
            if (!value) return null;
            return (
                <View style={styles.localRow}>
                    <MaterialIcons name="location-on" size={14} color="#185FED" />
                    <Text style={styles.localLabel}>{label}: <Text style={styles.localValue}>{value}</Text></Text>
                </View>
            )
        };

        return (
            <View style={styles.sectorCard}>
                <View style={styles.sectorLeft}>
                    <View style={styles.sectorHeader}>
                        <MaterialIcons name="storefront" size={20} color="#555" />
                        <Text style={styles.sectorTitle}>{item.descricao_setor}</Text>
                    </View>
                    <Text style={styles.sectorCode}>Cód. Setor: {item.setor}</Text>
                    
                    <View style={styles.locaisContainer}>
                        {renderLocal("Local", item.local_produto)}
                        {renderLocal("Loc. 1", item.local1_produto)}
                        {renderLocal("Loc. 2", item.local2_produto)}
                        {renderLocal("Loc. 3", item.local3_produto)}
                        {renderLocal("Loc. 4", item.local4_produto)}
                    </View>
                </View>

                <View style={styles.sectorRight}>
                    <View style={styles.sectorStockBadge}>
                        <Text style={styles.sectorStockValue}>{item.estoque}</Text>
                        <Text style={styles.sectorStockLabel}>UN</Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                        <Text style={styles.headerTitle}> 
                          Produtos
                        </Text>
                    <View style={{width: 24}} />  
                    
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#185FED" style={{marginRight: 8}} />
                        <TextInput
                            style={styles.searchInput}
                            onChangeText={(value) => setPesquisa(value)}
                            placeholder="Pesquisar por descrição..."
                            placeholderTextColor="#999"
                        />
                    </View>
                    <TouchableOpacity>
                        <AntDesign name="filter" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- LISTA PRINCIPAL --- */}
            <FlatList
                data={dados}
                renderItem={(item) => renderItem(item)}
                keyExtractor={(i: any) => i.codigo.toString()}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            />

            {/* --- BOTÃO FLUTUANTE (FAB) --- */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('cadastro_produto')}
            >
                <MaterialIcons name="add" size={40} color="#FFF" />
            </TouchableOpacity>

            {/* --- MODAL DE SETORES --- */}
            <Modal
                visible={visibleModalSetores}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisibleModalSetores(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle} numberOfLines={1}>
                                {dataProdSector && dataProdSector[0] ? dataProdSector[0].descricao_produto : 'Detalhes do Setor'}
                            </Text>
                            <TouchableOpacity onPress={() => setVisibleModalSetores(false)} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {loadingItemModalSetor ? (
                                <ActivityIndicator size="large" color="#185FED" style={{ marginTop: 20 }} />
                            ) : (
                                <>
                                    {(!dataProdSector || dataProdSector.length === 0) && (
                                        <Text style={styles.emptyStateText}>Produto não vinculado a nenhum setor.</Text>
                                    )}
                                    <FlatList
                                        data={dataProdSector}
                                        renderItem={(item) => renderProdSectorItem(item)}
                                        keyExtractor={(item: any) => item.setor.toString()}
                                        contentContainerStyle={{ paddingBottom: 20 }}
                                    />
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* O Modal 'visible' (detalhes) pode ser mantido ou removido conforme sua lógica original, 
                mas recomendo usar a tela de cadastro para detalhes ou estilizar igual ao Modal acima */}

        </View>
    )
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAF4FE',
    },
    // Header Styles
    header: {
        backgroundColor: '#185FED',
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 5,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 45,
    },
    searchInput: {
        flex: 1,
        color: '#333',
        fontWeight: '500',
    },
    
    // Product Card Styles
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 10,
        marginVertical: 6,
        padding: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    imageContainer: {
        width: 90,
        height: 90,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    noImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textCode: {
        fontSize: 12,
        color: '#757575',
    },
    textPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#185FED',
    },
    textDescription: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginVertical: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    stockInfo: {
        alignItems: 'flex-start',
    },
    stockLabel: {
        fontSize: 10,
        color: '#9E9E9E',
    },
    stockValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#424242',
    },
    btnSector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        gap: 4,
    },
    btnSectorText: {
        color: '#185FED',
        fontWeight: 'bold',
        fontSize: 12,
    },

    // Sector Modal Item Styles
    sectorCard: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 15,
        marginBottom: 10,
        flexDirection: 'row',
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#185FED',
    },
    sectorLeft: {
        flex: 1,
        paddingRight: 10,
    },
    sectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 2,
    },
    sectorTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
    },
    sectorCode: {
        fontSize: 11,
        color: '#999',
        marginBottom: 6,
    },
    locaisContainer: {
        gap: 2,
    },
    localRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    localLabel: {
        fontSize: 12,
        color: '#555',
        fontWeight: '600',
    },
    localValue: {
        fontWeight: 'normal',
        color: '#777',
    },
    sectorRight: {
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#F0F0F0',
        paddingLeft: 10,
        minWidth: 70,
    },
    sectorStockBadge: {
        alignItems: 'center',
    },
    sectorStockValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#185FED',
    },
    sectorStockLabel: {
        fontSize: 10,
        color: '#999',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: '#F5F7FA',
        borderRadius: 15,
        overflow: 'hidden',
    },
    modalHeader: {
        backgroundColor: '#185FED',
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalBody: {
        flex: 1,
        paddingTop: 10,
    },
    emptyStateText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
        fontSize: 15,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#185FED',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
    }
});