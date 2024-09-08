import {
  View, Text, SafeAreaView, StyleSheet,
  TouchableOpacity, ToastAndroid, Alert, ScrollView, Image,
  PermissionsAndroid,
  Platform
} from 'react-native';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { globalStyles } from '../../styles/global';
import DropDownPicker from "react-native-dropdown-picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { colors } from '../../utils/colors';
import DocumentPicker from 'react-native-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import { BasicView } from '../../components/BasicView';
import { ButtonText } from '../../components/ButtonText';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../app/store';
import { useSelector, RootStateOrAny } from 'react-redux';
import { getCategories } from '../category/CategorySlice';
import { transformDataToDropdownOptions, transformDataToDropdownOptionsLanguage } from '../../utils/utilts';
import { getServicesByCategory } from '../Service/ServiceSlice';
import { getSubserviceByService, clearSubServiceByService } from '../subservices/SubservicesSlice';
import { createBusiness, updateBusiness } from './BusinessSlice';
import { useForm, Controller } from 'react-hook-form';
import { TextInputField } from '../../components/TextInputField';
import { firebase } from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import VideoPlayer from '../../components/VideoPlayer';
import { selectLanguage } from '../../costants/languangeSlice';
import ToastMessage from '../../components/ToastMessage';
import ToastNotification from '../../components/ToastNotification/ToastNotification';
import { mediaPermissions } from '../../permissions/MediaPermissions';


