import { Text, TouchableOpacity, View } from "react-native"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
   
   type props ={
   tipo:string,
   value:string,
   defaultConfig:string, 
    setDefaultConfig:(value:any)=>void 
}

   export  function  RenderConfigSeletor   ( {tipo, value,defaultConfig, setDefaultConfig }: props)  {
        return(
            <TouchableOpacity style={ [ { 
                  marginHorizontal: 16,  marginVertical: 8, padding: 16,elevation:5,borderRadius: 12,  shadowColor: '#000', 
                shadowRadius: 4,flexDirection: 'row',   justifyContent: 'space-between',  alignItems: 'center',    
             backgroundColor: '#FFF'}   ]}
                onPress={()=>{ setDefaultConfig(value)}}
            
            >
                
                    <Text style={  { fontWeight:"bold",color: '#185FED', fontSize:20}  }>
                         { tipo } 
                    </Text> 

                   {
                            defaultConfig === value ? (
                        <MaterialCommunityIcons name="toggle-switch" size={35} color="#185FED" />
                            ):(
                           <MaterialCommunityIcons  name="toggle-switch-off" size={35} color="#666b75ff" />
                            )
                        }

            </TouchableOpacity>
        )
    }
      