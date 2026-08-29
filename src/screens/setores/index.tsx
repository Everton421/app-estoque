import Ionicons from '@expo/vector-icons/Ionicons';
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AlertType, CustomAlert } from "../../components/custom-alert/custom-alert";
import { CustomHeader } from "../../components/custom-header/custom-header";
import { EmptyState } from "../../components/empty-state";
import { Fab } from "../../components/fab";
import { LodingComponent } from "../../components/loading";
import { useSetores } from "../../database/querySetores/querySetores";
import useApi from "../../services/api";
import { configMoment } from "../../services/moment";
import { delay } from "../../utils/delay";
import { RenderItensSetores } from "./renderItem";
import { AuthContext } from '../../contexts/auth';
import { verifyUserPermission } from '../../services/verify-user-permissions';

type sector = {
    codigo: number;
    descricao: string;
    data_cadastro: string;
    data_recadastro: string;
    id:string
}

export const Setores = ({ navigation }: any) => {
    const [dados, setDados] = useState<sector[]>([]);
    const [pesquisa, setPesquisa] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [setorSelecionado, setSetorSelecionado] = useState<sector>();
    const [loading, setLoading] = useState(false);
   

    const [isVisibleAlert, setIsVisibleAlert] = useState(false);
    const [titleAlert, setTitleAlert] = useState('');
    const [messageAlert, setMessageAlert] = useState('');
    const [typeAlert, setTypeAlert] = useState<AlertType>('success');
    const [cancelText, setCancelText] = useState<string | undefined>();
    const [confirmText, setConfirmText] = useState<string | undefined>();

    const [isLoadingData, setIsloadingData] = useState(false);
        const { usuario, permissoes }: any = useContext(AuthContext);

     const [ isEnabledViewerSectors ] = useState( verifyUserPermission("setores", 'ler', permissoes))
     const [ isEnabledCreateSectors ] = useState( verifyUserPermission("setores", 'criar', permissoes))
     const [ isEnabledEditSectors ] = useState( verifyUserPermission("setores", 'editar', permissoes))
 
    const api = useApi();
    const dateService = configMoment();

    async function buscaSetoresRequest() {
        try {
            setIsloadingData(true);
            await delay(700);
            const responseSector = await api.get('/setores/search', {
                params: {
                    limit: 25,
                    search: pesquisa,
                    ativo: 'S'
                }
            });
            setDados(responseSector?.data);
        } catch (e) {
            console.log("[X] Erro ao buscar setores na api ", e);
        } finally {
            setIsloadingData(false);
        }
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            buscaSetoresRequest();
        });
        return unsubscribe;
    }, [navigation, pesquisa]);

    useEffect(() => {
        buscaSetoresRequest();
    }, [pesquisa]);

    function handleSelect(item: sector) {
        if( isEnabledEditSectors ){  
            setVisible(true);
            setSetorSelecionado(item);
        }else{
                setIsVisibleAlert(true);
                 setTitleAlert("Atenção!");
                 setTypeAlert('warning');
                 setMessageAlert("Você não tem permissão para editar setores!");
        }
     }

    async function gravar() {
        if (!setorSelecionado?.descricao) {
            setIsVisibleAlert(true);
            setTitleAlert("Atenção!");
            setMessageAlert(`É necessario informar a descrição para poder gravar!`);
            setTypeAlert('info');
            setCancelText(undefined);
            setConfirmText('ok');
            return;
        }

        try {
            setLoading(true);
            let objSetor: any = {
                "codigo": setorSelecionado && setorSelecionado.codigo,
                "id": setorSelecionado && setorSelecionado.id,
                "descricao": setorSelecionado.descricao,
                "data_cadastro": setorSelecionado.data_cadastro,
                "data_recadastro": dateService.dataHoraAtual(),
            }
            let result = await api.put('/setores', objSetor);

            if (result.status === 200) {
                setVisible(false);
                setIsVisibleAlert(true);
                setTitleAlert("Sucesso!");
                setMessageAlert(` Setor: ${setorSelecionado?.descricao} Alterado Com Sucesso! `);
                setTypeAlert('success');
                setCancelText(undefined);
                setConfirmText('ok');
            }
        } catch (e: any) {
            if (e.status === 400) {
                setIsVisibleAlert(true);
                setTitleAlert("Erro!");
                setMessageAlert(` ${e.response.data.message} `);
                setTypeAlert('error');
                setCancelText(undefined);
                setConfirmText('ok');
                return;
            } else {
                setIsVisibleAlert(true);
                setTitleAlert("Erro!");
                setMessageAlert(` ${e.response.data.message} `);
                setTypeAlert('error');
                setCancelText(undefined);
                setConfirmText('ok');
                return;
            }
        } finally {
            setLoading(false);
        }
    }

  
    function handlesCreateSector (){
         isEnabledCreateSectors ?     
                        navigation.navigate('cadastro_setores')
                        :
                      setIsVisibleAlert(true);
                      setTitleAlert("Atenção!");
                      setTypeAlert('warning');
                      setMessageAlert("Você não tem permissão para criar novos setores!");
   }


    return (
        <View style={{ flex: 1, backgroundColor: '#EAF4FE' }}>
            <LodingComponent isLoading={loading} />

            <CustomHeader
                title="Setores"
                onBack={() => navigation.goBack()}
                showSearch
                searchValue={pesquisa}
                onSearchChange={(v) => setPesquisa(v)}
                showFilter
            />

            <Modal transparent={true} visible={visible} animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '85%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', elevation: 10 }}>
                        <View style={{ backgroundColor: '#185FED', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Editar Setor</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 20 }}>
                            <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Código
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>  {setorSelecionado?.codigo}  </Text>
                            </Text>

                            <Text style={{ fontSize: 14, color: '#757575', marginBottom: 4 }}>Descrição</Text>
                            <TextInput
                                style={{ backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, height: 47, fontSize: 15, color: '#333' }}
                                defaultValue={setorSelecionado?.descricao}
                                onChangeText={(v) => setSetorSelecionado((prev: any) => ({ ...prev, descricao: v }))}
                            />

                            <TouchableOpacity
                                style={{ backgroundColor: '#185FED', borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 25, elevation: 3 }}
                                onPress={() => gravar()}
                            >
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Gravar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        { 
              typeAlert == 'warning' || typeAlert == 'info' ?
            <CustomAlert
                visible={isVisibleAlert}
                message={messageAlert}
                onConfirm={() => setIsVisibleAlert(false)}
                onCancel={() => setIsVisibleAlert(false)}
                title={titleAlert}
                type={typeAlert}
            />
            :
          <CustomAlert
                visible={isVisibleAlert}
                message={messageAlert}
                onConfirm={() => setIsVisibleAlert(false)}
                onCancel={() => setIsVisibleAlert(false)}
                title={titleAlert}
                type={typeAlert}
                cancelText={cancelText}
                confirmText={confirmText}
            />
        }
        


            {isLoadingData ?
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size={50} color="#185FED" />
                </View> :

                <View style={{ marginBottom: 10 }}>
                    {
                        isEnabledViewerSectors ? 
                         <FlatList
                                data={dados || []}
                                renderItem={({ item }) => <RenderItensSetores item={item} handleSelect={handleSelect} />}
                                keyExtractor={(i) => i.codigo.toString()}
                                ListEmptyComponent={() => <EmptyState icon="store" message="Nenhum setor encontrado" />}
                            />
                        :
                    <View style={{flex:1, alignItems:"center", justifyContent:"center" }}>
                            <Text style={{ fontWeight:"bold", color:'#999'}}>Você não tem permissão para ver os setores!</Text>
                    </View>
                    }
                   
                </View>
            }

            <Fab onPress={() => handlesCreateSector() } />
        </View>
    );
}