const AddBusiness = ({ route, navigation }: any) => {

  const [isEditMode, setIsEditMode] = useState(false);

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [value, setCategoryValue] = useState(null);
  const [ServiceValue, setServiceValue] = useState(null);

  const [checkedSubServices, setCheckedSubServices] = useState([]);
  const selectedLanguage = useSelector(selectLanguage);

  const [open, setOpen] = useState(false);

  const [ServiceOpen, setServiceOpen] = useState(false);
  const { user } = useSelector((state: RootStateOrAny) => state.user);
  const { categories } = useSelector((state: RootStateOrAny) => state.categories);
  const { servicesByCategory } = useSelector((state: RootStateOrAny) => state.services);
  const { subServiceByService } = useSelector((state: RootStateOrAny) => state.subservices);
  const { loading, business } = useSelector((state: RootStateOrAny) => state.businesses);

  const existingBusiness = route?.params?.business;

  const sub_services = route?.params?.sub_services

  useEffect(() => {
    dispatch(clearSubServiceByService());
    setSubs([]);
    dispatch(getCategories());
  }, []);

  useEffect(() => {
    const existingBusiness = route?.params?.business;
    if (existingBusiness) {
      setIsEditMode(true);
      setCategoryValue(String(existingBusiness?.service?.category_id))
      setServiceValue(String(existingBusiness?.service_id))
      setValue('description', existingBusiness.description)

      navigation.setOptions({
        title: t('screens:editBusiness'),
      });
    } else {
      navigation.setOptions({
        title: t('screens:addBusiness'),
      });
    }

  }, [route.params]);


  useEffect(() => {

    if (value !== null) {
      dispatch(getServicesByCategory({ categoryId: value }));
    }
  }, [value]);



  useEffect(() => {

    if (subServiceByService) {

      setSubs(subServiceByService);
      if (isEditMode) {
        const ids = sub_services?.map(subService => subService?.id);
        setCheckedSubServices(ids)

      }

    }
  }, [subServiceByService]);


  const commonSubServices = subServiceByService.filter(itemB => sub_services?.some(itemA => itemA?.id === itemB?.id));

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: ''
    },
  });




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



  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [items, setItems] = useState(transformDataToDropdownOptionsLanguage(categories, selectedLanguage));
  const [ServiceItems, setServiceItems] = useState(transformDataToDropdownOptionsLanguage(servicesByCategory, selectedLanguage));
  const [subs, setSubs] = useState(subServiceByService)

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  const stylesGlobal = globalStyles();

  const removeImage = () => {
    setImage(null)
  }

  const removeVideo = () => {
    setVideo(null)
  }

  const onChangeCategory = async () => {

    if (value !== null) {
      // Clear the services list
      await dispatch(clearSubServiceByService());  //clear sub service on first render not working
      setSubs([]);
      setServiceItems([]);
      dispatch(getServicesByCategory({ categoryId: value }));
    }
  }

  const onChangeService = () => {
    if (ServiceValue !== null) {
      dispatch(getSubserviceByService({ serviceId: ServiceValue }));
    }
  }

  const ServiceItemsMemoized = useMemo(() => {
    return transformDataToDropdownOptionsLanguage(servicesByCategory, selectedLanguage)
  }, [servicesByCategory]);

  const [video, setVideo] = useState(null);
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState(null);

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


  const selectImage = async () => {

    const permissionsGranted = await mediaPermissions();
    if (!permissionsGranted) {
      ToastNotification(`${t('screens:mediaPermissionNotGranted')}`, 'default', 'long');
      return;
    }

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

    const permissionsGranted = await mediaPermissions();
    if (!permissionsGranted) {
      ToastNotification(`${t('screens:mediaPermissionNotGranted')}`, 'default', 'long');
      return;
    }

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



  // const onSubmit = useCallback(async (data) => {
  //   data.provider_id = user.provider.id;
  //   data.category_id = value;
  //   data.service_id = ServiceValue;
  //   data.sub_services = checkedSubServices;
  
  //   // Function to handle the completion of file uploads
  //   const handleUploadFinish = () => {
  //     // Proceed with creating or updating business once all uploads are finished
  //     if (value == null || ServiceValue == null || checkedSubServices.length < 1) {
  //       setDisappearMessage(`${t('screens:chooseCategoryServiceSubService')}`);
  //       if (!showToast) {
  //         setShowToast(true);
  //         showToastMessage(t('screens:errorOccured'));
  //       }
  //     } else {
  //       if (isEditMode && data?.img_url == null) {
  //         data.img_url = existingBusiness?.img_url ? existingBusiness?.img_url : existingBusiness?.service?.images[0]?.img_url;
  //         console.log('Edit mode', data.img_url);
  //       }
  
  //       if (isEditMode && data?.video_url == null) {
  //         data.video_url = existingBusiness?.video_url ? existingBusiness?.video_url : null;
  //       }
  
  //       console.log('Business creation', data);
  
  //       // Call the create or update function after handling files
  //       dispatch(isEditMode ? updateBusiness({ data, businessId: existingBusiness.id }) : createBusiness(data))
  //         .unwrap()
         // .then(result => {
  //           if (result.status) {
  //             ToastNotification(`${t('screens:updatedSuccessfully')}`, 'success', 'long');
  //             navigation.navigate('My Businesses', {
  //               screen: 'My Businesses',
  //             });
  //           } else {
  //             if (result.error) {
  //               setDisappearMessage(result.error);
  //               if (!showToast) {
  //                 setShowToast(true);
  //                 showToastMessage(t('screens:errorOccured'));
  //               }
  //             } else {
  //               setDisappearMessage(`${t('screens:requestFail')}`);
  //               if (!showToast) {
  //                 setShowToast(true);
  //                 showToastMessage(t('screens:errorOccured'));
  //               }
  //             }
  //           }
  //         }).catch(rejectedValueOrSerializedError => {
  //           console.log('error');
  //           console.log(rejectedValueOrSerializedError);
  //         });
  //     }
  //   };
  
  //   // Function to upload a file
  //   const uploadFileAndHandleFinish = async (file, storagePath, isImage) => {
  //     const fileExtension = file[0].type.split("/").pop();
  //     const uuid = makeid(10);
  //     const fileName = `${uuid}.${fileExtension}`;
  //     const storageRef = firebase.storage().ref(`${storagePath}/${fileName}`);
  //     const fileUri = await getPathForFirebaseStorage(file[0].uri);
  
  //     try {
  //       setUploadingDoc(true);
  //       const task = storageRef.putFile(fileUri);
  
  //       task.on(
  //         firebase.storage.TaskEvent.STATE_CHANGED,
  //         (snapshot) => {
  //           console.log("snapshot state: " + snapshot.state);
  //           if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
  //             storageRef.getDownloadURL().then((downloadUrl) => {
  //               if (isImage) {
  //                 data.img_url = downloadUrl;  // Set image URL
  //               } else {
  //                 data.video_url = downloadUrl;  // Set video URL
  //               }
  //               setUploadingDoc(false);
  //               handleUploadFinish();
  //             });
  //           }
  //         },
  //         (error) => {
  //           console.warn(error);
  //           setUploadingDoc(false);
  //           handleUploadFinish();
  //         }
  //       );
  //     } catch (error) {
  //       console.warn(error);
  //       setUploadingDoc(false);
  //       handleUploadFinish();
  //     }
  //   };
  
  //   // Upload image if available
  //   if (image !== null) {
  //     console.log('Uploading image', image);
  //     await uploadFileAndHandleFinish(image, 'businesses/images/', true);
  //   }
  
  //   // Upload video if available
  //   if (video !== null) {
  //     console.log('Uploading video', video);
  //     await uploadFileAndHandleFinish(video, 'businesses/videos/', false);
  //   }
  
  //   // If no image or video, just finish
  //   if (image === null && video === null) {
  //     handleUploadFinish();
  //   }
  // }, [value, ServiceValue, checkedSubServices, image, video, isEditMode, existingBusiness, dispatch, t, navigation]);
  
  const onSubmit = useCallback(async (data) => {
    const formData = new FormData();
    formData.append('provider_id',user.provider.id);
    formData.append('category_id', value)
    formData.append('service_id',ServiceValue)
    formData.append('sub_services' , checkedSubServices);
    if(video){
    formData.append('video_file',video[0])
    }
   if(image){
    formData.append('image_file',image[0]);
   }
    
    

         if (value == null || ServiceValue == null || checkedSubServices.length < 1) {
          ToastNotification(`${t('screens:chooseCategoryServiceSubService')}`,'danger','long');
        
        }else{
          if (isEditMode && image==null) {
            //no new image uploaded
            formData.append('image_url', existingBusiness?.img_url ? existingBusiness?.img_url : existingBusiness?.service?.images[0]?.img_url)
        }
  
        if (isEditMode && video==null) {
          //no new vide uploaded
          formData.append('video_url',existingBusiness?.video_url ? existingBusiness?.video_url : null)
        }
        console.log('formDataaa',formData)
          dispatch(isEditMode ? updateBusiness({ data:formData, businessId: existingBusiness.id }) : createBusiness(formData))
          .unwrap()
         .then(result => {
            if (result.status) {
              ToastNotification(`${t('screens:updatedSuccessfully')}`, 'success', 'long');
              navigation.navigate('My Businesses', {
                screen: 'My Businesses',
              });
            } else {
              if (result.error) {
                setDisappearMessage(result.error);
                if (!showToast) {
                  setShowToast(true);
                  showToastMessage(t('screens:errorOccured'));
                }
              } else {
                setDisappearMessage(`${t('screens:requestFail')}`);
                if (!showToast) {
                  setShowToast(true);
                  showToastMessage(t('screens:errorOccured'));
                }
              }
            }
          }).catch(rejectedValueOrSerializedError => {
            console.log('error');
            console.log(rejectedValueOrSerializedError);
          });


        }

  },[value, ServiceValue, checkedSubServices, image, video, isEditMode, existingBusiness, dispatch, t, navigation])
  

  return (
    <SafeAreaView style={stylesGlobal.scrollBg}>
      {showToast && <View style={{ marginBottom: '15%' }}>
        <ToastMessage message={toastMessage} onClose={toggleToast} />
      </View>}
      <ScrollView style={stylesGlobal.appView} showsVerticalScrollIndicator={false}>

        <BasicView style={stylesGlobal.centerView}>
          <Text style={[stylesGlobal.errorMessage, { fontSize: 17, marginBottom: 10 }]}>{message}</Text>
        </BasicView>
        <View style={styles.marginDropdown}>
          <Text style={{ color: isDarkMode ? colors.white : colors.black }}>{t('screens:category')}</Text>
          <DropDownPicker
            searchable={true}
            zIndex={6000}
            placeholder={t('screens:selectCategory')}
            listMode="MODAL"
            open={open}
            value={value}
            items={items}
            onChangeValue={onChangeCategory}
            setOpen={setOpen}
            setValue={setCategoryValue}
            setItems={setItems}

          />
        </View>
        <View style={styles.marginDropdown}>
          <Text style={{ color: isDarkMode ? colors.white : colors.black }}>{t('screens:service')}</Text>
          <DropDownPicker
            searchable={true}
            placeholder={t('screens:selectService')}
            listMode="MODAL"
            open={ServiceOpen}
            value={ServiceValue}
            items={ServiceItemsMemoized}
            onChangeValue={onChangeService}
            setOpen={setServiceOpen}
            setValue={setServiceValue}
            setItems={setServiceItems}
          />

        </View>
        <View style={styles.checkBoxContainer}>
          <Text style={[styles.textStyle, { color: isDarkMode ? 'white' : 'black' }]}>{t('screens:pleaseChooseSubServiceYouOffer')}</Text>
          {
            subs?.map(subservice => (
              <BouncyCheckbox
                key={subservice.id}
                size={25}
                fillColor={colors.secondary}
                style={{ marginTop: 5 }}
                unfillColor="#FFFFFF"
                text={
                  selectedLanguage === 'sw' && subservice?.name?.sw 
                  ? subservice.name.sw 
                  : subservice?.name?.en
                }
                iconStyle={{ borderColor: "red" }}
                innerIconStyle={{ borderWidth: 2 }}
                textStyle={{ fontFamily: "JosefinSans-Regular" }}
                isChecked={commonSubServices.some(commonSub => commonSub.id === subservice.id)}
                onPress={(isChecked: boolean) => {

                  if (isChecked) {
                    setCheckedSubServices(prevChecked => [...prevChecked, subservice.id]);
                  } else {
                    //console.log('executing this block')
                    setCheckedSubServices(prevChecked =>
                      prevChecked.filter(id => id !== subservice.id)
                    );

                   // console.log('checked sub servicesss', checkedSubServices)
                  }
                }}
              />
            ))
          }


        </View>
        <BasicView>
          <Text
            style={[

              stylesGlobal.marginTop20, { color: isDarkMode ? 'white' : 'black' }
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
                placeholderTextColor={colors.alsoGrey}
                placeholder={t('screens:enterDescription')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={{ color: colors.black }}
              />
            )}
            name="description"
          />

          {errors.description && (
            <Text style={stylesGlobal.errorMessage}>
              {t('screens:descriptionRequired')}
            </Text>
          )}
        </BasicView>
        <View style={{ marginVertical: 10 }}>
          <Text style={[styles.textStyle, { color: isDarkMode ? colors.white : colors.black }]}>{t('screens:UploadImagesVideosOfService')}</Text>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={selectImage}>
              <Text style={{ color: isDarkMode ? colors.white : colors.blue, marginVertical: 10, fontWeight: 'bold', fontSize: 15 }}>{t('screens:uploadImage')}</Text>
            </TouchableOpacity>

            {/* {console.log('editedBusinesss',editedBusiness?.service?.images[0]?.img_url)}
          /show this when there is service[0]?.img_url */}
            {!isEditMode ? (image == null ? (<TouchableOpacity onPress={selectImage}><Ionicons name="image" color={isDarkMode ? colors.white : colors.blue}
              size={100} style={{ alignSelf: 'center' }} /></TouchableOpacity>) : (<>
                <Image source={{ uri: image[0].uri }} style={styles.docView} />
                {/* <TouchableOpacity onPress={removeImage}>
                  <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeImage')}</Text>
                </TouchableOpacity> */}
              </>)

            ) : (
              <>
                {isEditMode && image && image[0]?.uri ? (
                  <Image source={{ uri: image[0].uri }} style={styles.docView} />
                ) : (
                  <Image source={{ uri: (isEditMode && existingBusiness?.img_url) || image?.[0]?.uri || (existingBusiness?.service?.images?.[0]?.img_url) || 'default-image-uri' }} style={styles.docView} />
                )}
                {/* <TouchableOpacity onPress={removeImage}>
                  <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeImage')}</Text>
                </TouchableOpacity> */}
              </>
            )}

          </View>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={selectVideo}>
              <Text style={{ color: isDarkMode ? colors.white : colors.blue, marginVertical: 10, fontWeight: 'bold', fontSize: 15 }}>{t('screens:uploadVideo')}</Text>
            </TouchableOpacity>

            {!isEditMode ? (video == null ? (<TouchableOpacity onPress={selectVideo}><Ionicons name="videocam-outline" color={isDarkMode ? colors.white : colors.blue}
              size={100} style={{ alignSelf: 'center' }} /></TouchableOpacity>) : (<>
                <VideoPlayer
                  video_url={`${video[0]?.uri}`} />
                {/* <TouchableOpacity onPress={removeVideo}>
                  <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeVideo')}</Text>
                </TouchableOpacity> */}
              </>)

            ) : (
              <>
                {isEditMode && video && video[0]?.uri ? (
                  <VideoPlayer
                    video_url={`${video[0]?.uri}`} />
                ) : (
                  existingBusiness?.video_url == null ? (<Ionicons name="videocam-outline" color={isDarkMode ? colors.white : colors.black}
                    size={100} style={{ alignSelf: 'center' }} />) : (
                    <VideoPlayer
                      video_url={`${existingBusiness?.video_url || video[0]?.uri}`} />
                  ))}
                {/* <TouchableOpacity onPress={removeVideo}>
                  <Text style={{ color: colors.dangerRed, marginVertical: 10, fontWeight: 'bold' }}>{t('screens:removeVideo')}</Text>
                </TouchableOpacity> */}
              </>
            )}

          </View>
          <BasicView style={{ marginBottom: '20%' }}>
            <Button loading={loading || uploadingDoc} onPress={handleSubmit(onSubmit)}>
              <ButtonText>{isEditMode ? `${t('screens:editBusiness')}` : `${t('screens:addBusiness')}`}</ButtonText>
            </Button>
          </BasicView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  marginDropdown: { marginBottom: 20 },
  checkBoxContainer: {
    marginVertical: 10
  },
  textStyle: {
    marginBottom: 10,
    fontSize: 17,
  },
  docView: {
    flex: 1,
    width: 200,
    height: 150,
    alignSelf: 'center'
  },
  backgroundVideo: {
    width: 500,
    height: 300
  },
});

export default AddBusiness;
