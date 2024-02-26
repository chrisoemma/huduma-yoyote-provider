import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ToastAndroid, Image, ScrollView, PermissionsAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { globalStyles } from '../../styles/global';
import { colors } from '../../utils/colors';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { BasicView } from '../../components/BasicView';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';
import { useForm, Controller } from 'react-hook-form';
import { TextInputField } from '../../components/TextInputField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, RootStateOrAny } from 'react-redux';
import { createSubService, getSubserviceByService } from '../subservices/SubservicesSlice';
import { useAppDispatch } from '../../app/store';
import DocumentPicker from 'react-native-document-picker';
import { useTranslation } from 'react-i18next';
import VideoPlayer from '../../components/VideoPlayer';
import { firebase } from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

const AddSubServiceScreen = ({ route, navigation }: any) => {

  const { business, sub_services } = route.params;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const stylesGlobal = globalStyles();

  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const { loading, subServiceByService } = useSelector((state: RootStateOrAny) => state.subservices);

  const [checkedSubServices, setCheckedSubServices] = useState([]);
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [message, setMessage] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const [activeTab, setActiveTab] = useState('addNew');
  const toggleTab = () => {
    setActiveTab(activeTab === 'addNew' ? 'addFromList' : 'addNew');
  };

  useEffect(() => {
    dispatch(getSubserviceByService({ serviceId: business?.service_id }));
  }, [business?.service_id]);

  useEffect(() => {
    // console.log('servicessall',subServiceByService)
    // console.log('checked1l',checkedSubServices)
    if (subServiceByService) {
      const ids = sub_services?.map(subService => subService?.id);
      console.log('checked1l', checkedSubServices)
      setCheckedSubServices(ids)
      console.log('checked1222', checkedSubServices)
    }
  }, [subServiceByService]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: ''
    },
  });


  const commonSubServices = subServiceByService.filter(itemB => sub_services.some(itemA => itemA?.id === itemB?.id));



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


  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );



  ///New upload 

  const onSubmit = async (data) => {


    data.provider_id = user.provider.id;
    data.service_id = business?.service_id;
    data.business_id = business?.id;
    data.sub_services = checkedSubServices;

    let mediaUploadHandled = false;

    const handleUploadFinish = () => {

      if (!mediaUploadHandled) {
        mediaUploadHandled = true;
      if (checkedSubServices.length < 1 || data.name == null) {
        setDisappearMessage(`${t('screens:chooseSubserviceOrEnterName')}`);

      } else {
        dispatch(createSubService({ data: data, providerId: user.provider.id, businessId: business.id }))
          .unwrap()
          .then(result => {
            if (result.status) {
              ToastAndroid.show(`${t('screens:createdSuccessfully')}`, ToastAndroid.SHORT);
              navigation.navigate('My Businesses', {
                screen: 'My Businesses',
              });
            } else {
              setDisappearMessage(`${t('screens:requestFail')}`);
              console.log('dont navigate');
            }
          })
          .catch(rejectedValueOrSerializedError => {
            console.log('error');
            console.log(rejectedValueOrSerializedError);
          });
      }

      }
    };

    const uploadFileAndHandleFinish = async (file, storagePath) => {
      const fileExtension = file[0].type.split("/").pop();
      const uuid = makeid(10);
      const fileName = `${uuid}.${fileExtension}`;
      const storageRef = firebase.storage().ref(storagePath);

      const fileUri = await getPathForFirebaseStorage(file[0].uri);

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
              console.log("snapshot state: " + snapshot.state);
              if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
                storageRef.getDownloadURL().then((downloadUrl: any) => {
                  if (file === image) {

                    data.img_url = downloadUrl;
                  } else if (file === video) {
                    data.video_url = downloadUrl;
                  }
                  setUploadingDoc(false);
                //  mediaUploaded = true;

                  // Check if both image and video uploads are complete
                  handleUploadFinish();
                });
              }
            },
            (error) => {
              unsubscribe();
            }
          );
        }
      } catch (error) {
        console.warn(error);
      }
    };

  

    if (image !== null) {
      await uploadFileAndHandleFinish(image, 'businesses/images/');
    }
    if (video !== null) {
      await uploadFileAndHandleFinish(video, 'businesses/videos/');
    }
    if (image === null && video === null) {
      handleUploadFinish();
    }
  };

  return (
    <ScrollView
      style={stylesGlobal.scrollBg}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleTab}
        >
          <Text style={[styles.buttonText, activeTab === 'addNew' ? styles.activeToggleText : null]}>

            {t('screens:addNew')}
          </Text>
          <Text style={[styles.buttonText, activeTab === 'addFromList' ? styles.activeToggleText : null]}>
            {t('screens:addFromList')}
          </Text>

        </TouchableOpacity>
        <BasicView style={stylesGlobal.centerView}>
          <Text style={stylesGlobal.errorMessage}>{message}</Text>
        </BasicView>
        {
          activeTab === 'addFromList' ? (

            <View style={styles.checkBoxContainer}>

              <Text style={[styles.textStyle, { color: isDarkMode ? colors.white : colors.black }]}>{t('screens:addByCheckingMore')}</Text>
              {
                subServiceByService.map(subservice => (
                  <BouncyCheckbox
                    // key={subservice.id}
                    size={25}
                    fillColor={colors.secondary}
                    style={{ marginTop: 5 }}
                    unfillColor="#FFFFFF"
                    text={subservice.name}
                    iconStyle={{ borderColor: "red" }}
                    innerIconStyle={{ borderWidth: 2 }}
                    textStyle={{ fontFamily: "JosefinSans-Regular", color: isDarkMode ? colors.white : colors.alsoGrey }}
                    isChecked={commonSubServices.some(commonSub => commonSub.id === subservice.id)}

                    onPress={(isChecked: boolean) => {

                      if (isChecked) {
                        setCheckedSubServices(prevChecked => [...prevChecked, subservice.id]);
                      } else {
                        setCheckedSubServices(prevChecked =>
                          prevChecked.filter(id => id !== subservice.id)
                        );
                      }
                    }}
                  />
                ))
              }
            </View>
          ) : (

            <View>
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
                      placeholder={t('screens:enterSubService')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      style={{ color:colors.black }}
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
                    <TextInputField
                      placeholder={t('screens:enterDescription')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
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


              <View style={{ marginVertical: 10 }}>
                <Text style={[styles.textStyle, { color: isDarkMode ? colors.white : colors.black }]}>{t('screens:UploadImagesVideosOfService')}</Text>
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={selectImage}>
                    <Text style={{ color: isDarkMode ? colors.white : colors.black }}>{t('screens:uploadImage')}</Text>
                  </TouchableOpacity>

                  {image == null ? (
                    <Ionicons name="image" color={isDarkMode ? colors.white : colors.black} size={100} style={{ alignSelf: 'center' }} />
                  ) : (
                    <>
                      {image == null ? (
                        <Ionicons name="image" color={isDarkMode ? colors.white : colors.black} size={100} style={{ alignSelf: 'center' }} />
                      ) : (
                        <>
                          <Image source={{ uri: image[0].uri }} style={styles.docView} />
                          <TouchableOpacity onPress={removeImage}>
                            <Text style={{ color: isDarkMode ? colors.white : colors.black }}>{t('screens:removeImage')}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity onPress={removeImage}>
                        <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeImage')}</Text>
                      </TouchableOpacity>
                    </>
                  )}

                </View>

                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={selectVideo}>
                    <Text style={{ color: isDarkMode ? colors.white : colors.black }}>{t('screens:uploadVideo')}</Text>
                  </TouchableOpacity>
                  {video == null ? (
                    <Ionicons name="videocam-outline" color={isDarkMode ? colors.white : colors.black} size={100} style={{ alignSelf: 'center' }} />
                  ) : (
                    <>
                      <VideoPlayer
                        video_url={`${video[0]?.uri}`}
                      />

                      <TouchableOpacity onPress={removeVideo}>
                        <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeVideo')}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

              </View>

            </View>
          )}

        <BasicView>
          <Button loading={uploadingDoc || loading} onPress={handleSubmit(onSubmit)}>
            <ButtonText>{t('screens:addSubService')}</ButtonText>
          </Button>
        </BasicView>
      </View>
    </ScrollView>
  )
}

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

export default AddSubServiceScreen