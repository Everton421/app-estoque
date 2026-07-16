import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

const COLORS = {
    primary: '#185FED',
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    gray: '#DEE2E6',
    darkGray: '#6C757D',
    text: '#212529',
    background: 'rgba(0, 0, 0, 0.6)',
};

const SIZES = {
    padding: 16,
    borderRadius: 12,
    base: 8,
};

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const getSituationData = (situacao: string) => {
    switch (situacao) {
        case 'A': return { color: '#1E9C43', label: 'Em Aberto' };
        case 'E': return { color: '#307CEB', label: 'Efetuado' };
        case 'C': return { color: '#9C0404', label: 'Cancelado' };
        default: return { color: '#999999', label: 'Desconhecido' };
    }
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const LoteSerieItem = ({ item }) => (
    <View style={styles.loteCard}>
        <Text style={styles.loteText}>Lote/Série: {item.lote_serie}</Text>
        <Text style={styles.loteText}>Qtd: {item.quantidade}</Text>
    </View>
);

const ItemProduto = ({ item }) => (
    <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>Produto #{item.produto}</Text>
            <Text style={styles.cardQtd}>Qtd: {item.quantidade}</Text>
        </View>
        {item.custo != null && (
            <Text style={styles.cardSubtitle}>Custo: R$ {Number(item.custo).toFixed(2)}</Text>
        )}
        {item.lotes_series && item.lotes_series.length > 0 && (
            <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: COLORS.darkGray, marginBottom: 4, fontWeight: 'bold' }}>
                    Lotes/Séries:
                </Text>
                {item.lotes_series.map((ls, idx) => (
                    <LoteSerieItem key={idx} item={ls} />
                ))}
            </View>
        )}
    </View>
);

const buildHtml = (requirement) => {
    const sit = getSituationData(requirement.situacao);
    const itemsHtml = requirement.itens.map(item => {
        const lotesHtml = item.lotes_series?.map(ls =>
            `<tr><td style="padding:4px 8px;border:1px solid #ddd;">Lote: ${ls.lote_serie}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${ls.quantidade}</td></tr>`
        ).join('') || '';
        return `
            <tr>
                <td style="padding:8px;border:1px solid #ddd;">${item.produto}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.quantidade}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.custo ? 'R$ ' + Number(item.custo).toFixed(2) : '-'}</td>
            </tr>
            ${lotesHtml ? `<tr><td colspan="3" style="padding:4px 8px;background:#f5f5f5;">${lotesHtml}</td></tr>` : ''}
        `;
    }).join('');

    return `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
                body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
                h1 { font-size: 24px; margin-bottom: 4px; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th { background: #185FED; color: #fff; padding: 8px; text-align: left; }
                td { padding: 8px; border: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <h1>Requerimento #${requirement.codigo}</h1>
            <p><span class="badge" style="background:${sit.color}20;color:${sit.color}">${sit.label}</span></p>
            <hr/>
            <p><strong>Data:</strong> ${formatDate(requirement.data_requerimento)}</p>
            <p><strong>Requerente:</strong> ${requirement.requerente}</p>
            <p><strong>Responsável:</strong> ${requirement.responsavel}</p>
            <p><strong>Setor Origem:</strong> ${requirement.setor_origem} | <strong>Destino:</strong> ${requirement.setor_destino}</p>
            ${requirement.data_efetuacao ? `<p><strong>Efetuado em:</strong> ${formatDate(requirement.data_efetuacao)}</p>` : ''}
            ${requirement.historico ? `<p><strong>Histórico:</strong> ${requirement.historico}</p>` : ''}
            <table>
                <tr><th>Produto</th><th>Qtd</th><th>Custo</th></tr>
                ${itemsHtml}
            </table>
        </body>
        </html>
    `;
};

export const ModalPrintRequirement = ({ visible, requirement, setVisible }: any ) => {

    if (!requirement) return null;

    const sit = getSituationData(requirement.situacao);

    const print = async () => {
        const html = buildHtml(requirement);
        await Print.printAsync({ html });
    };

    const printToFile = async () => {
        const html = buildHtml(requirement);
        const { uri } = await Print.printToFileAsync({ html });
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={() => setVisible(false)}
        >
            <SafeAreaView style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity
                                        style={{ width: 20, height: 20,   justifyContent: "center", alignItems: "center",  }}
                                        onPress={() => setVisible(false)} 
                                    >
                                        <FontAwesome name="remove" size={20} color="#b10909" />
                                    </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                             <Text style={styles.headerTitle} numberOfLines={1}>
                                    Requerimento #{requirement.codigo}
                                </Text>
                            <InfoRow label="Data Requerimento:" value={formatDate(requirement.data_requerimento)} />
                            <InfoRow label="Requerente:" value={String(requirement.requerente)} />
                            <InfoRow label="Responsável:" value={String(requirement.responsavel)} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Setores:</Text>
                                <Text style={styles.infoValue}>
                                    {requirement.setor_origem} {'→'} {requirement.setor_destino}
                                </Text>
                            </View>
                            {requirement.data_efetuacao ? (
                                <InfoRow label="Data Efetuação:" value={formatDate(requirement.data_efetuacao)} />
                            ) : null}
                            {requirement.historico ? (
                                <View style={{ marginTop: 4 }}>
                                    <Text style={{ fontSize: 13, color: COLORS.darkGray, marginBottom: 2 }}>Histórico:</Text>
                                    <Text style={{ fontSize: 14, color: COLORS.text }}>{requirement.historico}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.section}>
                            <SectionHeader title={`ITENS (${requirement.itens.length})`} />
                            {requirement.itens.map((item, idx) => (
                                <ItemProduto key={idx} item={item} />
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.printFooter}>
                        <TouchableOpacity onPress={print} style={styles.printButton}>
                            <Feather name="printer" size={18} color="#FFF" />
                            <Text style={styles.printButtonText}>Imprimir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={printToFile} style={[styles.printButton, { backgroundColor: COLORS.darkGray }]}>
                            <Feather name="file-text" size={18} color="#FFF" />
                            <Text style={styles.printButtonText}>Exportar PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '95%',
        height: '90%',
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.padding,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        paddingBottom: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        padding: SIZES.base / 2,
    },
    section: {
        marginVertical: SIZES.base,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: SIZES.base,
        marginTop: SIZES.base,
        paddingBottom: SIZES.base / 2,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.base / 2,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.darkGray,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: 'bold',
        textAlign: 'right',
        flex: 1,
        marginLeft: SIZES.base,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.borderRadius / 1.5,
        padding: SIZES.padding / 1.5,
        marginBottom: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.gray,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    cardQtd: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 4,
    },
    loteCard: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 6,
        padding: 8,
        marginBottom: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    loteText: {
        fontSize: 13,
        color: COLORS.text,
    },
    printFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        paddingTop: SIZES.base,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray,
    },
    printButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    printButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 13,
    },
});
