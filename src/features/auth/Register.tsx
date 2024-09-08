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
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Linking,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import { useForm, Controller } from 'react-hook-form';
import { RootStateOrAny, useSelector } from 'react-redux';
import { setFirstTime, userRegiter } from './userSlice';
import { globalStyles } from '../../styles/global';
import { useTogglePasswordVisibility } from '../../hooks/useTogglePasswordVisibility';
import PhoneInput from 'react-native-phone-number-input';
import { BasicView } from '../../components/BasicView';
import { TextInputField } from '../../components/TextInputField';
import { useAppDispatch } from '../../app/store';
import Button from '../../components/Button';
import { ButtonText } from '../../components/ButtonText';

import { useTranslation } from 'react-i18next';
import { formatErrorMessages, showErrorWithLineBreaks, transformDataToDropdownOptions, validateNIDANumber } from '../../utils/utilts';
import { colors } from '../../utils/colors';
import DropDownPicker from 'react-native-dropdown-picker';
import { getProfessions } from '../professionsSlice';
import ToastMessage from '../../components/ToastMessage';
import messaging from '@react-native-firebase/messaging';
import ToastNotification from '../../components/ToastNotification/ToastNotification';
import CustomAlert from '../../components/Modals/CustomAlert';

const RegisterScreen = ({ route, navigation }: any) => {

  const dispatch = useAppDispatch();
  const { user, loading, status, isFirstTimeUser } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const { professions, profesionsLoading } = useSelector(
    (state: RootStateOrAny) => state.professions,
  );



  const [confirmPassword, setConfirmPassword] = useState('');

  const { selectedLanguage } = useSelector(
    (state: RootStateOrAny) => state.language,
  );
  useEffect(() => {
    dispatch(getProfessions({ language: selectedLanguage }));

  }, [selectedLanguage])

  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();

  const phoneInput = useRef<PhoneInput>(null);
  const [message, setMessage] = useState('');
  const [nidaError, setNidaError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [nidaLoading, setNidaLoading] = useState(false)
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [designationError, setDesignationError] = useState('')
  const [deviceToken, setDeviceToken] = useState('');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(() => () => {});

  const WIDTH = Dimensions.get("window").width;


  const { t } = useTranslation();

  useEffect(() => {
    if (isFirstTimeUser) {
      dispatch(setFirstTime(false))
    }
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: '',
      password: '',
      first_name: '',
      last_name: '',
      email: '',
      nida: '',
      business_name: '',
      confirmPassword: '',
    },
  });

  const handleModalConfirm = () => {
    if (onConfirmCallback) onConfirmCallback();
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };


  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 8000);
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


  



  const onSubmit = async (data: any) => {

    // if (errors.phone){
    //   setShowToast(true)
    //   showToastMessage(t('screens:errorOccured'));
    //   return 
    // }

    if (value.length < 1) {
      setDesignationError(`${t('auth:designationError')}`)
      setShowToast(true)
      showToastMessage(t('screens:errorOccured'));
      return
    } else {
      setDesignationError('');
    }

    if (data.password !== data.confirmPassword) {
      setConfirmError(t('auth:passwordMismatch'));
      setShowToast(true)
      showToastMessage(t('screens:errorOccured'));
      return;
    } else {
      setConfirmError('');
    }

    data.app_type = 'provider';
    data.designation_id = value;

    // setNidaLoading(true)
    // const nidaValidationResult = await validateNIDANumber(data.nida);
    // setNidaLoading(false)

    setShowToast(false)
   // if (!nidaValidationResult.obj.error || nidaValidationResult.obj.error.trim() === '') {

      dispatch(userRegiter(data))
        .unwrap()
        .then(result => {
          console.log('resultsss', result);
          if (result.status) {
            console.log('excuted this true block')
            ToastNotification(`${t('screens:userCreatedSuccessfully')}`,'success','long')
            navigation.navigate('Verify', { nextPage: 'Verify' });
          } else {
            if (result.error) {
              setDisappearMessage(result.error
              );
              setShowToast(true)
              showToastMessage(t('screens:errorOccured'));
            } else {
              if(result?.message){
                if (result?.existing_user) {
                  setModalMessage(result?.message);
                  setOnConfirmCallback(() => () => {
                    navigation.navigate('NewAccountPassword',{userData:result?.existing_user});
                  });
                  setIsModalVisible(true);
                } else {
                  setDisappearMessage(result?.message);
                }

              }
             
              // setShowToast(true)
              // showToastMessage(t('screens:errorOccured'));
            }
          }

          console.log('result');
          console.log(result);
        })
        .catch(rejectedValueOrSerializedError => {
          // handle error here
          console.log('error');
          console.log(rejectedValueOrSerializedError);
        });

   // } else {
      // setNidaError(t('auth:nidaDoesNotExist'))
      // console.log('NIDA validation failed:', nidaValidationResult.error);
      // setShowToast(true)
      // showToastMessage(t('screens:errorOccured'));
  //  }

  };



  const stylesGlobal = globalStyles();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  return (

    <SafeAreaView style={stylesGlobal.scrollBg}>
     
     {showToast && <ToastMessage message={toastMessage} onClose={toggleToast} />}
      
      
      <ScrollView contentInsetAdjustmentBehavior="automatic">
    
        <View style={stylesGlobal.centerView}>
          <Image
            source={isDarkMode ? require('./../../../assets/images/logo-white.png') : require('./../../../assets/images/logo.png')}
            style={[stylesGlobal.verticalLogo, { height: 100, marginTop: 20 }]}
          />
        </View>
        <View>
          <Text style={stylesGlobal.largeHeading}>{t('auth:register')}</Text>
        </View>
        <View>
        
          <BasicView style={stylesGlobal.centerView}>
            <Text style={stylesGlobal.errorMessage}>{message}</Text>
          </BasicView>

          <BasicView>
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop10,
              ]}>
              {t('auth:phone')}
            </Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PhoneInput
                  ref={phoneInput}
                  placeholder="714 055 666"
                  defaultValue={value}
                  defaultCode="TZ"
                  countryPickerProps={{
                    countryCodes: ['TZ', 'KE', 'UG', 'RW', 'BI'],
                  }}
                  layout="first"
                  // onChangeText={}
                  onChangeFormattedText={text => {
                    onChange(text);
                  }}
                  withDarkTheme
                  withShadow
                  autoFocus
                  containerStyle={stylesGlobal.phoneInputContainer}
                  textContainerStyle={stylesGlobal.phoneInputTextContainer}
                  textInputStyle={stylesGlobal.phoneInputField}
                  textInputProps={{
                    maxLength: 9,
                  }}
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

            {errors.business_name && (
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
                zIndex={6000}
                placeholder={t(`screens:chooseProfessions`)}
                listMode="MODAL"
                searchable={true}
                open={open}
                value={value}
                items={transformDataToDropdownOptions(professions)}
                setOpen={setOpen}
                setValue={setValue}

              />
              {designationError && (
                <Text style={stylesGlobal.errorMessage}>
                  {designationError}
                </Text>
              )}
            </View>
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
             {errors.nida && (
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:nidaEmptyError')}
              </Text>
            )}
            {nidaError && (
              <Text style={stylesGlobal.errorMessage}>
                {nidaError}
              </Text>
            )}
          </BasicView>

          <BasicView>
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop20,
              ]}>
              {t('auth:password')}
            </Text>

            <View style={stylesGlobal.passwordInputContainer}>
              <Controller
                control={control}
                rules={{

                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[stylesGlobal.passwordInputField,
                    { backgroundColor: colors.white, color: colors.black }
                    ]}
                    secureTextEntry={passwordVisibility}
                    placeholder={t('auth:enterPassword')}
                    placeholderTextColor={colors.alsoGrey}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="password"
              />

              <TouchableOpacity onPress={handlePasswordVisibility}>
                <Icon name={rightIcon} size={20} color={colors.grey} />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:passwordRequired')}
              </Text>
            )}
          </BasicView>


          <BasicView>
            <Text
              style={[
                stylesGlobal.inputFieldTitle,
                stylesGlobal.marginTop20,
              ]}>
              {t('auth:confirmPassword')}
            </Text>

            <View style={stylesGlobal.passwordInputContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (value) => value === confirmPassword,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[stylesGlobal.passwordInputField,
                    { backgroundColor: colors.white, color: colors.black }
                    ]}
                    secureTextEntry={passwordVisibility}
                    placeholderTextColor={colors.alsoGrey}
                    placeholder={t('auth:confirmPassword')}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      onChange(text);
                    }}
                    value={value}
                  />
                )}
                name="confirmPassword"
              />
              <TouchableOpacity onPress={handlePasswordVisibility}>
                <Icon name={rightIcon} size={20} color={colors.grey} />
              </TouchableOpacity>
            </View>
            {confirmError && (
              <Text style={stylesGlobal.errorMessage}>
                {t('auth:passwordMismatch')}
              </Text>
            )}
          </BasicView>


          <BasicView>
            <Button loading={nidaLoading || loading} onPress={handleSubmit(onSubmit)}>
              <ButtonText>{t('auth:register')}</ButtonText>
            </Button>
          </BasicView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal:5, marginBottom: 80 }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
              style={[stylesGlobal.marginTop20, {  flex: 1,
                alignItems: 'flex-start',}]}>
              <Text style={stylesGlobal.touchablePlainTextSecondary}>
                {t('auth:alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CheckPhoneNumber');
              }}
              style={[stylesGlobal.marginTop20, { 
                alignItems: 'flex-end',marginRight:10}]}>
              <Text style={stylesGlobal.touchablePlainTextSecondary}>
                {t('auth:haveOtp')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.TermsConditions}>
            <Text style={stylesGlobal.touchablePlainTextSecondary}>
              {t('screens:termsText')}{' '}
              <TouchableOpacity onPress={() => Linking.openURL('https://your-terms-url.com')}>
                <Text style={styles.linkText}>{t('screens:termsLink')}</Text>
              </TouchableOpacity>
              {` ${t('screens:termsContinueText')} `}
              <TouchableOpacity onPress={() => Linking.openURL('https://your-privacy-policy-url.com')}>
                <Text style={styles.linkText}>{t('screens:privacyPolicyLink')}</Text>
              </TouchableOpacity>
              {` ${t('screens:continuePrivacyPolicy')} `}
            </Text>
          </View>

        </View>
        <CustomAlert
          isVisible={isModalVisible}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
          title={t('screens:accountExists')}
          message={modalMessage}
        />

      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({

  loading: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 50,
    zIndex: 15000,
  },
  TermsConditions: {
    marginTop: '10%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom:'3%'
  },
  linkText: {
    color: colors.secondary,
    textDecorationLine: 'underline',
    fontWeight:'bold',
  },
});

export default RegisterScreen;
