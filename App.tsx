import 'react-native-gesture-handler';
import AuthProvider from './src/contexts/auth';
import { Routes } from './src/routes';
import { construtor } from './src/database/conexao';  
import * as SQLite  from 'expo-sqlite';
import ConnectedProvider from './src/contexts/conectedContext';
import { StatusBar } from 'expo-status-bar';
import { OfflineBanner } from './src/components/oflline-banner/oflline-banner';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

  return (
    <> 
    <SafeAreaView style={{ flex:1 }} >
    <ConnectedProvider>
          <AuthProvider>
              <SQLite.SQLiteProvider databaseName="test.db" onInit={construtor }>
              <StatusBar  style='auto' backgroundColor='#185FED'         />
                <Routes/>
            </SQLite.SQLiteProvider>
          </AuthProvider>
    </ConnectedProvider>
      </SafeAreaView>
  </>
  );
}

 