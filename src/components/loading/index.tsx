import {View, ActivityIndicator, Modal, StyleSheet, Text } from "react-native";


type props = { 
  isLoading: boolean,
  message?: string
}

export const LodingComponent = ({ isLoading, message }:props) => (
  <Modal animationType='fade' transparent={true} visible={isLoading}>
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#185FED" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '500'
  }
});
  