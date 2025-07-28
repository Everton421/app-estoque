import 'react-native-gesture-handler';
import AuthProvider from './src/contexts/auth';
import { Routes } from './src/routes';
import { construtor } from './src/database/conexao';  
import * as SQLite  from 'expo-sqlite';
import ConnectedProvider from './src/contexts/conectedContext';
import { StatusBar } from 'react-native';

export default function App() {

  return (
    <ConnectedProvider>
          <AuthProvider>
              <SQLite.SQLiteProvider databaseName="test.db" onInit={construtor }>
            <StatusBar backgroundColor={'#185FED'  }     />
                <Routes/>
            </SQLite.SQLiteProvider>
          </AuthProvider>
    </ConnectedProvider>
 
  );
}

 