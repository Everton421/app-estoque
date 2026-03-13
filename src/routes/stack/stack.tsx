import { createStackNavigator } from "@react-navigation/stack"
import { Produtos } from "../../screens/Produtos";
import { Setores } from "../../screens/setores";
import { Usuarios } from "../../screens/usuarios";
import { Home } from "../../screens/home";
import { Configurações } from "../../screens/configurações";
import { Cadastro_produto } from "../../screens/cadastro_produto";
import { Cadastro_Setores } from "../../screens/cadastrarSetores";
import { Acertos } from "../../screens/acerto";
import { NovoAcerto } from "../../screens/novo_acerto";
import { Clientes } from "../../screens/clientes";
import { Lista_pedidos } from "../../screens/pedidos";
import { Separacao } from "../../screens/separacao";

const StackConfig = createStackNavigator();

export const  Stack=()=>{

    return (
            <StackConfig.Navigator>
                    <StackConfig.Screen name="Home" component={Home}    options={{headerShown:false}} />
                    <StackConfig.Screen name="produtos" component={ Produtos }  options={{headerShown:false}} />
                    <StackConfig.Screen name="setores" component={Setores}  options={ { headerShown:false} } />
                    <StackConfig.Screen name="usuarios" component={Usuarios}   options={ { headerShown:false} }  />
                    <StackConfig.Screen name="ajustes" component={Configurações}  options={{headerShown:false}} />
                    <StackConfig.Screen name="cadastro_produto" component={Cadastro_produto}  options={{ headerStyle:{ backgroundColor:'#185FED'}, headerTintColor:'#FFF', title:"voltar"}} />
                    <StackConfig.Screen name="cadastro_setores" component={Cadastro_Setores}  options={{ headerStyle:{ backgroundColor:'#185FED'}, headerTintColor:'#FFF', title:"voltar"}} />
                    <StackConfig.Screen name="acertos" component={Acertos}  options={ { headerShown:false}} />
                    <StackConfig.Screen name="novo_acerto" component={NovoAcerto}  options={{ headerShown:false }} />
                    <StackConfig.Screen name="clientes"   component={Clientes} options={{headerShown:false}} />
                    <StackConfig.Screen name="vendas"                component={Lista_pedidos}  options={{headerShown:false}}  />
                    <StackConfig.Screen name="separacao"                component={Separacao}  options={{headerShown:false}}  />

            </StackConfig.Navigator>
    )
}