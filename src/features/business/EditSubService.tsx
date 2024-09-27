import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ToastAndroid, Image, ScrollView, PermissionsAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { globalStyles } from '../../styles/global';
import { colors } from '../../utils/colors';
import { BasicView } from '../../components/BasicView';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';
import { useForm, Controller } from 'react-hook-form';
import { TextInputField } from '../../components/TextInputField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, RootStateOrAny } from 'react-redux';
import { createSubService, getSubserviceByService, updateSubService } from '../subservices/SubservicesSlice';
import { useAppDispatch } from '../../app/store';
import DocumentPicker from 'react-native-document-picker';
import { useTranslation } from 'react-i18next';
import VideoPlayer from '../../components/VideoPlayer';
import { firebase } from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import { TextAreaInputField } from '../../components/TextAreaInputField';
import { selectLanguage } from '../../costants/languangeSlice';
import ToastMessage from '../../components/ToastMessage';
import ToastNotification from '../../components/ToastNotification/ToastNotification';

const EditSubService = ({ route, navigation }: any) => {

  const { type, sub_service, providerSubService } = route.params;
  const { loading} = useSelector((state: RootStateOrAny) => state.subservices);



  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const { isDarkMode } = useSelector((state: RootStateOrAny) => state.theme);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [message, setMessage] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const stylesGlobal = globalStyles();

  const selectedLanguage = useSelector(selectLanguage);

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: ''
    },
  });

  useEffect(() => {
    const setFormValues = (service, type) => {
        if(type=='subService'){
      const subList = service?.provider_sub_list;
      setValue('name', subList?.name? subList?.name : (selectedLanguage=='en'?service?.name?.en:service?.name?.sw));
      setValue('description', subList?.description ?subList?.description: selectedLanguage=='en'?service.description?.en:service?.description?.sw);
        }else{
            setValue('name', providerSubService?.name);
             setValue('description', providerSubService?.description);
        }
        
    };

    if (type === 'subService') {
      setFormValues(sub_service, type);
    }

    if (type === 'providerSubService') {
      setFormValues(providerSubService, type);
    }
  }, [route.params]);

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

  const removeImage = () => {
    setImage(null)
  }

  const removeVideo = () => {
    setVideo(null)
  }

  const selectImage = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      setImage(res);

    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User canceled the file picker
      } else {
        // For Unknown Error
        alert("Unknown Error: " + JSON.stringify(error));
        throw error;
      }
    }
  };

  const selectVideo = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
      });
      setVideo(res);

    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User canceled the file picker
      } else {
        // For Unknown Error
        alert("Unknown Error: " + JSON.stringify(error));
        throw error;
      }
    }
  };

  ///New upload 

  const onSubmit = async (data) => {
    const formData = new FormData();
  
    // Append necessary data
    formData.append('provider_id', user.provider.id);
    formData.append('type', type);
  
    let idData;
    let providerSubListId;
  
    // Conditionally set ID data based on the type
    if (type === 'subService') {
      idData = sub_service.id;
      providerSubListId = sub_service.provider_sub_list.id;
    } else {
      idData = providerSubService.id;
      providerSubListId = providerSubService.provider_sub_list.id;
    }


         // Append video file if available
         if (video) {
          formData.append('video_file', video[0]);  // Assuming video[0] holds the file
        }
    
        // Append image file if available
        if (image) {
          formData.append('image_file', image[0]);  // Assuming image[0] holds the file
        }
  
    // Append additional data
    formData.append('providerSubListId', providerSubListId);
  
    // Check for required fields
    if (data.description == null || data.name == null) {
      setDisappearMessage(`${t('screens:enterNameOrDescription')}`);
      if (!showToast) {
        setShowToast(true);
        showToastMessage(t('screens:errorOccured'));
      }
    } else {
      // Append other data fields to formData
      formData.append('name', data.name);
      formData.append('description', data.description);


      console.log('formData',formData)
      console.log('idData',idData);
  
      // Dispatch the action with FormData
      dispatch(updateSubService({ data: formData,  id: idData }))
        .unwrap()
        .then(result => {
          if (result.status) {
            ToastNotification(`${t('screens:updatedSuccessfully')}`, 'success', 'long');
            navigation.navigate('My Businesses', {
              screen: 'My Businesses',
            });
          } else {
            ToastNotification(`${t('screens:requestFail')}`, 'danger', 'long');
            if (!showToast) {
              setShowToast(true);
              showToastMessage(t('screens:errorOccured'));
            }
          }
        })
        .catch(rejectedValueOrSerializedError => {
          console.log('error');
          console.log(rejectedValueOrSerializedError);
        });
    }
  };


  return (
    <ScrollView
      style={stylesGlobal.scrollBg}
      showsVerticalScrollIndicator={false}
    >
      <View>
      {showToast && <View style={{marginBottom:'15%'}}>
   <ToastMessage message={toastMessage} onClose={toggleToast} />
   </View>}
      <BasicView style={stylesGlobal.centerView}>
          <Text style={stylesGlobal.errorMessage}>{message}</Text>
        </BasicView>
        <BasicView>
          <Text
            style={[
              stylesGlobal.inputFieldTitle,
              stylesGlobal.marginTop20,
              { color: isDarkMode ? colors.white : colors.black }
            ]}>
            {t('screens:subService')}
          </Text>

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInputField
              placeholderTextColor={colors.alsoGrey}
                placeholder={t('screens:enterSubService')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="name"
          />

          {errors.name && (
            <Text style={stylesGlobal.errorMessage}>
              {t('screens:subserviceRequired')}
            </Text>
          )}
        </BasicView>

        <BasicView>
          <Text
            style={[
              stylesGlobal.inputFieldTitle,
              stylesGlobal.marginTop20,
              { color: isDarkMode ? colors.white : colors.black }
            ]}>
            {t('screens:description')}
          </Text>

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextAreaInputField
                placeholder={t('screens:enterDescription')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline={true} 
                numberOfLines={5}
              />
            )}
            name="description"
          />

          {errors.description && (
            <Text style={stylesGlobal.errorMessage}>
              {t('screens:decriptionRequired')}
            </Text>
          )}
        </BasicView>


        <View style={{ margin: 15 }}>
          <Text style={[styles.textStyle, { color: isDarkMode ? colors.white : colors.black }]}>{t('screens:UploadImagesVideosOfService')}</Text>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={selectImage}>
              <Text style={{ color: isDarkMode ? colors.white : colors.blue,fontWeight:'bold',fontSize:15,marginVertical:15 }}>{t('screens:uploadImage')}</Text>
            </TouchableOpacity>

            {image ? (
              <>
                {image[0]?.uri ? (
                  <>
                    <Image source={{ uri: image[0].uri }} style={styles.docView} />
                    <TouchableOpacity onPress={removeImage}>
                      <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeImage')}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {providerSubService?.assets?.length < 1 ? (
                      <Image source={{ uri: sub_service?.assets[0]?.img_url  || sub_service?.default_images[0]?.img_url }} style={styles.docView} />
                    ) : (
                      <Image source={{ uri: providerSubService?.assets[0]?.img_url }} style={styles.docView} />
                    )}
                    <TouchableOpacity onPress={removeImage}>
                      <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeImage')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                {providerSubService?.assets?.length > 0 ? (
                  <Image source={{ uri: providerSubService?.assets[0]?.img_url }} style={styles.docView} />
                ) : (
                  <>
                    {sub_service !== null ? (
                      <Image source={{ uri: sub_service?.assets[0]?.img_url || sub_service?.default_images[0]?.img_url }} style={styles.docView} />
                    ) : (
                      <TouchableOpacity onPress={selectImage}>
                        <Ionicons name="image" color={isDarkMode ? colors.white : colors.blue} size={100} style={{ alignSelf: 'center' }} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}



          </View>

          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={selectVideo}>
              <Text style={{ color: isDarkMode ? colors.white : colors.blue,fontWeight:'bold',fontSize:15,marginVertical:15 }}>{t('screens:uploadVideo')}</Text>
            </TouchableOpacity>
            {video && video[0]?.uri ? (
                  <>
                    <VideoPlayer video_url={video[0]?.uri} />
                    <TouchableOpacity onPress={removeVideo}>
                      <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeVideo')}</Text>
                    </TouchableOpacity>
                  </>
                ) : (<>
                  {sub_service?.assets[0]?.video_url !== null
                   || sub_service?.default_images[0]?.video_url !== null 
                   || providerSubService?.assets[0]?.video_url !== null  ? (
                   <>
                    {sub_service?.assets[0]?.video_url !== null
                   || sub_service?.default_images[0]?.video_url !== null ?(
                    <VideoPlayer video_url={sub_service?.assets[0]?.video_url || sub_service?.default_images[0]?.video_url} />):(
                      <VideoPlayer video_url={providerSubService?.assets[0]?.video_url} />)}
                   </>):(
                    <TouchableOpacity onPress={selectVideo}>
                    <Ionicons name="videocam-outline" color={isDarkMode ? colors.white : colors.blue} size={100} style={{ alignSelf: 'center' }} />
                    </TouchableOpacity>
                   )}
                </>)

                }
          </View>

        </View>
      </View>

      <BasicView style={{marginBottom:'20%'}}>
        <Button loading={uploadingDoc|| loading} onPress={handleSubmit(onSubmit)}>
          <ButtonText>{t('screens:editSubService')}</ButtonText>
        </Button>
      </BasicView>
    </ScrollView>
  )
}

export default EditSubService

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  toggleButton: {
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  activeToggleText: {
    color: colors.white,
    backgroundColor: colors.primary,
    borderRadius: 20
    // Active text color
  },
  buttonText: {
    color: colors.primary,
    padding: 10,
    marginRight: 5
    // Default text color
  },
  checkBoxContainer: {
    marginVertical: 30
  },
  textStyle: {
    marginBottom: 10,
    fontSize: 17,
  },
  docView: {
    width: 200,
    height: 150,
    alignSelf: 'center'
  },

})