import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Button, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
    visible: boolean;
    onClose: () => void;
    onBarcodeScanned: (data: string) => void;
    stripZeros?: boolean;
};

export const BarcodeScanner = ({ visible, onClose, onBarcodeScanned, stripZeros: stripZerosProp }: Props) => {
    const [mode, setMode] = useState<"camera" | "leitor">("camera");
    const [stripZerosGlobal, setStripZerosGlobal] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const inputRef = useRef<TextInput>(null);

    const shouldStrip = stripZerosProp !== undefined ? stripZerosProp : stripZerosGlobal;

    useEffect(() => {
        if (!visible || mode !== "leitor") return;
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
        return () => clearTimeout(timer);
    }, [visible, mode]);

    useEffect(() => {
        if (!visible) return;
        loadMode();
    }, [visible]);

    async function loadMode() {
        try {
            const value = await AsyncStorage.getItem("configLeitor");
            if (value === "leitor" || value === "camera") {
                setMode(value);
            } else {
                setMode("camera");
            }

            const stripZerosValue = await AsyncStorage.getItem("configRemoveLeadingZeros");
            setStripZerosGlobal(stripZerosValue !== "N");
        } catch {
            setMode("camera");
            setStripZerosGlobal(true);
        }
    }

    function handleBarcodeRead(data: string) {
        const cleanCode = shouldStrip ? data.replace(/^0+/, '') || "0" : data;
        onBarcodeScanned(cleanCode);
        onClose();
    }

    if (!visible) return null;

    // --- MODO CÂMERA ---
    if (mode === "camera") {
        if (!permission) return null;

        if (!permission.granted) {
            return (
                <Modal visible={visible} animationType="slide">
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontWeight: "bold", margin: 10, color: "#89898f", fontSize: 17 }}>
                            Você precisa liberar o acesso à câmera para continuar!
                        </Text>
                        <Button onPress={requestPermission} title="Liberar acesso" />
                        <Button onPress={onClose} title="Cancelar" />
                    </View>
                </Modal>
            );
        }

        return (
            <Modal visible={visible} animationType="slide">
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    onBarcodeScanned={({ data }) => {
                        if (data) handleBarcodeRead(data);
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                        <View style={{ width: 280, height: 280, borderWidth: 2, borderColor: "#FFF", borderRadius: 20 }} />
                        <Text style={{ color: "#FFF", marginTop: 20, fontWeight: "bold" }}>Posicione o código de barras na área</Text>

                        <TouchableOpacity
                            onPress={onClose}
                            style={{ position: "absolute", bottom: 50, backgroundColor: "#FFF", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
                        >
                            <Text style={{ color: "#000", fontWeight: "bold" }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </Modal>
        );
    }

    // --- MODO COLETOR DE DADOS ---
    return (
        <Modal visible={visible} animationType="slide">
            <View style={{ flex: 1, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center", padding: 20 }}>
                <TextInput
                    ref={inputRef}
                    style={{ height: 1, opacity: 0, width: 200 }}
                    autoFocus={true}
                    showSoftInputOnFocus={false}
                    onSubmitEditing={(e) => {
                        const code = e.nativeEvent.text;
                        if (code) handleBarcodeRead(code);
                    }}
                />

                <View style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 30, alignItems: "center", elevation: 5, width: "100%" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10, textAlign: "center" }}>
                        Coletor de Dados
                    </Text>
                    <Text style={{ fontSize: 14, color: "#666", textAlign: "center", marginBottom: 30 }}>
                        Posicione o cursor no campo de busca e escaneie o código de barras com o coletor.
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                            inputRef.current?.focus();
                        }}
                        style={{ backgroundColor: "#185FED", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginBottom: 15 }}
                    >
                        <Text style={{ color: "#FFF", fontWeight: "bold" }}>Focar no campo de leitura</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        style={{ paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, borderWidth: 1, borderColor: "#999" }}
                    >
                        <Text style={{ color: "#666", fontWeight: "bold" }}>Cancelar</Text>
                    </TouchableOpacity>
                </View>

                {__DEV__ && (
                    <View style={{ marginTop: 30, padding: 15, backgroundColor: "#eee", borderRadius: 8, width: "100%", alignItems: "center" }}>
                        <Text style={{ textAlign: "center", marginBottom: 10, color: "#666" }}>--- Modo de Teste ---</Text>
                        <Button
                            title="Simular Leitura"
                            onPress={() => handleBarcodeRead("0000123")}
                        />
                    </View>
                )}
            </View>
        </Modal>
    );
};
