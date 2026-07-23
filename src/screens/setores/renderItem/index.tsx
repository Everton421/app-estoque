import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { defaultColors } from "../../../styles/global";

type item = {
  codigo: number;
  descricao: string;
};

interface Props {
  item: item;
  handleSelect: (item: item) => void;
}

export const RenderItensSetores = ({ item, handleSelect }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.codigo}>Código: {item.codigo}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="store" size={24} color={defaultColors.darkBlue} />
        </View>
        <Text style={styles.descricao} numberOfLines={2} ellipsizeMode="tail">
          {item.descricao}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    elevation: 2,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  header: {
    marginBottom: 8,
  },
  codigo: {
    fontSize: 12, color: '#757575', flex: 1
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  iconContainer: {
    marginRight: 10,
  },
  descricao: { fontSize: 14, fontWeight: '600', color: '#333', marginVertical: 4 },
});
