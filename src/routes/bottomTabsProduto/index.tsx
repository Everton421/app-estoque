import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Produtos } from "../../screens/Produtos";

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Setores } from "../../screens/setores";

const BottomProduto = createBottomTabNavigator()

export const BottomTabProdutos= ()=>{
    return(
         <BottomProduto.Navigator >   
            <BottomProduto.Screen 
             name="Produtos"
              component={Produtos} 
               options={{
                tabBarStyle:{ backgroundColor:'#185FED' , height:55 },
                tabBarActiveBackgroundColor: '#00129A',
                tabBarActiveTintColor:'red',
                tabBarLabelStyle:{ color:"#FFF", fontSize:13  },
                tabBarIcon:()=> <FontAwesome name="home" size={24} color="#FFF" />,
                headerShown:false,
              }}
              
            />
            {/**
            <BottomProduto.Screen 
             name="categorias"
              component={Categoria}
              options={{
                tabBarStyle:{ backgroundColor:'#185FED' , height:55 },
                tabBarActiveBackgroundColor: '#00129A',
                tabBarLabelStyle:{ color:"#FFF", fontSize:13},
                tabBarIcon:()=> <MaterialIcons name="category" size={24} color="#FFF" /> ,
                headerShown:false,


              }} />*/}

      <BottomProduto.Screen 
             name="setores"
              component={Setores}
              options={{
                tabBarStyle:{ backgroundColor:'#185FED' , height:55 },
                tabBarActiveBackgroundColor: '#00129A',
                tabBarLabelStyle:{ color:"#FFF", fontSize:13},
                tabBarIcon:()=> <FontAwesome name="bookmark" size={24} color="#FFF" /> ,
                headerShown:false,

              }} />
 
              {/* <FontAwesome name="bookmark" size={24} color="black" />*/}
           
         </BottomProduto.Navigator>
    )
}