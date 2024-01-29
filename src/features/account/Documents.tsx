import {
  View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
  Modal,
  Button,
  Image,
} from 'react-native'
import React, { useEffect, useState } from 'react'
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

import { createDocument, getDocuments, getRegDocs } from '../business/BusinessSlice';
import { useAppDispatch } from '../../app/store';
import { useSelector, RootStateOrAny } from 'react-redux';
import { breakTextIntoLines } from '../../utils/utilts';
import PreviewDocumentModel from '../../components/PriewDocumentModel';
import UploadBusinessDocumentModal from '../../components/UploadBusinessDocumentModal';
import { firebase } from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

const Documents = () => {

  const { t } = useTranslation();

  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [message, setMessage] = useState('');
  const [uploadingDoc,setUploadingDoc] =useState(false);
  const [resetModal, setResetModal] = useState(false);

  const [docId, setDocId] = useState(null);

  const togglePreviewModal = () => {
    if (!isModalVisible) {
      setDocId(null);
    }
    setModalVisible(!isModalVisible);
  };


  const stylesGlobal=globalStyles();


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



  const { documents, businesses,regDocs } = useSelector(
    (state: RootStateOrAny) => state.businesses,
  );


  const getPathForFirebaseStorage = async (uri: any) => {

    // if (Platform.OS === "ios") return uri;
    // const stat = await RNFetchBlob.fs.stat(uri);
    // return stat.path;
    const destPath = `${RNFS.TemporaryDirectoryPath}/text`;
    await RNFS.copyFile(uri, destPath);

    return (await RNFS.stat(destPath)).path;
  };


  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const dispatch = useAppDispatch();
  if (user.provider) {
    useEffect(() => {
       dispatch(getRegDocs());
      dispatch(getDocuments({ providerId: user.provider.id }));
    }, [dispatch])
  }

  // console.log('documents', documents);


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
    business: '',
    provider_id: '',
    doc_format: '',
    working_document_id:''
  }



  const handleDocumentUpload = async (value, doc, text,valueType) => {

    data.provider_id = user.provider.id,
      data.doc_format = text;
         if(valueType==1){
          data.working_document_id=value
         }else if(valueType==2){
          data.business = value;
         }
   // console.log('business_id',value);

    if (doc !== null) {
      data.document_type = doc[0].type;
      console.log('file document', doc);
      const fileExtension = doc[0].type.split("/").pop();
      var uuid = makeid(10)
      const fileName = `${uuid}.${fileExtension}`;
      var storageRef = firebase.storage().ref(`businesses/docs/${fileName}`);

      console.log('file docs', doc[0].uri);
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
                dispatch(createDocument({data:data,providerId:user.provider.id}))
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
                      setDisappearMessage(
                        'Unable to process request. Please try again later.',
                      );
                      console.log('dont navigate');
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

  return (
    <>
      <SafeAreaView
        style={stylesGlobal.scrollBg}
      >
        <ScrollView style={stylesGlobal.appView}>

          <TouchableOpacity
            style={styles.uploadArea}
            onPress={toggleBusinessListModal}
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
          <View style={styles.listView}>
            <Text style={{
              color: colors.black,
              fontWeight: 'bold'
            }}>{t('screens:uploadedDocuments')}</Text>
            {
              documents?.map(document => (
                <View style={styles.documentItem}
                  key={document?.id}
                >
                  <View>
                    <Icon
                      name="folder"
                      size={25}
                      color={colors.secondary}
                    />
                  </View>
                  <View>
                    <Text style={{ color: isDarkMode?colors.white:colors.black }}>{breakTextIntoLines(document?.doc_format, 30)}</Text>
                  </View>
                  <TouchableOpacity>
                    <Menu>
                      <MenuTrigger>
                        <Icon
                          name="ellipsis-horizontal-sharp"
                          size={25}
                          color={isDarkMode?colors.white:colors.black}
                        />
                      </MenuTrigger>
                      <MenuOptions>
                        <MenuOption onSelect={() => handleDocumentPreview(document?.doc_type, document?.doc_url)} >
                         <Text style={{color:colors.black}}>{t('screens:preview')}</Text>
                      </MenuOption>
                        <MenuOption onSelect={() => alert(`Delete`)} >
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

      <UploadBusinessDocumentModal
        isVisible={isBusinessListVisible}
        onClose={toggleBusinessListModal}
        businesses={businesses}
        regDocs={regDocs}
        handleDocumentUpload={handleDocumentUpload}
        uploadingDoc={uploadingDoc}
        resetModalState={[resetModal, setResetModal]}
        onSuccess={toggleBusinessListModal}
      />
    </>
  )
}

const styles = StyleSheet.create({

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
    color:colors.alsoGrey,
    fontWeight: 'bold',
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
    justifyContent: 'space-between'
  }
});

export default Documents