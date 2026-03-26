import 'react-native-gesture-handler';
import AuthProvider from './src/contexts/auth';
import { Routes } from './src/routes';
import { construtor } from './src/database/conexao';  
import * as SQLite  from 'expo-sqlite';
import ConnectedProvider, { ConnectedContext } from './src/contexts/conectedContext';
import { StatusBar } from 'expo-status-bar';
import {  SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import useApi from './src/services/api';

export default function App() {
 
  return (
    <> 
    <SafeAreaView style={{ flex:1 }} >

    <ConnectedProvider>
          <AuthProvider>
              <SQLite.SQLiteProvider databaseName="test.db" onInit={construtor }>
            
                 <StatusBar  style="dark" backgroundColor="#185FED"  />  
            
                <Routes/>
            
            </SQLite.SQLiteProvider>
          </AuthProvider>
    </ConnectedProvider>
      </SafeAreaView>
  </>
  );
}

 