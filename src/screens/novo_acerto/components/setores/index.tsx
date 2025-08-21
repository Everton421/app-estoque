import { Text, TouchableOpacity } from "react-native"

type setor = {
     codigo: number,
     data_cadastro: string,
     data_recadastro: string,
     descricao: string
} 
type props={
    setor:setor,
     selectSetor:any
}
export const Setores = ({ setor,selectSetor }:props )=>{
    return(
          <TouchableOpacity style={{ backgroundColor:'#FFF',margin:5, borderWidth:1, borderColor:'#CCC',borderRadius:5,padding:5, elevation:7  }} onPress={()=>{ selectSetor(setor)}}> 

                    <Text style={{ left:3 ,fontWeight:'bold', color:'#185FED'}}>
                      Cód({setor.codigo}) 
                    </Text>
                   <Text style={{ flex:1,fontWeight:'bold' ,textAlign: 'left',fontSize:15}}>{setor.descricao} </Text>


                    <Text style={{ left:3 ,fontWeight:'bold', color:'#474b4dff'}}>
                                      Cadastrado: {new Date(setor.data_cadastro).toLocaleString('pt-br', { day:'numeric',month:'short',year:'numeric' })} 
                                    </Text>
            
          </TouchableOpacity> 
    )
}
 