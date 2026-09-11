import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { CustomAlert } from "../../../../components/custom-alert/custom-alert";
import { AuthContext } from "../../../../contexts/auth";
import { verifyUserPermission } from "../../../../services/verify-user-permissions";

type statusSeparation = 'NAO INICIADA' |  'EM ANDAMENTO' |  'PAUSADA' | 'RECUSADA' | 'CONCLUIDA';

type ModalFilterProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
   setSelectedFilter:  ( data: statusSeparation )=>void;

   selectedFilter: statusSeparation[] | null
};

export const ModalFilterStatusSeparation = ({  visible, setVisible,selectedFilter ,setSelectedFilter    }: ModalFilterProps) => {
      let { permissoes }:any  = useContext(AuthContext) ;
    const [isVisibleAlert, setIsVisibleAlert ] = useState(false);
    const [titleAlert, setTitleAlert ] = useState('');
    const [messageAlert, setMessageAlert ]= useState('');
    const [typeAlert, setTypeAlert] = useState<'success' | 'error' | 'warning' | 'info'>('warning');
 
    

    const [statusSeparationOptions ]= useState([  
        { id: 'NAO INICIADA', permission:'pedidos.ver_separacao_nao_iniciada', label:'Não iniciada', color:'#0023F5' },
        { id: 'EM ANDAMENTO', permission:'pedidos.ver_separacao_em_andamento', label:'Em andamento', color:'#43b1ff' }, 
        { id: 'PAUSADA',      permission:'pedidos.ver_separacao_pausada',      label:'Pausada',      color:'#46985e' },
        { id: 'RECUSADA' ,    permission:'pedidos.ver_separacao_recusada',     label:'Recusada',     color:'#F44336' },
        { id: 'CONCLUIDA',    permission:'pedidos.ver_separacao_concluida',    label:'Concluída',    color:'#1E9C43' },
    ])

    
         function switchStatusFilter(status:statusSeparation){
                        let isEnabledPermission = false;
                        if(verifyUserPermission('*', '', permissoes) ){
                             isEnabledPermission =true;
                        }else{
                            if( status == 'RECUSADA' && verifyUserPermission('pedidos', 'ver_separacao_recusada',permissoes )) isEnabledPermission =true;
                            if( status == 'CONCLUIDA' && verifyUserPermission('pedidos', 'ver_separacao_concluida', permissoes)) isEnabledPermission =true;
                            if( status == 'EM ANDAMENTO' && verifyUserPermission('pedidos', 'ver_separacao_em_andamento', permissoes)) isEnabledPermission =true;
                            if( status == 'NAO INICIADA' && verifyUserPermission('pedidos', 'ver_separacao_nao_iniciada', permissoes)) isEnabledPermission =true;
                            if( status == 'PAUSADA' && verifyUserPermission('pedidos', 'ver_separacao_pausada', permissoes)) isEnabledPermission =true;
                        }
                     return isEnabledPermission;
            }

 

    const handleSelectStatus = (newStatus: statusSeparation) => {
        const iSenabled = switchStatusFilter(newStatus)
        if(iSenabled){
            setSelectedFilter(newStatus);
        
        }else{
             setIsVisibleAlert(true);
             setTitleAlert('Atenção!');
             setMessageAlert(`Você não possui permissao para ver pedidos com status:\n [ ${statusSeparationOptions.find((i)=> i.id == newStatus)?.label} ]`);
              setTypeAlert('warning');
        }
    };


    return (
               <Modal visible={visible}   transparent={true} animationType="slide" onRequestClose={() => setVisible(false)}>
                <View style={{ flex: 1, height:'auto', backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: 'center', alignItems: 'center'  }}>
                    <CustomAlert
                                visible={isVisibleAlert}
                                message={messageAlert}
                                onConfirm={() => setIsVisibleAlert(false)}
                                title={titleAlert}
                                type={typeAlert}
                            />
                                    
                                 <View style={{  width:'90%',padding:10, marginTop: 8, backgroundColor: '#F5F7FA', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' }}>
                              
                                    <View style={{ marginBottom:5}}>
                                        <TouchableOpacity onPress={() => setVisible(false)}>
                                                <Ionicons name="close" size={24} color="#8d0a0a" />
                                        </TouchableOpacity>
                                        <Text style={{ color:'#555', fontWeight:"bold"}}> Status da Separação:</Text>
                                    </View>

                                  {  
                                   statusSeparationOptions.map((opt:any) => {
                                        const isSelected = selectedFilter &&  selectedFilter.some((i)=> i == opt.id)   ;
                                        return (
                                            <TouchableOpacity
                                                key={opt.id}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 15,
                                                    backgroundColor: isSelected ? '#E3F2FD' : '#FFF',
                                                    borderBottomWidth: opt.id !== statusSeparationOptions[statusSeparationOptions.length - 1].id ? 1 : 0,
                                                    borderBottomColor: '#E0E0E0',
                                                }}
                                                onPress={() => handleSelectStatus(opt.id)}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: opt.color }} />
                                                    <Text style={{ fontSize: 15, fontWeight: isSelected ? 'bold' : '500', color: isSelected ? '#185FED' : '#555' }}>
                                                        {opt.label}
                                                    </Text>
                                                </View>
                                                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#185FED" />}
                                            </TouchableOpacity>
                                        );
                                    }) 
                                     
                                   }
                            </View>
            </View>
        </Modal>
    );
};