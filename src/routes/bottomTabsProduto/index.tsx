import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Produtos } from "../../screens/Produtos";

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Setores } from "../../screens/setores";
import { Categoria } from "../../screens/categorias";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Marcas } from "../../screens/marcas";
import { Caracteristicas } from "../../screens/caracteristicas";

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
                tabBarIcon:()=>  <FontAwesome name="cubes" size={22} color="#FFF" />
                
                ,
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
             name="categorias"
              component={Categoria}
              options={{
                tabBarStyle:{ backgroundColor:'#185FED' , height:55 },
                tabBarActiveBackgroundColor: '#00129A',
                tabBarLabelStyle:{ color:"#FFF", fontSize:13},
                tabBarIcon:()=> <MaterialIcons name="category" size={24} color="#FFF" /> ,
                headerShown:false,


              }} />

      <BottomProduto.Screen 
             name="marcas"
              component={Marcas}
              options={{
                tabBarStyle:{ backgroundColor:'#185FED' , height:55 },
                tabBarActiveBackgroundColor: '#00129A',
                tabBarLabelStyle:{ color:"#FFF", fontSize:13},
                tabBarIcon:()=> <FontAwesome name="bookmark" size={24} color="#FFF" /> ,
                headerShown:false,

              }} />

              {
                /*
                <BottomProduto.Screen
                  name="caracteristicas"
                  component={Caracteristicas}
                  options={{
                    tabBarStyle:{ backgroundColor:'#185FED' , height:55 },
                    tabBarActiveBackgroundColor: '#00129A',
                    tabBarLabelStyle:{ color:"#FFF", fontSize:13},
                    tabBarIcon:()=> <Ionicons name="options" size={24} color="#FFF" />,
                    headerShown:false,
                }}
                />*/
                
              }

           
         </BottomProduto.Navigator>
    )
}