import { useEffect, useState } from "react"
import { Button, Text, View } from "react-native"
import { LoadingDataComponent } from "../../components/loadingData"

export const CarregarDados = ({navigation}:any)=>{

        const [ visible, setVisible ] = useState(false)
  const [ carregarDados, setCarregarDados ] = useState(false);  
  const [ nameitemSync, setNameItemSync ] = useState('teste');
  const [ progressItem, setProgressItem ] = useState(95);


        useEffect(()=>{
                async function carregarDados(){
                        }

                    try{
                        setCarregarDados(true)
                        carregarDados()
                    }catch(e){
                        console.log("Erro",e)
                    }finally{
                    navigation.navigate('Home')
                    setCarregarDados(false)
                    }
        },[])


    return(
        <View style={{ flex:1}}>
            <LoadingDataComponent isLoading={carregarDados} item={nameitemSync} progress={progressItem}/>
        </View>
    )
}