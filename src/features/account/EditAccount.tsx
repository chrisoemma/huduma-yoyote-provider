import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';


import { useForm, Controller } from 'react-hook-form';
import { RootStateOrAny, useSelector } from 'react-redux';
import { globalStyles } from '../../styles/global';
import PhoneInput from 'react-native-phone-number-input';
import { colors } from '../../utils/colors';
import { BasicView } from '../../components/BasicView';
import { TextInputField } from '../../components/TextInputField';
import { useAppDispatch } from '../../app/store';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';
import { useTranslation } from 'react-i18next';
import { updateProviderInfo } from '../auth/userSlice';
import { formatErrorMessages, showErrorWithLineBreaks, transformDataToDropdownOptions, validateNIDANumber, validateTanzanianPhoneNumber } from '../../utils/utilts';
import Location from '../../components/Location';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import GooglePlacesInput from '../../components/GooglePlacesInput';
import DropDownPicker from 'react-native-dropdown-picker';
import { getProfessions } from '../professionsSlice';
import ToastMessage from '../../components/ToastMessage';
import ToastNotification from '../../components/ToastNotification/ToastNotification';

const EditAccount = ({
  route,
  navigation,

}: any) => {

  const WIDTH = Dimensions.get("window").width;


  const dispatch = useAppDispatch();
  const { user, residence, loading, status } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const phoneInput = useRef<PhoneInput>(null);

  const [location, setLocation] = useState({} as any);

  const [message, setMessage] = useState('');

  const { t } = useTranslation();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  const { professions, profesionsLoading } = useSelector(
    (state: RootStateOrAny) => state.professions,
  );
   
  const { selectedLanguage } = useSelector(
    (state: RootStateOrAny) => state.language,
  );

  const { provider, employee } = route.params

  const [birthdate, setBirthdate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedYear, setSelectedYear] = useState(birthdate?.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(birthdate?.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(birthdate?.getDate());
  const [nidaError, setNidaError] = useState('');

  const [regionValue, setRegionValue] = useState(null);
  const [districtValue, setDistrictValue] = useState(null);
  const [wardValue, setWardValue] = useState(null);
  const [streetValue, setStreetValue] = useState(null);
  //const [nidaLoading, setNidaLoading] = useState(false)

  const [open, setOpen] = useState(false);
  const [DropDownvalue, setDropDownValue] = useState([])
  const [designationError, setDesignationError] = useState('')
  const [workingLocation,setWorkingLocation]=useState(null)

  const [gLocation, setGLocation] = useState({})


  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const stylesGlobal = globalStyles();

  const handleConfirm = (date) => {

    setBirthdate(date);
    setSelectedYear(date?.getFullYear());
    setSelectedMonth(date?.getMonth() + 1);
    setSelectedDay(date?.getDate());
    hideDatePicker();
  };

    

  useEffect(() => {
    if(user?.provider){
    dispatch(getProfessions({ language: selectedLanguage }));
  }
  }, [selectedLanguage])
   

  const selectLocation = (locationSelected: any) => {
    console.log('Location selected ::');
    console.log(locationSelected);
    setLocation(locationSelected);
  };

  
  useEffect(() => {
    const cleanedPhone = user?.phone?.replace(/\+/g, '');
    const latitudeData = user.provider ? parseFloat(user?.provider?.latitude) : parseFloat(user?.employee?.latitude)
    const longitudeData = user.provider ? parseFloat(user?.provider?.longitude) : parseFloat(user?.employee?.longitude);

    setWorkingLocation({latitude:latitudeData,longitude:longitudeData});

    if (user?.provider) {
      setValue('name', provider?.name);
      setValue('first_name', provider?.first_name);
      setValue('last_name', provider?.last_name);
      setValue('phone', cleanedPhone);
      setValue('email', user?.email);
      setValue('nida', user?.nida);
      setValue('business_name', user?.provider.business_name);
      setGLocation({latitude:latitudeData,longitude:longitudeData})

      const birthdate = user?.birth_date;
      const parsedDate = birthdate ? new Date(birthdate) : null;
      const formattedDate = parsedDate ? new Date(parsedDate.toISOString()) : null;
      setBirthdate(formattedDate);
      setDropDownValue(JSON.stringify(user?.provider?.designation_id))
    } else {
      setValue('name', user.employee?.name);
      setValue('phone', cleanedPhone);
      setValue('email', user?.email);
      setValue('nida', user.employee?.nida);
    }

  }, [route.params]);



  const lastNidaStatus = user?.provider?.nida_statuses?.[user?.provider?.nida_statuses.length - 1]?.status;

  const finalRegionValue = (value) => {
    setRegionValue(value)
  }

  const finalDistrictValue = (value) => {
    setDistrictValue(value)
  }

  const finalWardValue = (value) => {
    setWardValue(value)
  }

  const finalStreetValue = (value) => {
    setStreetValue(value)
  }

  const getRegionValue = (regionValue) => {
    if (regionValue !== null) {
      finalRegionValue(regionValue)
    }
  }

  const getDistrictValue = (districtValue) => {
    finalDistrictValue(districtValue)
  }

  const getWardValue = (wardValue) => {
    finalWardValue(wardValue)
  }
  const getStreetValue = (streetValue) => {
    finalStreetValue(streetValue || '')
  }
  // const getStreetInput = ({ inputStreetValue }: any) => {
  //   finalInputStreetValue(inputStreetValue || '' )
  // }



  useEffect(() => {
    if (status !== '') {
      setMessage(status);
    }
  }, [status]);

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: '',
      email: '',
      name: '',
      first_name: '',
      last_name: '',
      nida: '',
      business_name: ''
    },
  });

  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };


  const [toastMessage, setToastMessage] = useState(''); // State for toast message content
  const [showToast, setShowToast] = useState(false); // State to control visibility of toast message

  // Function to toggle visibility of toast message
  const toggleToast = () => {
    setShowToast(!showToast);
  };

  // Function to show the toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    toggleToast(); 
    setTimeout(() => {
      toggleToast(); 
    }, 5000); 
  };


  const updateProvider = (data: any) => {
    const userType = user.provider !== null ? 'provider' : 'employee';
  
    dispatch(updateProviderInfo({ data: data, userType: userType, userId: user?.id }))
      .unwrap()
      .then(result => {
        if (result.status) {
    
          ToastNotification(`${t('screens:updatedSuccessfully')}`,'success','long')
          navigation.navigate('Account', {
            screen: 'Account',
            message: message
          });
        } else {
          // Handle errors based on what is returned from the server
          if (result.error) {
            // Show the error message received from the server
            showToastMessage(result.error);
            setShowToast(true);
           // showToastMessage(t('screens:errorOccured'));
          } else {
            // Fallback for any other messages
            setDisappearMessage(result.message);
            setShowToast(true);
            showToastMessage(t('screens:errorOccured'));
          }
        }
      })
      .catch(error => {
        // Catch any unexpected errors
        console.error('Error updating provider:', error);
        setShowToast(true);
        showToastMessage(t('screens:errorOccured'));
      });
  };
  


  const onSubmit = async (data: any) => {


    if (Object.keys(location).length === 0) {

      data.latitude = user?.provider.latitude;
      data.longitude = user.provider.longitude;
    } else {
      data.latitude = location.lat;
      data.longitude = location.lng;
    }

   const currentDesignationId = parseInt(user?.provider?.designation_id);
    const selectedDesignationId = parseInt(DropDownvalue);
  
    if (user?.provider && currentDesignationId !== selectedDesignationId) {
      Alert.alert(
         t('screens:professionChange'), 
          t('screens:changeProfessionBody'),
        [
          {
            text: t('screens:cancel'),
            onPress: () => console.log('Profession change canceled'),
            style: 'cancel',
          },
          {
            text: t('screens:ok'),
            onPress: async () => {
              data.phone = validateTanzanianPhoneNumber(data.phone);
              if (user?.provider) {
                data.birth_date = birthdate;
                data.designation_id = selectedDesignationId;
                data.location_id = streetValue;
              }
  
              try {
              const respose=  updateProvider(data);

              console.log('respose344',respose);

              } catch (error) {
                console.error('Error validating NIDA:', error);
                setShowToast(true);
                showToastMessage(t('screens:errorOccured'));
              }
            },
          },
        ],
        { cancelable: false }
      );
      return;
    }

    data.phone = validateTanzanianPhoneNumber(data.phone);
    if(user?.provider){
    data.birth_date = birthdate;
    data.designation_id = DropDownvalue;
    data.location_id = streetValue
    }
    // Check if the NIDA number has changed
    if (user?.nida === data.nida) {
      updateProvider(data);
      return;
    }
    //setNidaLoading(true);
    try {
     // const nidaValidationResult = await validateNIDANumber(data.nida);
     // setNidaLoading(false);
      setShowToast(false)
      //if (!nidaValidationResult.obj.error || nidaValidationResult.obj.error.trim() === '') {
     
        updateProvider(data);
      // } else {
      //   setNidaError(t('auth:nidaDoesNotExist'));
      //   setShowToast(true)
      //   showToastMessage(t('screens:errorOccured'));
      // }
    } catch (error) {
     // console.error('Error validating NIDA:', error);
      setShowToast(true)
      showToastMessage(t('screens:errorOccured'));
      // setNidaLoading(false);
      // setNidaError(t('auth:errorValidatingNIDA'));
    }
  };




  // const onSubmit = async (data: any) => {
  //   if (Object.keys(location).length === 0) {
  //     data.latitude = user?.provider.latitude;
  //     data.longitude = user.provider.longitude;
  //   } else {
  //     data.latitude = location.lat;
  //     data.longitude = location.lng;
  //   }
  
  //   const currentDesignationId = parseInt(user?.provider?.designation_id);
  //   const selectedDesignationId = parseInt(DropDownvalue);
  
  //   if (user?.provider && currentDesignationId !== selectedDesignationId) {
  //     Alert.alert(
  //       'Profession Change',
  //       'You are about to change your profession. Do you want to continue?',
  //       [
  //         {
  //           text: 'Cancel',
  //           onPress: () => console.log('Profession change canceled'),
  //           style: 'cancel',
  //         },
  //         {
  //           text: 'OK',
  //           onPress: async () => {
  //             data.phone = validateTanzanianPhoneNumber(data.phone);
  //             if (user?.provider) {
  //               data.birth_date = birthdate;
  //               data.designation_id = selectedDesignationId;
  //               data.location_id = streetValue;
  //             }
  
  //             try {
  //               updateProvider(data);
  //             } catch (error) {
  //               console.error('Error validating NIDA:', error);
  //               setShowToast(true);
  //               showToastMessage(t('screens:errorOccured'));
  //             }
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //     return;
  //   }
  
  //   data.phone = validateTanzanianPhoneNumber(data.phone);
  //   if (user?.provider) {
  //     data.birth_date = birthdate;
  //     data.designation_id = selectedDesignationId;
  //     data.location_id = streetValue;
  //   }
  
  //   try {
  //     updateProvider(data);
  //   } catch (error) {
  //     console.error('Error validating NIDA:', error);
  //     setShowToast(true);
  //     showToastMessage(t('screens:errorOccured'));
  //   }
  // };
  



  return (

    <SafeAreaView style={[stylesGlobal.scrollBg]}>

{showToast && <View style={{marginBottom:'20%'}}>
   <ToastMessage message={toastMessage} onClose={toggleToast} />
   </View>}
      <ScrollView contentInsetAdjustmentBehavior="automatic">
      
        <View>
          <BasicView style={stylesGlobal.centerView}>
            <Text style={stylesGlobal.errorMessage}>{message}</Text>
          </BasicView>

          <BasicView>
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop20,
              ]}>
              {t('auth:phone')}
            </Text>

            <Controller
              control={control}
              rules={{
                minLength: 10,
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  placeholderTextColor={colors.alsoGrey}
                  placeholder={t('screens:enterPhone')}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    // Remove any non-numeric characters
                    const cleanedText = text.replace(/\D/g, '');


                    if (cleanedText.startsWith('0') && cleanedText.length <= 10) {
                      onChange(cleanedText);
                    } else if (
                      (cleanedText.startsWith('255') ||
                        cleanedText.startsWith('+255')) &&
                      cleanedText.length <= 12
                    ) {
                      onChange(cleanedText);
                    }
                  }}
                  value={value}
                  keyboardType="phone-pad"
                  editable={!user?.phone_verified_at}
                  

                />
              )}
              name="phone"
            />
            {errors.phone && (
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:phoneRequired')}
              </Text>
            )}
          </BasicView>

          {user?.provider !== null ? (
            <>
              <BasicView>
                <Text
                  style={[
                    stylesGlobal.inputFieldTitle,
                    stylesGlobal.marginTop20,
                  ]}>
                  {t('auth:firstName')}
                </Text>

                <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInputField
                      placeholderTextColor={colors.alsoGrey}
                      placeholder={t('auth:enterFirstName')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="first_name"
                />

                {errors.first_name && (
                  <Text style={stylesGlobal.errorMessage}>
                    {t('auth:firstNameRequired')}
                  </Text>
                )}
              </BasicView>

              <BasicView>
                <Text
                  style={[
                    stylesGlobal.inputFieldTitle,
                    stylesGlobal.marginTop20,
                  ]}>
                  {t('auth:lastName')}
                </Text>

                <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInputField
                      placeholderTextColor={colors.alsoGrey}
                      placeholder={t('auth:enterLastName')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="last_name"
                />

                {errors.last_name && (
                  <Text style={stylesGlobal.errorMessage}>
                    {t('auth:lastNameRequired')}
                  </Text>
                )}
              </BasicView>
            </>
          ) : (

            <BasicView>
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
                {t('auth:name')}
              </Text>

              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInputField
                    placeholderTextColor={colors.alsoGrey}
                    placeholder={t('auth:enterName')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="name"
              />

              {errors.name && (
                <Text style={stylesGlobal.errorMessage}>
                  {t('auth:nameRequired')}
                </Text>
              )}
            </BasicView>

          )}

          <BasicView>
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop20,
              ]}>
              {t('auth:email')}
            </Text>

            <Controller
              control={control}
              rules={{

                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Regular expression for email validation
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  placeholderTextColor={colors.alsoGrey}
                  placeholder={t('screens:enterEmail')}
                  onBlur={onBlur}
                  keyboardType='email-address'
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="email"
            />
            {errors.email && (
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:emailRequired')}
              </Text>
            )}
          </BasicView>

          <BasicView>
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop20,
              ]}>
              {t('auth:nida')}
            </Text>

            <Controller
              control={control}
              rules={{
                required: true,
                validate: (value) => {
                  if (value.length !== 20) {
                    return false;
                  }
                  setNidaError('');
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  placeholderTextColor={colors.alsoGrey}
                  placeholder={t('auth:enterNida')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType='numeric'
                  editable={lastNidaStatus=='A.Valid'?false:true}
                />
              )}
              name="nida"
            />
            {errors.nida && (
                
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:nidaRequired')}
              </Text>
            )}
            {nidaError && (
              <Text style={stylesGlobal.errorMessage}>
                {nidaError}
              </Text>
            )}
          </BasicView>

         {user?.provider ?(
          <>
          <BasicView style={stylesGlobal.marginTop20}>
            <Button onPress={showDatePicker}>
              <ButtonText >{t('screens:selectBirthDate')}</ButtonText>
            </Button>

            <TextInput
              value={
                birthdate ?
                  `${birthdate.getFullYear()}-${(birthdate.getMonth() + 1).toString().padStart(2, '0')}-${birthdate.getDate().toString().padStart(2, '0')}`
                  :
                  t('screens:noBirthdateChoosen')
              }
              editable={false}
              style={{ color: isDarkMode ? 'white' : 'black', fontSize: 16, fontFamily: 'Prompt-Regular', }}
            />

            <Modal isVisible={isDatePickerVisible}>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                maximumDate={new Date()} // Set maximum date to today's date
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                {...Platform.select({
                  android: {
                    // Android specific props
                    display: 'calendar',
                    headerTextIOS: t('screens:selectDate'),
                  },
                  ios: {
                    // iOS specific props
                    headerText: t('screens:selectDate'),
                  },
                })}
              />
            </Modal>
          </BasicView>


          <BasicView>
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop20,
              ]}>
              {t('auth:businessName')}
            </Text>

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  placeholderTextColor={colors.alsoGrey}
                  placeholder={t('auth:enterBusinessName')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="business_name"
            />

            {errors.first_name && (
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:businessNameRequired')}
              </Text>
            )}
          </BasicView>


          <BasicView>

            <View
              style={{

                marginVertical: 30
              }}
            >
              <Text
                style={[
                  stylesGlobal.inputFieldTitle,
                  stylesGlobal.marginTop20,
                ]}>
                {t('screens:chooseProfessions')}
              </Text>
              {profesionsLoading ? <View style={styles.loading}>
                <ActivityIndicator size='large' color={colors.primary} />
              </View> : <></>}

              
              <DropDownPicker
                containerStyle={{
                  width: WIDTH / 1.1,
                  marginRight: 10,
                }}
                zIndex={100000}
                placeholder={t(`screens:chooseProfessions`)}
                listMode="MODAL"
                searchable={true}
                open={open}
                value={DropDownvalue}
                items={transformDataToDropdownOptions(professions)}
                setOpen={setOpen}
                setValue={setDropDownValue}

              />
                         {
  user?.provider?.pending_profession ? (
    <Text style={{ color: 'orange', marginBottom: 10 }}>
      {t('screens:YouHavePendingProffessionRequest')}.
      {' '}
      <Text style={{fontWeight:'bold'}}>
        "{selectedLanguage === 'en' 
          ? user?.provider?.pending_profession?.name?.en 
          : user?.provider?.pending_profession?.name?.sw}"
      </Text>
    </Text>
  ) : (
    <></>
  )
}

            </View>
          </BasicView>

          <BasicView style={stylesGlobal.marginTop20}>
            <Text style={{
              color: colors.primary, fontSize: 20
            }}>{t('screens:residentialLocation')}:</Text>
            <Location
              getRegionValue={getRegionValue}
              getDistrictValue={getDistrictValue}
              getWardValue={getWardValue}
              getStreetValue={getStreetValue}
              initialRegion={residence?.region?.region_code}
              initialDistrict={residence?.district?.district_code}
              initialWard={residence?.ward?.ward_code}
              initialStreet={residence?.area?.id}

            />

          </BasicView>
          </>):(<></>)}

          <BasicView style={stylesGlobal.marginTop20}>
            <Text
              style={{
                color: colors.primary, fontSize: 20
              }}
            >{t('screens:officeLocation')}:</Text>
            <GooglePlacesInput
              setLocation={selectLocation}
              placeholder={t('screens:whatsYourLocation')}
              defaultValue={workingLocation==null?'':gLocation}
            />
          </BasicView>

          <BasicView>
            <Button loading={loading} onPress={handleSubmit(onSubmit)}>
              <ButtonText>{t('navigate:editAccount')}</ButtonText>
            </Button>
          </BasicView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EditAccount;
