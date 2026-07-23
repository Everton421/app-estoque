import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface FabProps {
  onPress: () => void;
}

export const Fab = ({ onPress }: FabProps) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <MaterialIcons name="add" size={32} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#185FED",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 999,
  },
});
