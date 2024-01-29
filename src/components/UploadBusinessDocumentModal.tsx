import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, TextInput,ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { convertBusinessesToLabelsAndValues, convertRegDoc, transformDataToDropdownOptions } from '../utils/utilts';
import { colors } from '../utils/colors';
import { BasicView } from './BasicView';
import { globalStyles } from '../styles/global';
import { Controller, useForm } from 'react-hook-form'
import { TextInputField } from './TextInputField';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker, { types } from 'react-native-document-picker';
import { firebase } from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';


const UploadBusinessDocumentModal = ({ isVisible, onClose, businesses, regDocs,handleDocumentUpload,uploadingDoc,onSuccess, resetModalState}: any) => {

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(convertBusinessesToLabelsAndValues(businesses));
    const [registrationDocs,setRegDocs]=useState(convertRegDoc(regDocs))
    const [uploadedDocument, setUploadedDocument] = useState(null);
    const [doc, setDoc] = useState(null);
    const [text, onChangeText] = React.useState('');
    const [selectedDocType, setSelectedDocType] = useState('');
    const [openType, setOpenType] = useState(false);
    const [valueType, setValueType] = useState(null);
    const [resetModal, setResetModal] = resetModalState;

    const [doctypes, setDocTypes] = useState([
    {label:"Registration & Licenses docs",value:1},
    {label:"Business docs",value:2}
    ]);

    
    const stylesGlobal=globalStyles();
      

    const resetModalFunction = () => {
        // Reset modal logic
        setOpen(false);
        setValue(null);
        setItems(convertBusinessesToLabelsAndValues(businesses));
        setRegDocs(convertRegDoc(regDocs));
        setUploadedDocument(null);
        setDoc(null);
        onChangeText('');
        setSelectedDocType('');
        setOpenType(false);
        setValueType(null);
      };


      useEffect(() => {
        if (resetModal) {
          resetModalFunction();
          setResetModal(false);
        }
      }, [resetModal, setResetModal]);

    const { t } = useTranslation();

    const selectDoc = async () => {

        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
            });
            setDoc(res);

        } catch (error) {
            if (DocumentPicker.isCancel(error)) {
                setDoc(null);

            } else {
                // For Unknown Error
                alert("Unknown Error: " + JSON.stringify(error));
                throw error;
            }
        }
    };

      let textData=''
     if(valueType==1){
        textData='screens:selectRegistrationDoc'
        
     }else if(valueType==2){
        textData='screens:selectBusinesses'
     }
    //

  //console.log('doc type',doc[0])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('screens:selectDocType')}</Text>
                    <View style={styles.marginDropdown}>
                        <DropDownPicker
                            searchable={true}
                            zIndex={7000}
                            placeholder={t('screens:selectDocType')}
                            listMode="SCROLLVIEW"
                            open={openType}
                            value={valueType}
                            items={doctypes}
                            setOpen={setOpenType}
                            setValue={setValueType}
                            setItems={setDocTypes}
                        />
                    </View>
                       
                     {valueType?( 
                        <>
                    <Text style={styles.modalTitle}> {t(textData)}</Text>
                    <View style={styles.marginDropdown}>
                        <DropDownPicker
                            searchable={true}
                            zIndex={6000}
                            placeholder={t(textData)}
                            listMode="SCROLLVIEW"
                            open={open}
                            value={value}
                            items={valueType==1?registrationDocs:items}
                            //  onChangeValue={onChangeValue}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                        />
                    </View>
                    </>
                     ):<View />}
                    <BasicView style={[stylesGlobal.marginTop20, { marginHorizontal: 10 }]}>
                        <Text
                            style={[stylesGlobal.inputFieldTitle, { color: 'black' }]}>
                            {t('screens:documentName')}
                        </Text>

                        <TextInput
                            style={styles.input}
                            onChangeText={onChangeText}
                            value={text}
                            placeholder={t('screens:enterDocumentName')}
                        />

                        {/* {errors.doc_type && (
                            <Text style={stylesGlobal.errorMessage}>
                                {t('screens:documentNameRequired')}
                            </Text>
                        )} */}
                    </BasicView>
                    <BasicView style={{ marginVertical: 30 }}>
                        <TouchableOpacity
                            style={styles.uploadArea}
                            onPress={selectDoc}
                        >

                            {uploadedDocument ? (
                                <Text style={styles.uploadedFileName}>
                                    {uploadedDocument?.name}
                                </Text>
                            ) : (
                                <>
                                    <Icon
                                        name="cloud-upload-outline"
                                        size={48}
                                        color="#888"
                                    />
                                    <Text style={styles.uploadText}>{t('screens:uploadDocument')}</Text>
                                </>
                            )}
                            <View style={styles.dottedLine}></View>
                        </TouchableOpacity>

                    </BasicView>
                    <BasicView>
                        {doc == null ? (<View></View>) : (
                            <View style={stylesGlobal.displayDoc}>

                                  
                                  {
                                    doc[0]?.type == "application/pdf" ? (
                                        <Pdf 
                                            source={{ uri: doc[0]?.uri }}
                                            style={{ marginTop: 40, height: 100, width: 120 }}
                                            maxScale={3}
                                        />
                                    ) : (
                                        <Image 
                                        source={{ uri: doc[0]?.uri }}
                                        style={{ marginTop: 40, height: 100, width: 120 }}
                                        />
                                    )
                                }  
                            </View>)}

                    </BasicView>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                        <TouchableOpacity onPress={onClose}
                          disabled={uploadingDoc}
                        >
                            <Text style={styles.closeButton}>{t('screens:close')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDocumentUpload(value, doc,text,valueType)}
                            style={{ backgroundColor: colors.primary,
                                 borderRadius: 8, 
                                 justifyContent: 'center',
                                 opacity: uploadingDoc ? 0.5 : 1,
                                 
                                 }}
                                 disabled={uploadingDoc}
                        >
                             {uploadingDoc ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={{ color: colors.white, padding: 5 }}>{t('screens:upload')}</Text>
              )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    marginDropdown: { marginBottom: 20 },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
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
        width: '95%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    uploadArea: {
        alignSelf: 'center',
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#888',
    },
    uploadedFileName: {
        fontSize: 16,
        fontWeight: 'bold',
        color:colors.alsoGrey,
        textAlign: 'center',
        marginBottom: 5,
    },
    uploadText: {
        fontSize: 16,
        color:colors.alsoGrey,
        textAlign: 'center',
    },
    dottedLine: {
        borderStyle: 'dotted',
        borderWidth: 1,
        borderColor: '#888',
        width: '60%',
        marginTop: 10,
    },
    employeeName: {
        fontSize: 16,
        marginBottom: 10,
        color: 'blue',
    },
    closeButton: {
        fontSize: 16,
        color: 'red',
        marginTop: 20,
    },
});

export default UploadBusinessDocumentModal;
