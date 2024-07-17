import {
  View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
  Modal,
  Button,
  Image,
  Alert,
} from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { globalStyles } from '../../styles/global'
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';


import { createDocument, deleteDocument, getDocuments, getRegDocs } from '../business/BusinessSlice';
import { useAppDispatch } from '../../app/store';
import { useSelector, RootStateOrAny } from 'react-redux';
import { breakTextIntoLines,getStatusBackgroundColor } from '../../utils/utilts';
import PreviewDocumentModel from '../../components/PriewDocumentModel';
import { firebase } from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import UploadBusinessDocument from '../../components/UploadBusinessDocument';
import { getProviderDocumentToRegister } from '../serviceproviders/ServiceProviderSlice';

const Documents = () => {

  const { t } = useTranslation();
  

  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [message, setMessage] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['25%', '95%'], []);

  const [docId, setDocId] = useState(null);


 


  const togglePreviewModal = () => {
    if (!isModalVisible) {
      setDocId(null);
    }
    setModalVisible(!isModalVisible);
  };

  const handlePresentModalPress = useCallback(() => {
    console.log('clickedddd')
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);


  const stylesGlobal = globalStyles();


  const handleDocumentPreview = (docType, docUrl) => {
    setPreviewType(docType);
    setPreviewSource(docUrl);
    setModalVisible(true);
    togglePreviewModal();
  };

  // Function to handle document upload

  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  

  const { documents, businesses, regDocs } = useSelector(
    (state: RootStateOrAny) => state.businesses,
  );


  const { documentForRegister,documentForBusiness } = useSelector(
    (state: RootStateOrAny) => state.providers,
  );


  const getPathForFirebaseStorage = async (uri: any) => {

    const destPath = `${RNFS.TemporaryDirectoryPath}/text`;
    await RNFS.copyFile(uri, destPath);

    return (await RNFS.stat(destPath)).path;
  };


  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 10000);
  };



  const [toastMessage, setToastMessage] = useState(''); 
  const [showToast, setShowToast] = useState(false);

  const toggleToast = () => {
    setShowToast(!showToast);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    toggleToast();
    setTimeout(() => {
      toggleToast(); 
    }, 5000); 
  };


  const dispatch = useAppDispatch();
  if (user.provider) {
    useEffect(() => {
      //dispatch(getRegDocs());
      dispatch(getProviderDocumentToRegister(user.provider.id));
      dispatch(getDocuments({ providerId: user.provider.id }));
    }, [dispatch])

  }

 /// console.log('documents1234', documents);


  


  const makeid = (length: any) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  // useEffect(() => {
  //   if (status !== '') {
  //     setMessage(status);
  //   }
  // }, [status]);


  const data = {
    doc_url: '',
    document_type: '',
   // business: '',
    provider_id: '',
    doc_format: '',
    working_document_id: ''
  }



  const removeDocument = (id,status) =>{
 
    if (status ==='Approved') {
      Alert.alert(t('screens:deleteNotAllowed'), t('screens:approvedDocumentCannotBeDeleted'), [
        { text: t('screens:ok'), onPress: () => console.log('Approved document delete prevented') }
      ]);
      return;
    }
 
 
 
    Alert.alert(`${t('screens:deleteDocument')}`, `${t('screens:areYouWantToDelete')}`, [
    {
      text: `${t('screens:cancel')}`,
      onPress: () => console.log('Cancel task delete'),
      style: 'cancel',
    },
    {
      text: `${t('screens:ok')}`,
      onPress: () => {
     
        dispatch(deleteDocument({ documentId: id }))
          .unwrap()
          .then(result => {
            if (result.status) {
              ToastAndroid.show(`${t('screens:deletedSuccessfully')}`, ToastAndroid.SHORT);
     
            } else {
              setDisappearMessage(
                `${t('screens:requestFail')}`,
              );
           
            }

          
          })
          .catch(rejectedValueOrSerializedError => {
            // handle error here
            console.log('error');
            console.log(rejectedValueOrSerializedError);
          });
      },
    },
  ]);
}


  const handleDocumentUpload = async (value, doc, text, valueType) => {
   
    data.provider_id = user.provider.id,
      data.doc_format = text;
    if (valueType == 1) {
      data.working_document_id = value
    } else if (valueType == 2) {
     // data.business = value;
     data.working_document_id=value
    }

    const existingDocument = documents.find(doc => doc.working_document_id === data.working_document_id);


    if (existingDocument) {
      setShowToast(true)
      showToastMessage(t('screens:documentAlreadyUploaded'))
      return; 
  }


    if (doc !== null && value !==null) {
      setShowToast(false)
      data.document_type = doc[0].type;
    
      const fileExtension = doc[0].type.split("/").pop();
      var uuid = makeid(10)
      const fileName = `${uuid}.${fileExtension}`;
      var storageRef = firebase.storage().ref(`businesses/docs/${fileName}`);

      const fileUri = await getPathForFirebaseStorage(doc[0].uri);
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,

          {
            title: "Read Permission",
            message: "Your app needs permission.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setUploadingDoc(true);
          storageRef.putFile(fileUri).on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot: any) => {
              console.log("snapshost: " + snapshot.state);
              if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
              }
            },
            (error) => {
              unsubscribe();
            },
            () => {
              storageRef.getDownloadURL().then((downloadUrl: any) => {
                data.doc_url = downloadUrl;
                setUploadingDoc(false);
                //    console.log('on submit data', data);
                dispatch(createDocument({ data: data, providerId: user.provider.id }))
                  .unwrap()
                  .then(result => {
                    console.log('resultsss', result);
                    if (result.status) {
                      console.log('excuted this true block')
                      ToastAndroid.show(`${t('screens:uploadedDocSuccessfully')}`, ToastAndroid.SHORT);

                      toggleBusinessListModal();
                      setResetModal(true)
                      onSuccess();

                    } else {
                        
                        setDisappearMessage(`${t('screens:unAbletoProcessRequest')}`);
                        setShowToast(true)
                        showToastMessage(t('screens:unAbletoProcessRequest'))
                    }

                    console.log('result');
                    console.log(result);
                  })
                  .catch(rejectedValueOrSerializedError => {
                    // handle error here
                    console.log('error');
                    console.log(rejectedValueOrSerializedError);
                  });
              });
            }
          );
        } else {
          return false;
        }
      } catch (error) {
        console.warn(error);
        return false;
      }
    }else{
      setShowToast(true)
      showToastMessage(t('screens:documentUploadError'))
    }
  };

  const [isBusinessListVisible, setBusinessListVisible] = useState(false);
  const toggleBusinessListModal = () => {
    if (!isBusinessListVisible) {
      setSelectedBusiness(null);
    }
    setBusinessListVisible(!isBusinessListVisible);
  };

  const onSuccess = () => {
    setBusinessListVisible(false);
    setSelectedBusiness(null);
  };

  const getStatusTranslation = (status: string) => {
    return t(`screens:${status}`);
  };

  return (
    
    <>
    <GestureHandlerRootView>
      <SafeAreaView
        style={stylesGlobal.scrollBg}
      >
        <ScrollView style={stylesGlobal.appView}>

          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handlePresentModalPress}
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
                  color="#3238a8"
                />
                <Text style={styles.uploadText}>{t('screens:uploadDocument')}</Text>
              </>
            )}
            <View style={styles.dottedLine}></View>
          </TouchableOpacity>
          <View style={styles.listView}>
  <Text style={{
    color: isDarkMode ? colors.white : colors.black,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingBottom: 10
  }}>{t('screens:uploadedDocuments')}</Text>
  {
    documents?.map(document => (
      <View style={styles.documentItem}
        key={document?.id}
      >
        <Icon
          name="folder"
          size={25}
          color={colors.secondary}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={{ color: isDarkMode ? colors.white : colors.black }}>
            {breakTextIntoLines(document?.doc_format, 30)}{' '} ({document?.working_document?.doc_name})
          </Text>
          <Text style={{ color: getStatusBackgroundColor(document?.status) }}>
            {getStatusTranslation(document?.status)}
          </Text>
        </View>
        <TouchableOpacity>
          <Menu>
            <MenuTrigger>
              <Icon
                name="ellipsis-horizontal-sharp"
                size={25}
                color={isDarkMode ? colors.white : colors.black}
                style={styles.icon}
              />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => handleDocumentPreview(document?.doc_type, document?.doc_url)}>
                <Text style={{ color: colors.black }}>{t('screens:preview')}</Text>
              </MenuOption>
              <MenuOption onSelect={() => removeDocument(document?.id, document?.status)}>
                <Text style={{ color: 'red' }}>{t('screens:delete')}</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </TouchableOpacity>
      </View>
    ))
  }
