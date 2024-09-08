import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ToastAndroid, ScrollView, SafeAreaView, Modal } from 'react-native';
import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView, } from 'react-native-gesture-handler';
import { colors } from '../../utils/colors';
import { globalStyles } from '../../styles/global';
import FloatBtn from '../../components/FloatBtn';
import { useSelector, RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { useTranslation } from 'react-i18next';
import { deleteBusiness } from './BusinessSlice';
import Video, { VideoRef } from 'react-native-video';
import { BasicView } from '../../components/BasicView';
import { deleteSubService, getBusinessSubservices } from '../subservices/SubservicesSlice';
import VideoPlayer from '../../components/VideoPlayer';
import Orientation from 'react-native-orientation-locker';
import { selectLanguage } from '../../costants/languangeSlice';
import ToastNotification from '../../components/ToastNotification/ToastNotification';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomBackground from '../../components/CustomBgBottomSheet'

const BusinessDetails = ({ route, navigation }: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const videoRef = useRef<VideoRef>(null);

  const snapPoints = useMemo(() => ['25%', '95%'], []);

  const [isVideoModalVisible, setVideoModalVisible] = useState(false);

  const { service } = route.params;


  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const stylesGlobal = globalStyles();

  const { loading, subservices, providerSubServices } = useSelector(
    (state: RootStateOrAny) => state.subservices,
  );


  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );


  const selectedLanguage = useSelector(selectLanguage);


  // useEffect(() => {

  //   Orientation.lockToLandscape();

  //   // Don't forget to unlock when the screen unmounts
  //   return () => {
  //     Orientation.unlockAllOrientations();
  //   };
  // }, []);

  const [message, setMessage] = useState(null)

  useEffect(() => {
    dispatch(getBusinessSubservices({ providerId: user?.provider?.id, serviceId: service.service_id }));
  }, [dispatch])

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);


  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const toggleVideoModal = () => {
    setVideoModalVisible(!isVideoModalVisible);
  };


  const removeBusiness = (id) =>
    Alert.alert(`${t('screens:deleteBusiness')}`, `${t('screens:areYouWantToDelete')}`, [
      {
        text: `${t('screens:cancel')}`,
        onPress: () => console.log('Cancel task delete'),
        style: 'cancel',
      },
      {
        text: `${t('screens:ok')}`,
        onPress: () => {
          console.log('idddd', id);
          dispatch(deleteBusiness({ businessId: id }))
            .unwrap()
            .then(result => {
              if (result.status) {

                ToastNotification(`${t('screens:deletedSuccessfully')}`, 'success', 'long')
                navigation.navigate('My Businesses', {
                  screen: 'My Businesses',
                });
              } else {

                ToastNotification(`${t('screens:requestFail')}`, 'danger', 'long')
                console.log('dont navigate');
              }

              console.log('resultsss', result)
            })
            .catch(rejectedValueOrSerializedError => {
              // handle error here
              console.log('error');
              console.log(rejectedValueOrSerializedError);
            });
        },
      },
    ]);



  const removeSubService = (type, providerList, id) =>
    Alert.alert(`${t('screens:deleteSubService')}`, `${t('screens:areYouWantToDelete')}`, [
      {
        text: `${t('screens:cancel')}`,
        onPress: () => console.log('Cancel subservice delete'),
        style: 'cancel',
      },
      {
        text: `${t('screens:ok')}`,
        onPress: () => {

          dispatch(deleteSubService({ providerId: user.provider.id, id: id, type: type, providerList: providerList }))
            .unwrap()
            .then(result => {
              if (result.status) {

                ToastNotification(`${t('screens:deletedSuccessfully')}`, 'success', 'long')
                navigation.navigate('My Businesses', {
                  screen: 'My Businesses',
                });
              } else {
                ToastNotification(`${t('screens:requestFail')}`, 'danger', 'long')
                console.log('dont navigate');
              }

              console.log('resultsss', result)
            })
            .catch(rejectedValueOrSerializedError => {
              // handle error here
              console.log('error');
              console.log(rejectedValueOrSerializedError);
            });
        },
      },
    ]);


    const ServicesOffered = ({ sub_service, provider_sub_service }: any) => {
      const containerStyle = {
        ...styles.sub_div,
        borderColor: isDarkMode ? colors.white : colors.alsoLightGrey,
        backgroundColor: isDarkMode ? colors.darkModeBottomSheet : colors.whiteBackground,
      };
    
      if (sub_service) {
        return (
          <TouchableOpacity
            style={containerStyle}
            onPress={() => navigation.navigate('View sub service', {
              sub_service: sub_service,
              type: 'subService'
            })}
          >
            <Text style={[styles.category,{color:isDarkMode?colors.white:colors.black}]}>
              {sub_service?.provider_sub_list?.name || (selectedLanguage === 'en' ? sub_service.name.en : sub_service.name.sw)}
            </Text>
            <View style={styles.descBtnsContainer}>
              <Text style={[styles.description,{color:isDarkMode?colors.white:colors.black}]}
               numberOfLines={2}
               ellipsizeMode="tail" 
              >
                {sub_service?.provider_sub_list?.description || (selectedLanguage === 'en' ? sub_service?.description?.en : sub_service?.description?.sw)}
              </Text>
              <View style={styles.btnContainer}>
                {user?.provider && user.status !== 'In Active' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.status, { backgroundColor: colors.dullYellow, marginRight: 10 }]}
                      onPress={() => navigation.navigate('Edit sub service', {
                        sub_service: sub_service,
                        type: 'subService'
                      })}
                    >
                      <Text style={styles.statusText}>{t('screens:edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.status, { backgroundColor: colors.dangerRed,marginRight:8 }]}
                      onPress={() => removeSubService('subService', sub_service?.provider_sub_list?.id, sub_service.id)}
                    >
                      <Text style={styles.statusText}>{t('screens:delete')}</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        );
      } else if (provider_sub_service) {
        return (
          <TouchableOpacity
            style={containerStyle}
            onPress={() => navigation.navigate('View sub service', {
              providerSubService: provider_sub_service,
              type: 'providerSubService'
            })}
          >
            <Text style={styles.category}>
              {provider_sub_service.name} {' '}
              <Text style={{ color: provider_sub_service?.status === 'Pending' ? 'orange' : provider_sub_service?.status === 'Rejected' ? 'red' : 'green' }}>
                {provider_sub_service?.status.toLowerCase() === 'pending' ? t('screens:listInactive') :
                  provider_sub_service?.status.toLowerCase() === 'rejected' ? t('screens:listRejected') :
                    provider_sub_service?.status.toLowerCase() === 'accepted' ? t('screens:listAccepted') :
                      ''}
              </Text>
            </Text>
            <View style={styles.descBtnsContainer}>
              <Text style={styles.description}>
                {provider_sub_service.description}
              </Text>
              <View style={styles.btnContainer}>
                {provider_sub_service?.status === 'Pending' || provider_sub_service?.status === 'Accepted' ? (
                  <TouchableOpacity
                    style={[styles.status, { backgroundColor: colors.dullYellow, marginRight: 10 }]}
                    onPress={() => navigation.navigate('Edit sub service', {
                      providerSubService: provider_sub_service,
                      type: 'providerSubService'
                    })}
                  >
                    <Text style={styles.statusText}>{t('screens:edit')}</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[styles.status, { backgroundColor: colors.dangerRed }]}
                  onPress={() => removeSubService('providerSubService', provider_sub_service?.provider_sub_list?.id, provider_sub_service.id)}
                >
                  <Text style={styles.statusText}>{t('screens:delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      } else {
        return <View />;
      }
    };
    


  return (
    <View style={[stylesGlobal.scrollBg, { flex: 1 }]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {message?(  <BasicView style={[stylesGlobal.centerView, { flex: 1 }]}>
          <Text style={stylesGlobal.errorMessage}>{message}</Text>
        </BasicView>):(<></>)}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.mainContentContainer}>
  <Image
    source={{ uri: service.img_url || (service?.service?.images[0]?.img_url) }}
    style={styles.image}
  />
  <Text style={[styles.category,{color:isDarkMode ? colors.white : colors.darkGrey}]}>
  {' '} <Icon name="business" size={20} color={isDarkMode ? colors.white : colors.darkGrey} />
    {selectedLanguage === 'en' ? service?.service?.name?.en : service?.service?.name?.sw}
  </Text>
  {/* <Text style={[styles.service,{color:isDarkMode ? colors.white : colors.darkGrey}]}>
    {selectedLanguage === 'en' ? service?.service?.category?.name?.en : service?.service?.category?.name?.sw}
  </Text> */}
  <Text style={[styles.description,{color:isDarkMode ? colors.white : colors.darkGrey}]}>
    {service.description == null ? selectedLanguage === 'en' ? service?.service?.description?.en : service.service.description?.sw : service.description}
  </Text>
  {service?.video_url ? (
    <TouchableOpacity style={styles.viewVideo} onPress={toggleVideoModal}>
      <Text style={styles.videoText}>{t('screens:video')}</Text>
    </TouchableOpacity>
  ) : null}
  <TouchableOpacity style={styles.status} onPress={handlePresentModalPress}>
    <Text style={styles.statusText}>{t('screens:subServices')}</Text>
  </TouchableOpacity>
</View>

        </ScrollView>

        <BottomSheetModalProvider>
          <View style={styles.bottomSheetContainer}>
            <BottomSheetModal
             backgroundComponent={CustomBackground}
              ref={bottomSheetModalRef}
              index={1}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}
            >
              <BottomSheetScrollView style={styles.bottomSheetContentContainer}>
                {subservices.map(sub_service => (
                  <ServicesOffered key={sub_service.id} sub_service={sub_service} />
                ))}
                {providerSubServices?.map(provider_sub_service => (
                  <ServicesOffered key={provider_sub_service.id} provider_sub_service={provider_sub_service} />
                ))}
              </BottomSheetScrollView>

              {user.provider && user.status !== 'In Active' ? (
                <FloatBtn
                  onPress={() => {
                    navigation.navigate('Add Sub Service', {
                      business: service,
                      sub_services: subservices
                    });
                  }}
                  iconType='add'
                />
              ) : null}
            </BottomSheetModal>
          </View>
        </BottomSheetModalProvider>

        <View style={{
          backgroundColor: isDarkMode ? colors.black : colors.white,
          height: 100,
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
          position: 'absolute',
        }}>
          {user.provider && user.status !== 'In Active' ? (
            <>
              <TouchableOpacity
                onPress={() => navigation.navigate('Add Business', {
                  business: service,
                  sub_services: subservices
                })}
                style={{
                  backgroundColor: colors.warningYellow,
                  borderRadius: 20,
                  justifyContent: 'center',
                  padding: 20
                }}
              >
                <Text style={{ color: colors.white }}>{t('screens:edit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeBusiness(service.id)}
                style={{
                  backgroundColor: colors.dangerRed,
                  borderRadius: 20,
                  justifyContent: 'center',
                  padding: 20
                }}
              >
                <Text style={{ color: colors.white }}>{t('screens:delete')}</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        <Modal visible={isVideoModalVisible}>
          <View style={[styles.videoModalContainer,{backgroundColor:isDarkMode?colors.darkModeBackground:colors.white}]}>
            <TouchableOpacity onPress={toggleVideoModal}>
              <Text style={[styles.closeButton,{color:isDarkMode?colors.white:colors.secondary}]}>{t('screens:close')}</Text>
            </TouchableOpacity>
            <VideoPlayer video_url={`${service?.video_url}`} />
          </View>
        </Modal>
      </GestureHandlerRootView>
    </View>


  );
};

const styles = StyleSheet.create({
  mainContentContainer: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  image: {
    resizeMode: 'cover',
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 10,
  },
  bottomSheetContainer: {
    zIndex: 1000
  },
  description: {
    fontFamily: 'Prompt-Regular',
    color: colors.alsoGrey,
    fontSize: 14,
  },
  bottomSheetContentContainer: {
    padding: 10,
    borderRadius: 10,
  },
  category: {
    fontFamily: 'Prompt-SemiBold',
    color: colors.secondary,
    fontSize: 15,
  },
  statusText: {
    fontFamily: 'Prompt-Regular',
    color: colors.white,
    fontSize: 13,
  },
  service: {
    fontFamily: 'Prompt-Regular',
    paddingTop: 5,
    color: colors.black,
    fontSize: 14,
  },
  status: {
    alignSelf: 'flex-end',
    backgroundColor: colors.secondary,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 3,
  },
  descBtnsContainer: {
    marginTop: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  backgroundVideo: {
    height: 200,
    width: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  sub_div: {
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 2,
  },
  viewVideo: {
    marginVertical: 15,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    elevation: 3,
    borderRadius: 25,
    paddingVertical: 10,
  },
  videoText: {
    fontFamily: 'Prompt-Regular',
    fontSize: 18,
    color: colors.white,
  },
  videoModalContainer: {
    flex:1,
    padding: 20,
    borderRadius: 15,
    justifyContent: 'center',

  },
  closeButton: {
    fontFamily: 'Prompt-Regular',
    fontSize: 18,
    alignSelf:'center',
    marginBottom: 30,
  },
});


export default BusinessDetails;
