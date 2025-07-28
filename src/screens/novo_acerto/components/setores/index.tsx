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
          <TouchableOpacity style={{ backgroundColor:'#185FED',margin:4, borderRadius:5,padding:5  }} onPress={()=>{ selectSetor(setor)}}> 
            <Text style={{fontWeight:'bold',color:'#FFF',textAlign: 'left',fontSize:15}}> Cód({setor.codigo})  /  {setor.descricao} </Text>
          </TouchableOpacity> 
    )
}