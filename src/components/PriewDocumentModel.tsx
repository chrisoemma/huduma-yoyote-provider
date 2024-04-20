import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import Pdf from 'react-native-pdf';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '../styles/global';

const PreviewDocumentModel = ({ isVisible, onClose, previewType, previewSource }) => {
    const { t } = useTranslation();
    const stylesGlobal = globalStyles();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{t('screens:previewFile')}</Text>
                            <View style={styles.marginDropdown}>
                                {previewType === 'image/jpeg' && (
                                    <Image
                                        source={{ uri: previewSource }}
                                        style={{ width: '100%', height: '80%' }}
                                    />
                                )}
                                {previewType === 'application/pdf' && (
                                    <Pdf source={{ uri: previewSource }} style={stylesGlobal.pdf} maxScale={3} />
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={onClose}>
                                    <Text style={styles.closeButton}>{t('screens:close')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    marginDropdown: { marginBottom: 20 },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    employeeName: {
        fontSize: 16,
        marginBottom: 10,
        color: 'blue', // Customize the color as needed
    },
    closeButton: {
        fontSize: 16,
        color: 'red', // Customize the color as needed
        marginTop: 20,
    },
});

export default PreviewDocumentModel;
