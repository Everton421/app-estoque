import { Component } from "react";
import { ActivityIndicator, Animated, Image, Modal, StyleSheet, Text, View } from "react-native";
 
type props = 
{
    isLoading:boolean,
    item:string,
    progress:number
}

export const InitialLoadingData = ({ isLoading, item, progress }:props) => (
  <Modal animationType='slide' transparent={true} visible={isLoading}>
    <View style={styles.loadingContainer}>
      {/* <ActivityIndicator size="large" color="#FFF" /> */}

        <Image
                              style={{ width: 95, height: 95, resizeMode: 'stretch' }}
                              source={require('../../imgs/intersig120x120.png')}
                          />

      <Text style={styles.loadingText}>Sincronizando {item}...</Text>
      <Text style={styles.loadingText}>{progress}%</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  </Modal>
);
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(  0, 0 , 0 ,  0.6 )', // Cor de fundo com opacidade
  },
   loadingText: {
     fontSize: 18,
     marginBottom: 10,
     color:'#FFF',
     width:'100%',
     textAlign:'center',
     fontWeight:'bold'
  },
    progressBarContainer: { height: 10, width: '80%', backgroundColor: '#FFF', borderRadius: 5, overflow: 'hidden' },
  progressBar: {
    height: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    width: '90%', // Garantir que a barra de progresso tenha uma largura inicial
 
  },
})