</View>
          <PreviewDocumentModel
            isVisible={isModalVisible}
            onClose={togglePreviewModal}
            previewType={previewType}
            previewSource={previewSource}
          />
        </ScrollView>
      </SafeAreaView>

        <BottomSheetModalProvider>
          <View style={styles.bottomSheetContainer}>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={1}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}
            >
              <BottomSheetScrollView style={styles.bottomSheetContentContainer}>
              <UploadBusinessDocument
              businesses={businesses}
              regDocs={documentForRegister}
              documentForBusiness={documentForBusiness}
              handleDocumentUpload={handleDocumentUpload}
              uploadingDoc={uploadingDoc}
              resetModalState={[resetModal, setResetModal]}
              onSuccess={toggleBusinessListModal}
              errorMessage={message}
              showToast={showToast}
              showToastMessage={showToastMessage}
              toastMessage={toastMessage}
              toggleToast={toggleToast}
              setShowToast={setShowToast}
         />
                  
              </BottomSheetScrollView>
            </BottomSheetModal>
          </View>
        </BottomSheetModalProvider>

      </GestureHandlerRootView>
    </>

  )
}

const styles = StyleSheet.create({

  uploadArea: {
    alignSelf: 'center',
    width: '45%',
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
    color: colors.alsoGrey,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  uploadText: {
    fontSize: 16,
    color: colors.alsoGrey,
    textAlign: 'center',
  },
  bottomSheetContainer: {
  // flex: 1,
    zIndex: 1000
  },
  bottomSheetContentContainer: {
    // flex:1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  dottedLine: {
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#888',
    width: '80%',
    marginTop: 10,
  },
  listView: {
    marginTop: 30
  },
  documentItem: {
    flexDirection: 'row',
    marginVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#888',
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  icon: {
    marginHorizontal: 10
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 10
  }

});

export default Documents