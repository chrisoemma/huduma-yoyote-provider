import { View, Text, SafeAreaView, Image, Alert, ToastAndroid, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { globalStyles } from '../../styles/global';
import { colors } from '../../utils/colors';
import { breakTextIntoLines, makePhoneCall, getStatusBackgroundColor, combineSubServices } from '../../utils/utilts';
import Divider from '../../components/Divider';
import Icon from 'react-native-vector-icons/AntDesign';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { deleteEmployee, getEmployeeRequests } from './EmployeeSlice';
import { useAppDispatch } from '../../app/store';
import { BasicView } from '../../components/BasicView';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../../costants/languangeSlice';
import ToastNotification from '../../components/ToastNotification/ToastNotification';


const EmployeeAccount = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const employee = route.params?.employee;

  const stylesGlobal = globalStyles();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  const { employee_requests } = useSelector(
    (state: RootStateOrAny) => state.employees,
  );

  const getStatusTranslation = (status: string) => {
    return t(`screens:${status}`);
  };

  useEffect(() => {
    dispatch(getEmployeeRequests({ employeeId: employee?.id }));
  }, [])

  const phoneNumber = `${employee.phone}`;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [message, setMessage] = useState("")

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);


  const snapPoints = useMemo(() => ['25%', '95%'], []);


  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const selectedLanguage = useSelector(selectLanguage);

  const ServicesOffered = ({ request }: any) => {

    const request_status = request?.statuses[request?.statuses.length - 1].status;

    const subServices = combineSubServices(request);

    const maxItemsToShow = 4;
    return (
      <View style={styles.requestContainer}
        key={request?.request_id}
      >
        <View style={styles.descContainer}>
          <Text style={styles.category}>{selectedLanguage==='en'?request?.service?.name.en:request?.service?.name?.sw}</Text>
          <View><Text style={{ color: colors.alsoGrey }}>{selectedLanguage==='en'?request?.service?.description?.en:request?.service?.description?.sw}</Text></View>
          {subServices.slice(0, maxItemsToShow)?.map((subService, index) => (
            <Text style={{ color: isDarkMode ? colors.white : colors.darkGrey }} key={subService.id}>
              - {subService?.provider_sub_list?.name || selectedLanguage==='en'? subService?.sub_service?.name?.en: subService?.sub_service?.name?.sw || subService?.provider_sub_service?.name}
            </Text>
          ))}
        </View>
        <TouchableOpacity style={[styles.status, { backgroundColor: getStatusBackgroundColor(request_status) }]}>
          <Text style={{ color: colors.white }}>{getStatusTranslation(request_status)}</Text>
        </TouchableOpacity>
        <Divider />
      </View>

    )
  }

  const deleteFunc = (id) =>
    Alert.alert(`${t('screens:deleteEmployee')}`, `${t('screens:areYouWantToDelete')}`, [
      {
        text: `${t('screens:cancel')}`,
        onPress: () => console.log('Cancel task delete'),
        style: 'cancel',
      },
      {
        text: `${t('screens:ok')}`,
        onPress: () => {

          dispatch(deleteEmployee({ employeeId: id }))
            .unwrap()
            .then(result => {
              if (result.status) {
                ToastNotification(`${t('screens:deletedSuccessfully')}`,'success','long')
                
                navigation.navigate('Employees', {
                  screen: 'Employees',
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

  return (
    <SafeAreaView
      style={stylesGlobal.scrollBg}
    >
      <View style={stylesGlobal.appView}>

        <BasicView style={stylesGlobal.centerView}>
          <Text style={stylesGlobal.errorMessage}>{message}</Text>
        </BasicView>

        <View style={styles.btnView}>
          <TouchableOpacity style={{ marginRight: 10, alignSelf: 'flex-end' }}
            onPress={() => { deleteFunc(employee.id) }}
          >
            <Icon
              name="delete"
              color={colors.dangerRed}
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginRight: 10, alignSelf: 'flex-end' }}
            onPress={() => {
              navigation.navigate('Add Employees', {
                employee: employee
              })
            }}
          >
            <Icon
              name="edit"
              color={isDarkMode ? colors.white : colors.black}
              size={25}
            />
          </TouchableOpacity>
        </View>

        <View style={[stylesGlobal.circle, { backgroundColor: colors.white, marginTop: 15, alignContent: 'center', justifyContent: 'center' }]}>
          <Image
            source={
              employee?.profile_img?.startsWith('https://')
                ? { uri: employee.profile_img }
                : employee?.user_img?.startsWith('https://')
                  ? { uri: employee.user_img }
                  : require('./../../../assets/images/profile.png')
            }
            style={{
              resizeMode: "cover",
              width: 90,
              height: 95,
              borderRadius: 90,
              alignSelf: 'center'
            }}
          />
        </View>
        <Text style={{ color: isDarkMode ? colors.white : colors.black,  fontFamily: 'Prompt-Bold', alignSelf: 'center' }}>{employee.name}</Text>
        <View style={{marginLeft:10}}>
        <Text style={{color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold'}}>{t('screens:accountNumber')}</Text>
        <Text style={{color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Regular'}}>#{employee?.user?.reg_number}</Text>

        <Text style={{color: isDarkMode ? colors.white : colors.black, fontFamily: 'Prompt-Bold',}}>{t('auth:phone')}</Text>
          <TouchableOpacity style={{ flexDirection: 'row', marginBottom: 10 }}
            onPress={() => makePhoneCall(phoneNumber)}
          >
            <Icon
              name="phone"
              color={isDarkMode ? colors.white : colors.black}
              size={25}
            />
            <Text style={{ paddingHorizontal: 10, color: isDarkMode ? colors.white : colors.black,fontFamily: 'Prompt-Regular' }}>{employee.phone}</Text>
          </TouchableOpacity>
          
               <Text style={{color: isDarkMode ? colors.white : colors.black,fontFamily: 'Prompt-Bold'}}>{t('auth:nida')}</Text>

               <TouchableOpacity style={{ flexDirection: 'row' }}
               >
                 <Icon
                   name="infocirlce"
                   color={isDarkMode ? colors.white : colors.black}
                   size={25}
                 />
                  <Text style={{color: isDarkMode ? colors.white : colors.black,fontFamily: 'Prompt-Regular' }}>{employee?.nida}</Text>
               </TouchableOpacity>
           
        </View>
        <View style={{ marginVertical: 20 }}>
          <Divider />
        </View>
        <TouchableOpacity style={styles.status} onPress={handlePresentModalPress}>
          <Text style={{ color: colors.white,fontFamily: 'Prompt-Regular' }}>{t('screens:requests')}</Text>
        </TouchableOpacity>
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
                  employee_requests?.map(request => (

                    <ServicesOffered request={request}  />

                  ))
                }
              </BottomSheetScrollView>

            </BottomSheetModal>
          </View>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainContentContainer: {
    margin: 15,
    backgroundColor: 'white',
    height: '60%',
    padding: 10,
    borderRadius: 10,
  },
  btnView: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
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
  descContainer: {
    marginBottom: 8
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  requestContainer: {
    justifyContent: 'space-between'
  }
});

export default EmployeeAccount