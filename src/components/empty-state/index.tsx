import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type EmptyStateProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  message: string;
};

export function EmptyState({ icon = "search-off", message }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 }}>
      <MaterialIcons name={icon} size={64} color="#CCC" />
      <Text style={{ fontWeight: "bold", fontSize: 18, color: "#999", marginTop: 12 }}>
        {message}
      </Text>
    </View>
  );
}
