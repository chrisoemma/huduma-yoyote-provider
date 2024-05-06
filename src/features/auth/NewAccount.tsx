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
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import { useForm, Controller } from 'react-hook-form';
import { RootStateOrAny, useSelector } from 'react-redux';
import { multiRegister, setFirstTime, userLogout, userRegiter } from './userSlice';
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

const NewAccount = ({ route, navigation }: any) => {

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
  const [value, setProffValue] = useState([]);
  const [designationError, setDesignationError] = useState('')

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
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: '',
      first_name: '',
      last_name: '',
      email: '',
      nida: '',
      business_name: '',
    },
  });


  useEffect(() => {
    const cleanedPhone = user?.phone?.replace(/\+/g, '');
    setValue('phone', cleanedPhone);
    setValue('email', user?.email);
    setValue('nida',user?.nida);
    if(user?.agent){
    setValue('name', user?.agent?.name); 
    setValue('first_name', user?.agent.first_name);
    setValue('last_name', user?.agent.last_name);
   
    }else if(user?.client){
        setValue('name', user?.client?.name); 
        setValue('first_name', user?.client?.first_name);
        setValue('last_name', user?.client?.last_name);
    }else{
        setValue('name', user?.employee?.name);
    }
   
}, [route.params]);


  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 8000);
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
    toggleToast(); // Show the toast message
    setTimeout(() => {
      toggleToast(); // Hide the toast message after a delay
    }, 5000); // Adjust duration as per your requirement
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
    if(user?.agent){
    data.account_from='agent'
    }else if(user.client){
        data.account_from='client'
    }else{
        data.account_from='employee' 
    }
    data.designation_id = value

       if(user?.agent || user?.employee){
           
        dispatch(multiRegister({ data, userId: user?.id }))
        .unwrap()
        .then(result => {
          console.log('resultsss', result);
          if (result.status) {
            console.log('excuted this true block')
            ToastAndroid.show(`${t('screens:userMultiAccountCreated')}`, ToastAndroid.LONG);
          } else {
            if (result.error) {
         
              setDisappearMessage(result.error
              );
              setShowToast(true)
              showToastMessage(t('screens:errorOccured'));
            } else {
              setDisappearMessage(result.message);
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
       }else{
    setNidaLoading(true)
    const nidaValidationResult = await validateNIDANumber(data.nida);
    setNidaLoading(false)

    setShowToast(false)

    if (!nidaValidationResult.obj.error || nidaValidationResult.obj.error.trim() === '') {

      dispatch(multiRegister({ data, userId: user?.id }))
        .unwrap()
        .then(result => {
          console.log('resultsss', result);
          if (result.status) {
            console.log('excuted this true block')
            ToastAndroid.show(`${t('screens:userMultiAccountCreated')}`, ToastAndroid.LONG);
          } else {
            if (result.error) {
         
              setDisappearMessage(result.error
              );
              setShowToast(true)
              showToastMessage(t('screens:errorOccured'));
            } else {
              setDisappearMessage(result.message);
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

    } else {
      setNidaError(t('auth:nidaDoesNotExist'))
      console.log('NIDA validation failed:', nidaValidationResult.error);
      setShowToast(true)
      showToastMessage(t('screens:errorOccured'));
    }

  }
  };



  const stylesGlobal = globalStyles();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  return (

    <SafeAreaView style={stylesGlobal.scrollBg}>
     
     {showToast && <ToastMessage message={toastMessage} onClose={toggleToast} />}
      
      
      <ScrollView contentInsetAdjustmentBehavior="automatic">
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
                  editable={user?.agent?false:true}
                  style={user?.agent? styles.disabledTextInput : null}

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
                  editable={user?.agent?false:true}
                  style={user?.agent? styles.disabledTextInput : null}
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
                  editable={user?.agent?false:true}
                  style={user?.agent? styles.disabledTextInput : null}
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
                listMode="SCROLLVIEW"
                searchable={true}
                open={open}
                value={value}
                items={transformDataToDropdownOptions(professions)}
                setOpen={setOpen}
                setValue={setProffValue}

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
                  editable={user?.agent?false:true}
                  style={user?.agent? styles.disabledTextInput : null}
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
            <Button loading={nidaLoading || loading} onPress={handleSubmit(onSubmit)}>
              <ButtonText>{t('auth:register')}</ButtonText>
            </Button>
          </BasicView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 80 }}>
            <TouchableOpacity
               disabled={loading}
              onPress={() => {
                dispatch(userLogout());
              }}
              style={[stylesGlobal.marginTop20, stylesGlobal.centerView]}>
              <Text style={stylesGlobal.touchablePlainTextSecondary}>
                {t('screens:cancelAccount')}
              </Text>
            </TouchableOpacity>
         
          </View>
        </View>

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
  disabledTextInput: {
    backgroundColor: 'lightgray', 
  },
});

export default NewAccount;
