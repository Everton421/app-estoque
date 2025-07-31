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
          <TouchableOpacity style={{ backgroundColor:'#FFF',margin:4, borderWidth:1, borderColor:'#CCC',borderRadius:5,padding:5, elevation:5  }} onPress={()=>{ selectSetor(setor)}}> 
            <Text style={{fontWeight:'bold' ,textAlign: 'left',fontSize:15}}> Cód({setor.codigo})    {setor.descricao} </Text>
          </TouchableOpacity> 
    )
}