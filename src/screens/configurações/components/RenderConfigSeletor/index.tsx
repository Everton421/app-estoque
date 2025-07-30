import { Text, TouchableOpacity, View } from "react-native"

   
   type props ={
   tipo:string,
   value:string,
   defaultConfig:string, 
    setDefaultConfig:(value:any)=>void 
}

   export  function  RenderConfigSeletor   ( {tipo, value,defaultConfig, setDefaultConfig }: props)  {
        return(
            <TouchableOpacity style={ [ { 
                  marginHorizontal: 16,  marginVertical: 8, padding: 16, borderRadius: 12, elevation: 4, shadowColor: '#000', 
                shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.1,
                shadowRadius: 4,flexDirection: 'row',   justifyContent: 'space-between',  alignItems: 'center',    
            },  {backgroundColor: defaultConfig === value ? '#185FED' : '#FFF'}   ]}
                onPress={()=>{ setDefaultConfig(value)}}
            
            >
                
                    <Text style={[ { fontWeight:"bold" }, { color: defaultConfig === value ?  '#FFF' : '#185FED' } ] }>
                         { tipo } 
                    </Text> 

            </TouchableOpacity>
        )
    }
      