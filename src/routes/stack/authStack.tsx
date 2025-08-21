import { createStackNavigator } from "@react-navigation/stack"
import { Inicio } from "../../screens/inicio";
import { Login } from "../../screens/login";
import { Enviar_codigo  } from "../../screens/enviar_codigo";
import { Resgistrar_empresa } from "../../screens/registrar_empresa";
import { Alterar_senha } from "../../screens/alterar_senha";


const StackConfig = createStackNavigator();

export const AuthStack=()=>{


    return (

            <StackConfig.Navigator>
                    <StackConfig.Screen name="inicio" component={ Inicio }  options={{headerShown:false}} />
                    <StackConfig.Screen name="registrar_empresa" component={Resgistrar_empresa}  options={ { headerShown:false} } />
                    <StackConfig.Screen name="login" component={Login}  options={ { headerShown:false} } />
                    <StackConfig.Screen name="enviar_codigo" component={Enviar_codigo}  options={{ headerStyle:{ backgroundColor:'#185FED'}, headerTintColor:'#FFF', title:"voltar"}} />
                    <StackConfig.Screen name="alterar_senha" component={Alterar_senha}  options={{ headerStyle:{ backgroundColor:'#185FED'}, headerTintColor:'#FFF', title:"voltar"}} />

            </StackConfig.Navigator>
    )
}