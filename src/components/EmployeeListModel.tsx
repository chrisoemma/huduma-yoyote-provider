import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { transformDataToDropdownOptions } from '../utils/utilts';
import { colors } from '../utils/colors';

const EmployeeListModal = ({ isVisible, onClose, employees,transferFunc }:any) => {

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(transformDataToDropdownOptions(employees));

    const { t } = useTranslation();

  

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('screens:employeeToTransfer')}</Text>
                    <View style={styles.marginDropdown}>
                        <DropDownPicker
                            searchable={true}
                            zIndex={6000}
                            placeholder={t('screens:selectEmployee')}
                            listMode="SCROLLVIEW"
                            open={open}
                            value={value}
                            items={items}
                            //  onChangeValue={onChangeValue}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                        />
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                   
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeButton}>{t('screens:close')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => transferFunc(value)}
                      style={{backgroundColor:colors.primary,borderRadius:8,justifyContent:'center'}}
                    >
                        <Text style={{color:colors.white,padding:5}}>{t('screens:transfer')}</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </View>
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

export default EmployeeListModal;
