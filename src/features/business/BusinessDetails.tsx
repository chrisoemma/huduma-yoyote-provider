import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ToastAndroid, SafeAreaView } from 'react-native';
import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../../utils/colors';
import { globalStyles } from '../../styles/global';
import FloatBtn from '../../components/FloatBtn';
import { useSelector, RootStateOrAny } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { useTranslation } from 'react-i18next';
import { deleteBusiness, getBusiness } from './BusinessSlice';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { BasicView } from '../../components/BasicView';
import { deleteSubService } from '../subservices/SubservicesSlice';

const BusinessDetails = ({ route, navigation }: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['25%', '95%'], []);

  const { service } = route.params;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { user } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const { loading, business } = useSelector(
    (state: RootStateOrAny) => state.businesses,
  );

  const [message, setMessage] = useState(null)

  useEffect(() => {
    dispatch(getBusiness({ providerId: user?.provider?.id, serviceId: service.id }));
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
      <View style={styles.serviceContainer}
        key={sub_service?.id}
      >
        <Text style={styles.category}>{sub_service?.name}</Text>
        <View style={styles.descBtnsContainer}>
          <View><Text>{sub_service?.description}</Text></View>
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
    <View style={[globalStyles.scrollBg, { flex: 1 }]}>

      <BasicView style={globalStyles.centerView}>
        <Text style={globalStyles.errorMessage}>{message}</Text>
      </BasicView>

      <TouchableOpacity style={{ marginRight: '10%', justifyContent: 'flex-end', alignSelf: 'flex-end' }}>
        <Menu>
          <MenuTrigger style={{ backgroundColor: colors.alsoLightGrey }}>
            <Text style={{ padding: 5, fontWeight: 'bold' }} >{t('screens:action')}</Text>
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => navigation.navigate('Add Business', {
              business: service,
              sub_services: business
            })} >
              <Text style={{ color: colors.warningYellow }}>{t('screens:edit')}</Text>
            </MenuOption>
            <MenuOption onSelect={() => removeBusiness(service.id)} >
              <Text style={{ color: colors.dangerRed }}>{t('screens:delete')}</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </TouchableOpacity>

      <View style={styles.mainContentContainer}>
        <View>
          <Image
            source={{ uri: service?.service?.images[0].img_url }}
            style={{
              resizeMode: 'cover',
              width: '100%',
              height: '55%',
              borderRadius: 10,
            }}
          />
          <Text style={styles.category}>{service.service.name}</Text>
          <Text style={styles.service}>{service.service.category.name}</Text>
          <Text>
            {service.description == null ? service.service.description : service.description}
          </Text>
          <TouchableOpacity style={styles.status} onPress={handlePresentModalPress}>
            <Text style={{ color: colors.white }}>{t('screens:subServices')}</Text>
          </TouchableOpacity>
        </View>

      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
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
                  business.map(sub_service => (

                    <ServicesOffered sub_service={sub_service} />

                  ))
                }

              </BottomSheetScrollView>

            </BottomSheetModal>
          </View>

          <FloatBtn
            onPress={() => {
              navigation.navigate('Add Sub Service', {
                business: service,
                sub_services: business
                //there is a confusin here the business(Service) variable get  list of
                // one business and  it subservice sub_services 
                //While Logical for the system a Business is a service

              })
            }
            }
            iconType='add'
          />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>

    </View>

  );
};

const styles = StyleSheet.create({
  mainContentContainer: {

    margin: 15,
    backgroundColor: 'white',
    height: '48%',
    padding: 10,
    borderRadius: 10,
  },
  bottomSheetContainer: {
    // flex: 1,
    margin: 10,
    zIndex: 1000
  },
  bottomSheetContentContainer: {
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
    padding: 10,
    borderRadius: 10,
  },
  descBtnsContainer: {
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

export default BusinessDetails;
