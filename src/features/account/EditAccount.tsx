import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';


import { useForm, Controller } from 'react-hook-form';
import { RootStateOrAny, useSelector } from 'react-redux';
import { globalStyles } from '../../styles/global';
import PhoneInput from 'react-native-phone-number-input';
import { colors } from '../../utils/colors';
import { Container } from '../../components/Container';
import { BasicView } from '../../components/BasicView';
import { TextInputField } from '../../components/TextInputField';
import { useAppDispatch } from '../../app/store';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';
import { useTranslation } from 'react-i18next';
import { updateProviderInfo } from '../auth/userSlice';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { PLACES_API_KEY } from '../../utils/config';
import { formatErrorMessages, showErrorWithLineBreaks, validateNIDANumber, validateTanzanianPhoneNumber } from '../../utils/utilts';
import Location from '../../components/Location';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import GooglePlacesInput from '../../components/GooglePlacesInput';

const EditAccount = ({
  route,
  navigation,
  accountData
}: any) => {


  const dispatch = useAppDispatch();
  const { user, loading, status } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const phoneInput = useRef<PhoneInput>(null);

  const [location, setLocation] = useState({} as any);

  const [message, setMessage] = useState('');

  const { t } = useTranslation();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  const { provider, employee } = route.params

  const [birthdate, setBirthdate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedYear, setSelectedYear] = useState(birthdate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(birthdate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(birthdate.getDate());
  const [nidaError, setNidaError] = useState('');

  const [regionValue, setRegionValue] = useState(null);
  const [districtValue, setDistrictValue] = useState(null);
  const [wardValue, setWardValue] = useState(null);
  const [streetValue, setStreetValue] = useState(null);
  const [nidaLoading, setNidaLoading] = useState(false)
  // const [streetInputValue,setStreetInputValue]=useState(null);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const stylesGlobal = globalStyles();

  const handleConfirm = (date) => {
    setBirthdate(date);
    setSelectedYear(date.getFullYear());
    setSelectedMonth(date.getMonth() + 1);
    setSelectedDay(date.getDate());
    hideDatePicker();
  };


  const selectLocation = (locationSelected: any) => {
    console.log('Location selected ::');
    console.log(locationSelected);
    setLocation(locationSelected);
  };

  useEffect(() => {
    const cleanedPhone = user?.phone?.replace(/\+/g, '');


    if (user?.provider) {
      setValue('name', provider?.name);
      setValue('first_name', provider?.first_name);
      setValue('last_name', provider?.last_name);
      setValue('phone', cleanedPhone);
      setValue('email', user?.email);
      setValue('nida', user?.provider?.nida);
    } else {
      setValue('name', user.employee?.name);
      setValue('phone', cleanedPhone);
      setValue('email', user?.email);
      setValue('nida', user.employee?.nida);
    }

  }, [route.params]);



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
      nida: ''
    },
  });

  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const onSubmit = async (data: any) => {
    data.latitude = location.lat;
    data.longitude = location.lng;
    data.phone = validateTanzanianPhoneNumber(data.phone);
    data.birth_date = birthdate;

    // Call the external API for NIDA validation
    setNidaLoading(true)
    const nidaValidationResult = await validateNIDANumber(data.nida);
    setNidaLoading(false)


    if (!nidaValidationResult.obj.error || nidaValidationResult.obj.error.trim() === '') {
      data.status = 'S.Valid';
      let userType = '';
      if (user.provider !==null) {
        userType = 'provider';
      } else {
        userType = 'employee';
      }

      dispatch(updateProviderInfo({ data: data, userType: userType, userId: user?.id }))
        .unwrap()
        .then(result => {
          console.log('resultsss', result);
          if (result.status) {
            console.log('executed this true block');
            ToastAndroid.show(`${t('screens:userUpatedSuccessfully')}`, ToastAndroid.LONG);
            navigation.navigate('Account', {
              screen: 'Account',
              message: message
            });
          } else {

            if (result.data) {
              const errors = result.data.errors;
              setDisappearMessage(
                showErrorWithLineBreaks(formatErrorMessages(errors))
              );
            } else {
              setDisappearMessage(result.message);
            }

          }
        });
    } else {
      setNidaError(t('auth:nidaDoesNotExist'))
      setNidaLoading(false)

    }
  };


  return (

    <SafeAreaView style={stylesGlobal.scrollBg}>


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

          {user?.provider !==null ? (
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
                  placeholder={t('auth:enterEmail')}
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
                    setNidaError(t('auth:nida20numbers'));
                    return false;
                  }
                  setNidaError('');
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  placeholder={t('auth:enterNida')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType='numeric'
                />
              )}
              name="nida"
            />
            {nidaError && (
              <Text style={stylesGlobal.errorMessage}>
                {nidaError}
              </Text>
            )}
          </BasicView>

          <BasicView style={stylesGlobal.marginTop20}>

            <Button onPress={showDatePicker}>
              <ButtonText >{t('screens:selectBirthDate')}</ButtonText>
            </Button>


            <TextInput
              value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`}
              editable={false}
              style={{ color: isDarkMode ? 'white' : 'black', fontSize: 20 }}
            />


            <Modal isVisible={isDatePickerVisible}>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </Modal>
          </BasicView>

          <BasicView style={stylesGlobal.marginTop20}>
            <Text>{t('screens:residentialLocation')}:</Text>
            <Location
              getRegionValue={getRegionValue}
              getDistrictValue={getDistrictValue}
              getWardValue={getWardValue}
              getStreetValue={getStreetValue}
              // getStreetInput={getStreetInput}
              initialRegion={null}
              initialDistrict={null}
              initialWard={null}
              initialStreet={null}

            />

          </BasicView>

          <BasicView style={stylesGlobal.marginTop20}>
            <Text>{t('screens:officeLocation')}:</Text>
            <GooglePlacesInput
              setLocation={selectLocation}
              placeholder="What's your location?"
            />
          </BasicView>

          <BasicView>
            <Button loading={nidaLoading || loading} onPress={handleSubmit(onSubmit)}>
              <ButtonText>{t('navigate:editAccount')}</ButtonText>
            </Button>
          </BasicView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EditAccount;
