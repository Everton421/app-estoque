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
import { Fornecedores } from "../../screens/fornecedores";
import { Lista_requerimentos } from "../../screens/requerimentos";
import { NovoRequerimento } from "../../screens/novo_requerimento";
import { Cadastro_caracteristicas } from "../../screens/cadastro-caracteristicas";
import { Cadastro_Marcas } from "../../screens/cadastrarMarcas";
import { Cadastro_Categorias } from "../../screens/cadastrarCategorias";
import { BottomTabProdutos } from "../bottomTabsProduto";
import { Cadastro_cliente } from "../../screens/cadastro_cliente";
import { Cadastro_fornecedores } from "../../screens/cadastro_fornecedores";

const StackConfig = createStackNavigator();

const PedidosDeCompra= ({navigation}:any)=>{
        return <Lista_pedidos  navigation={navigation} tipo={6} />
}

     const PedidosDeVenda= ({navigation}:any)=>{
         return <Lista_pedidos  navigation={navigation} tipo={1} />      
        }   
     const ViewTabProdutos =({ navigation}: any )=>{
        return <BottomTabProdutos   />
     }       


export const  Stack=()=>{

    return (
            <StackConfig.Navigator>
                    <StackConfig.Screen name="Home" component={Home}    options={{headerShown:false}} />
                    <StackConfig.Screen name="produtos" component={ Produtos }  options={{headerShown:false}} />

                    <StackConfig.Screen name="cadastro_caracteristicas"   component={Cadastro_caracteristicas}  options={{ headerShown:false }} />

        
                    <StackConfig.Screen name="cadastro_cliente"          component={Cadastro_cliente}  options={{ headerShown:false }} />

                    <StackConfig.Screen name="cadastro_fornecedores"     component={Cadastro_fornecedores}  options={{ headerShown:false }} />

                    <StackConfig.Screen name="cadastro_marcas"           component={Cadastro_Marcas}  options={{ headerShown:false }} />

                    <StackConfig.Screen name="cadastro_categorias"       component={ Cadastro_Categorias } options={{ headerShown:false }}  />
                
                    <StackConfig.Screen name="ViewTabProdutos"           component={ViewTabProdutos} options={{headerShown:false}} />

                    <StackConfig.Screen name="setores" component={Setores}  options={ { headerShown:false} } />
                    <StackConfig.Screen name="usuarios" component={Usuarios}   options={ { headerShown:false} }  />
                    <StackConfig.Screen name="ajustes" component={Configurações}  options={{headerShown:false}} />
                    <StackConfig.Screen name="cadastro_produto" component={Cadastro_produto}  options={{ headerStyle:{ backgroundColor:'#185FED'}, headerTintColor:'#FFF', title:"voltar"}} />
                    <StackConfig.Screen name="cadastro_setores" component={Cadastro_Setores} options={ { headerShown:false} }/>
                    <StackConfig.Screen name="acertos" component={Acertos}  options={ { headerShown:false}} />
                    <StackConfig.Screen name="novo_acerto" component={NovoAcerto}  options={{ headerShown:false }} />
                    <StackConfig.Screen name="clientes"   component={Clientes} options={{headerShown:false}} />
                    <StackConfig.Screen name="fornecedores"   component={Fornecedores} options={{headerShown:false}} />
                    <StackConfig.Screen name="vendas"                component={PedidosDeVenda}  options={{headerShown:false}}  />
                    <StackConfig.Screen name="compras"    component={PedidosDeCompra}  options={{headerShown:false}}  />
                    
                    <StackConfig.Screen name="separacao"                component={Separacao}  options={{headerShown:false}}  />
                    <StackConfig.Screen name="requerimentos"                component={Lista_requerimentos}  options={{headerShown:false}}  />
                    <StackConfig.Screen name="novoRequerimento"                component={NovoRequerimento}  options={{headerShown:false}}  />

            </StackConfig.Navigator>
    )
}