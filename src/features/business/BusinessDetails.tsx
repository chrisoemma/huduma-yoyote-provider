import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ToastAndroid,ScrollView, SafeAreaView } from 'react-native';
import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView,  } from 'react-native-gesture-handler';
import { colors } from '../../utils/colors';
import { globalStyles } from '../../styles/global';
import FloatBtn from '../../components/FloatBtn';
import { useSelector, RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { useTranslation } from 'react-i18next';
import { deleteBusiness } from './BusinessSlice';
import Video, { VideoRef } from 'react-native-video';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { BasicView } from '../../components/BasicView';
import { deleteSubService, getBusinessSubservices } from '../subservices/SubservicesSlice';
import VideoPlayer from '../../components/VideoPlayer';
import Orientation from 'react-native-orientation-locker';

const BusinessDetails = ({ route, navigation }: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const videoRef = useRef<VideoRef>(null);

  const snapPoints = useMemo(() => ['25%', '95%'], []);

  const [isPaused, setPaused] = useState(true)

  const { service } = route.params;


  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const stylesGlobal = globalStyles();

  const { loading, subservices } = useSelector(
    (state: RootStateOrAny) => state.subservices,
  );

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );


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
                ToastAndroid.show(`${t('screens:deletedSuccessfully')}`, ToastAndroid.SHORT);
                navigation.navigate('My Businesses', {
                  screen: 'My Businesses',
                });
              } else {
                setDisappearMessage(
                  `${t('screens:requestFail')}`,
                );
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



  const removeSubService = (id) =>
    Alert.alert(`${t('screens:deleteSubService')}`, `${t('screens:areYouWantToDelete')}`, [
      {
        text: `${t('screens:cancel')}`,
        onPress: () => console.log('Cancel subservice delete'),
        style: 'cancel',
      },
      {
        text: `${t('screens:ok')}`,
        onPress: () => {

          dispatch(deleteSubService({ providerId: user.provider.id, subServiceId: id }))
            .unwrap()
            .then(result => {
              if (result.status) {
                ToastAndroid.show(`${t('screens:deletedSuccessfully')}`, ToastAndroid.SHORT);
                navigation.navigate('My Businesses', {
                  screen: 'My Businesses',
                });
              } else {
                setDisappearMessage(
                  `${t('screens:requestFail')}`,
                );
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

  const ServicesOffered = ({ sub_service }: any) => {


    return (
      <View
        key={sub_service?.id}
      >
        <Text style={styles.category}>{sub_service?.name}</Text>
        <View style={styles.descBtnsContainer}>
          <View><Text style={{ color: colors.alsoGrey }}>{sub_service?.description}</Text></View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={[styles.status, { backgroundColor: colors.dullYellow, marginRight: 10 }]} onPress={handlePresentModalPress}>
              <Text style={{ color: colors.white }}>{t('screens:edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.status, { backgroundColor: colors.dangerRed }]} onPress={() => removeSubService(sub_service?.id)}>
              <Text style={{ color: colors.white }}>{t('screens:delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={[stylesGlobal.scrollBg,{flex:1,height:'100%'}]}>
        <View>
        <GestureHandlerRootView>
        <BasicView style={stylesGlobal.centerView}>
          <Text style={stylesGlobal.errorMessage}>{message}</Text>
        </BasicView>

        <View style={styles.mainContentContainer}>
          <View>
            <Image
              source={{ uri: service.img_url || (service?.service?.images[0]?.img_url) }}
              style={{
                resizeMode: 'cover',
                width: '100%',
                height:320,
                borderRadius: 10,
              }}
            />
            <Text style={styles.category}>{service.service.name}</Text>
            <Text style={styles.service}>{service.service.category.name}</Text>
            <Text style={{ color: colors.alsoGrey }}>
              {service.description == null ? service.service.description : service.description}
            </Text>
            <View>
           
              {service?.video_url ?  <View>
              <VideoPlayer
              video_url={`${service.video_url}`} 
              />
            </View>:<></>}
           
            </View>
            <TouchableOpacity style={styles.status} onPress={handlePresentModalPress}>
              <Text style={{ color: colors.white }}>{t('screens:subServices')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <BottomSheetModalProvider>
          <View style={styles.bottomSheetContainer}>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={1}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}
            >
              <BottomSheetScrollView style={styles.bottomSheetContentContainer}>
                {
                  subservices?.map(sub_service => (

                    <ServicesOffered sub_service={sub_service} />

                  ))
                }

              </BottomSheetScrollView>

              <FloatBtn
                onPress={() => {
                  navigation.navigate('Add Sub Service', {
                    business: service,
                    sub_services: subservices
                    //there is a confusin here the business(Service) variable get  list of
                    // one business and  it subservice sub_services 
                    //While Logical for the system a Business is a service

                  })
                }
                }
                iconType='add'
              />
            </BottomSheetModal>
          </View>
        </BottomSheetModalProvider>

        
        </GestureHandlerRootView>
        <View style={{
        backgroundColor: isDarkMode ? colors.black : colors.white, height: 100,
        flexDirection: 'row',
      //  flex:1,
        justifyContent: 'space-between',
        padding: 20,
      }}>
        <>
          <TouchableOpacity
            onPress={() => navigation.navigate('Add Business', {
              business: service,
              sub_services: subservices
            })}
            style={{
              backgroundColor: colors.warningYellow, borderRadius: 20,
              justifyContent: 'center',
              padding: 20
            }}>
            <Text style={{ color: colors.white }}>{t('screens:edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeBusiness(service.id)}
            style={{
              backgroundColor: colors.dangerRed, borderRadius: 20,
              justifyContent: 'center',
              padding: 20
            }}>
            <Text style={{ color: colors.white }}>{t('screens:delete')}</Text>
          </TouchableOpacity>
        </>
      </View>
        </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  mainContentContainer: {

    margin: 15,
    backgroundColor: 'white',
   // height: '75%',
    padding: 10,
    borderRadius: 10,
  },
  bottomSheetContainer: {
   // flex: 1,
    margin: 10,
    zIndex: 1000
  },
  bottomSheetContentContainer: {
   // flex:1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  category: {
    textTransform: 'uppercase',
    color: colors.secondary,
    marginTop: 15,
  },
  service: {
    paddingTop: 5,
    fontWeight: 'bold',
    color: colors.black,
  },
  status: {
    alignSelf: 'flex-end',
    backgroundColor: colors.secondary,
    margin:10,
    padding: 10,
    borderRadius: 10,
  },
  descBtnsContainer: {
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
});

export default BusinessDetails;
