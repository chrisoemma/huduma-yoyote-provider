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

const RegisterScreen = ({ route, navigation }: any) => {

  const dispatch = useAppDispatch();
  const { user, loading, status,isFirstTimeUser } = useSelector(
    (state: RootStateOrAny) => state.user,
  );

  const { professions,profesionsLoading } = useSelector(
    (state: RootStateOrAny) => state.professions,
  );

  const { selectedLanguage } = useSelector(
    (state: RootStateOrAny) => state.language,
  );


  useEffect(() => {
    dispatch(getProfessions({ language:selectedLanguage }));
    
  }, [ selectedLanguage])

  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();

  const phoneInput = useRef<PhoneInput>(null);
  const [message, setMessage] = useState('');
   const [nidaError, setNidaError] = useState('');
   const [nidaLoading,setNidaLoading]=useState(false)
   const [open, setOpen] = useState(false);
   const [value, setValue] = useState([]);

   const WIDTH = Dimensions.get("window").width;


   const { t } = useTranslation();

 

  // useEffect(() => {
  //   if (status !== '') {
  //     setMessage(status);
  //   }
  // }, [status]);

  useEffect(() => {
    if(isFirstTimeUser){
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
      email:'',
      nida: '',
    },
  });



  const setDisappearMessage = (message: any) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, 5000);
  };



  const onSubmit = async (data: any) => {

     data.app_type='provider';

     setNidaLoading(true)
     const nidaValidationResult = await validateNIDANumber(data.nida);
     setNidaLoading(false)
 
   
     if (!nidaValidationResult.obj.error|| nidaValidationResult.obj.error.trim() === '') {
      
     dispatch(userRegiter(data))
       .unwrap()
       .then(result => {
         console.log('resultsss', result);
         if (result.status) {
           console.log('excuted this true block')
           ToastAndroid.show(`${t('auth:userCreatedSuccessfully')}`, ToastAndroid.LONG);
           navigation.navigate('Verify',{nextPage:'Verify'});
         } else {
          if (result.error) {
            setDisappearMessage(result.error
            );
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
       setNidaError(t('auth:nidaDoesNotExist'))
       console.log('NIDA validation failed:', nidaValidationResult.error);
     }

  };

  const stylesGlobal = globalStyles();

  const { isDarkMode } = useSelector(
    (state: RootStateOrAny) => state.theme,
  );

  return (

    <SafeAreaView style={stylesGlobal.scrollBg}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
       
          <View style={stylesGlobal.centerView}>
            <Image
             source={isDarkMode? require('./../../../assets/images/logo-white.png'): require('./../../../assets/images/logo.png')}
              style={[stylesGlobal.verticalLogo,{height:100,marginTop:20}]}
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
                    placeholder= {t('auth:enterFirstName')}
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
                    placeholder= {t('auth:enterLastName')}
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
                    placeholder= {t('auth:enterBusinessName')}
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
  
        marginVertical:30
      }}
    >
      { profesionsLoading?<View style={styles.loading}>
      <ActivityIndicator size='large' color={colors.primary}/>
    </View>:<></>}
      <DropDownPicker
        containerStyle={{
          width: WIDTH/1.1 ,
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
        setValue={setValue}
     
      />
      
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
                        {backgroundColor:colors.white,color:colors.black}
                      ]}
                      secureTextEntry={passwordVisibility}
                      placeholder={t('auth:enterPassword')}
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
              <Button loading={loading || nidaLoading} onPress={handleSubmit(onSubmit)}>
                <ButtonText>{t('auth:register')}</ButtonText>
              </Button>
            </BasicView>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
              style={[stylesGlobal.marginTop20, stylesGlobal.centerView]}>
              <Text style={stylesGlobal.touchablePlainTextSecondary}>
                {t('auth:alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
          </View>
       
      </ScrollView>
    </SafeAreaView>
  );
};


const styles =  StyleSheet.create({

        loading: {
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft:50,
          zIndex:15000,
        },
      });

export default RegisterScreen;
